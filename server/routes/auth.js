const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createHmac, randomInt, randomUUID, timingSafeEqual } = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/sendEmail');
const { authenticate, authorize, authSecret } = require('../middleware/auth');
const MongoRateLimitStore = require('../utils/MongoRateLimitStore');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const r = express.Router();
const ROLES = ['Admin', 'FleetManager', 'WarehouseManager', 'Driver', 'Client', 'Accountant'];
const OTP_WINDOW_MS = 5 * 60 * 1000;
const OTP_LOCK_MS = 10 * 60 * 1000;
const genericOtpResponse = {
  success: true,
  message: 'If the account is eligible, a verification code will be sent.'
};

const otpIpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  store: new MongoRateLimitStore('auth:otp:ip:'),
  keyGenerator: (req) => createHmac('sha256', authSecret()).update(ipKeyGenerator(req.ip)).digest('hex')
});
const otpEmailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  store: new MongoRateLimitStore('auth:otp:email:'),
  keyGenerator: (req) => createHmac('sha256', authSecret()).update(String(req.body.email || '').trim().toLowerCase()).digest('hex')
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  store: new MongoRateLimitStore('auth:login:ip:'),
  keyGenerator: (req) => createHmac('sha256', authSecret()).update(ipKeyGenerator(req.ip)).digest('hex')
});

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}
function otpDigest(email, role, otp) {
  const secret = process.env.OTP_SECRET || authSecret();
  if (secret.length < 32) throw new Error('OTP_SECRET must contain at least 32 characters.');
  return createHmac('sha256', secret).update(email + ':' + role + ':' + otp).digest('hex');
}
function sameDigest(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}
function validateRegistration(req, res, next) {
  const { fullName, email, password, contactNumber, dob, otp } = req.body || {};
  if (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 100
    || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || typeof password !== 'string' || password.length < 8 || password.length > 128
    || typeof contactNumber !== 'string' || contactNumber.trim().length < 7 || contactNumber.trim().length > 24
    || typeof dob !== 'string' || !/^\d{8}$/.test(dob)
    || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ success: false, message: 'Please provide valid registration details and a 6-digit OTP.' });
  }
  req.body.email = normalizeEmail(email);
  req.body.fullName = fullName.trim();
  req.body.contactNumber = contactNumber.trim();
  next();
}
async function issueOtp(email, role, fullName) {
  const current = await Otp.findOne({ email, role });
  if (current && current.lockedUntil && current.lockedUntil > new Date()) return;
  const otp = String(randomInt(100000, 1000000));
  const otpHash = otpDigest(email, role, otp);
  await Otp.findOneAndUpdate(
    { email, role },
    { $set: { otpHash, failedAttempts: 0, lockedUntil: null, expiresAt: new Date(Date.now() + OTP_WINDOW_MS) } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  try {
    await sendEmail(email, otp);
  } catch (error) {
    await Otp.deleteOne({ email, role, otpHash });
    console.error(JSON.stringify({ level: 'error', event: 'otp_delivery_failed', error: error.name }));
  }
}
async function verifyOtp(email, role, submittedOtp) {
  const record = await Otp.findOne({ email, role }).select('+otpHash');
  const now = new Date();
  if (!record || record.expiresAt <= now || (record.lockedUntil && record.lockedUntil > now)) {
    const error = new Error('Invalid or expired OTP.');
    error.status = 400;
    throw error;
  }
  if (!sameDigest(record.otpHash, otpDigest(email, role, submittedOtp))) {
    await Otp.findOneAndUpdate(
      {
        _id: record._id,
        otpHash: record.otpHash,
        expiresAt: { $gt: now },
        $and: [
          { $or: [{ failedAttempts: { $lt: 5 } }, { failedAttempts: { $exists: false } }] },
          { $or: [{ lockedUntil: null }, { lockedUntil: { $lte: now } }] }
        ]
      },
      [
        { $set: { failedAttempts: { $add: [{ $ifNull: ['$failedAttempts', 0] }, 1] } } },
        { $set: {
          lockedUntil: { $cond: [{ $gte: ['$failedAttempts', 5] }, new Date(now.getTime() + OTP_LOCK_MS), '$lockedUntil'] },
          expiresAt: { $cond: [{ $gte: ['$failedAttempts', 5] }, new Date(now.getTime() + OTP_LOCK_MS), '$expiresAt'] }
        } }
      ],
      { new: true }
    );
    const updated = await Otp.findById(record._id).select('failedAttempts');
    const error = new Error(updated && updated.failedAttempts >= 5
      ? 'Too many incorrect OTP attempts. Request a new code later.'
      : 'Invalid or expired OTP.');
    error.status = updated && updated.failedAttempts >= 5 ? 429 : 400;
    throw error;
  }
  if (record.failedAttempts >= 5) {
    const error = new Error('Too many incorrect OTP attempts. Request a new code later.');
    error.status = 429;
    throw error;
  }
  return record;
}
async function consumeOtp(record, session) {
  const now = new Date();
  const consumed = await Otp.findOneAndDelete({
    _id: record._id,
    otpHash: record.otpHash,
    expiresAt: { $gt: now },
    $and: [
      { $or: [{ failedAttempts: { $lt: 5 } }, { failedAttempts: { $exists: false } }] },
      { $or: [{ lockedUntil: null }, { lockedUntil: { $lte: now } }] }
    ]
  }, { session });
  if (!consumed) {
    const error = new Error('Invalid or expired OTP.');
    error.status = 400;
    throw error;
  }
}
function publicOtpResponse(res) {
  return res.status(202).json(genericOtpResponse);
}

r.post('/send-otp', otpIpLimiter, otpEmailLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const role = 'Client';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    }
    if (await User.exists({ email, role })) return publicOtpResponse(res);
    await issueOtp(email, role, String(req.body.fullName || '').trim());
    return publicOtpResponse(res);
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', event: 'signup_otp_failed', error: error.name }));
    return publicOtpResponse(res);
  }
});

