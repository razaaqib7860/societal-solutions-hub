import { Router } from 'express';
import {
  recommendedChallenges,
  expressInterest,
  acceptChallenge,
  createTeam,
} from '../controllers/universityController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(protect, authorize('UNIVERSITY', 'ADMIN'));

router.get('/recommended-challenges', recommendedChallenges);
router.post('/challenges/:id/interest', expressInterest);
router.post('/challenges/:id/accept', acceptChallenge);
router.post('/projects/:id/team', createTeam);

export default router;
