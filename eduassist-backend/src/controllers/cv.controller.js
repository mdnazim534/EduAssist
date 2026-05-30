'use strict';

const CV = require('../models/cv.model');
const { generateCvPdf } = require('../services/cv.service');
const { success, created, error, paginated, asyncHandler } = require('../utils/response');
const { deleteTempFile } = require('../services/pdf.service');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

/**
 * POST /api/v1/cv
 */
const createCv = asyncHandler(async (req, res) => {
  const cvData = {
    userId: req.user._id,
    ...req.body,
  };

  // Enforce per-user CV limit on free plan
  if (req.user.plan === 'free') {
    const count = await CV.countDocuments({ userId: req.user._id });
    if (count >= 3) return error(res, 'Free plan allows up to 3 CVs. Upgrade to Pro for unlimited.', 403);
  }

  const cv = await CV.create(cvData);
  return created(res, { cv }, 'CV created');
});

/**
 * GET /api/v1/cv
 */
const listCvs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const [data, total] = await Promise.all([
    CV.find({ userId: req.user._id }).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
    CV.countDocuments({ userId: req.user._id }),
  ]);
  return paginated(res, { data, total, page, limit });
});

/**
 * GET /api/v1/cv/:id
 */
const getCv = asyncHandler(async (req, res) => {
  const cv = await CV.findOne({ _id: req.params.id, userId: req.user._id });
  if (!cv) return error(res, 'CV not found', 404);
  return success(res, { cv });
});

/**
 * GET /api/v1/cv/public/:slug
 * Public view (no auth required).
 */
const getPublicCv = asyncHandler(async (req, res) => {
  const cv = await CV.findOne({ slug: req.params.slug, isPublic: true });
  if (!cv) return error(res, 'CV not found or not public', 404);
  return success(res, { cv });
});

/**
 * PUT /api/v1/cv/:id
 */
const updateCv = asyncHandler(async (req, res) => {
  const cv = await CV.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { ...req.body, pdfPath: undefined, pdfGeneratedAt: undefined }, // force PDF regen
    { new: true, runValidators: true }
  );
  if (!cv) return error(res, 'CV not found', 404);
  return success(res, { cv }, 'CV updated');
});

/**
 * PATCH /api/v1/cv/:id/publish
 * Toggle public sharing.
 */
const togglePublish = asyncHandler(async (req, res) => {
  const cv = await CV.findOne({ _id: req.params.id, userId: req.user._id });
  if (!cv) return error(res, 'CV not found', 404);

  cv.isPublic = !cv.isPublic;
  if (cv.isPublic && !cv.slug) {
    const base = slugify(cv.personal?.name || 'cv', { lower: true, strict: true });
    cv.slug = `${base}-${uuidv4().slice(0, 8)}`;
  }
  await cv.save();

  return success(res, {
    cv,
    publicUrl: cv.isPublic ? `/api/v1/cv/public/${cv.slug}` : null,
  }, cv.isPublic ? 'CV published' : 'CV unpublished');
});

/**
 * DELETE /api/v1/cv/:id
 */
const deleteCv = asyncHandler(async (req, res) => {
  const cv = await CV.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!cv) return error(res, 'CV not found', 404);
  if (cv.pdfPath) {
    deleteTempFile(path.join(__dirname, '..', '..', 'uploads', 'processed', cv.pdfPath));
  }
  return success(res, {}, 'CV deleted');
});

/**
 * POST /api/v1/cv/:id/export
 * Generate and return CV as PDF.
 */
const exportCvPdf = asyncHandler(async (req, res) => {
  const cv = await CV.findOne({ _id: req.params.id, userId: req.user._id });
  if (!cv) return error(res, 'CV not found', 404);

  // Return cached PDF if generated in last hour and CV hasn't changed
  if (cv.pdfPath && cv.pdfGeneratedAt) {
    const pdfAge = Date.now() - cv.pdfGeneratedAt.getTime();
    const pdfFilePath = path.join(__dirname, '..', '..', 'uploads', 'processed', cv.pdfPath);
    if (pdfAge < 60 * 60 * 1000 && fs.existsSync(pdfFilePath)) {
      return res.download(pdfFilePath, `${cv.title || 'CV'}.pdf`);
    }
  }

  const result = await generateCvPdf(cv.toObject());

  cv.pdfPath = result.filename;
  cv.pdfGeneratedAt = new Date();
  await cv.save();

  return res.download(result.outputPath, `${cv.title || 'CV'}.pdf`);
});

module.exports = { createCv, listCvs, getCv, getPublicCv, updateCv, togglePublish, deleteCv, exportCvPdf };
