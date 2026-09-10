import { Router } from 'express';
import {
  createProject,
  listProjects,
  getProject,
  updateProjectStatus,
  addMilestone,
  updateMilestone,
  addMilestoneComment,
} from '../controllers/projectController.js';
import { recordImpactMetric, listImpactMetrics } from '../controllers/impactController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(protect);

router.post('/', authorize('ADMIN', 'UNIVERSITY'), createProject);
router.get('/', listProjects);
router.get('/:id', getProject);
router.patch('/:id/status', authorize('ADMIN', 'UNIVERSITY'), updateProjectStatus);

router.post('/:id/milestones', authorize('ADMIN', 'UNIVERSITY'), addMilestone);
router.patch('/:id/milestones/:milestoneId', authorize('ADMIN', 'UNIVERSITY'), updateMilestone);
router.post('/:id/milestones/:milestoneId/comments', addMilestoneComment);

router.post('/:id/impact', authorize('ADMIN', 'UNIVERSITY'), recordImpactMetric);
router.get('/:id/impact', listImpactMetrics);

export default router;
