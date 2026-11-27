// Database Configuration
// Configure Neon Lakebase PostgreSQL connection pool and schema initialization

const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const logger = require('../utils/logger');

// Load backend/.env first (if edited directly), then Neon-managed .env.local from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const normalizeSslMode = (url) => {
  if (!url) return url;
  return url.replace('sslmode=require', 'sslmode=verify-full');
};

const dbUrl = normalizeSslMode(process.env.DATABASE_URL);

if (!dbUrl) {
  logger.warn('DATABASE_URL is not set in environment variables');
}

const pool = new Pool({
  connectionString: dbUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL pool error', err.message);
});

const query = (text, params) => pool.query(text, params);

const ensureSchema = async () => {
  await pool.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        reset_token TEXT,
        reset_token_expiry TIMESTAMPTZ,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS plants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        species TEXT NOT NULL,
        watering_schedule INTEGER NOT NULL CHECK (watering_schedule >= 1),
        last_watered TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        health INTEGER NOT NULL DEFAULT 100 CHECK (health >= 0 AND health <= 100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_plants_user_id ON plants(user_id);

      CREATE TABLE IF NOT EXISTS schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
        plant_name TEXT NOT NULL,
        task TEXT NOT NULL,
        due_date TEXT NOT NULL,
        time TEXT NOT NULL DEFAULT '09:00 AM',
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_schedules_user_due ON schedules(user_id, due_date);
      CREATE INDEX IF NOT EXISTS idx_schedules_user_completed ON schedules(user_id, completed);

      CREATE TABLE IF NOT EXISTS settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        email_alerts BOOLEAN NOT NULL DEFAULT TRUE,
        watering_reminders BOOLEAN NOT NULL DEFAULT TRUE,
        weekly_reports BOOLEAN NOT NULL DEFAULT FALSE,
        dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
        language TEXT NOT NULL DEFAULT 'English',
        timezone TEXT NOT NULL DEFAULT 'UTC',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
};

const connectDB = async () => {
  try {
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    await pool.query('SELECT 1');
    await ensureSchema();

    logger.info('PostgreSQL (Neon) connected and schema verified successfully');
    return pool;
  } catch (error) {
    logger.error('Database connection error', error.message);
    process.exit(1);
  }
};

module.exports = {
  pool,
  query,
  ensureSchema,
  connectDB,
};
