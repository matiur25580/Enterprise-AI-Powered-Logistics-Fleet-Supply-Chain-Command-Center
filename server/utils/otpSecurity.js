const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const MAX_OTP_ATTEMPTS = 5;

function generateOtp() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

function hashOtp(code) {
  return bcrypt.hash(code, 10);
}

async function consumeOtp(Otp, { email, role, code }) {
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) return false;
  const challenge = await Otp.findOneAndUpdate(
    { email, role, expiresAt: { $gt: new Date() }, attempts: { $lt: MAX_OTP_ATTEMPTS } },
    { $inc: { attempts: 1 } },
    { new: true }
  ).select('+otpHash');
  if (!challenge || !(await bcrypt.compare(code, challenge.otpHash))) return false;
  const consumed = await Otp.deleteOne({ _id: challenge._id, attempts: challenge.attempts });
  return consumed.deletedCount === 1;
}

module.exports = { generateOtp, hashOtp, consumeOtp, MAX_OTP_ATTEMPTS };
