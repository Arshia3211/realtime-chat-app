import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { allowedOrigins } from '../config/cors.js';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { generateToken, hashToken } from '../utils/crypto.js';
import { getTokenExpiry, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import { selfUserSelect } from '../utils/userSelect.js';
import { sendPasswordResetEmail } from './email.service.js';

export const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_TTL_MINUTES = 30;
// A just-rotated refresh token is still accepted this long (concurrent tabs).
const ROTATION_GRACE_MS = 30_000;

// Compared against when a login identifier doesn't exist, so the response time
// doesn't reveal whether an account exists.
const dummyPasswordHash = bcrypt.hash('dummy-password-for-timing', BCRYPT_ROUNDS);

const invalidSession = () => ApiError.unauthorized('Session expired, please sign in again');

// ── Sessions ────────────────────────────────────────────────────────────────

// Creates a Session row and returns the tokens for it.
const createSession = async (userId, meta) => {
  // The id is generated here because the refresh token must embed it.
  const sessionId = crypto.randomUUID();
  const refreshToken = signRefreshToken(userId, sessionId);
  const refreshTokenExpiresAt = getTokenExpiry(refreshToken);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt: refreshTokenExpiresAt,
      userAgent: meta.userAgent?.slice(0, 255),
      ipAddress: meta.ipAddress?.slice(0, 64),
    },
  });

  return { accessToken: signAccessToken(userId, sessionId), refreshToken, refreshTokenExpiresAt };
};

const issueAuthResult = async (user, meta) => {
  const tokens = await createSession(user.id, meta);
  return { user, ...tokens };
};

// ── Public API ──────────────────────────────────────────────────────────────

export const register = async ({ displayName, username, email, password }, meta) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });

  if (existing) {
    const fieldErrors = {};
    if (existing.email === email) fieldErrors.email = ['An account with this email already exists'];
    if (existing.username === username) fieldErrors.username = ['This username is taken'];
    throw ApiError.conflict('Account already exists', { fieldErrors });
  }

  const user = await prisma.user.create({
    data: {
      displayName,
      username,
      email,
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    },
    select: selfUserSelect,
  });

  return issueAuthResult(user, meta);
};

export const login = async ({ identifier, password }, meta) => {
  const where = identifier.includes('@') ? { email: identifier } : { username: identifier };
  const user = await prisma.user.findUnique({ where, select: { id: true, passwordHash: true } });

  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? (await dummyPasswordHash));
  if (!user || !passwordMatches) {
    throw ApiError.unauthorized('Invalid email/username or password');
  }

  const profile = await prisma.user.findUnique({ where: { id: user.id }, select: selfUserSelect });
  return issueAuthResult(profile, meta);
};

// Exchanges a valid refresh token for a new access token and a rotated refresh token.
export const refresh = async (refreshToken) => {
  if (!refreshToken) throw invalidSession();

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw invalidSession();
  }

  const session = await prisma.session.findUnique({ where: { id: payload.sid } });
  if (!session || session.userId !== payload.sub) throw invalidSession();

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    throw invalidSession();
  }

  const presentedHash = hashToken(refreshToken);
  const isCurrent = presentedHash === session.refreshTokenHash;
  const isRecentPrevious =
    presentedHash === session.previousTokenHash &&
    session.rotatedAt &&
    Date.now() - session.rotatedAt.getTime() < ROTATION_GRACE_MS;

  if (!isCurrent && !isRecentPrevious) {
    // A valid but already-rotated token: likely stolen and replayed. Revoke the session.
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    throw invalidSession();
  }

  const newRefreshToken = signRefreshToken(session.userId, session.id);
  const refreshTokenExpiresAt = getTokenExpiry(newRefreshToken);

  // Conditional update: if another request rotated this session meanwhile, count is 0.
  const { count } = await prisma.session.updateMany({
    where: { id: session.id, refreshTokenHash: session.refreshTokenHash },
    data: {
      refreshTokenHash: hashToken(newRefreshToken),
      previousTokenHash: session.refreshTokenHash,
      rotatedAt: new Date(),
      expiresAt: refreshTokenExpiresAt,
      lastUsedAt: new Date(),
    },
  });
  if (count === 0) throw invalidSession();

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: selfUserSelect });
  if (!user) throw invalidSession();

  return {
    user,
    accessToken: signAccessToken(user.id, session.id),
    refreshToken: newRefreshToken,
    refreshTokenExpiresAt,
  };
};

// Revokes the session behind a refresh token. Never throws: logout always succeeds.
export const logout = async (refreshToken) => {
  if (!refreshToken) return;
  try {
    const { sid } = verifyRefreshToken(refreshToken);
    await prisma.session.deleteMany({ where: { id: sid } });
  } catch {
    // Invalid/expired token: nothing to revoke.
  }
};

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: selfUserSelect });
  if (!user) throw ApiError.unauthorized('Account no longer exists');
  return user;
};

// Always resolves the same way whether or not the email exists (no account enumeration).
export const forgotPassword = async ({ email }) => {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, displayName: true } });
  if (!user) return;

  const token = generateToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetTokenHash: hashToken(token),
      passwordResetExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000),
    },
  });

  const resetUrl = `${allowedOrigins[0]}/reset-password/${token}`;
  if (!env.isProduction) {
    console.log(`[auth] password reset link for ${email}: ${resetUrl}`);
  }

  try {
    await sendPasswordResetEmail({
      to: email,
      name: user.displayName,
      resetUrl,
      expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
    });
  } catch (error) {
    // Logged, not surfaced: the response must not reveal whether the account exists.
    console.error('[email] failed to send password reset email:', error.message);
  }
};

export const resetPassword = async ({ token, password }) => {
  const user = await prisma.user.findFirst({
    where: { passwordResetTokenHash: hashToken(token), passwordResetExpiresAt: { gt: new Date() } },
    select: { id: true },
  });

  if (!user) {
    throw ApiError.badRequest('This reset link is invalid or has expired');
  }

  // New password, single-use token, and every existing session signed out.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      },
    }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);
};
