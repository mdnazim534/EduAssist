'use strict';

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'temp');
const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '50');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = {
  pdf: ['application/pdf'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  any: [
    'application/pdf',
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
};

function buildStorage() {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  });
}

function buildFilter(allowedTypes) {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
  };
}

// Named upload configs
const uploadPdf = multer({
  storage: buildStorage(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024, files: 20 },
  fileFilter: buildFilter(ALLOWED_MIME_TYPES.pdf),
});

const uploadImage = multer({
  storage: buildStorage(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024, files: 20 },
  fileFilter: buildFilter(ALLOWED_MIME_TYPES.image),
});

const uploadAny = multer({
  storage: buildStorage(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024, files: 5 },
  fileFilter: buildFilter(ALLOWED_MIME_TYPES.any),
});

module.exports = { uploadPdf, uploadImage, uploadAny, UPLOAD_DIR };
