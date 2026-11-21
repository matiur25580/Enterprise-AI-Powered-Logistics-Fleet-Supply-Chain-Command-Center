const r = require('express').Router();
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authorize } = require('../middleware/auth');

r.get('/my', async (req, res) => {
  const notifications = await Notification.find({ to: req.user.email }).sort({ createdAt: -1 }).limit(60);
  return res.json(notifications);
});

r.put('/read-all', async (req, res) => {
  await Notification.updateMany({ to: req.user.email, read: false }, { $set: { read: true } });
  return res.json({ success: true, message: 'Notifications marked as read.' });
});

r.put('/:id/read', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid notification ID.' });
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, to: req.user.email },
    { $set: { read: true } },
    { new: true }
  );
  if (!notification) return res.status(404).json({ message: 'Notification not found.' });
  return res.json({ success: true, notification });
});

r.post('/', authorize('Admin'), async (req, res) => {
  const to = String(req.body.to || '').trim().toLowerCase();
  const title = String(req.body.title || '').trim();
  const message = String(req.body.message || '').trim();
  const type = String(req.body.type || 'info');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || title.length < 1 || title.length > 120
    || message.length < 1 || message.length > 2000 || !['info', 'alert', 'success', 'warning'].includes(type)) {
    return res.status(400).json({ message: 'Provide valid notification details.' });
  }
  const recipient = await User.findOne({ email: to, isActive: { $ne: false } }).select('_id email');
  if (!recipient) return res.status(404).json({ message: 'Recipient not found.' });
  const notification = await Notification.create({ to: recipient.email, title, message, type });
  return res.status(201).json(notification);
});

module.exports = r;
