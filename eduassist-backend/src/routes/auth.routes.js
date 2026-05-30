'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { register, login, me, logout, updateProfile, deleteAccount } = require('../controllers/auth.controller');
const { registerRules } = require('../middleware/validators');

// All auth routes require a valid Firebase token
router.post('/register', authenticate, registerRules, register);
router.post('/login', authenticate, login);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);
router.patch('/profile', authenticate, updateProfile);
router.delete('/account', authenticate, deleteAccount);

module.exports = router;
