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
import { validate } from '../middleware/validate.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { z } from 'zod';
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, JHARKHAND_DISTRICTS } from '../utils/constants.js';

const router = Router();
const createChallengeSchema = z.object({
  title: z.string().trim().min(5).max(160),
  description: z.string().trim().min(20).max(5000),
  category: z.enum(COMPLAINT_CATEGORIES).optional(),
  subcategory: z.string().trim().max(80).optional(),
  location: z.object({ district: z.enum(JHARKHAND_DISTRICTS), block: z.string().trim().min(1).max(100), village: z.string().trim().min(1).max(100), lat: z.number(), lng: z.number() }),
  affectedPopulation: z.number().int().min(1).max(100000000),
  issueDuration: z.string().trim().min(1).max(100),
  frequency: z.enum(['One-time', 'Occasional', 'Recurring', 'Continuous']),
  urgency: z.enum(['Low', 'Medium', 'High', 'Critical']),
  evidenceUrls: z.array(z.string().url()).max(10).optional(),
}).strict();
const overrideSchema = z.object({ category: z.enum(COMPLAINT_CATEGORIES).optional(), subcategory: z.string().trim().min(1).max(80).optional(), priority: z.enum(COMPLAINT_PRIORITIES).optional() }).strict();

router.use(protect);

router.get('/nearby', nearbyChallenges);
router.get('/clusters', listClusters);
router.get('/clusters/:id', getCluster);

router.post('/', authorize('CITIZEN', 'ADMIN'), rateLimit({ windowMs: 60_000, max: 10 }), validate(createChallengeSchema), createChallenge);
router.get('/', listChallenges);
router.get('/:id', getChallenge);

router.patch('/:id/validate', authorize('ADMIN'), validateChallenge);
router.patch('/:id/reject', authorize('ADMIN'), rejectChallenge);
router.post('/:id/merge', authorize('ADMIN'), mergeChallenges);
router.patch('/:id/assign', authorize('ADMIN'), assignChallenge);
router.patch('/:id/override', authorize('ADMIN'), validate(overrideSchema), overrideClassification);

export default router;
