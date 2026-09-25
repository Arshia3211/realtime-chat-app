import { rateLimit } from 'express-rate-limit';

const baseOptions = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
};

// General limit for all /api routes (chat clients make many small requests).
export const apiLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 1000,
});

// Sending messages: per signed-in user (mount after requireAuth), so people
// sharing one network/IP don't share a limit.
export const messageLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  limit: 120,
  keyGenerator: (req) => `user:${req.user.id}`,
  message: { success: false, message: 'You are sending messages too quickly. Please slow down.' },
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
