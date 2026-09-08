import { Proposal, Challenge } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';

export const createProposal = asyncHandler(async (req, res) => {
  const proposal = await Proposal.create({ ...req.body, submittedBy: req.user._id, status: 'SUBMITTED' });
  ok(res, proposal, 'Proposal submitted', 201);
});

export const listProposals = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.challenge) filter.challenge = req.query.challenge;
  if (req.query.university) filter.university = req.query.university;
  const proposals = await Proposal.find(filter).sort('-createdAt');
  ok(res, proposals, 'Proposals fetched');
});

export const getProposal = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findById(req.params.id).populate('challenge').populate('university');
  if (!proposal) return fail(res, 'Proposal not found', 404);
  ok(res, proposal, 'Proposal fetched');
});

export const reviewProposal = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const proposal = await Proposal.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!proposal) return fail(res, 'Proposal not found', 404);
  ok(res, proposal, 'Proposal reviewed');
});
