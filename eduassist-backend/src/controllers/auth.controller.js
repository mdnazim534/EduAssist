'use strict';

const User = require('../models/user.model');
const { getAuth } = require('../config/firebase');
const { success, created, error, asyncHandler } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * POST /api/v1/auth/register
 * Called after Firebase signup to create/sync the MongoDB user record.
 */
const register = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const firebaseUser = req.firebaseUser;

  let user = await User.findOne({ firebaseUid: firebaseUser.uid });
  if (user) {
    return success(res, { user }, 'User already exists, logged in');
  }

  user = await User.create({
    firebaseUid: firebaseUser.uid,
    email: firebaseUser.email,
    name: name || firebaseUser.name || firebaseUser.email.split('@')[0],
    avatar: firebaseUser.picture || null,
  });

  logger.info(`User registered: ${user.email}`);
  return created(res, { user }, 'Account created successfully');
});

/**
 * POST /api/v1/auth/login
 * Sync user data on login.
 */
const login = asyncHandler(async (req, res) => {
  const user = req.user; // populated by authenticate middleware
  return success(res, { user }, 'Login successful');
});

/**
 * GET /api/v1/auth/me
 */
const me = asyncHandler(async (req, res) => {
  return success(res, { user: req.user });
});

/**
 * POST /api/v1/auth/logout
 * Firebase logout is client-side; server can revoke the refresh token.
 */
const logout = asyncHandler(async (req, res) => {
  try {
    await getAuth().revokeRefreshTokens(req.firebaseUser.uid);
  } catch (e) {
    logger.warn(`Could not revoke tokens for ${req.user.email}: ${e.message}`);
  }
  return success(res, {}, 'Logged out successfully');
});

/**
 * PATCH /api/v1/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, preferences } = req.body;
  const updates = {};
  if (name) updates.name = name.trim().slice(0, 100);
  if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  return success(res, { user }, 'Profile updated');
});

/**
 * DELETE /api/v1/auth/account
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await User.findByIdAndDelete(userId);
  try {
    await getAuth().deleteUser(req.firebaseUser.uid);
  } catch (e) {
    logger.warn(`Firebase delete failed for ${req.user.email}: ${e.message}`);
  }
  return success(res, {}, 'Account deleted');
});

module.exports = { register, login, me, logout, updateProfile, deleteAccount };
