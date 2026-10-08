import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/HttpError';

// express.json() reports malformed or oversized bodies as errors with a `type` and a 4xx `status`.
function isClientBodyError(err: unknown): err is { status: number } {
  const { type, status } = (err ?? {}) as { type?: unknown; status?: unknown };
  return typeof type === 'string' && typeof status === 'number' && status < 500;
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { message: err.message, details: err.details } });
    return;
  }

  if (err instanceof ZodError) {
    const { formErrors, fieldErrors } = err.flatten();
    const details = formErrors.length ? { ...fieldErrors, form: formErrors } : fieldErrors;
    res.status(400).json({ error: { message: 'Validation failed', details } });
    return;
  }

  if (isClientBodyError(err)) {
    res.status(err.status).json({ error: { message: 'Invalid request body' } });
    return;
  }

  // Unexpected errors are logged server-side only so stack traces never reach the client.
  console.error(err);
  res.status(500).json({ error: { message: 'Internal server error' } });
};
