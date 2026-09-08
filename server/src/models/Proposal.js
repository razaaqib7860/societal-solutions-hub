import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema(
  {
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    problemUnderstanding: { type: String, required: true },
    proposedSolution: { type: String, required: true },
    technology: [{ type: String }],
    innovation: { type: String },
    expectedImpact: { type: String },
    implementationPlan: { type: String },
    estimatedBudget: { type: Number, default: 0 },
    timeline: { type: String },
    requiredIndustrySupport: [{ type: String }],
    expectedBeneficiaries: { type: Number, default: 0 },
    documents: [{ type: String }],
    status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'], default: 'DRAFT' },
  },
  { timestamps: true }
);

export default mongoose.model('Proposal', proposalSchema);
