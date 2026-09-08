import mongoose from 'mongoose';

const impactMetricSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
    metricName: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, default: 'people' },
    beneficiaries: { type: Number, default: 0 },
    district: { type: String },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recordedAt: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('ImpactMetric', impactMetricSchema);
