const helpers = require('../utils/helpers');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const isValidCalendarDate = (dateStr) => {
  if (typeof dateStr !== 'string' || !DATE_REGEX.test(dateStr)) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
};

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

    if (!email || !password || !name || !String(name).trim()) {
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

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    next();
  },

  validatePlant: (req, res, next) => {
    const { name, species, wateringSchedule } = req.body;

    if (!name || !String(name).trim() || !species || !String(species).trim() || wateringSchedule === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name, species, and watering schedule are required'
      });
    }

    const scheduleNum = Number(wateringSchedule);
    if (!Number.isInteger(scheduleNum) || scheduleNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'Watering schedule must be a whole number of at least 1 day'
      });
    }

    next();
  },

  validatePlantUpdate: (req, res, next) => {
    const { name, species, wateringSchedule, health } = req.body;

    if (
      name === undefined &&
      species === undefined &&
      wateringSchedule === undefined &&
      health === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: 'At least one field (name, species, wateringSchedule, or health) is required'
      });
    }

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Plant name must be a non-empty string'
      });
    }

    if (species !== undefined && (typeof species !== 'string' || !species.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Plant species must be a non-empty string'
      });
    }

    if (wateringSchedule !== undefined) {
      const scheduleNum = Number(wateringSchedule);
      if (!Number.isInteger(scheduleNum) || scheduleNum < 1) {
        return res.status(400).json({
          success: false,
          error: 'Watering schedule must be a whole number of at least 1 day'
        });
      }
    }

    if (health !== undefined) {
      const healthNum = Number(health);
      if (!Number.isInteger(healthNum) || healthNum < 0 || healthNum > 100) {
        return res.status(400).json({
          success: false,
          error: 'Health must be an integer between 0 and 100'
        });
      }
    }

    next();
  },

  validateSchedule: (req, res, next) => {
    const { plantId, task, dueDate, priority } = req.body;

    if (!plantId || !task || !String(task).trim() || !dueDate) {
      return res.status(400).json({
        success: false,
        error: 'Plant ID, task, and due date are required'
      });
    }

    if (typeof plantId !== 'string' || !UUID_REGEX.test(plantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plant ID format'
      });
    }

    if (!isValidCalendarDate(dueDate)) {
      return res.status(400).json({
        success: false,
        error: 'Due date must be a valid date in YYYY-MM-DD format'
      });
    }

    if (priority !== undefined && !['high', 'medium', 'low'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Priority must be high, medium, or low'
      });
    }

    next();
  },

  validateScheduleUpdate: (req, res, next) => {
    const { task, dueDate, time, priority, completed } = req.body;

    if (
      task === undefined &&
      dueDate === undefined &&
      time === undefined &&
      priority === undefined &&
      completed === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: 'At least one field (task, dueDate, time, priority, or completed) is required'
      });
    }

    if (task !== undefined && (typeof task !== 'string' || !task.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Task description must be a non-empty string'
      });
    }

    if (dueDate !== undefined && !isValidCalendarDate(dueDate)) {
      return res.status(400).json({
        success: false,
        error: 'Due date must be a valid date in YYYY-MM-DD format'
      });
    }

    if (time !== undefined && (typeof time !== 'string' || !time.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Time must be a non-empty string'
      });
    }

    if (priority !== undefined && !['high', 'medium', 'low'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Priority must be high, medium, or low'
      });
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Completed must be a boolean'
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
  },

  validateChangePassword: (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Current and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      });
    }

    next();
  }
};

module.exports = validationMiddleware;
