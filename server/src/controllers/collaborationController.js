import { CollaborationRequest, Project } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';
import { notifyUser } from '../services/notificationService.js';

/** POST /api/v1/collaborations (INDUSTRY expresses interest / UNIVERSITY invites partner) */
export const createCollaborationRequest = asyncHandler(async (req, res) => {
  const request = await CollaborationRequest.create({ ...req.body, initiator: req.user._id, initiatorRole: req.user.role });
  ok(res, request, 'Collaboration request created', 201);
});

export const listCollaborationRequests = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.project) filter.project = req.query.project;
  if (req.query.status) filter.status = req.query.status;
  const requests = await CollaborationRequest.find(filter).populate('project industryPartner university').sort('-createdAt');
  ok(res, requests, 'Collaboration requests fetched');
});

/** PATCH /api/v1/collaborations/:id/respond */
export const respondToCollaboration = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const request = await CollaborationRequest.findById(req.params.id);
  if (!request) return fail(res, 'Collaboration request not found', 404);

  request.status = status;
  request.respondedBy = req.user._id;
  request.respondedAt = new Date();
  await request.save();

  if (status === 'ACCEPTED' && request.project && request.industryPartner) {
    await Project.findByIdAndUpdate(request.project, { $addToSet: { industryPartners: request.industryPartner } });
  }

  await notifyUser({
    recipient: request.initiator,
    title: `Collaboration request ${status.toLowerCase()}`,
    message: `Your collaboration request has been ${status.toLowerCase()}`,
    type: 'COLLABORATION',
  });

  ok(res, request, 'Collaboration request updated');
});
