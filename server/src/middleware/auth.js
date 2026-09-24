import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/tokens.js';

// Requires a valid access token: `Authorization: Bearer <token>`.
// Sets req.user = { id, sessionId }.
export const requireAuth = (req, _res, next) => {
  const [scheme, token] = (req.get('authorization') ?? '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Authentication required');
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, sessionId: payload.sid };
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }

  next();
};
