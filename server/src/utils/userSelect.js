// Prisma `select` objects that never include secrets (password hash, reset token).

// Fields visible to other users.
export const publicUserSelect = {
  id: true,
  username: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
  lastSeenAt: true,
  createdAt: true,
};

// Fields returned to the signed-in user about themselves.
export const selfUserSelect = {
  ...publicUserSelect,
  email: true,
  isEmailVerified: true,
  updatedAt: true,
};
