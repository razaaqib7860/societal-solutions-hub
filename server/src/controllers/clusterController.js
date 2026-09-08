import { ChallengeCluster } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';

export const listClusters = asyncHandler(async (req, res) => {
  const clusters = await ChallengeCluster.find().populate('representativeChallenge').sort('-reportCount');
  ok(res, clusters, 'Clusters fetched');
});

export const getCluster = asyncHandler(async (req, res) => {
  const cluster = await ChallengeCluster.findById(req.params.id).populate('members').populate('representativeChallenge');
  if (!cluster) return fail(res, 'Cluster not found', 404);
  ok(res, cluster, 'Cluster fetched');
});
