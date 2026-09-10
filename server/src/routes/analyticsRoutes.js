import { Router } from 'express';
import {
  challengesByDistrict,
  challengesByDomain,
  severityDistribution,
  statusDistribution,
  universityParticipation,
  industryParticipation,
  projectPipeline,
  solutionsDeployed,
  impactTotals,
  dashboardSummary,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(protect, authorize('ADMIN'));

router.get('/summary', dashboardSummary);
router.get('/challenges-by-district', challengesByDistrict);
router.get('/challenges-by-domain', challengesByDomain);
router.get('/severity-distribution', severityDistribution);
router.get('/status-distribution', statusDistribution);
router.get('/university-participation', universityParticipation);
router.get('/industry-participation', industryParticipation);
router.get('/project-pipeline', projectPipeline);
router.get('/solutions-deployed', solutionsDeployed);
router.get('/impact-totals', impactTotals);

export default router;
