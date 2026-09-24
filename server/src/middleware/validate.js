import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';

const parseOrThrow = (schema, input) => {
  const result = schema.safeParse(input ?? {});
  if (!result.success) {
    const { fieldErrors, formErrors } = z.flattenError(result.error);
    throw ApiError.badRequest('Validation failed', { fieldErrors, formErrors });
  }
  return result.data;
};

// Validates and normalizes req.body with a Zod schema.
// On failure responds 400 with `details.fieldErrors` ({ field: [messages] }).
export const validateBody = (schema) => (req, _res, next) => {
  req.body = parseOrThrow(schema, req.body);
  next();
};

// req.query is read-only in Express 5, so the parsed result goes to req.validatedQuery.
export const validateQuery = (schema) => (req, _res, next) => {
  req.validatedQuery = parseOrThrow(schema, req.query);
  next();
};

export const validateParams = (schema) => (req, _res, next) => {
  req.validatedParams = parseOrThrow(schema, req.params);
  next();
};
