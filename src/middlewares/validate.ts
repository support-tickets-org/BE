import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

// Express 5 makes req.query read-only, so parsed values go to res.locals.
export const validate =
  (schema: ZodTypeAny, source: 'body' | 'query' | 'params' = 'body'): RequestHandler =>
  (req, res, next) => {
    res.locals[source] = schema.parse(req[source]);
    next();
  };
