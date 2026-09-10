import { Router } from 'express';
import {
  createChallenge,
  listChallenges,
  getChallenge,
  validateChallenge,
  rejectChallenge,
  mergeChallenges,
  assignChallenge,
  overrideClassification,
  nearbyChallenges,
} from '../controllers/challengeController.js';
import { listClusters, getCluster } from '../controllers/clusterController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(protect);

router.get('/nearby', nearbyChallenges);
router.get('/clusters', listClusters);
router.get('/clusters/:id', getCluster);

router.post('/', authorize('CITIZEN', 'ADMIN'), createChallenge);
router.get('/', listChallenges);
router.get('/:id', getChallenge);

router.patch('/:id/validate', authorize('ADMIN'), validateChallenge);
router.patch('/:id/reject', authorize('ADMIN'), rejectChallenge);
router.post('/:id/merge', authorize('ADMIN'), mergeChallenges);
router.patch('/:id/assign', authorize('ADMIN'), assignChallenge);
router.patch('/:id/override', authorize('ADMIN'), overrideClassification);

export default router;
