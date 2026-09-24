import { env } from '../config/env.js';

export const REFRESH_COOKIE_NAME = 'rtc_refresh';

// In production the frontend and API usually live on different sites, which
// requires SameSite=None + Secure. Locally both are on localhost (same site).
const baseOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  path: '/api/auth', // only sent to auth endpoints
};

export const setRefreshCookie = (res, token, expiresAt) => {
  res.cookie(REFRESH_COOKIE_NAME, token, { ...baseOptions, expires: expiresAt });
};

export const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, baseOptions);
};
