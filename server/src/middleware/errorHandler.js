import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// Express 5 forwards rejected promises from async handlers here automatically.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err instanceof ApiError ? err.statusCode : (err.status ?? 500);
  const isServerError = statusCode >= 500;

  if (isServerError) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: isServerError && env.isProduction ? 'Internal server error' : err.message,
    ...(err.details && { details: err.details }),
    ...(!env.isProduction && isServerError && { stack: err.stack }),
  });
};
