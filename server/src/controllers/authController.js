import { User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';
import { generateToken } from '../utils/generateToken.js';

/** POST /api/v1/auth/register */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, district } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return fail(res, 'Email already registered', 409);

  const user = await User.create({
    name,
    email,
    passwordHash: password,
    role: role || 'CITIZEN',
    phone,
    district,
  });

  const token = generateToken(user);
  ok(res, { user: user.toSafeObject(), token }, 'Registration successful', 201);
});

/** POST /api/v1/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    return fail(res, 'Invalid email or password', 401);
  }
  if (!user.isActive) return fail(res, 'This account has been deactivated', 403);

  const token = generateToken(user);
  ok(res, { user: user.toSafeObject(), token }, 'Login successful');
});

/** GET /api/v1/auth/me */
export const me = asyncHandler(async (req, res) => {
  ok(res, req.user, 'Current user fetched');
});

/** POST /api/v1/auth/logout (stateless JWT: client discards token) */
export const logout = asyncHandler(async (req, res) => {
  ok(res, null, 'Logged out successfully');
});

/** PATCH /api/v1/auth/me */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, district, avatarUrl } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { name, phone, district, avatarUrl } },
    { new: true, runValidators: true }
  );
  ok(res, user, 'Profile updated');
});
