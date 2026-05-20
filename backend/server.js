// Main Server File
// Express app setup, middleware, routes, and server initialization

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');
const serverConfig = require('./config/server');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const plantRoutes = require('./routes/plantRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: serverConfig.corsOrigin,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/settings', settingsRoutes);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler (must be last)
app.use(errorHandler);

// Start Server
const PORT = serverConfig.port;
const HOST = serverConfig.host;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const server = app.listen(PORT, HOST, () => {
      logger.info(`Server running on http://${HOST}:${PORT} in ${serverConfig.environment} mode`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
