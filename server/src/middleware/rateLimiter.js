import { rateLimit } from 'express-rate-limit';

const baseOptions = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
};

// General limit for all /api routes.
export const apiLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 300,
});

// Login/register/reset: only failed attempts count, to slow down password guessing.
export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
});

// Forgot-password always succeeds (no account enumeration), so every request counts.
export const passwordResetLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 5,
});
