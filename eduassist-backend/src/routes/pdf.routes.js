'use strict';

const router = require('express').Router();
const { optionalAuth } = require('../middleware/auth.middleware');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { uploadImage, uploadPdf } = require('../config/multer');
const {
  imageToPdf,
  mergePdf,
  compressPdfHandler,
  pdfToWord,
  downloadFile,
} = require('../controllers/pdf.controller');

// PDF tools are usable without auth (guest mode), but track files if logged in
router.use(optionalAuth);
router.use(uploadLimiter);

router.post('/image-to-pdf', uploadImage.array('images', 20), imageToPdf);
router.post('/merge', uploadPdf.array('files', 20), mergePdf);
router.post('/compress', uploadPdf.single('file'), compressPdfHandler);
router.post('/to-word', uploadPdf.single('file'), pdfToWord);
router.get('/download/:filename', downloadFile);

module.exports = router;
