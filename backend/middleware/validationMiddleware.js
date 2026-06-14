const helpers = require('../utils/helpers');

const validationMiddleware = {
  validateLogin: (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    if (!helpers.isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    next();
  },

  validateRegister: (req, res, next) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
    }

    if (!helpers.isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    next();
  },

  validatePlant: (req, res, next) => {
    const { name, species, wateringSchedule } = req.body;

    if (!name || !species || wateringSchedule === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name, species, and watering schedule are required'
      });
    }

    if (wateringSchedule < 1) {
      return res.status(400).json({
        success: false,
        error: 'Watering schedule must be at least 1 day'
      });
    }

    next();
  },

  validateSchedule: (req, res, next) => {
    const { plantId, task, dueDate, priority } = req.body;

    if (!plantId || !task || !dueDate) {
      return res.status(400).json({
        success: false,
        error: 'Plant ID, task, and due date are required'
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      return res.status(400).json({
        success: false,
        error: 'Due date must be in YYYY-MM-DD format'
      });
    }

    if (priority && !['high', 'medium', 'low'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Priority must be high, medium, or low'
      });
    }

    next();
  },

  validateSettings: (req, res, next) => {
    const { language, timezone } = req.body;

    if (language && typeof language !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Language must be a string'
      });
    }

    if (timezone && typeof timezone !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Timezone must be a string'
      });
    }

    next();
  }
};

module.exports = validationMiddleware;
