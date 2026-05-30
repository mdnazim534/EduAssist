'use strict';

const { validationResult, body, param, query } = require('express-validator');

/**
 * Run after validators — returns 422 with field-level errors if invalid.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

// ── Auth validators ──────────────────────────────────────────────────────────
const registerRules = [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().isLength({ min: 2, max: 100 }),
  validate,
];

// ── CV validators ────────────────────────────────────────────────────────────
const createCvRules = [
  body('personal.name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('personal.email').optional().isEmail(),
  body('template').optional().isIn(['t1', 't2', 't3']),
  body('title').optional().isLength({ max: 100 }),
  validate,
];

// ── AI validators ────────────────────────────────────────────────────────────
const aiGenerateRules = [
  body('requestedTypes')
    .isArray({ min: 1 }).withMessage('Select at least one generation type')
    .custom((arr) => {
      const valid = ['summary', 'mcq', 'shortq', 'broadq', 'viva', 'topics', 'explain'];
      return arr.every((t) => valid.includes(t));
    }).withMessage('Invalid generation type'),
  body('inputText').optional().isString().isLength({ max: 50000 }),
  validate,
];

// ── Pagination ───────────────────────────────────────────────────────────────
const paginationRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validate,
];

module.exports = { validate, registerRules, createCvRules, aiGenerateRules, paginationRules };
