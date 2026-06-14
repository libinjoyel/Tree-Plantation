// Server Configuration
// Configure server settings

const serverConfig = {
  port: process.env.PORT || 5000,
  host: process.env.HOST || 'localhost',
  environment: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || /^http:\/\/localhost:\d+$/,
  logLevel: process.env.LOG_LEVEL || 'info'
};

module.exports = serverConfig;
