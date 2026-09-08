import mongoose from 'mongoose';
import { CHALLENGE_STATUS, SEVERITY } from '../utils/constants.js';

const timelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: Object.values(CHALLENGE_STATUS) },
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const recommendedUniversitySchema = new mongoose.Schema(
  {
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    score: { type: Number, default: 0 },
    reasons: [{ type: String }],
  },
  { _id: false }
);

const challengeSchema = new mongoose.Schema(
  {
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String },
    subcategory: { type: String },
    location: {
      district: { type: String },
      block: { type: String },
      village: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    affectedPopulation: { type: Number, default: 0 },
    issueDuration: { type: String },
    frequency: { type: String, enum: ['One-time', 'Occasional', 'Recurring', 'Continuous'], default: 'Recurring' },
    urgency: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    severity: { type: String, enum: SEVERITY, default: 'Medium' },
    priorityScore: { type: Number, default: 0 },
    innovationScore: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(CHALLENGE_STATUS), default: CHALLENGE_STATUS.SUBMITTED, index: true },
    evidence: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChallengeEvidence' }],
    similarChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
    cluster: { type: mongoose.Schema.Types.ObjectId, ref: 'ChallengeCluster' },
    reportCount: { type: Number, default: 1 },
    recommendedUniversities: [recommendedUniversitySchema],
    assignedUniversity: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    aiAnalysis: {
      category: String,
      subcategory: String,
      severity: String,
      priorityScore: Number,
      innovationScore: Number,
      confidence: Number,
      generatedAt: Date,
      overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      aiAssisted: { type: Boolean, default: true },
    },
    timeline: [timelineEntrySchema],
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

challengeSchema.index({ 'location.lat': 1, 'location.lng': 1 });
challengeSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Challenge', challengeSchema);
