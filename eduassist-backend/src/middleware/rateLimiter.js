'use strict';

const rateLimit = require('express-rate-limit');

const windowMs = (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000;

const generalLimiter = rateLimit({
  windowMs,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

// Stricter limit for AI endpoints (cost & abuse prevention)
const aiLimiter = rateLimit({
  windowMs,
  max: parseInt(process.env.AI_RATE_LIMIT_MAX) || 20,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { success: false, message: 'AI request limit reached. Please wait before trying again.' },
});

// File upload limiter
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 minutes
  max: 30,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { success: false, message: 'Too many file uploads, please slow down' },
});

module.exports = { generalLimiter, aiLimiter, uploadLimiter };
