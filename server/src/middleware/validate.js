import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';

// Validates and normalizes req.body with a Zod schema.
// On failure responds 400 with `details.fieldErrors` ({ field: [messages] }).
export const validateBody = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {});

  if (!result.success) {
    const { fieldErrors, formErrors } = z.flattenError(result.error);
    throw ApiError.badRequest('Validation failed', { fieldErrors, formErrors });
  }

  req.body = result.data;
  next();
};
