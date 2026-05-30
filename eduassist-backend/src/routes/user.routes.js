'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { asyncHandler, success } = require('../utils/response');
const User = require('../models/user.model');

router.use(authenticate);

// GET /api/v1/users/me - alias
router.get('/me', asyncHandler(async (req, res) => {
  return success(res, { user: req.user });
}));

// PATCH /api/v1/users/preferences
router.patch('/preferences', asyncHandler(async (req, res) => {
  const { theme, emailNotifications, processingAlerts, defaultAiProvider } = req.body;
  const updates = {};
  if (theme) updates['preferences.theme'] = theme;
  if (emailNotifications !== undefined) updates['preferences.emailNotifications'] = emailNotifications;
  if (processingAlerts !== undefined) updates['preferences.processingAlerts'] = processingAlerts;
  if (defaultAiProvider) updates['preferences.defaultAiProvider'] = defaultAiProvider;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  return success(res, { preferences: user.preferences }, 'Preferences updated');
}));

module.exports = router;
