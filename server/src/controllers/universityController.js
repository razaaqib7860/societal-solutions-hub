import { University, Challenge, Project, Faculty, Student } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';
import { createDefaultMilestones } from '../services/projectService.js';
import { CHALLENGE_STATUS, PROJECT_STATUS } from '../utils/constants.js';

/** GET /api/v1/universities/recommended-challenges */
export const recommendedChallenges = asyncHandler(async (req, res) => {
  const universityId = req.user.organization?.item;
  if (!universityId) return fail(res, 'No university organization linked to this account', 400);

  const challenges = await Challenge.find({
    status: { $in: [CHALLENGE_STATUS.VALIDATED, CHALLENGE_STATUS.MATCHED] },
    $or: [{ assignedUniversity: universityId }, { 'recommendedUniversities.university': universityId }],
  }).sort('-priorityScore');

  ok(res, challenges, 'Recommended challenges fetched');
});

/** POST /api/v1/universities/challenges/:id/interest */
export const expressInterest = asyncHandler(async (req, res) => {
  const universityId = req.user.organization?.item;
  const challenge = await Challenge.findById(req.params.id);
  if (!challenge) return fail(res, 'Challenge not found', 404);

  challenge.timeline.push({ status: challenge.status, at: new Date(), by: req.user._id, note: 'University expressed interest' });
  await challenge.save();

  ok(res, challenge, 'Interest recorded');
});

/** POST /api/v1/universities/challenges/:id/accept */
export const acceptChallenge = asyncHandler(async (req, res) => {
  const universityId = req.user.organization?.item;
  if (!universityId) return fail(res, 'No university organization linked to this account', 400);

  const challenge = await Challenge.findById(req.params.id);
  if (!challenge) return fail(res, 'Challenge not found', 404);

  challenge.assignedUniversity = universityId;
  challenge.status = CHALLENGE_STATUS.PROJECT_CREATED;
  challenge.timeline.push({ status: CHALLENGE_STATUS.PROJECT_CREATED, at: new Date(), by: req.user._id, note: 'University accepted challenge' });
  await challenge.save();

  const project = await Project.create({
    challenge: challenge._id,
    university: universityId,
    title: challenge.title,
    summary: challenge.description,
    status: PROJECT_STATUS.PROPOSAL,
  });
  await createDefaultMilestones(project._id);

  ok(res, { challenge, project }, 'Challenge accepted and project created', 201);
});

/** POST /api/v1/universities/projects/:id/team */
export const createTeam = asyncHandler(async (req, res) => {
  const { facultyMentor, students = [] } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) return fail(res, 'Project not found', 404);

  if (facultyMentor) project.facultyMentor = facultyMentor;
  if (students.length) project.students = students;
  await project.save();

  if (facultyMentor) await Faculty.findByIdAndUpdate(facultyMentor, { $addToSet: { mentoredProjects: project._id } });
  if (students.length) await Student.updateMany({ _id: { $in: students } }, { $addToSet: { projects: project._id } });

  ok(res, project, 'Team formed for project');
});
