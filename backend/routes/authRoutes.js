const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

// POST /api/auth/login
router.post('/login', validationMiddleware.validateLogin, authController.login);

// POST /api/auth/register
router.post('/register', validationMiddleware.validateRegister, authController.register);

// POST /api/auth/logout
router.post('/logout', authMiddleware.authenticate, authController.logout);

// GET /api/auth/me
router.get('/me', authMiddleware.authenticate, authController.getCurrentUser);

// POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', authController.resetPassword);

// POST /api/auth/restore
router.post('/restore', authController.restoreAccount);

module.exports = router;
