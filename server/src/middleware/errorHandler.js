import { fail } from '../utils/apiResponse.js';

/** Catches 404s for unknown routes. */
export function notFound(req, res, next) {
  fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

/** Centralised Express error handler. */
export function errorHandler(err, req, res, next) {
  console.error('[error]', err);

  if (err.name === 'ValidationError') {
    return fail(res, err.message, 422, err.errors);
  }
  if (err.name === 'CastError') {
    return fail(res, `Invalid ${err.path}: ${err.value}`, 400);
  }
  if (err.code === 11000) {
    return fail(res, `Duplicate value for field(s): ${Object.keys(err.keyValue || {}).join(', ')}`, 409);
  }

  const status = err.statusCode || 500;
  fail(res, err.message || 'Internal server error', status);
}
