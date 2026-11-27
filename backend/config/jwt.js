// JWT Configuration
// Configure JWT settings for authentication

const UNSAFE_JWT_SECRETS = new Set([
  'your-secret-key',
  'your-secret-key-change-in-production',
  'secret',
  'changeme',
  'default-secret'
]);

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET ? process.env.JWT_SECRET.trim() : '';

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  if (process.env.NODE_ENV === 'production') {
    if (UNSAFE_JWT_SECRETS.has(secret) || secret.length < 32) {
      throw new Error(
        'JWT_SECRET must be a strong, non-placeholder secret (at least 32 characters) in production'
      );
    }
  }

  return secret;
};

const jwtConfig = {
  get secret() {
    return getJwtSecret();
  },
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  algorithm: 'HS256',
  validate: getJwtSecret
};

module.exports = jwtConfig;
