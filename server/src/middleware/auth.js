import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/index.js';
import { fail } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Verifies the Bearer JWT and attaches the authenticated user to req.user. */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) return fail(res, 'Not authorized, no token provided', 401);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) return fail(res, 'User no longer exists', 401);
    req.user = user;
    next();
  } catch (err) {
    return fail(res, 'Not authorized, invalid or expired token', 401);
  }
});

export default protect;
