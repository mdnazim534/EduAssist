'use strict';

const path = require('path');
const fs = require('fs');
const File = require('../models/file.model');
const {
  imagesToPdf,
  mergePdfs,
  compressPdf,
  pdfToWordText,
  deleteTempFile,
} = require('../services/pdf.service');
const { success, error, asyncHandler } = require('../utils/response');
const logger = require('../utils/logger');

// Helper — clean up uploaded temp files
function cleanUpFiles(files = []) {
  files.forEach((f) => { if (f?.path) deleteTempFile(f.path); });
}

// Helper — build a download URL for a processed file
function downloadUrl(req, filename) {
  return `${req.protocol}://${req.get('host')}/processed/${filename}`;
}

// Helper — optionally save File record for authenticated users
async function saveFileRecord(userId, uploadedFile, tool, result) {
  if (!userId) return null;
  return File.create({
    userId,
    originalName: uploadedFile?.originalname || result.filename,
    storedName: result.filename,
    mimeType: 'application/pdf',
    size: result.size,
    tool,
    status: 'done',
    outputPath: result.filename,
    outputSize: result.size,
    metadata: result.metadata || {},
  });
}

/**
 * POST /api/v1/pdf/image-to-pdf
 * Converts uploaded images → PDF
 */
const imageToPdf = asyncHandler(async (req, res) => {
  const files = req.files;
  if (!files?.length) return error(res, 'No image files uploaded', 400);

  const options = {
    pageSize: req.body.pageSize || 'A4',
    orientation: req.body.orientation || 'portrait',
    addMargin: req.body.addMargin === 'true',
  };

  try {
    const result = await imagesToPdf(files.map((f) => f.path), options);
    await saveFileRecord(req.user?._id, files[0], 'img2pdf', result);
    cleanUpFiles(files);

    logger.info(`img2pdf: ${files.length} images → ${result.filename}`);
    return success(res, {
      filename: result.filename,
      downloadUrl: downloadUrl(req, result.filename),
      size: result.size,
      pageCount: files.length,
    }, 'Images converted to PDF successfully');
  } catch (err) {
    cleanUpFiles(files);
    throw err;
  }
});

/**
 * POST /api/v1/pdf/merge
 * Merges multiple PDFs into one
 */
const mergePdf = asyncHandler(async (req, res) => {
  const files = req.files;
  if (!files || files.length < 2) return error(res, 'At least 2 PDF files required', 400);

  const options = { addBookmarks: req.body.addBookmarks !== 'false' };

  try {
    const result = await mergePdfs(files.map((f) => f.path), options);
    await saveFileRecord(req.user?._id, files[0], 'merge', result);
    cleanUpFiles(files);

    logger.info(`merge: ${files.length} PDFs → ${result.filename}`);
    return success(res, {
      filename: result.filename,
      downloadUrl: downloadUrl(req, result.filename),
      size: result.size,
      mergedCount: files.length,
    }, `${files.length} PDFs merged successfully`);
  } catch (err) {
    cleanUpFiles(files);
    throw err;
  }
});

/**
 * POST /api/v1/pdf/compress
 */
const compressPdfHandler = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) return error(res, 'No PDF file uploaded', 400);

  const options = {
    quality: req.body.quality || 'balanced',
    removeMetadata: req.body.removeMetadata === 'true',
  };

  try {
    const result = await compressPdf(file.path, options);
    await saveFileRecord(req.user?._id, file, 'compress', {
      ...result,
      metadata: { originalSize: result.originalSize, reductionPercent: result.reductionPercent },
    });
    deleteTempFile(file.path);

    logger.info(`compress: ${result.originalSize}B → ${result.size}B (${result.reductionPercent}% reduction)`);
    return success(res, {
      filename: result.filename,
      downloadUrl: downloadUrl(req, result.filename),
      originalSize: result.originalSize,
      compressedSize: result.size,
      reductionPercent: result.reductionPercent,
    }, `PDF compressed — ${result.reductionPercent}% size reduction`);
  } catch (err) {
    deleteTempFile(file.path);
    throw err;
  }
});

/**
 * POST /api/v1/pdf/to-word
 */
const pdfToWord = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) return error(res, 'No PDF file uploaded', 400);

  try {
    const result = await pdfToWordText(file.path);
    await saveFileRecord(req.user?._id, file, 'pdf2word', result);
    deleteTempFile(file.path);

    return success(res, {
      filename: result.filename,
      downloadUrl: downloadUrl(req, result.filename),
      size: result.size,
      preview: result.text.slice(0, 500),
    }, 'PDF converted to text successfully');
  } catch (err) {
    deleteTempFile(file.path);
    throw err;
  }
});

/**
 * GET /api/v1/pdf/download/:filename
 * Redirect to the processed file (also served statically via /processed/)
 */
const downloadFile = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  // Basic security: no path traversal
  if (filename.includes('..') || filename.includes('/')) {
    return error(res, 'Invalid filename', 400);
  }
  const filePath = path.join(__dirname, '..', '..', 'uploads', 'processed', filename);
  if (!fs.existsSync(filePath)) return error(res, 'File not found or expired', 404);
  res.download(filePath, filename);
});

module.exports = { imageToPdf, mergePdf, compressPdfHandler, pdfToWord, downloadFile };
