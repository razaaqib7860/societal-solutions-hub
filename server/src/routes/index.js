import { Router } from 'express';
import authRoutes from './authRoutes.js';
import challengeRoutes from './challengeRoutes.js';
import universityRoutes from './universityRoutes.js';
import proposalRoutes from './proposalRoutes.js';
import projectRoutes from './projectRoutes.js';
import collaborationRoutes from './collaborationRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import impactRoutes from './impactRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/challenges', challengeRoutes);
router.use('/universities', universityRoutes);
router.use('/proposals', proposalRoutes);
router.use('/projects', projectRoutes);
router.use('/collaborations', collaborationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/impact', impactRoutes);

export default router;
