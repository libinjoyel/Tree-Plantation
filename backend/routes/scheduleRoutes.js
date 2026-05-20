const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

// Apply authentication to all schedule routes
router.use(authMiddleware.authenticate);

// GET /api/schedules
router.get('/', scheduleController.getAllSchedules);

// GET /api/schedules/upcoming
router.get('/upcoming', scheduleController.getUpcomingSchedules);

// GET /api/schedules/:id
router.get('/:id', scheduleController.getScheduleById);

// POST /api/schedules
router.post('/', validationMiddleware.validateSchedule, scheduleController.createSchedule);

// PUT /api/schedules/:id
router.put('/:id', scheduleController.updateSchedule);

// DELETE /api/schedules/:id
router.delete('/:id', scheduleController.deleteSchedule);

// POST /api/schedules/:id/complete
router.post('/:id/complete', scheduleController.markTaskComplete);

module.exports = router;
