'use strict';

const logger = require('../utils/logger');
const fs = require('fs');

/**
 * Central error handler — cleans up uploaded files on error.
 */
function errorHandler(err, req, res, next) {
  // Cleanup any uploaded temp files attached to the request
  const files = req.files || (req.file ? [req.file] : []);
  files.forEach((f) => {
    if (f.path && fs.existsSync(f.path)) {
      try { fs.unlinkSync(f.path); } catch (_) {}
    }
  });

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 50}MB`,
    });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ success: false, message: 'Too many files uploaded at once' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ success: false, message: 'Unexpected file field' });
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }

  // CORS
  if (err.message?.includes('CORS')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  const status = err.statusCode || err.status || 500;
  const message = (status < 500) ? err.message : 'Internal server error';

  if (status >= 500) {
    logger.error(`[${req.method} ${req.url}] ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`[${req.method} ${req.url}] ${err.message}`);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}

function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
}

module.exports = { errorHandler, notFound };
