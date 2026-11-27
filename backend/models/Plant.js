const { query } = require('../config/database');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidUuid = (id) => typeof id === 'string' && UUID_REGEX.test(id);

const formatPlant = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    userId: row.user_id,
    name: row.name,
    species: row.species,
    wateringSchedule: row.watering_schedule,
    lastWatered: row.last_watered,
    health: row.health,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const Plant = {
  findAllByUser: async (userId) => {
    const result = await query(
      `SELECT id, user_id, name, species, watering_schedule, last_watered, health, created_at, updated_at
       FROM plants
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows.map(formatPlant);
  },

  findByIdAndUser: async (id, userId) => {
    if (!isValidUuid(id) || !isValidUuid(userId)) return null;
    const result = await query(
      `SELECT id, user_id, name, species, watering_schedule, last_watered, health, created_at, updated_at
       FROM plants
       WHERE id = $1 AND user_id = $2
       LIMIT 1`,
      [id, userId]
    );
    return formatPlant(result.rows[0]);
  },

  create: async ({ userId, name, species, wateringSchedule }) => {
    const result = await query(
      `INSERT INTO plants (user_id, name, species, watering_schedule, last_watered)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, user_id, name, species, watering_schedule, last_watered, health, created_at, updated_at`,
      [userId, String(name).trim(), String(species).trim(), Number(wateringSchedule)]
    );
    return formatPlant(result.rows[0]);
  },

  updateByIdAndUser: async (id, userId, { name, species, wateringSchedule, health }) => {
    if (!isValidUuid(id) || !isValidUuid(userId)) return null;
    const result = await query(
      `UPDATE plants
       SET name = COALESCE($1, name),
           species = COALESCE($2, species),
           watering_schedule = COALESCE($3, watering_schedule),
           health = COALESCE($4, health),
           updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING id, user_id, name, species, watering_schedule, last_watered, health, created_at, updated_at`,
      [
        name !== undefined ? String(name).trim() : null,
        species !== undefined ? String(species).trim() : null,
        wateringSchedule !== undefined ? Number(wateringSchedule) : null,
        health !== undefined ? Number(health) : null,
        id,
        userId,
      ]
    );
    return formatPlant(result.rows[0]);
  },

  deleteByIdAndUser: async (id, userId) => {
    if (!isValidUuid(id) || !isValidUuid(userId)) return null;
    const result = await query(
      `DELETE FROM plants
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, name, species, watering_schedule, last_watered, health, created_at, updated_at`,
      [id, userId]
    );
    return formatPlant(result.rows[0]);
  },

  waterByIdAndUser: async (id, userId) => {
    if (!isValidUuid(id) || !isValidUuid(userId)) return null;
    const result = await query(
      `UPDATE plants
       SET last_watered = NOW(), updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, name, species, watering_schedule, last_watered, health, created_at, updated_at`,
      [id, userId]
    );
    return formatPlant(result.rows[0]);
  },

  searchByUser: async (userId, searchQuery) => {
    const pattern = `%${String(searchQuery).trim()}%`;
    const result = await query(
      `SELECT id, user_id, name, species, watering_schedule, last_watered, health, created_at, updated_at
       FROM plants
       WHERE user_id = $1 AND (name ILIKE $2 OR species ILIKE $2)
       ORDER BY created_at DESC`,
      [userId, pattern]
    );
    return result.rows.map(formatPlant);
  },
};

module.exports = Plant;
