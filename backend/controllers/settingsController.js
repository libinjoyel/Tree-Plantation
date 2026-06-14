const Settings = require('../models/Settings');
const User = require('../models/User');
const logger = require('../utils/logger');

const settingsController = {
  getSettings: async (req, res) => {
    try {
      let settings = await Settings.findOne({ userId: req.userId });

      if (!settings) {
        // Create default settings if not exists
        settings = new Settings({
          userId: req.userId,
          notificationsEnabled: true,
          emailAlerts: true,
          wateringReminders: true,
          weeklyReports: false,
          darkMode: false,
          language: 'English',
          timezone: 'UTC'
        });
        await settings.save();
      }

      res.json({
        success: true,
        data: { settings }
      });
    } catch (error) {
      logger.error('Get settings error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch settings'
      });
    }
  },

  updateSettings: async (req, res) => {
    try {
      const {
        notificationsEnabled,
        emailAlerts,
        wateringReminders,
        weeklyReports,
        darkMode,
        language,
        timezone
      } = req.body;

      const settings = await Settings.findOneAndUpdate(
        { userId: req.userId },
        {
          ...(notificationsEnabled !== undefined && { notificationsEnabled }),
          ...(emailAlerts !== undefined && { emailAlerts }),
          ...(wateringReminders !== undefined && { wateringReminders }),
          ...(weeklyReports !== undefined && { weeklyReports }),
          ...(darkMode !== undefined && { darkMode }),
          ...(language && { language }),
          ...(timezone && { timezone }),
          updatedAt: new Date()
        },
        { new: true, upsert: true }
      );

      logger.info(`Settings updated for user: ${req.userId}`);

      res.json({
        success: true,
        data: { settings }
      });
    } catch (error) {
      logger.error('Update settings error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to update settings'
      });
    }
  },

  getNotificationPreferences: async (req, res) => {
    try {
      const settings = await Settings.findOne({ userId: req.userId });

      if (!settings) {
        return res.status(404).json({
          success: false,
          error: 'Settings not found'
        });
      }

      const notificationPrefs = {
        notificationsEnabled: settings.notificationsEnabled,
        emailAlerts: settings.emailAlerts,
        wateringReminders: settings.wateringReminders,
        weeklyReports: settings.weeklyReports
      };

      res.json({
        success: true,
        data: { notifications: notificationPrefs }
      });
    } catch (error) {
      logger.error('Get notification preferences error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch notification preferences'
      });
    }
  },

  updateNotificationPreferences: async (req, res) => {
    try {
      const {
        notificationsEnabled,
        emailAlerts,
        wateringReminders,
        weeklyReports
      } = req.body;

      const settings = await Settings.findOneAndUpdate(
        { userId: req.userId },
        {
          ...(notificationsEnabled !== undefined && { notificationsEnabled }),
          ...(emailAlerts !== undefined && { emailAlerts }),
          ...(wateringReminders !== undefined && { wateringReminders }),
          ...(weeklyReports !== undefined && { weeklyReports }),
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!settings) {
        return res.status(404).json({
          success: false,
          error: 'Settings not found'
        });
      }

      logger.info(`Notification preferences updated for user: ${req.userId}`);

      res.json({
        success: true,
        data: { notifications: settings }
      });
    } catch (error) {
      logger.error('Update notification preferences error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to update notification preferences'
      });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current and new password are required'
        });
      }

      // Get user with password
      const user = await User.findById(req.userId).select('+password');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${req.userId}`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Change password error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to change password'
      });
    }
  },

  getUserInfo: async (req, res) => {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const userInfo = {
        username: user.name,
        email: user.email
      };

      res.json({
        success: true,
        data: { userInfo }
      });
    } catch (error) {
      logger.error('Get user info error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user info'
      });
    }
  },

  updateUserInfo: async (req, res) => {
    try {
      const { name } = req.body;

      const user = await User.findByIdAndUpdate(
        req.userId,
        {
          ...(name && { name }),
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const userInfo = {
        username: user.name,
        email: user.email
      };

      logger.info(`User info updated for user: ${req.userId}`);

      res.json({
        success: true,
        data: { userInfo }
      });
    } catch (error) {
      logger.error('Update user info error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to update user info'
      });
    }
  }
};

module.exports = settingsController;
