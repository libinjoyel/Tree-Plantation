const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidUuid = (id) => typeof id === 'string' && UUID_REGEX.test(id);

const formatUser = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
};

const User = {
  isValidId: isValidUuid,
  format: formatUser,

  findByEmail: async (email, { includePassword = false } = {}) => {
    const normalizedEmail = String(email).trim().toLowerCase();
    const cols = includePassword
      ? 'id, name, email, password, reset_token, reset_token_expiry, deleted_at, created_at, updated_at'
      : 'id, name, email, deleted_at, created_at, updated_at';
    const result = await query(
      `SELECT ${cols} FROM users WHERE LOWER(email) = $1 LIMIT 1`,
      [normalizedEmail]
    );
    return result.rows[0] || null;
  },

  findById: async (id, { includePassword = false } = {}) => {
    if (!isValidUuid(id)) return null;
    const cols = includePassword
      ? 'id, name, email, password, reset_token, reset_token_expiry, deleted_at, created_at, updated_at'
      : 'id, name, email, deleted_at, created_at, updated_at';
    const result = await query(
      `SELECT ${cols} FROM users WHERE id = $1 LIMIT 1`,
      [id]
    );
    return result.rows[0] || null;
  },

  findByValidResetToken: async (token) => {
    const result = await query(
      `SELECT id, name, email, deleted_at, created_at, updated_at
       FROM users
       WHERE reset_token = $1 AND reset_token_expiry > NOW()
       LIMIT 1`,
      [token]
    );
    return result.rows[0] || null;
  },

  create: async ({ name, email, password }) => {
    const normalizedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(name).trim();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, deleted_at, created_at, updated_at`,
      [trimmedName, normalizedEmail, hashedPassword]
    );
    return result.rows[0];
  },

  comparePassword: async (enteredPassword, hashedPassword) => {
    return bcrypt.compare(enteredPassword, hashedPassword);
  },

  setResetToken: async (email, resetToken, resetTokenExpiry) => {
    const normalizedEmail = String(email).trim().toLowerCase();
    await query(
      `UPDATE users
       SET reset_token = $1, reset_token_expiry = $2, updated_at = NOW()
       WHERE LOWER(email) = $3`,
      [resetToken, resetTokenExpiry, normalizedEmail]
    );
  },

  updatePasswordAndClearReset: async (id, newPassword) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await query(
      `UPDATE users
       SET password = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW()
       WHERE id = $2`,
      [hashedPassword, id]
    );
  },

  updateName: async (id, name) => {
    if (!isValidUuid(id)) return null;
    const result = await query(
      `UPDATE users
       SET name = COALESCE($1, name), updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email, deleted_at, created_at, updated_at`,
      [name ? String(name).trim() : null, id]
    );
    return result.rows[0] || null;
  },

  softDelete: async (id) => {
    if (!isValidUuid(id)) return null;
    const result = await query(
      `UPDATE users
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING id`,
      [id]
    );
    return result.rows[0] || null;
  },

  restore: async (id) => {
    if (!isValidUuid(id)) return null;
    const result = await query(
      `UPDATE users
       SET deleted_at = NULL, updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, email, deleted_at, created_at, updated_at`,
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = User;
