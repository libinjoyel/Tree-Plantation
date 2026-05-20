const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const helpers = {
  // Generate unique ID
  generateId: () => {
    return Math.random().toString(36).substr(2, 9);
  },

  // Format date to YYYY-MM-DD
  formatDate: (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  },

  // Parse date string
  parseDate: (dateString) => {
    return new Date(dateString);
  },

  // Validate email format
  isValidEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  // Generate JWT token
  generateToken: (userId) => {
    return jwt.sign({ userId }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    });
  },

  // Verify JWT token
  verifyToken: (token) => {
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      return null;
    }
  },

  // Calculate days between two dates
  daysBetween: (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Check if date is overdue
  isOverdue: (dueDate) => {
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  }
};

module.exports = helpers;
