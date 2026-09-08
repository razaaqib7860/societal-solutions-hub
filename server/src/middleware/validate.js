import { fail } from '../utils/apiResponse.js';

/** Validates req.body (or another target) against a zod schema. */
export const validate = (schema, target = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[target]);
  if (!result.success) {
    return fail(res, 'Validation failed', 422, result.error.flatten());
  }
  req[target] = result.data;
  next();
};

export default validate;
