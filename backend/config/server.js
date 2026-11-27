// Server Configuration
// Configure server settings

const environment = process.env.NODE_ENV || 'development';

const serverConfig = {
  port: Number(process.env.PORT) || 5000,
  host: process.env.HOST || (environment === 'production' || process.env.RENDER ? '0.0.0.0' : 'localhost'),
  environment,
  corsOrigin: process.env.CORS_ORIGIN || '',
  logLevel: process.env.LOG_LEVEL || 'info'
};

module.exports = serverConfig;
