const { query } = require('../config/database');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidUuid = (id) => typeof id === 'string' && UUID_REGEX.test(id);

const formatSchedule = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    userId: row.user_id,
    plantId: row.plant_id,
    plantName: row.plant_name,
    task: row.task,
    dueDate: row.due_date,
    time: row.time,
    completed: row.completed,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const Schedule = {
  findAllByUser: async (userId) => {
    const result = await query(
      `SELECT id, user_id, plant_id, plant_name, task, due_date, time, completed, priority, created_at, updated_at
       FROM schedules
       WHERE user_id = $1
       ORDER BY due_date ASC,
                CASE priority WHEN 'high' THEN 3 WHEN 'medium' THEN 2 WHEN 'low' THEN 1 ELSE 0 END DESC`,
      [userId]
    );
    return result.rows.map(formatSchedule);
  },

  findByIdAndUser: async (id, userId) => {
    if (!isValidUuid(id) || !isValidUuid(userId)) return null;
    const result = await query(
      `SELECT id, user_id, plant_id, plant_name, task, due_date, time, completed, priority, created_at, updated_at
       FROM schedules
       WHERE id = $1 AND user_id = $2
       LIMIT 1`,
      [id, userId]
    );
    return formatSchedule(result.rows[0]);
  },

  create: async ({ userId, plantId, plantName, task, dueDate, time, priority }) => {
    const result = await query(
      `INSERT INTO schedules (user_id, plant_id, plant_name, task, due_date, time, priority, completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
       RETURNING id, user_id, plant_id, plant_name, task, due_date, time, completed, priority, created_at, updated_at`,
      [
        userId,
        plantId,
        String(plantName).trim(),
        String(task).trim(),
        dueDate,
        time || '09:00 AM',
        priority || 'medium',
      ]
    );
    return formatSchedule(result.rows[0]);
  },

  updateByIdAndUser: async (id, userId, { task, dueDate, time, priority, completed }) => {
    if (!isValidUuid(id) || !isValidUuid(userId)) return null;
    const result = await query(
      `UPDATE schedules
       SET task = COALESCE($1, task),
           due_date = COALESCE($2, due_date),
           time = COALESCE($3, time),
           priority = COALESCE($4, priority),
           completed = COALESCE($5, completed),
           updated_at = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING id, user_id, plant_id, plant_name, task, due_date, time, completed, priority, created_at, updated_at`,
      [
        task !== undefined ? String(task).trim() : null,
        dueDate !== undefined ? dueDate : null,
        time !== undefined ? time : null,
        priority !== undefined ? priority : null,
        completed !== undefined ? Boolean(completed) : null,
        id,
        userId,
      ]
    );
    return formatSchedule(result.rows[0]);
  },

  deleteByIdAndUser: async (id, userId) => {
    if (!isValidUuid(id) || !isValidUuid(userId)) return null;
    const result = await query(
      `DELETE FROM schedules
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, plant_id, plant_name, task, due_date, time, completed, priority, created_at, updated_at`,
      [id, userId]
    );
    return formatSchedule(result.rows[0]);
  },

  markCompleteByIdAndUser: async (id, userId) => {
    if (!isValidUuid(id) || !isValidUuid(userId)) return null;
    const result = await query(
      `UPDATE schedules
       SET completed = TRUE, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, plant_id, plant_name, task, due_date, time, completed, priority, created_at, updated_at`,
      [id, userId]
    );
    return formatSchedule(result.rows[0]);
  },

  findUpcomingByUser: async (userId, today, futureDateStr) => {
    const result = await query(
      `SELECT id, user_id, plant_id, plant_name, task, due_date, time, completed, priority, created_at, updated_at
       FROM schedules
       WHERE user_id = $1
         AND due_date >= $2
         AND due_date <= $3
         AND completed = FALSE
       ORDER BY due_date ASC,
                CASE priority WHEN 'high' THEN 3 WHEN 'medium' THEN 2 WHEN 'low' THEN 1 ELSE 0 END DESC`,
      [userId, today, futureDateStr]
    );
    return result.rows.map(formatSchedule);
  },
};

module.exports = Schedule;
