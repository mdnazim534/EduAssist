'use strict';

const File = require('../models/file.model');
const AiHistory = require('../models/aiHistory.model');
const CV = require('../models/cv.model');
const User = require('../models/user.model');
const { success, asyncHandler } = require('../utils/response');

/**
 * GET /api/v1/dashboard/overview
 */
const overview = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalFiles,
    totalAiSessions,
    totalCvs,
    recentFiles,
    recentAiSessions,
    weekFiles,
    weekAiSessions,
  ] = await Promise.all([
    File.countDocuments({ userId }),
    AiHistory.countDocuments({ userId, status: 'done' }),
    CV.countDocuments({ userId }),
    File.find({ userId }).sort({ createdAt: -1 }).limit(5).select('originalName tool status createdAt size'),
    AiHistory.find({ userId, status: 'done' }).sort({ createdAt: -1 }).limit(5).select('title requestedTypes createdAt tokensUsed'),
    File.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } }),
    AiHistory.countDocuments({ userId, status: 'done', createdAt: { $gte: sevenDaysAgo } }),
  ]);

  // Build unified recent activity
  const activity = [
    ...recentFiles.map((f) => ({
      type: 'file',
      icon: toolIcon(f.tool),
      title: `${toolLabel(f.tool)}: ${f.originalName}`,
      time: f.createdAt,
      status: f.status,
    })),
    ...recentAiSessions.map((s) => ({
      type: 'ai',
      icon: '🤖',
      title: s.title || `AI: ${s.requestedTypes.join(', ')}`,
      time: s.createdAt,
      status: 'done',
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

  return success(res, {
    stats: {
      totalFiles,
      totalAiSessions,
      totalCvs,
      weekFiles,
      weekAiSessions,
    },
    storage: {
      used: req.user.storageUsed,
      limit: req.user.storageLimit,
      usedMB: parseFloat(req.user.storageUsedMB),
      limitMB: parseFloat(req.user.storageLimitMB),
    },
    activity,
    user: {
      name: req.user.name,
      plan: req.user.plan,
      email: req.user.email,
      avatar: req.user.avatar,
    },
  });
});

/**
 * GET /api/v1/dashboard/search?q=
 */
const search = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q?.trim()) return success(res, { results: [] });

  const regex = new RegExp(q.trim(), 'i');
  const userId = req.user._id;

  const [files, sessions, cvs] = await Promise.all([
    File.find({ userId, originalName: regex }).limit(5).select('originalName tool createdAt'),
    AiHistory.find({ userId, title: regex }).limit(5).select('title requestedTypes createdAt'),
    CV.find({ userId, 'personal.name': regex }).limit(3).select('title personal.name updatedAt'),
  ]);

  return success(res, {
    results: [
      ...files.map((f) => ({ type: 'file', id: f._id, label: f.originalName, sub: toolLabel(f.tool), time: f.createdAt })),
      ...sessions.map((s) => ({ type: 'ai', id: s._id, label: s.title, sub: s.requestedTypes.join(', '), time: s.createdAt })),
      ...cvs.map((c) => ({ type: 'cv', id: c._id, label: c.title, sub: c.personal?.name, time: c.updatedAt })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)),
  });
});

function toolIcon(tool) {
  return { img2pdf: '🖼️', merge: '🔗', pdf2word: '📝', compress: '🗜️', 'ai-upload': '🤖', cv: '📋' }[tool] || '📄';
}
function toolLabel(tool) {
  return { img2pdf: 'Image→PDF', merge: 'Merge PDF', pdf2word: 'PDF→Word', compress: 'Compress', 'ai-upload': 'AI Upload', cv: 'CV' }[tool] || tool;
}

module.exports = { overview, search };
