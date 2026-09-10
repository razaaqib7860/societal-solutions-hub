import { Router } from 'express';
import {
  createCollaborationRequest,
  listCollaborationRequests,
  respondToCollaboration,
} from '../controllers/collaborationController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(protect);

router.post('/', authorize('INDUSTRY', 'UNIVERSITY'), createCollaborationRequest);
router.get('/', listCollaborationRequests);
router.patch('/:id/respond', authorize('UNIVERSITY', 'INDUSTRY', 'ADMIN'), respondToCollaboration);

export default router;
