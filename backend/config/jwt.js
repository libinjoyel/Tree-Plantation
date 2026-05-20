// JWT Configuration
// Configure JWT settings for authentication

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  algorithm: 'HS256'
};

module.exports = jwtConfig;
