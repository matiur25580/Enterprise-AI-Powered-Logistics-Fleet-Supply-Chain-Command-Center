const jwt = require('jsonwebtoken');
const User = require('../models/User');

function authSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters.');
  return secret;
}

function unauthorized(res, code = 'AUTH_REQUIRED') {
  return res.status(401).json({ success: false, code, message: 'Authentication is required.' });
}

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) return unauthorized(res);

    let decoded;
    try {
      decoded = jwt.verify(match[1], authSecret(), { algorithms: ['HS256'] });
    } catch (_error) {
      return unauthorized(res, 'AUTH_INVALID');
    }
    if (decoded.type !== 'access' || typeof decoded.id !== 'string') {
      return unauthorized(res, 'AUTH_INVALID');
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.isActive === false || Number(decoded.ver || 0) !== Number(user.tokenVersion || 0)) {
      return unauthorized(res, 'AUTH_REVOKED');
    }

    req.user = user;
    req.userId = user._id.toString();
    req.userRole = user.role;
    return next();
  } catch (error) {
    return next(error);
  }
}

function authorize(...roles) {
  const allowed = new Set(roles.flat().map((role) => String(role)));
  return (req, res, next) => {
    if (!req.user) return unauthorized(res);
    if (!allowed.has(req.user.role)) {
      return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' });
    }
    return next();
  };
}

module.exports = { authenticate, authorize, authSecret };
