import { Challenge, ChallengeEvidence, ChallengeCluster, University } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';
import { runAiPipeline } from '../services/challengeService.js';
import { haversineDistanceKm } from '../utils/geo.js';
import { CHALLENGE_STATUS } from '../utils/constants.js';
import { notifyMany } from '../services/notificationService.js';
import { User } from '../models/index.js';

/** POST /api/v1/challenges */
export const createChallenge = asyncHandler(async (req, res) => {
  const payload = { ...req.body, submittedBy: req.user._id };
  const challenge = new Challenge(payload);
  challenge.timeline.push({ status: CHALLENGE_STATUS.SUBMITTED, at: new Date(), by: req.user._id, note: 'Challenge submitted' });

  await runAiPipeline(challenge);
  challenge.status = CHALLENGE_STATUS.UNDER_REVIEW;
  await challenge.save();

  if (Array.isArray(req.body.evidenceUrls)) {
    const evidenceDocs = await ChallengeEvidence.insertMany(
      req.body.evidenceUrls.map((url) => ({ challenge: challenge._id, uploadedBy: req.user._id, url }))
    );
    challenge.evidence = evidenceDocs.map((e) => e._id);
    await challenge.save();
  }

  const admins = await User.find({ role: 'ADMIN' }).select('_id');
  await notifyMany(admins.map((a) => a._id), {
    title: 'New challenge submitted',
    message: `"${challenge.title}" needs review`,
    type: 'CHALLENGE',
    link: `/challenges/${challenge._id}`,
  });

  ok(res, challenge, 'Challenge submitted and analysed by AI', 201);
});

/** GET /api/v1/challenges */
export const listChallenges = asyncHandler(async (req, res) => {
  const { status, category, district, severity, page = 1, limit = 20, mine } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (district) filter['location.district'] = district;
  if (severity) filter.severity = severity;
  if (mine === 'true') filter.submittedBy = req.user._id;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Challenge.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)).populate('submittedBy', 'name email role'),
    Challenge.countDocuments(filter),
  ]);

  ok(res, items, 'Challenges fetched', 200, { total, page: Number(page), limit: Number(limit) });
});

/** GET /api/v1/challenges/:id */
export const getChallenge = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id)
    .populate('submittedBy', 'name email role')
    .populate('evidence')
    .populate('assignedUniversity')
    .populate('recommendedUniversities.university', 'name expertiseTags district');
  if (!challenge) return fail(res, 'Challenge not found', 404);
  ok(res, challenge, 'Challenge fetched');
});

/** PATCH /api/v1/challenges/:id/validate (ADMIN) */
export const validateChallenge = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id);
  if (!challenge) return fail(res, 'Challenge not found', 404);

  challenge.status = CHALLENGE_STATUS.VALIDATED;
  challenge.timeline.push({ status: CHALLENGE_STATUS.VALIDATED, at: new Date(), by: req.user._id, note: req.body.note || 'Validated by admin' });
  await challenge.save();

  ok(res, challenge, 'Challenge validated');
});

/** PATCH /api/v1/challenges/:id/reject (ADMIN) */
export const rejectChallenge = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id);
  if (!challenge) return fail(res, 'Challenge not found', 404);

  challenge.status = CHALLENGE_STATUS.REJECTED;
  challenge.rejectionReason = req.body.reason || 'Not actionable';
  challenge.timeline.push({ status: CHALLENGE_STATUS.REJECTED, at: new Date(), by: req.user._id, note: challenge.rejectionReason });
  await challenge.save();

  ok(res, challenge, 'Challenge rejected');
});

