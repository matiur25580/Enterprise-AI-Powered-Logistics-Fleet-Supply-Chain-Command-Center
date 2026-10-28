const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { forecast } = require('../utils/forecast');
// GET /api/forecast/demand?days=14 -> past daily counts + next 7-day forecast
router.get('/demand', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 14;
    const since = new Date(); since.setDate(since.getDate() - days);
    const agg = await Booking.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const map = {}; agg.forEach(a => { map[a._id] = a.count; });
    const labels = [], counts = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      labels.push(k); counts.push(map[k] || 0);
    }
    const future = [];
    for (let h = 1; h <= 7; h++) {
      const d = new Date(); d.setDate(d.getDate() + h);
      future.push(d.toISOString().slice(0, 10));
    }
    res.json({ labels, counts, future, forecast: forecast(counts, 7) });
  } catch (e) { res.status(500).json({ msg: e.message }); }
});
module.exports = router;
