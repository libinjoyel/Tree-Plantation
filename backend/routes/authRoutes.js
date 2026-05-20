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

module.exports = router;
