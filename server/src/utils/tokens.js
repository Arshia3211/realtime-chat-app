import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const assertSecret = (secret, name) => {
  if (!secret) {
    throw new Error(`${name} is not configured`);
  }
  return secret;
};

// Short-lived token sent in the Authorization header (and Socket.IO handshake).
// `sid` identifies the device session, e.g. to keep it when signing out other devices.
export const signAccessToken = (userId, sessionId) =>
  jwt.sign({ type: 'access', sid: sessionId }, assertSecret(env.jwt.secret, 'JWT_SECRET'), {
    subject: userId,
    expiresIn: env.jwt.expiresIn,
  });

export const verifyAccessToken = (token) => {
  const payload = jwt.verify(token, assertSecret(env.jwt.secret, 'JWT_SECRET'));
  if (payload.type !== 'access') {
    throw new jwt.JsonWebTokenError('Invalid token type');
  }
  return payload;
};

// Long-lived token kept in an httpOnly cookie. `sid` points at the Session row;
// `jti` makes every issued token unique even within the same second.
export const signRefreshToken = (userId, sessionId) =>
  jwt.sign({ type: 'refresh', sid: sessionId }, assertSecret(env.jwt.refreshSecret, 'JWT_REFRESH_SECRET'), {
    subject: userId,
    jwtid: crypto.randomUUID(),
    expiresIn: env.jwt.refreshExpiresIn,
  });

export const verifyRefreshToken = (token) => {
  const payload = jwt.verify(token, assertSecret(env.jwt.refreshSecret, 'JWT_REFRESH_SECRET'));
  if (payload.type !== 'refresh' || !payload.sid) {
    throw new jwt.JsonWebTokenError('Invalid token type');
  }
  return payload;
};

// Expiry (as a Date) encoded in a token we just signed.
export const getTokenExpiry = (token) => new Date(jwt.decode(token).exp * 1000);
