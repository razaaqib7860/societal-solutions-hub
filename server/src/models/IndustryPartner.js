import mongoose from 'mongoose';

const industryPartnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    sector: { type: String },
    capabilities: [{ type: String }],
    supportTypes: [{ type: String, enum: ['Funding', 'Mentorship', 'Equipment', 'Infrastructure', 'Pilot Deployment', 'CSR'] }],
    csrBudget: { type: Number, default: 0 },
    contactEmail: { type: String },
    contactPhone: { type: String },
    website: { type: String },
    logoUrl: { type: String, default: '' },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true }
);

export default mongoose.model('IndustryPartner', industryPartnerSchema);
