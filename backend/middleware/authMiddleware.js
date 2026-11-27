const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const User = require('../models/User');
const logger = require('../utils/logger');

const authMiddleware = {
  authenticate: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No token provided'
        });
      }

      const decoded = jwt.verify(token, jwtConfig.secret);
      const user = await User.findById(decoded.userId);

      if (!user || user.deleted_at) {
        return res.status(401).json({
          success: false,
          error: 'Account no longer exists or has been deactivated'
        });
      }

      req.userId = user.id;
      req.user = decoded;
      next();
    } catch (error) {
      logger.error('Authentication error', error.message);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  },

  requireAuth: (req, res, next) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    next();
  }
};

module.exports = authMiddleware;
