import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['CHALLENGE', 'PROJECT', 'PROPOSAL', 'COLLABORATION', 'MILESTONE', 'SYSTEM'],
      default: 'SYSTEM',
    },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
