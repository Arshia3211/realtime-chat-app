import { z } from 'zod'

// Mirrors server/src/validators/auth.validators.js so users see errors before submitting.

const email = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .pipe(z.email('Enter a valid email address'))

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number')

// The server lowercases usernames, so mixed case is accepted here.
export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[A-Za-z0-9_]+$/, 'Only letters, numbers and underscores')

const withConfirmation = (schema) =>
  schema.refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = withConfirmation(
  z.object({
    displayName: z
      .string()
      .trim()
      .min(2, 'Display name must be at least 2 characters')
      .max(50, 'Display name must be at most 50 characters'),
    username: usernameSchema,
    email,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  }),
)

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = withConfirmation(
  z.object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  }),
)
