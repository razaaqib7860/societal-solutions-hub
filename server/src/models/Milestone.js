import mongoose from 'mongoose';
import { MILESTONE_NAME, MILESTONE_STATUS } from '../utils/constants.js';

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const milestoneSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    name: { type: String, enum: MILESTONE_NAME, required: true },
    description: { type: String, default: '' },
    deadline: { type: Date },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: MILESTONE_STATUS, default: 'Pending' },
    documents: [{ type: String }],
    comments: [commentSchema],
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Milestone', milestoneSchema);
