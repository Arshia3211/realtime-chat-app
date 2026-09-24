import { z } from 'zod';

// Keep these rules in sync with client/src/lib/validations/auth.js.

const email = z
  .string({ error: 'Email is required' })
  .trim()
  .toLowerCase()
  .max(254, 'Email is too long')
  .pipe(z.email('Enter a valid email address'));

// bcrypt only uses the first 72 bytes of a password, so longer ones are rejected.
const password = z
  .string({ error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number');

export const registerSchema = z.object({
  displayName: z
    .string({ error: 'Display name is required' })
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be at most 50 characters'),
  username: z
    .string({ error: 'Username is required' })
    .trim()
    .toLowerCase()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
  email,
  password,
});

export const loginSchema = z.object({
  // Email address or username.
  identifier: z
    .string({ error: 'Email or username is required' })
    .trim()
    .toLowerCase()
    .min(1, 'Email or username is required')
    .max(254),
  password: z.string({ error: 'Password is required' }).min(1, 'Password is required').max(72),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string({ error: 'Reset token is required' }).regex(/^[a-f0-9]{64}$/, 'Invalid reset link'),
  password,
});
