import mongoose from 'mongoose';

const challengeClusterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String },
    representativeChallenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
    districtSpread: [{ type: String }],
    reportCount: { type: Number, default: 0 },
    aiAssisted: { type: Boolean, default: true },
    aiSummary: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('ChallengeCluster', challengeClusterSchema);
