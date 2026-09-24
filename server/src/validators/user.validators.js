import { z } from 'zod';
import { passwordSchema, usernameSchema } from './auth.validators.js';

// Keep these rules in sync with client/src/lib/validations/profile.js.

export const updateProfileSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, 'Display name must be at least 2 characters')
      .max(50, 'Display name must be at most 50 characters')
      .optional(),
    username: usernameSchema.optional(),
    // Empty string clears the bio.
    bio: z
      .string()
      .trim()
      .max(280, 'Bio must be at most 280 characters')
      .transform((value) => value || null)
      .nullable()
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, { message: 'Nothing to update' });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string({ error: 'Current password is required' }).min(1, 'Current password is required').max(72),
    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from the current one',
    path: ['newPassword'],
  });

export const searchUsersQuerySchema = z.object({
  q: z.string({ error: 'Search query is required' }).trim().min(1, 'Search query is required').max(50),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const userIdParamsSchema = z.object({
  userId: z.uuid('Invalid user id'),
});
