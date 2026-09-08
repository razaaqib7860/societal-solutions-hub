/** Uniform success response envelope. */
export function ok(res, data = null, message = 'Success', status = 200, meta = undefined) {
  return res.status(status).json({ success: true, message, data, ...(meta ? { meta } : {}) });
}

/** Uniform error response envelope. */
export function fail(res, message = 'Something went wrong', status = 400, errors = undefined) {
  return res.status(status).json({ success: false, message, ...(errors ? { errors } : {}) });
}
