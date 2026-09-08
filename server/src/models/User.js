import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, JHARKHAND_DISTRICTS } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.CITIZEN, index: true },
    organization: {
      kind: { type: String, enum: ['University', 'IndustryPartner'], default: undefined },
      item: { type: mongoose.Schema.Types.ObjectId, refPath: 'organization.kind' },
    },
    phone: { type: String, trim: true },
    district: { type: String, enum: JHARKHAND_DISTRICTS },
    avatarUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export default mongoose.model('User', userSchema);
