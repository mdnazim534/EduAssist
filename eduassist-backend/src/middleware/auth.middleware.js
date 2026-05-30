'use strict';

const { getAuth } = require('../config/firebase');
const User = require('../models/user.model');
const logger = require('../utils/logger');

/**
 * Verify Firebase ID token, attach req.user (MongoDB doc).
 * Creates the user record on first login.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No auth token provided' });
    }

    const idToken = authHeader.slice(7);
    const decoded = await getAuth().verifyIdToken(idToken);

    // Find or create the user in MongoDB
    let user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.email.split('@')[0],
        avatar: decoded.picture || null,
        lastLoginAt: new Date(),
      });
      logger.info(`New user registered: ${decoded.email}`);
    } else {
      user.lastLoginAt = new Date();
      await user.save();
    }

    req.user = user;
    req.firebaseUser = decoded;
    next();
  } catch (err) {
    logger.warn(`Auth failed: ${err.message}`);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

/**
 * Optional auth — populates req.user if token is present, but doesn't block.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();
  try {
    const decoded = await getAuth().verifyIdToken(authHeader.slice(7));
    req.user = await User.findOne({ firebaseUid: decoded.uid });
    req.firebaseUser = decoded;
  } catch (_) { /* ignore */ }
  next();
}

/**
 * Require pro or team plan.
 */
function requirePro(req, res, next) {
  if (!req.user || req.user.plan === 'free') {
    return res.status(403).json({ success: false, message: 'Pro plan required for this feature' });
  }
  next();
}

module.exports = { authenticate, optionalAuth, requirePro };
