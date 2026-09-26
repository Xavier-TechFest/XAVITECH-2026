import { sendError } from '../utils/response.util.js';

/**
 * Validation Middleware Runner Placeholder
 *
 * Runs schema validations (e.g. using Joi, Zod, or custom validator functions)
 * and intercepts invalid requests before reaching controllers.
 */

export const validate = (schemaValidator) => {
  return (req, res, next) => {
    if (typeof schemaValidator === 'function') {
      const result = schemaValidator(req.body);
      if (!result.isValid) {
        return sendError(res, 'Validation failed', result.errors, 400);
      }
    }
    next();
  };
};

export default validate;
