const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Please provide a plant name'],
      trim: true
    },
    species: {
      type: String,
      required: [true, 'Please provide plant species'],
      trim: true
    },
    wateringSchedule: {
      type: Number,
      required: [true, 'Please provide watering schedule in days'],
      min: 1
    },
    lastWatered: {
      type: Date,
      default: Date.now
    },
    health: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
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

// Index for faster queries
plantSchema.index({ userId: 1 });

module.exports = mongoose.model('Plant', plantSchema);
