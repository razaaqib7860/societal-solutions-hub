import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/** Signs a JWT embedding the user id and role. */
export function generateToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export default generateToken;
