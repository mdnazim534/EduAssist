'use strict';

const { PDFDocument, degrees } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const PROCESSED_DIR = path.join(__dirname, '..', '..', 'uploads', 'processed');
if (!fs.existsSync(PROCESSED_DIR)) fs.mkdirSync(PROCESSED_DIR, { recursive: true });

function outPath(name) {
  return path.join(PROCESSED_DIR, name);
}

// ── Image → PDF ───────────────────────────────────────────────────────────────

async function imagesToPdf(filePaths, options = {}) {
  const { pageSize = 'A4', orientation = 'portrait', addMargin = false } = options;

  const PAGE_SIZES = {
    A4: [595.28, 841.89],
    Letter: [612, 792],
    Legal: [612, 1008],
  };

  const [pw, ph] = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;
  const [pageW, pageH] = orientation === 'landscape' ? [ph, pw] : [pw, ph];
  const margin = addMargin ? 40 : 0;

  const pdfDoc = await PDFDocument.create();

  for (const filePath of filePaths) {
    const imageBytes = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();

    let image;
    let convertedBytes = imageBytes;

    // sharp can convert WebP/GIF/TIFF → JPEG for pdf-lib
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      convertedBytes = await sharp(imageBytes).jpeg({ quality: 90 }).toBuffer();
      image = await pdfDoc.embedJpg(convertedBytes);
    } else if (ext === '.png') {
      try { image = await pdfDoc.embedPng(imageBytes); }
      catch { convertedBytes = await sharp(imageBytes).jpeg({ quality: 90 }).toBuffer(); image = await pdfDoc.embedJpg(convertedBytes); }
    } else {
      image = await pdfDoc.embedJpg(imageBytes);
    }

    const page = pdfDoc.addPage([pageW, pageH]);
    const availW = pageW - margin * 2;
    const availH = pageH - margin * 2;
    const scaled = image.scaleToFit(availW, availH);

    page.drawImage(image, {
      x: margin + (availW - scaled.width) / 2,
      y: margin + (availH - scaled.height) / 2,
      width: scaled.width,
      height: scaled.height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const filename = `img2pdf_${uuidv4()}.pdf`;
  const outputPath = outPath(filename);
  fs.writeFileSync(outputPath, pdfBytes);

  return { filename, outputPath, size: pdfBytes.length };
}

// ── Merge PDFs ────────────────────────────────────────────────────────────────

async function mergePdfs(filePaths, options = {}) {
  const { addBookmarks = true } = options;
  const mergedDoc = await PDFDocument.create();

  for (const filePath of filePaths) {
    const bytes = fs.readFileSync(filePath);
    const srcDoc = await PDFDocument.load(bytes);
    const pages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    pages.forEach((p) => mergedDoc.addPage(p));
  }

  const pdfBytes = await mergedDoc.save();
  const filename = `merged_${uuidv4()}.pdf`;
  const outputPath = outPath(filename);
  fs.writeFileSync(outputPath, pdfBytes);

  return { filename, outputPath, size: pdfBytes.length };
}

// ── Compress PDF ──────────────────────────────────────────────────────────────
// pdf-lib doesn't do true compression; we re-save which removes metadata & some bloat.
// For production, integrate Ghostscript or a cloud API for real compression.

async function compressPdf(filePath, options = {}) {
  const { quality = 'balanced', removeMetadata = false } = options;

  const bytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(bytes);

  if (removeMetadata) {
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('EduAssist');
    pdfDoc.setCreator('EduAssist');
  }

  // useObjectStreams compresses cross-reference table
  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const filename = `compressed_${uuidv4()}.pdf`;
  const outputPath = outPath(filename);
  fs.writeFileSync(outputPath, pdfBytes);

  const originalSize = fs.statSync(filePath).size;
  const reductionPct = (((originalSize - pdfBytes.length) / originalSize) * 100).toFixed(1);

  return {
    filename,
    outputPath,
    size: pdfBytes.length,
    originalSize,
    reductionPercent: parseFloat(reductionPct),
  };
}

// ── PDF → extracted text (for Word export) ────────────────────────────────────

async function extractPdfText(filePath) {
  const bytes = fs.readFileSync(filePath);
  const data = await pdfParse(bytes);
  return {
    text: data.text,
    numpages: data.numpages,
    info: data.info,
  };
}

// ── PDF text → DOCX-like text file (basic; for full DOCX use mammoth/docx lib)

async function pdfToWordText(filePath) {
  const { text, numpages } = await extractPdfText(filePath);

  // Build a simple plain-text .txt (true DOCX conversion requires paid libs)
  const filename = `converted_${uuidv4()}.txt`;
  const outputPath = outPath(filename);
  const content = `[Extracted from PDF — ${numpages} pages]\n\n${text}`;
  fs.writeFileSync(outputPath, content, 'utf8');

  return { filename, outputPath, size: Buffer.byteLength(content), text };
}

// ── Extract text from PDF for AI ─────────────────────────────────────────────

async function extractTextForAI(filePath) {
  const { text } = await extractPdfText(filePath);
  return text.slice(0, 40000); // Limit to model context
}

// ── Cleanup helper ────────────────────────────────────────────────────────────

function deleteTempFile(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    logger.warn(`Could not delete temp file ${filePath}: ${e.message}`);
  }
}

module.exports = {
  imagesToPdf,
  mergePdfs,
  compressPdf,
  extractPdfText,
  pdfToWordText,
  extractTextForAI,
  deleteTempFile,
  PROCESSED_DIR,
};
