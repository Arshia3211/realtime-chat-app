import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: 'File is too large',
  LIMIT_FILE_COUNT: 'Too many files',
  LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
};

// Maps known Prisma and Multer errors to HTTP errors so they don't surface as 500s.
const fromLibraryError = (err) => {
  if (err instanceof multer.MulterError) {
    const statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return new ApiError(statusCode, MULTER_MESSAGES[err.code] ?? err.message);
  }

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
  const error = err instanceof ApiError ? err : (fromLibraryError(err) ?? err);
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
