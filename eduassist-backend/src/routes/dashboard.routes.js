'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { overview, search } = require('../controllers/dashboard.controller');

router.use(authenticate);

router.get('/overview', overview);
router.get('/search', search);

module.exports = router;
