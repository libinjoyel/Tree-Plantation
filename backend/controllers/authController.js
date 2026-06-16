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
      const { name, email, password} = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        });
      }

      // Create new user
      const user = new User({ name, email, password});
      await user.save();

      // Create default settings for user
      await Settings.create({
        userId: user._id,
        notificationsEnabled: true,
        emailAlerts: true,
        wateringReminders: true,
        weeklyReports: false,
        darkMode: false,
        language: 'English',
        timezone: 'UTC'
      });

      // Generate token
      const token = generateToken(user._id);

      logger.info(`User registered: ${email}`);

      res.status(201).json({
        success: true,
        data: {
          user: user.toJSON(),
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
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Generate token
      const token = generateToken(user._id);

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        data: {
          user: user.toJSON(),
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
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user: user.toJSON() }
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

      const user = await User.findOne({ email });
      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({
          success: true,
          message: 'If an account with that email exists, a reset link has been sent.'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      await User.updateOne(
        { email },
        {
          $set: {
            resetToken,
            resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
          }
        }
      );

      logger.info(`Password reset requested for: ${email}`);

      res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
        // In production, remove this and send via email instead
        ...(process.env.NODE_ENV !== 'production' && { resetToken })
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

      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token'
        });
      }

      user.password = password;
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();

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
  }
};

module.exports = authController;
