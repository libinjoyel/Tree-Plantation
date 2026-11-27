const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  }
});

// POST /api/auth/login
router.post('/login', authRateLimiter, validationMiddleware.validateLogin, authController.login);

// POST /api/auth/register
router.post('/register', authRateLimiter, validationMiddleware.validateRegister, authController.register);

// POST /api/auth/logout
router.post('/logout', authMiddleware.authenticate, authController.logout);

// GET /api/auth/me
router.get('/me', authMiddleware.authenticate, authController.getCurrentUser);

// POST /api/auth/forgot-password
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', authRateLimiter, authController.resetPassword);

// POST /api/auth/restore
router.post('/restore', authRateLimiter, authController.restoreAccount);

module.exports = router;
