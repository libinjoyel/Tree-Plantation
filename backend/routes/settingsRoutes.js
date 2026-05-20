const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

// Apply authentication to all settings routes
router.use(authMiddleware.authenticate);

// GET /api/settings
router.get('/', settingsController.getSettings);

// PUT /api/settings
router.put('/', validationMiddleware.validateSettings, settingsController.updateSettings);

// GET /api/settings/notifications
router.get('/notifications', settingsController.getNotificationPreferences);

// PUT /api/settings/notifications
router.put('/notifications', settingsController.updateNotificationPreferences);

// POST /api/settings/change-password
router.post('/change-password', settingsController.changePassword);

// GET /api/settings/user-info
router.get('/user-info', settingsController.getUserInfo);

// PUT /api/settings/user-info
router.put('/user-info', settingsController.updateUserInfo);

module.exports = router;
