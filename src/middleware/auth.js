// src/middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Verifies the JWT sent in the Authorization header.
 * Expected format: "Authorization: Bearer <token>"
 * On success, attaches the decoded payload to req.user.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

/**
 * Optional auth — attaches req.user if a valid token is present,
 * but doesn't block the request if there isn't one.
 * Useful for routes like GET /cafes that work for guests too,
 * but behave differently for logged-in users (e.g. showing favorites).
 */
function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    req.user = null;
  }
  next();
}

module.exports = { authenticate, optionalAuthenticate };