import mongoose from 'mongoose';
import { PROJECT_STATUS } from '../utils/constants.js';

const projectSchema = new mongoose.Schema(
  {
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    facultyMentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    industryPartners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'IndustryPartner' }],
    proposal: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' },
    milestones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' }],
    status: { type: String, enum: Object.values(PROJECT_STATUS), default: PROJECT_STATUS.PROPOSAL, index: true },
    requiredSupport: [{ type: String }],
    estimatedBudget: { type: Number, default: 0 },
    impactMetrics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ImpactMetric' }],
    title: { type: String },
    summary: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
