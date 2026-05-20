// Error Handling Middleware
// Handles global error handling and response formatting

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  logger.error(`Error [${statusCode}]: ${message}`, err);

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { details: err.stack })
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
