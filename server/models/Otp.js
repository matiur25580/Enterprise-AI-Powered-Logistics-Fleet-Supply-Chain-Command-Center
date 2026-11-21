const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  role: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  otpHash: { type: String, required: true, select: false },
  failedAttempts: { type: Number, default: 0, min: 0 },
  lockedUntil: { type: Date, default: null },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

otpSchema.index({ email: 1, role: 1 }, { unique: true });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.models.Otp || mongoose.model('Otp', otpSchema);
