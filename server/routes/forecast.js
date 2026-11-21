const express = require('express');
const Booking = require('../models/Booking');
const { forecast } = require('../utils/forecast');
const { authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/demand', authorize('Admin', 'FleetManager', 'Accountant'), async (req, res) => {
  try {
    const requested = Number.parseInt(req.query.days || '14', 10);
    const days = Number.isFinite(requested) ? Math.min(90, Math.max(7, requested)) : 14;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const aggregation = await Booking.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const countsByDay = Object.fromEntries(aggregation.map((item) => [item._id, item.count]));
    const labels = [];
    const counts = [];
    for (let index = days - 1; index >= 0; index -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - index);
      const key = date.toISOString().slice(0, 10);
      labels.push(key);
      counts.push(countsByDay[key] || 0);
    }
    const future = [];
    for (let horizon = 1; horizon <= 7; horizon += 1) {
      const date = new Date();
      date.setDate(date.getDate() + horizon);
      future.push(date.toISOString().slice(0, 10));
    }
    return res.json({ labels, counts, future, forecast: forecast(counts, 7) });
  } catch (_error) {
    return res.status(500).json({ success: false, message: 'Demand forecast is temporarily unavailable.' });
  }
});

module.exports = router;
