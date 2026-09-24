import * as authService from '../services/auth.service.js';
import { clearRefreshCookie, REFRESH_COOKIE_NAME, setRefreshCookie } from '../utils/cookies.js';

const requestMeta = (req) => ({ userAgent: req.get('user-agent'), ipAddress: req.ip });

// Sets the refresh cookie and returns only what the client may see.
const sendAuthResult = (res, statusCode, { user, accessToken, refreshToken, refreshTokenExpiresAt }) => {
  setRefreshCookie(res, refreshToken, refreshTokenExpiresAt);
  res.status(statusCode).json({ success: true, data: { user, accessToken } });
};

export const register = async (req, res) => {
  const result = await authService.register(req.body, requestMeta(req));
  sendAuthResult(res, 201, result);
};

export const login = async (req, res) => {
  const result = await authService.login(req.body, requestMeta(req));
  sendAuthResult(res, 200, result);
};

export const refresh = async (req, res) => {
  try {
    const result = await authService.refresh(req.cookies[REFRESH_COOKIE_NAME]);
    sendAuthResult(res, 200, result);
  } catch (error) {
    clearRefreshCookie(res);
    throw error;
  }
};

export const logout = async (req, res) => {
  await authService.logout(req.cookies[REFRESH_COOKIE_NAME]);
  clearRefreshCookie(res);
  res.json({ success: true, message: 'Signed out' });
};

export const me = async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  res.json({ success: true, data: { user } });
};

export const forgotPassword = async (req, res) => {
  await authService.forgotPassword(req.body);
  res.json({
    success: true,
    message: 'If an account exists for that email, a password reset link has been sent.',
  });
};

export const resetPassword = async (req, res) => {
  await authService.resetPassword(req.body);
  res.json({ success: true, message: 'Password updated. Please sign in with your new password.' });
};
