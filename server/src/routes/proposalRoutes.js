import { Router } from 'express';
import { createProposal, listProposals, getProposal, reviewProposal } from '../controllers/proposalController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(protect);

router.post('/', authorize('UNIVERSITY'), createProposal);
router.get('/', listProposals);
router.get('/:id', getProposal);
router.patch('/:id/review', authorize('ADMIN'), reviewProposal);

export default router;