r.post('/register', validateRegistration, async (req, res) => {
  const { fullName, email, password, contactNumber, dob, otp } = req.body;
  try {
    if (req.body.role && req.body.role !== 'Client') {
      return res.status(403).json({ success: false, message: 'Public registration is limited to Client accounts.' });
    }
    if (await User.exists({ email, role: 'Client' })) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }
    const otpRecord = await verifyOtp(email, 'Client', otp);
    const passwordHash = await bcrypt.hash(password, 12);
    const dobDigits = dob.replace(/\D/g, '').slice(0, 8);
    const uniqueId = 'CL-' + randomUUID().slice(0, 8).toUpperCase();
    const session = await mongoose.startSession();
    let created;
    try {
      await session.withTransaction(async () => {
        await consumeOtp(otpRecord, session);
        const [user] = await User.create([{
          fullName, email, password: passwordHash, role: 'Client',
          contactNumber, dob: dobDigits, uniqueId
        }], { session });
        created = user;
      });
    } finally {
      await session.endSession();
    }
    return res.status(201).json({ message: 'Registered successfully', success: true, uniqueId: created.uniqueId });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Registration could not be completed.' });
  }
});

r.post('/login', loginLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password, role } = req.body;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || !ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }
    const user = await User.findOne({ email, role }).select('+password');
    if (!user || user.isActive === false || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const token = jwt.sign({
      id: user._id.toString(), type: 'access', ver: Number(user.tokenVersion || 0)
    }, authSecret(), { expiresIn: '1h', algorithm: 'HS256' });
    return res.json({
      message: 'Login successful', success: true, token,
      role: user.role, fullName: user.fullName, email: user.email
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Login service is temporarily unavailable.' });
  }
});

r.post('/logout', authenticate, async (req, res) => {
  const result = await User.updateOne(
    { _id: req.user._id, tokenVersion: req.user.tokenVersion },
    { $inc: { tokenVersion: 1 } }
  );
  return res.json({ success: true, revoked: result.modifiedCount === 1 });
});

r.post('/forgot-password', otpIpLimiter, otpEmailLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const role = String(req.body.role || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !ROLES.includes(role)) {
      return publicOtpResponse(res);
    }
    if (await User.exists({ email, role })) await issueOtp(email, role, '');
    return publicOtpResponse(res);
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', event: 'password_reset_otp_failed', error: error.name }));
    return publicOtpResponse(res);
  }
});

r.post('/reset-password', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const role = String(req.body.role || '');
  const otp = String(req.body.otp || '');
  const newPassword = req.body.newPassword;
  if (!ROLES.includes(role) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || !/^\d{6}$/.test(otp) || typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
  }
  try {
    const otpRecord = await verifyOtp(email, role, otp);
    const hash = await bcrypt.hash(newPassword, 12);
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await consumeOtp(otpRecord, session);
        const user = await User.findOneAndUpdate(
          { email, role, isActive: { $ne: false } },
          { $set: { password: hash }, $inc: { tokenVersion: 1 } },
          { new: true, session }
        );
        if (!user) {
          const error = new Error('Invalid or expired OTP.');
          error.status = 400;
          throw error;
        }
      });
    } finally {
      await session.endSession();
    }
    return res.json({ success: true, message: 'Password reset successfully. Please log in again.' });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Password reset could not be completed.' });
  }
});

r.get('/by-role/:role', authenticate, authorize('Admin'), async (req, res) => {
  if (!ROLES.includes(req.params.role)) return res.status(400).json({ message: 'Invalid role.' });
  const users = await User.find({ role: req.params.role }).select('fullName email role contactNumber uniqueId isActive');
  return res.json(users);
});

r.post('/provision', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { fullName, email, password, role, contactNumber, dob } = req.body;
    const normalizedEmail = normalizeEmail(email);
    if (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 100
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
      || typeof password !== 'string' || password.length < 12 || password.length > 128
      || !ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Provide valid account details and an allowed role.' });
    }
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName: fullName.trim(), email: normalizedEmail, password: hash, role,
      contactNumber: String(contactNumber || '').trim(),
      dob: String(dob || '').replace(/\D/g, '').slice(0, 8),
      uniqueId: role.slice(0, 2).toUpperCase() + '-' + randomUUID().slice(0, 8).toUpperCase()
    });
    return res.status(201).json({
      success: true,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, uniqueId: user.uniqueId }
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'An account with this email or ID already exists.' });
    return res.status(500).json({ success: false, message: 'Account could not be provisioned.' });
  }
});

module.exports = r;
