import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { publicUserSelect, selfUserSelect } from '../utils/userSelect.js';
import { BCRYPT_ROUNDS } from './auth.service.js';
import { deleteImage, uploadImage } from './storage.service.js';

// Square crop on Cloudinary; the local fallback stores the original image.
const AVATAR_TRANSFORMATION = [{ width: 512, height: 512, crop: 'fill', gravity: 'auto' }];

// Case-insensitive match on username or display name, excluding the searcher.
export const searchUsers = (currentUserId, { q, limit }) =>
  prisma.user.findMany({
    where: {
      id: { not: currentUserId },
      OR: [
        { username: { contains: q, mode: 'insensitive' } },
        { displayName: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: publicUserSelect,
    orderBy: { username: 'asc' },
    take: limit,
  });

export const getPublicProfile = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect });
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const updateProfile = async (userId, updates) => {
  if (updates.username) {
    const taken = await prisma.user.findFirst({
      where: { username: updates.username, id: { not: userId } },
      select: { id: true },
    });
    if (taken) {
      throw ApiError.conflict('Username is taken', { fieldErrors: { username: ['This username is taken'] } });
    }
  }

  return prisma.user.update({ where: { id: userId }, data: updates, select: selfUserSelect });
};

// Verifies the current password, sets the new one and signs out every other device.
export const changePassword = async (userId, currentSessionId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user) throw ApiError.unauthorized('Account no longer exists');

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw ApiError.badRequest('Current password is incorrect', {
      fieldErrors: { currentPassword: ['Current password is incorrect'] },
    });
  }

  const [, { count: signedOutSessions }] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(newPassword, BCRYPT_ROUNDS) },
    }),
    prisma.session.deleteMany({
      where: { userId, ...(currentSessionId && { id: { not: currentSessionId } }) },
    }),
  ]);

  return { signedOutSessions };
};

export const updateAvatar = async (userId, image) => {
  const current = await prisma.user.findUnique({ where: { id: userId }, select: { avatarPublicId: true } });
  if (!current) throw ApiError.unauthorized('Account no longer exists');

  const uploaded = await uploadImage(image.buffer, {
    folder: 'avatars',
    ext: image.ext,
    transformation: AVATAR_TRANSFORMATION,
  });

  let user;
  try {
    user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: uploaded.url, avatarPublicId: uploaded.publicId },
      select: selfUserSelect,
    });
  } catch (error) {
    await deleteImage(uploaded.publicId); // don't leave an orphaned file
    throw error;
  }

  await deleteImage(current.avatarPublicId);
  return user;
};

export const removeAvatar = async (userId) => {
  const current = await prisma.user.findUnique({ where: { id: userId }, select: { avatarPublicId: true } });
  if (!current) throw ApiError.unauthorized('Account no longer exists');

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null, avatarPublicId: null },
    select: selfUserSelect,
  });

  await deleteImage(current.avatarPublicId);
  return user;
};
