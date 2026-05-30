'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const { uploadAny } = require('../config/multer');
const { aiGenerateRules, paginationRules } = require('../middleware/validators');
const {
  generate,
  getHistory,
  getSession,
  updateSession,
  deleteSession,
} = require('../controllers/ai.controller');

// All AI routes require auth
router.use(authenticate);

// Main generation — accepts optional file upload
router.post(
  '/generate',
  aiLimiter,
  uploadAny.single('file'),
  generate
);

// History CRUD
router.get('/history', paginationRules, getHistory);
router.get('/history/:id', getSession);
router.patch('/history/:id', updateSession);
router.delete('/history/:id', deleteSession);

module.exports = router;
