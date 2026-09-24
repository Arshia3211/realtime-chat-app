// Operational error with an HTTP status code. Throw it from controllers/services;
// the global error handler turns it into a JSON response.
export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message = 'Bad request', details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Unauthorized', details) {
    return new ApiError(401, message, details);
  }

  static forbidden(message = 'Forbidden', details) {
    return new ApiError(403, message, details);
  }

  static notFound(message = 'Not found', details) {
    return new ApiError(404, message, details);
  }

  static conflict(message = 'Conflict', details) {
    return new ApiError(409, message, details);
  }
}
