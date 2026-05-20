const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    plantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
      required: true
    },
    plantName: {
      type: String,
      required: true
    },
    task: {
      type: String,
      required: [true, 'Please provide a task description'],
      trim: true
    },
    dueDate: {
      type: String,
      required: [true, 'Please provide a due date'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Please provide date in YYYY-MM-DD format']
    },
    time: {
      type: String,
      default: '09:00 AM'
    },
    completed: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
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
scheduleSchema.index({ userId: 1, dueDate: 1 });
scheduleSchema.index({ userId: 1, completed: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
