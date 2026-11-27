// Main Server File
// Express app setup, middleware, routes, and server initialization

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB, pool } = require('./config/database');
const jwtConfig = require('./config/jwt');
const logger = require('./utils/logger');
const serverConfig = require('./config/server');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const plantRoutes = require('./routes/plantRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const weatherRoutes = require('./routes/weatherRoutes');

// Initialize Express app
const app = express();

// Trust first reverse-proxy hop in production (Render/Vercel/etc.) for accurate rate-limiting IP
if (serverConfig.environment === 'production' || process.env.RENDER) {
  app.set('trust proxy', 1);
}

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = serverConfig.corsOrigin
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isLocalDevOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients (health checks, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (serverConfig.environment !== 'production' && isLocalDevOrigin(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true
}));

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint (includes live DB ping)
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      success: true,
      message: 'Server is running',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database unavailable',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/weather', weatherRoutes);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler (must be last)
app.use(errorHandler);

// Start Server
const PORT = serverConfig.port;
const HOST = serverConfig.host;

const startServer = async () => {
  try {
    // Validate JWT configuration before accepting requests
    jwtConfig.validate();

    // Connect to Neon PostgreSQL and ensure schema
    await connectDB();

    const server = app.listen(PORT, HOST, () => {
      logger.info(`Server running on http://${HOST}:${PORT} in ${serverConfig.environment} mode`);
    });

    const shutdown = (signal) => {
      logger.info(`${signal} signal received: closing HTTP server`);
      server.close(async () => {
        await pool.end();
        logger.info('HTTP server and database pool closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
