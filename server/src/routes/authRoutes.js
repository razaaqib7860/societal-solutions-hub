import { Router } from 'express';
import { register, login, me, logout, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, me);
router.patch('/me', protect, updateProfile);

export default router;
