import { Project, Milestone } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';

export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create(req.body);
  ok(res, project, 'Project created', 201);
});

export const listProjects = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.university) filter.university = req.query.university;
  const projects = await Project.find(filter)
    .populate('challenge', 'title category location')
    .populate('university', 'name')
    .populate('industryPartners', 'name')
    .sort('-createdAt');
  ok(res, projects, 'Projects fetched');
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('challenge')
    .populate('university')
    .populate('facultyMentor')
    .populate('students')
    .populate('industryPartners')
    .populate('proposal')
    .populate({ path: 'milestones', options: { sort: { createdAt: 1 } } })
    .populate('impactMetrics');
  if (!project) return fail(res, 'Project not found', 404);
  ok(res, project, 'Project fetched');
});

export const updateProjectStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const project = await Project.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!project) return fail(res, 'Project not found', 404);
  ok(res, project, 'Project status updated');
});

export const addMilestone = asyncHandler(async (req, res) => {
  const milestone = await Milestone.create({ ...req.body, project: req.params.id });
  await Project.findByIdAndUpdate(req.params.id, { $push: { milestones: milestone._id } });
  ok(res, milestone, 'Milestone added', 201);
});

export const updateMilestone = asyncHandler(async (req, res) => {
  const milestone = await Milestone.findByIdAndUpdate(req.params.milestoneId, req.body, { new: true, runValidators: true });
  if (!milestone) return fail(res, 'Milestone not found', 404);
  if (milestone.status === 'Completed' && !milestone.completedAt) {
    milestone.completedAt = new Date();
    await milestone.save();
  }
  ok(res, milestone, 'Milestone updated');
});

export const addMilestoneComment = asyncHandler(async (req, res) => {
  const milestone = await Milestone.findById(req.params.milestoneId);
  if (!milestone) return fail(res, 'Milestone not found', 404);
  milestone.comments.push({ author: req.user._id, text: req.body.text });
  await milestone.save();
  ok(res, milestone, 'Comment added', 201);
});
