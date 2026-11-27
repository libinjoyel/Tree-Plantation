const Schedule = require('../models/Schedule');
const Plant = require('../models/Plant');
const logger = require('../utils/logger');

const scheduleController = {
  getAllSchedules: async (req, res) => {
    try {
      const schedules = await Schedule.findAllByUser(req.userId);

      res.json({
        success: true,
        data: { schedules }
      });
    } catch (error) {
      logger.error('Get all schedules error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch schedules'
      });
    }
  },

  getScheduleById: async (req, res) => {
    try {
      const schedule = await Schedule.findByIdAndUser(req.params.id, req.userId);

      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }

      res.json({
        success: true,
        data: { schedule }
      });
    } catch (error) {
      logger.error('Get schedule by ID error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch schedule'
      });
    }
  },

  createSchedule: async (req, res) => {
    try {
      const { plantId, plantName, task, dueDate, time, priority } = req.body;

      const plant = await Plant.findByIdAndUser(plantId, req.userId);
      if (!plant) {
        return res.status(404).json({
          success: false,
          error: 'Plant not found'
        });
      }

      const schedule = await Schedule.create({
        userId: req.userId,
        plantId,
        plantName: plantName || plant.name,
        task,
        dueDate,
        time: time || '09:00 AM',
        priority: priority || 'medium'
      });

      logger.info(`Schedule created: ${task}`);

      res.status(201).json({
        success: true,
        data: { schedule }
      });
    } catch (error) {
      logger.error('Create schedule error', error.message);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create schedule'
      });
    }
  },

  updateSchedule: async (req, res) => {
    try {
      const { task, dueDate, time, priority, completed } = req.body;

      const schedule = await Schedule.updateByIdAndUser(req.params.id, req.userId, {
        task,
        dueDate,
        time,
        priority,
        completed
      });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }

      logger.info(`Schedule updated: ${schedule.task}`);

      res.json({
        success: true,
        data: { schedule }
      });
    } catch (error) {
      logger.error('Update schedule error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to update schedule'
      });
    }
  },

  deleteSchedule: async (req, res) => {
    try {
      const schedule = await Schedule.deleteByIdAndUser(req.params.id, req.userId);

      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }

      logger.info(`Schedule deleted: ${schedule.task}`);

      res.json({
        success: true,
        message: 'Schedule deleted successfully'
      });
    } catch (error) {
      logger.error('Delete schedule error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to delete schedule'
      });
    }
  },

  markTaskComplete: async (req, res) => {
    try {
      const schedule = await Schedule.markCompleteByIdAndUser(req.params.id, req.userId);

      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }

      logger.info(`Task completed: ${schedule.task}`);

      res.json({
        success: true,
        data: { schedule }
      });
    } catch (error) {
      logger.error('Mark task complete error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to mark task as complete'
      });
    }
  },

  getUpcomingSchedules: async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 7;
      const today = new Date().toISOString().split('T')[0];

      // Calculate future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const schedules = await Schedule.findUpcomingByUser(req.userId, today, futureDateStr);

      res.json({
        success: true,
        data: { schedules }
      });
    } catch (error) {
      logger.error('Get upcoming schedules error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch upcoming schedules'
      });
    }
  }
};

module.exports = scheduleController;
