const Plant = require('../models/Plant');
const logger = require('../utils/logger');

const plantController = {
  getAllPlants: async (req, res) => {
    try {
      const plants = await Plant.find({ userId: req.userId }).sort({ createdAt: -1 });
      res.json({
        success: true,
        data: { plants }
      });
    } catch (error) {
      logger.error('Get all plants error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch plants'
      });
    }
  },

  getPlantById: async (req, res) => {
    try {
      const plant = await Plant.findOne({
        _id: req.params.id,
        userId: req.userId
      });

      if (!plant) {
        return res.status(404).json({
          success: false,
          error: 'Plant not found'
        });
      }

      res.json({
        success: true,
        data: { plant }
      });
    } catch (error) {
      logger.error('Get plant by ID error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch plant'
      });
    }
  },

  createPlant: async (req, res) => {
    try {
      const { name, species, wateringSchedule } = req.body;

      const plant = new Plant({
        userId: req.userId,
        name,
        species,
        wateringSchedule,
        lastWatered: new Date()
      });

      await plant.save();
      logger.info(`Plant created: ${name}`);

      res.status(201).json({
        success: true,
        data: { plant }
      });
    } catch (error) {
      logger.error('Create plant error', error.message);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create plant'
      });
    }
  },

  updatePlant: async (req, res) => {
    try {
      const { name, species, wateringSchedule, health } = req.body;

      const plant = await Plant.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        {
          ...(name && { name }),
          ...(species && { species }),
          ...(wateringSchedule && { wateringSchedule }),
          ...(health !== undefined && { health }),
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!plant) {
        return res.status(404).json({
          success: false,
          error: 'Plant not found'
        });
      }

      logger.info(`Plant updated: ${plant.name}`);

      res.json({
        success: true,
        data: { plant }
      });
    } catch (error) {
      logger.error('Update plant error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to update plant'
      });
    }
  },

  deletePlant: async (req, res) => {
    try {
      const plant = await Plant.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId
      });

      if (!plant) {
        return res.status(404).json({
          success: false,
          error: 'Plant not found'
        });
      }

      logger.info(`Plant deleted: ${plant.name}`);

      res.json({
        success: true,
        message: 'Plant deleted successfully'
      });
    } catch (error) {
      logger.error('Delete plant error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to delete plant'
      });
    }
  },

  waterPlant: async (req, res) => {
    try {
      const plant = await Plant.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { lastWatered: new Date() },
        { new: true }
      );

      if (!plant) {
        return res.status(404).json({
          success: false,
          error: 'Plant not found'
        });
      }

      logger.info(`Plant watered: ${plant.name}`);

      res.json({
        success: true,
        data: { plant }
      });
    } catch (error) {
      logger.error('Water plant error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to water plant'
      });
    }
  },

  searchPlants: async (req, res) => {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const plants = await Plant.find({
        userId: req.userId,
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { species: { $regex: q, $options: 'i' } }
        ]
      });

      res.json({
        success: true,
        data: { plants }
      });
    } catch (error) {
      logger.error('Search plants error', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to search plants'
      });
    }
  }
};

module.exports = plantController;
