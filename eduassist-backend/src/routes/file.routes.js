'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { paginationRules } = require('../middleware/validators');
const { listFiles, saveFile, deleteFile, storageInfo, clearTempFiles } = require('../controllers/file.controller');

router.use(authenticate);

router.get('/', paginationRules, listFiles);
router.get('/storage', storageInfo);
router.patch('/:id/save', saveFile);
router.delete('/clear-temp', clearTempFiles);
router.delete('/:id', deleteFile);

module.exports = router;
