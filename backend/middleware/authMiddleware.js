const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const logger = require('../utils/logger');

const authMiddleware = {
  authenticate: (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No token provided'
        });
      }

      const decoded = jwt.verify(token, jwtConfig.secret);
      req.userId = decoded.userId;
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
