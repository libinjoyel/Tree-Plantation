const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Settings = require('../models/Settings');
const jwtConfig = require('../config/jwt');
const logger = require('../utils/logger');

const generateToken = (userId) => {
  return jwt.sign({ userId }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        });
      }

      // Create new user
      const user = await User.create({ name, email, password });

      // Create default settings for user
      await Settings.createDefault(user.id);

      // Generate token
      const token = generateToken(user.id);

      logger.info(`User registered: ${email}`);

      res.status(201).json({
        success: true,
        data: {
          user: User.format(user),
          token
        }
      });
    } catch (error) {
      logger.error('Register error', error.message);
      res.status(500).json({
        success: false,
        error: error.message || 'Registration failed'
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email, { includePassword: true });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check if account was deleted
      if (user.deleted_at) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await User.comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Generate token
      const token = generateToken(user.id);

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        data: {
          user: User.format(user),
          token
        }
      });
    } catch (error) {
      logger.error('Login error', error.message);
      res.status(500).json({
        success: false,
        error: error.message || 'Login failed'
      });
    }
  },

  logout: (req, res) => {
    try {
      logger.info(`User logged out: ${req.userId}`);
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout error', error.message);
      res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  },

  getCurrentUser: async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user || user.deleted_at) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user: User.format(user) }
      });
    } catch (error) {
      logger.error('Get current user error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user'
      });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      const user = await User.findByEmail(email);
      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({
          success: true,
          message: 'If an account with that email exists, a reset link has been sent.'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await User.setResetToken(email, resetToken, resetTokenExpiry);

      logger.info(`Password reset requested for: ${email}`);

      res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.'
      });
    } catch (error) {
      logger.error('Forgot password error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to process request'
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          success: false,
          error: 'Token and new password are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters'
        });
      }

      const user = await User.findByValidResetToken(token);

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token'
        });
      }

      await User.updatePasswordAndClearReset(user.id, password);

      logger.info(`Password reset completed for: ${user.email}`);

      res.json({
        success: true,
        message: 'Password has been reset successfully.'
      });
    } catch (error) {
      logger.error('Reset password error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to reset password'
      });
    }
  },

  restoreAccount: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Find user including deleted ones
      const user = await User.findByEmail(email, { includePassword: true });

      // Generic error to prevent email enumeration
      if (!user || !user.deleted_at) {
        return res.status(400).json({
          success: false,
          error: 'Unable to restore account. Please check your credentials.'
        });
      }

      const isPasswordValid = await User.comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          error: 'Unable to restore account. Please check your credentials.'
        });
      }

      const restoredUser = await User.restore(user.id);

      // Generate token so the user is logged in immediately
      const token = generateToken(user.id);

      logger.info(`Account restored for user: ${email}`);

      res.json({
        success: true,
        data: {
          user: User.format(restoredUser),
          token
        }
      });
    } catch (error) {
      logger.error('Restore account error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to restore account'
      });
    }
  }
};

module.exports = authController;
