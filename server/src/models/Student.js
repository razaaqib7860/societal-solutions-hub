import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    department: { type: String },
    year: { type: Number },
    skills: [{ type: String }],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true }
);

export default mongoose.model('Student', studentSchema);