/** POST /api/v1/challenges/:id/merge (ADMIN) - merges duplicate challenge IDs into this one, forming/growing a cluster */
export const mergeChallenges = asyncHandler(async (req, res) => {
  const { duplicateIds = [] } = req.body;
  const primary = await Challenge.findById(req.params.id);
  if (!primary) return fail(res, 'Primary challenge not found', 404);

  const duplicates = await Challenge.find({ _id: { $in: duplicateIds } });

  let cluster = primary.cluster ? await ChallengeCluster.findById(primary.cluster) : null;
  if (!cluster) {
    cluster = await ChallengeCluster.create({
      title: primary.title,
      category: primary.category,
      representativeChallenge: primary._id,
      members: [primary._id],
      districtSpread: [primary.location?.district].filter(Boolean),
      reportCount: primary.reportCount || 1,
      aiSummary: `Cluster auto-created while merging ${duplicates.length} duplicate report(s).`,
    });
    primary.cluster = cluster._id;
  }

  for (const dup of duplicates) {
    dup.status = CHALLENGE_STATUS.MERGED;
    dup.cluster = cluster._id;
    dup.timeline.push({ status: CHALLENGE_STATUS.MERGED, at: new Date(), by: req.user._id, note: `Merged into ${primary._id}` });
    await dup.save();
    cluster.members.addToSet(dup._id);
    if (dup.location?.district) cluster.districtSpread = [...new Set([...cluster.districtSpread, dup.location.district])];
  }

  cluster.reportCount = cluster.members.length;
  await cluster.save();

  primary.reportCount = (primary.reportCount || 1) + duplicates.length;
  await primary.save();

  ok(res, { primary, cluster }, 'Duplicate challenges merged');
});

/** PATCH /api/v1/challenges/:id/assign (ADMIN) - assigns a university, AI-recommended or manual */
export const assignChallenge = asyncHandler(async (req, res) => {
  const { universityId } = req.body;
  const challenge = await Challenge.findById(req.params.id);
  if (!challenge) return fail(res, 'Challenge not found', 404);

  const university = await University.findById(universityId);
  if (!university) return fail(res, 'University not found', 404);

  challenge.assignedUniversity = university._id;
  challenge.status = CHALLENGE_STATUS.MATCHED;
  challenge.timeline.push({ status: CHALLENGE_STATUS.MATCHED, at: new Date(), by: req.user._id, note: `Assigned to ${university.name}` });
  await challenge.save();

  const universityUsers = await User.find({ 'organization.item': university._id, role: 'UNIVERSITY' }).select('_id');
  await notifyMany(universityUsers.map((u) => u._id), {
    title: 'New challenge assigned',
    message: `"${challenge.title}" has been assigned to your institution`,
    type: 'CHALLENGE',
    link: `/challenges/${challenge._id}`,
  });

  ok(res, challenge, 'Challenge assigned to university');
});

/** PATCH /api/v1/challenges/:id/override (ADMIN) - overrides AI classification */
export const overrideClassification = asyncHandler(async (req, res) => {
  const { category, subcategory, severity, priorityScore } = req.body;
  const challenge = await Challenge.findById(req.params.id);
  if (!challenge) return fail(res, 'Challenge not found', 404);

  if (category) challenge.category = category;
  if (subcategory) challenge.subcategory = subcategory;
  if (severity) challenge.severity = severity;
  if (priorityScore != null) challenge.priorityScore = priorityScore;
  challenge.aiAnalysis.overriddenBy = req.user._id;
  await challenge.save();

  ok(res, challenge, 'AI classification overridden');
});

/** GET /api/v1/challenges/nearby?lat=&lng=&radiusKm= */
export const nearbyChallenges = asyncHandler(async (req, res) => {
  const { lat, lng, radiusKm = 25 } = req.query;
  if (!lat || !lng) return fail(res, 'lat and lng query params are required', 400);

  const all = await Challenge.find({ status: { $ne: 'REJECTED' } }).lean();
  const point = { lat: Number(lat), lng: Number(lng) };
  const results = all
    .map((c) => ({ ...c, distanceKm: haversineDistanceKm(point, c.location) }))
    .filter((c) => c.distanceKm <= Number(radiusKm))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  ok(res, results, 'Nearby challenges fetched');
});
