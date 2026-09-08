import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    department: { type: String },
    designation: { type: String },
    expertise: [{ type: String }],
    mentoredProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true }
);

export default mongoose.model('Faculty', facultySchema);
