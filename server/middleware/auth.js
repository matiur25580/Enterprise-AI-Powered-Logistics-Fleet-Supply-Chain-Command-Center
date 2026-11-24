const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Resolves the authenticated user from the Bearer token before protected logistics routes run.
async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ message: 'Authentication required' });
  if (!process.env.JWT_SECRET) return res.status(503).json({ message: 'Authentication is not configured' });

  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET);
    if (!payload || !payload.id) return res.status(401).json({ message: 'Invalid session' });
    const user = await User.findById(payload.id).select('_id email role fullName');
    if (!user) return res.status(401).json({ message: 'Account is no longer available' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Insufficient permissions' });
    next();
  };
}

module.exports = { authenticate, authorize };
