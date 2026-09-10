import { Router } from 'express';
import { citizensImpacted } from '../controllers/impactController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/citizens-impacted', citizensImpacted);

export default router;
