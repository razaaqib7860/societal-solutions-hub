import mongoose from 'mongoose';

const challengeEvidenceSchema = new mongoose.Schema(
  {
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['image', 'video', 'document', 'audio'], default: 'image' },
    url: { type: String, required: true },
    caption: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('ChallengeEvidence', challengeEvidenceSchema);
