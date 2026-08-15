// src/middleware/license.js
const { pool } = require('../config/db');

// Limits applied when a user has no license_key (demo mode)
const DEMO_LIMITS = {
  maxCafesVisible: 5,
  maxFavorites: 2,
  canPostReviews: false
};

/**
 * Looks up whether the logged-in user has a valid license_key.
 * Attaches req.hasLicense (boolean) so route handlers can branch on it.
 * Does NOT block the request — use requireLicense() for hard gates.
 * Must run after `authenticate` (needs req.user.id).
 */
async function checkLicense(req, res, next) {
  if (!req.user) {
    req.hasLicense = false;
    return next();
  }

  try {
    const [rows] = await pool.query(
      'SELECT license_key FROM users WHERE id = ?',
      [req.user.id]
    );
    req.hasLicense = Boolean(rows[0]?.license_key);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Hard gate — blocks the request entirely if the user has no license.
 * Use this on actions you want fully locked in demo mode
 * (e.g. posting a review).
 */
function requireLicense(req, res, next) {
  if (!req.hasLicense) {
    return res.status(403).json({
      error: 'This feature requires a full license.',
      upgradeUrl: process.env.UPGRADE_URL || 'https://your-store-link.example.com'
    });
  }
  next();
}

module.exports = { checkLicense, requireLicense, DEMO_LIMITS };