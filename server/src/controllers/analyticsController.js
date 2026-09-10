import { Challenge, Project, University, IndustryPartner, ImpactMetric, CollaborationRequest } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';

/** GET /api/v1/analytics/challenges-by-district */
export const challengesByDistrict = asyncHandler(async (req, res) => {
  const data = await Challenge.aggregate([
    { $group: { _id: '$location.district', count: { $sum: 1 } } },
    { $project: { _id: 0, district: '$_id', count: 1 } },
    { $sort: { count: -1 } },
  ]);
  ok(res, data, 'Challenges by district fetched');
});

/** GET /api/v1/analytics/challenges-by-domain */
export const challengesByDomain = asyncHandler(async (req, res) => {
  const data = await Challenge.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $project: { _id: 0, domain: '$_id', count: 1 } },
    { $sort: { count: -1 } },
  ]);
  ok(res, data, 'Challenges by domain fetched');
});

/** GET /api/v1/analytics/severity-distribution */
export const severityDistribution = asyncHandler(async (req, res) => {
  const data = await Challenge.aggregate([
    { $group: { _id: '$severity', count: { $sum: 1 } } },
    { $project: { _id: 0, severity: '$_id', count: 1 } },
    { $sort: { count: -1 } },
  ]);
  ok(res, data, 'Severity distribution fetched');
});

/** GET /api/v1/analytics/status-distribution */
export const statusDistribution = asyncHandler(async (req, res) => {
  const data = await Challenge.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { _id: 0, status: '$_id', count: 1 } },
    { $sort: { count: -1 } },
  ]);
  ok(res, data, 'Status distribution fetched');
});

/** GET /api/v1/analytics/university-participation */
export const universityParticipation = asyncHandler(async (req, res) => {
  const data = await Project.aggregate([
    { $group: { _id: '$university', projectCount: { $sum: 1 } } },
    {
      $lookup: {
        from: University.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'university',
      },
    },
    { $unwind: '$university' },
    { $project: { _id: 0, university: '$university.name', district: '$university.district', projectCount: 1 } },
    { $sort: { projectCount: -1 } },
  ]);
  ok(res, data, 'University participation fetched');
});

/** GET /api/v1/analytics/industry-participation */
export const industryParticipation = asyncHandler(async (req, res) => {
  const data = await CollaborationRequest.aggregate([
    { $match: { industryPartner: { $ne: null } } },
    { $group: { _id: '$industryPartner', requestCount: { $sum: 1 }, accepted: { $sum: { $cond: [{ $eq: ['$status', 'ACCEPTED'] }, 1, 0] } } } },
    {
      $lookup: {
        from: IndustryPartner.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'industryPartner',
      },
    },
    { $unwind: '$industryPartner' },
    { $project: { _id: 0, industryPartner: '$industryPartner.name', sector: '$industryPartner.sector', requestCount: 1, accepted: 1 } },
    { $sort: { requestCount: -1 } },
  ]);
  ok(res, data, 'Industry participation fetched');
});

/** GET /api/v1/analytics/project-pipeline */
export const projectPipeline = asyncHandler(async (req, res) => {
  const data = await Project.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { _id: 0, status: '$_id', count: 1 } },
    { $sort: { count: -1 } },
  ]);
  ok(res, data, 'Project pipeline fetched');
});

/** GET /api/v1/analytics/solutions-deployed */
export const solutionsDeployed = asyncHandler(async (req, res) => {
  const count = await Project.countDocuments({ status: { $in: ['DEPLOYMENT', 'IMPACT_MEASUREMENT', 'COMPLETED'] } });
  ok(res, { solutionsDeployed: count }, 'Solutions deployed count fetched');
});

/** GET /api/v1/analytics/impact-totals */
export const impactTotals = asyncHandler(async (req, res) => {
  const [totals] = await ImpactMetric.aggregate([
    {
      $group: {
        _id: null,
        totalValue: { $sum: '$value' },
        totalBeneficiaries: { $sum: '$beneficiaries' },
        metricCount: { $sum: 1 },
      },
    },
    { $project: { _id: 0, totalValue: 1, totalBeneficiaries: 1, metricCount: 1 } },
  ]);
  ok(res, totals || { totalValue: 0, totalBeneficiaries: 0, metricCount: 0 }, 'Impact totals fetched');
});

/** GET /api/v1/analytics/summary - combined dashboard summary */
export const dashboardSummary = asyncHandler(async (req, res) => {
  const [totalChallenges, totalProjects, totalUniversities, totalIndustryPartners, resolvedChallenges] = await Promise.all([
    Challenge.countDocuments(),
    Project.countDocuments(),
    University.countDocuments(),
    IndustryPartner.countDocuments(),
    Challenge.countDocuments({ status: 'RESOLVED' }),
  ]);
  ok(res, { totalChallenges, totalProjects, totalUniversities, totalIndustryPartners, resolvedChallenges }, 'Dashboard summary fetched');
});
