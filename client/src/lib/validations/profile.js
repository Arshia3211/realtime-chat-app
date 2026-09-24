import { z } from 'zod'
import { passwordSchema, usernameSchema } from './auth'

// Mirrors server/src/validators/user.validators.js.

export const BIO_MAX_LENGTH = 280

export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be at most 50 characters'),
  username: usernameSchema,
  bio: z.string().trim().max(BIO_MAX_LENGTH, `Bio must be at most ${BIO_MAX_LENGTH} characters`),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from the current one',
    path: ['newPassword'],
  })

// Avatar rules (the server re-checks the real file type from its bytes).
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024
export const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

export const validateAvatarFile = (file) => {
  if (!AVATAR_ACCEPT.split(',').includes(file.type)) return 'Choose a JPEG, PNG, WebP or GIF image'
  if (file.size > AVATAR_MAX_BYTES) return 'Image must be 5 MB or smaller'
  return null
}
