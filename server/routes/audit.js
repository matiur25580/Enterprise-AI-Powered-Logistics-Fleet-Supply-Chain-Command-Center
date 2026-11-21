const r = require('express').Router();
const AuditLog = require('../models/AuditLog');
const { authorize } = require('../middleware/auth');

r.get('/', authorize('Admin'), async (req, res) => {
  const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(200);
  return res.json(logs);
});

// Audit records are append-only. There is intentionally no clear/delete endpoint.
module.exports = r;
