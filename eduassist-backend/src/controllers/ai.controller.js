'use strict';

const AiHistory = require('../models/aiHistory.model');
const File = require('../models/file.model');
const { generateStudyContent, extractTextFromImageViaAI } = require('../services/ai.service');
const { extractTextForAI } = require('../services/pdf.service');
const { success, error, paginated, asyncHandler } = require('../utils/response');
const { deleteTempFile } = require('../services/pdf.service');
const logger = require('../utils/logger');
const fs = require('fs');

/**
 * POST /api/v1/ai/generate
 * Main AI study content generation endpoint.
 * Accepts: text body, uploaded PDF, or uploaded image.
 */
const generate = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { requestedTypes, inputText, provider, title } = req.body;
  const userId = req.user._id;
  const uploadedFile = req.file;

  // Parse requestedTypes if sent as JSON string
  let types = requestedTypes;
  if (typeof types === 'string') {
    try { types = JSON.parse(types); } catch { types = [types]; }
  }
  if (!Array.isArray(types) || types.length === 0) {
    return error(res, 'requestedTypes must be a non-empty array', 422);
  }

  // ── Extract text from source ──────────────────────────────────────────────
  let sourceText = '';
  let inputType = 'text';
  let inputFileId = null;

  if (uploadedFile) {
    const mime = uploadedFile.mimetype;
    if (mime === 'application/pdf') {
      inputType = 'pdf';
      sourceText = await extractTextForAI(uploadedFile.path);
      if (!sourceText.trim()) {
        deleteTempFile(uploadedFile.path);
        return error(res, 'Could not extract text from the PDF. It may be scanned/image-based.', 422);
      }
    } else if (mime.startsWith('image/')) {
      inputType = 'image';
      const imageBytes = fs.readFileSync(uploadedFile.path);
      const base64 = imageBytes.toString('base64');
      sourceText = await extractTextFromImageViaAI(base64, mime);
    }

    // Save file record
    const fileRecord = await File.create({
      userId,
      originalName: uploadedFile.originalname,
      storedName: uploadedFile.filename,
      mimeType: uploadedFile.mimetype,
      size: uploadedFile.size,
      tool: 'ai-upload',
      status: 'done',
    });
    inputFileId = fileRecord._id;
    deleteTempFile(uploadedFile.path);
  } else if (inputText?.trim()) {
    sourceText = inputText.trim();
    inputType = 'text';
  } else {
    return error(res, 'Provide either inputText or upload a file', 400);
  }

  if (!sourceText.trim()) {
    return error(res, 'No content found to analyze', 422);
  }

  // ── Create history record (processing) ───────────────────────────────────
  const historyRecord = await AiHistory.create({
    userId,
    inputType,
    inputText: sourceText.slice(0, 5000), // store first 5k chars
    inputFileId,
    requestedTypes: types,
    title: title || `${types[0]} session — ${new Date().toLocaleDateString()}`,
    provider: provider || process.env.AI_PROVIDER || 'anthropic',
    status: 'processing',
  });

  // ── Call AI service ───────────────────────────────────────────────────────
  try {
    const { results, provider: usedProvider, model, tokensUsed } = await generateStudyContent({
      inputText: sourceText,
      requestedTypes: types,
      provider: provider || process.env.AI_PROVIDER,
      userId,
    });

    const processingTimeMs = Date.now() - startTime;

    await AiHistory.findByIdAndUpdate(historyRecord._id, {
      results,
      provider: usedProvider,
      model,
      tokensUsed,
      status: 'done',
      processingTimeMs,
    });

    logger.info(`AI generation done for user ${userId}: ${types.join(', ')} in ${processingTimeMs}ms`);

    return success(res, {
      sessionId: historyRecord._id,
      results,
      meta: { provider: usedProvider, model, tokensUsed, processingTimeMs },
    }, 'Study content generated successfully');

  } catch (err) {
    await AiHistory.findByIdAndUpdate(historyRecord._id, {
      status: 'error',
      errorMessage: err.message,
    });
    logger.error(`AI generation failed: ${err.message}`);
    throw err;
  }
});

/**
 * GET /api/v1/ai/history
 * Paginated list of user's AI sessions.
 */
const getHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const saved = req.query.saved === 'true' ? true : undefined;

  const filter = { userId: req.user._id, status: 'done' };
  if (saved !== undefined) filter.saved = saved;

  const [data, total] = await Promise.all([
    AiHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-results.mcq -results.shortq -results.broadq -results.viva'), // light list
    AiHistory.countDocuments(filter),
  ]);

  return paginated(res, { data, total, page, limit });
});

/**
 * GET /api/v1/ai/history/:id
 * Full session detail.
 */
const getSession = asyncHandler(async (req, res) => {
  const session = await AiHistory.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) return error(res, 'Session not found', 404);
  return success(res, { session });
});

/**
 * PATCH /api/v1/ai/history/:id
 * Save / tag / rename a session.
 */
const updateSession = asyncHandler(async (req, res) => {
  const { title, saved, tags } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (saved !== undefined) updates.saved = saved;
  if (tags !== undefined) updates.tags = tags;

  const session = await AiHistory.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    updates,
    { new: true }
  );
  if (!session) return error(res, 'Session not found', 404);
  return success(res, { session }, 'Session updated');
});

/**
 * DELETE /api/v1/ai/history/:id
 */
const deleteSession = asyncHandler(async (req, res) => {
  const session = await AiHistory.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!session) return error(res, 'Session not found', 404);
  return success(res, {}, 'Session deleted');
});

module.exports = { generate, getHistory, getSession, updateSession, deleteSession };
