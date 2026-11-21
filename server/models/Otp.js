const mongoose = require('mongoose');
const otpSchema = new mongoose.Schema({
  role: { type: String, default: '' },
  email: { type: String, required: true, lowercase: true, trim: true },
  otpHash: { type: String, required: true, select: false },
  attempts: { type: Number, default: 0, min: 0, max: 5 },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('Otp', otpSchema);
