'use strict';

const File = require('../models/file.model');
const User = require('../models/user.model');
const path = require('path');
const fs = require('fs');
const { success, error, paginated, asyncHandler } = require('../utils/response');
const { deleteTempFile } = require('../services/pdf.service');

/**
 * GET /api/v1/files
 */
const listFiles = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { tool, saved } = req.query;

  const filter = { userId: req.user._id };
  if (tool) filter.tool = tool;
  if (saved !== undefined) filter.saved = saved === 'true';

  const [data, total] = await Promise.all([
    File.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    File.countDocuments(filter),
  ]);
  return paginated(res, { data, total, page, limit });
});

/**
 * PATCH /api/v1/files/:id/save
 * Toggle permanent save (extend TTL indefinitely).
 */
const saveFile = asyncHandler(async (req, res) => {
  const file = await File.findOne({ _id: req.params.id, userId: req.user._id });
  if (!file) return error(res, 'File not found', 404);

  file.saved = !file.saved;
  file.savedAt = file.saved ? new Date() : undefined;
  if (file.saved) file.expiresAt = undefined; // never expire
  await file.save();

  return success(res, { file }, file.saved ? 'File saved permanently' : 'File unsaved');
});

/**
 * DELETE /api/v1/files/:id
 */
const deleteFile = asyncHandler(async (req, res) => {
  const file = await File.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!file) return error(res, 'File not found', 404);

  // Free up storage quota
  await User.findByIdAndUpdate(req.user._id, { $inc: { storageUsed: -file.size } });

  // Delete physical file
  if (file.outputPath) {
    deleteTempFile(path.join(__dirname, '..', '..', 'uploads', 'processed', file.outputPath));
  }

  return success(res, {}, 'File deleted');
});

/**
 * GET /api/v1/files/storage
 */
const storageInfo = asyncHandler(async (req, res) => {
  const user = req.user;
  return success(res, {
    used: user.storageUsed,
    limit: user.storageLimit,
    usedMB: parseFloat(user.storageUsedMB),
    limitMB: parseFloat(user.storageLimitMB),
    percentUsed: ((user.storageUsed / user.storageLimit) * 100).toFixed(1),
  });
});

/**
 * DELETE /api/v1/files/clear-temp
 * Delete all non-saved files for the user.
 */
const clearTempFiles = asyncHandler(async (req, res) => {
  const files = await File.find({ userId: req.user._id, saved: false });
  let deletedCount = 0;
  let freedBytes = 0;

  for (const file of files) {
    if (file.outputPath) {
      deleteTempFile(path.join(__dirname, '..', '..', 'uploads', 'processed', file.outputPath));
    }
    freedBytes += file.size;
    await file.deleteOne();
    deletedCount++;
  }

  await User.findByIdAndUpdate(req.user._id, { $inc: { storageUsed: -freedBytes } });

  return success(res, { deletedCount, freedBytes }, `Cleared ${deletedCount} temp files`);
});

module.exports = { listFiles, saveFile, deleteFile, storageInfo, clearTempFiles };
