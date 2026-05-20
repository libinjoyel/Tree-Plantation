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
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        });
      }

      // Create new user
      const user = new User({ email, password, name });
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
  }
};

module.exports = authController;
