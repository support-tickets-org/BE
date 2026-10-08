import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { HttpError, type ErrorDetails } from '../utils/HttpError';

type Schemas = { body?: ZodTypeAny; query?: ZodTypeAny; params?: ZodTypeAny };

// Parsed values go to res.locals because Express 5 exposes req.query as a read-only getter.
export const validate =
  (schemas: Schemas): RequestHandler =>
  (req, res, next) => {
    const details: ErrorDetails = {};

    for (const key of ['params', 'query', 'body'] as const) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(req[key] ?? {});
      if (result.success) {
        res.locals[key] = result.data;
      } else {
        const { formErrors, fieldErrors } = result.error.flatten();
        Object.assign(details, fieldErrors);
        if (formErrors.length) details[key] = formErrors;
      }
    }

    if (Object.keys(details).length) {
      return next(new HttpError(400, 'Validation failed', details));
    }
    next();
  };
