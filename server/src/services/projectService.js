import { Milestone, Project } from '../models/index.js';
import { MILESTONE_NAME } from '../utils/constants.js';

/** Creates the default milestone set (Research -> Deployment) for a new project. */
export async function createDefaultMilestones(projectId) {
  const milestones = await Milestone.insertMany(
    MILESTONE_NAME.map((name) => ({ project: projectId, name, status: 'Pending' }))
  );
  await Project.findByIdAndUpdate(projectId, { $push: { milestones: { $each: milestones.map((m) => m._id) } } });
  return milestones;
}

export default { createDefaultMilestones };
