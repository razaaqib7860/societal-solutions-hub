import mongoose from 'mongoose';

const collaborationRequestSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
    initiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    initiatorRole: { type: String, enum: ['UNIVERSITY', 'INDUSTRY'] },
    industryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'IndustryPartner' },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    supportOffered: [{ type: String }],
    message: { type: String },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN'], default: 'PENDING' },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('CollaborationRequest', collaborationRequestSchema);
