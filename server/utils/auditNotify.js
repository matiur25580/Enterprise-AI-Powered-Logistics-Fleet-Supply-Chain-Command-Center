const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const User = require('../models/User');

const SKIP = ['/api/auth', '/api/notifications', '/api/audit'];
const SENSITIVE_FIELDS = new Set(['password', 'newPassword', 'otp', 'token', 'authorization', 'secret', 'contactNumber', 'dob']);

async function notifyRoles(roles, title, message, excludeEmail) {
  try {
    const users = await User.find({ role: { $in: roles }, isActive: { $ne: false } }).select('email');
    const docs = users
      .filter((user) => user.email && user.email.toLowerCase() !== String(excludeEmail || '').toLowerCase())
      .map((user) => ({ to: user.email, title, message, type: 'alert' }));
    if (docs.length) await Notification.insertMany(docs, { ordered: false });
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', event: 'notification_fanout_failed', error: error.name }));
  }
}

module.exports = function auditNotify(req, res, next) {
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) || !req.user) return next();
  const fullPath = (req.baseUrl || '') + (req.path || '');
  if (SKIP.some((path) => fullPath.startsWith(path))) return next();

  const actorEmail = req.user.email;
  const role = req.user.role;
  const originalJson = res.json.bind(res);
  res.json = function auditSuccessfulMutation(body) {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      const safe = {};
      for (const [key, value] of Object.entries(req.body || {})) {
        if (!SENSITIVE_FIELDS.has(key)) safe[key] = value;
      }
      AuditLog.create({
        actor: actorEmail,
        role,
        action: req.method + ' ' + fullPath,
        entity: (req.baseUrl || '').split('/').filter(Boolean).pop() || 'api',
        details: JSON.stringify(safe).slice(0, 600),
        ip: req.ip
      }).catch((error) => console.error(JSON.stringify({ level: 'error', event: 'audit_write_failed', error: error.name })));

      const path = fullPath;
      const method = req.method;
      const status = String((req.body || {}).status || '');
      if (method === 'POST' && path.startsWith('/api/booking')) {
        notifyRoles(['Admin', 'FleetManager'], 'New booking received', 'A new booking was submitted by ' + actorEmail, actorEmail);
      } else if (path.includes('/billing')) {
        notifyRoles(['Admin'], 'Invoice updated', 'Billing was updated by ' + actorEmail, actorEmail);
      } else if (method === 'POST' && path.startsWith('/api/trip')) {
        notifyRoles(['Admin', 'FleetManager'], 'New trip created', 'A trip was created by ' + actorEmail, actorEmail);
      } else if (method === 'PUT' && path.startsWith('/api/trip') && status === 'Delivered') {
        notifyRoles(['Admin'], 'Trip delivered', 'A trip was marked delivered by ' + actorEmail, actorEmail);
      } else if (path.startsWith('/api/fleet')) {
        notifyRoles(['Admin', 'FleetManager'], 'Fleet updated', method + ' ' + path + ' by ' + actorEmail, actorEmail);
      } else if (path.startsWith('/api/maintenance')) {
        notifyRoles(['Admin', 'FleetManager'], 'Maintenance update', 'Maintenance activity by ' + actorEmail, actorEmail);
      }
    }
    return originalJson(body);
  };
  next();
};
