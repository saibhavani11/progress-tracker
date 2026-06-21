// middleware/auth.js — protects routes by requiring a valid JWT in the
// Authorization header. On success, attaches req.userId for use downstream.
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing or invalid Authorization header' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
};
