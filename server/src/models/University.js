import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    district: { type: String },
    address: { type: String },
    departments: [{ type: String }],
    researchAreas: [{ type: String }],
    laboratories: [{ type: String }],
    expertiseTags: [{ type: String }],
    previousProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    contactEmail: { type: String },
    contactPhone: { type: String },
    website: { type: String },
    logoUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('University', universitySchema);
