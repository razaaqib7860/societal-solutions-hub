import { fail } from '../utils/apiResponse.js';

/** Restricts a route to the given list of roles. Use after `protect`. */
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return fail(res, 'Not authorized', 401);
  if (!roles.includes(req.user.role)) {
    return fail(res, `Role '${req.user.role}' is not permitted to perform this action`, 403);
  }
  next();
};

export default authorize;
