'use strict';

const router = require('express').Router();
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const { createCvRules, paginationRules } = require('../middleware/validators');
const {
  createCv,
  listCvs,
  getCv,
  getPublicCv,
  updateCv,
  togglePublish,
  deleteCv,
  exportCvPdf,
} = require('../controllers/cv.controller');

// Public route (no auth)
router.get('/public/:slug', getPublicCv);

// Protected routes
router.use(authenticate);
router.post('/', createCvRules, createCv);
router.get('/', paginationRules, listCvs);
router.get('/:id', getCv);
router.put('/:id', updateCv);
router.patch('/:id/publish', togglePublish);
router.delete('/:id', deleteCv);
router.post('/:id/export', exportCvPdf);

module.exports = router;
