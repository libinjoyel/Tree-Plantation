const express = require('express');
const router = express.Router();
const plantController = require('../controllers/plantController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

// Apply authentication to all plant routes
router.use(authMiddleware.authenticate);

// GET /api/plants
router.get('/', plantController.getAllPlants);

// GET /api/plants/search
router.get('/search', plantController.searchPlants);

// GET /api/plants/:id
router.get('/:id', plantController.getPlantById);

// POST /api/plants
router.post('/', validationMiddleware.validatePlant, plantController.createPlant);

// PUT /api/plants/:id
router.put('/:id', validationMiddleware.validatePlantUpdate, plantController.updatePlant);

// DELETE /api/plants/:id
router.delete('/:id', plantController.deletePlant);

// POST /api/plants/:id/water
router.post('/:id/water', plantController.waterPlant);

module.exports = router;
