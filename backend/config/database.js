// Database Configuration
// Configure MongoDB connection settings

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const dbConfig = {
  development: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tree_plantation_dev',
    options: {}
  },
  production: {
    uri: process.env.MONGODB_URI,
    options: {}
  },
  test: {
    uri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/tree_plantation_test',
    options: {}
  }
};

const connectDB = async () => {
  try {
    const config = dbConfig[process.env.NODE_ENV || 'development'];
    
    await mongoose.connect(config.uri, config.options);
    
    logger.info('Database connected successfully');
    return mongoose.connection;
  } catch (error) {
    logger.error('Database connection error', error.message);
    process.exit(1);
  }
};

module.exports = {
  dbConfig,
  connectDB
};
