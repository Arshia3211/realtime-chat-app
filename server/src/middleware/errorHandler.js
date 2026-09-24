import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// Maps known Prisma errors to HTTP errors so they don't surface as 500s.
const fromPrismaError = (err) => {
  switch (err.code) {
    case 'P2002':
      return ApiError.conflict('A record with these details already exists');
    case 'P2025':
      return ApiError.notFound('Record not found');
    default:
      return null;
  }
};

// Express 5 forwards rejected promises from async handlers here automatically.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  const error = err instanceof ApiError ? err : (fromPrismaError(err) ?? err);
  const statusCode = error instanceof ApiError ? error.statusCode : (error.status ?? 500);
  const isServerError = statusCode >= 500;

  if (isServerError) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: isServerError && env.isProduction ? 'Internal server error' : error.message,
    ...(error.details && { details: error.details }),
    ...(!env.isProduction && isServerError && { stack: err.stack }),
  });
};
