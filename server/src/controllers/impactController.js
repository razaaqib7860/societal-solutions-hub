import { ImpactMetric, Project } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';

/** POST /api/v1/projects/:id/impact */
export const recordImpactMetric = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return fail(res, 'Project not found', 404);

  const metric = await ImpactMetric.create({
    ...req.body,
    project: project._id,
    challenge: req.body.challenge || project.challenge,
    recordedBy: req.user._id,
  });

  await Project.findByIdAndUpdate(project._id, { $addToSet: { impactMetrics: metric._id } });

  ok(res, metric, 'Impact metric recorded', 201);
});

/** GET /api/v1/projects/:id/impact */
export const listImpactMetrics = asyncHandler(async (req, res) => {
  const metrics = await ImpactMetric.find({ project: req.params.id }).sort('-recordedAt');
  ok(res, metrics, 'Impact metrics fetched');
});

/** GET /api/v1/impact/citizens-impacted - aggregate total citizens impacted across all projects */
export const citizensImpacted = asyncHandler(async (req, res) => {
  const [totals] = await ImpactMetric.aggregate([
    {
      $group: {
        _id: null,
        totalCitizensImpacted: { $sum: '$beneficiaries' },
        totalValue: { $sum: '$value' },
      },
    },
    { $project: { _id: 0, totalCitizensImpacted: 1, totalValue: 1 } },
  ]);
  ok(res, totals || { totalCitizensImpacted: 0, totalValue: 0 }, 'Citizens impacted fetched');
});
