const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    },
    emailAlerts: {
      type: Boolean,
      default: true
    },
    wateringReminders: {
      type: Boolean,
      default: true
    },
    weeklyReports: {
      type: Boolean,
      default: false
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'English'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
