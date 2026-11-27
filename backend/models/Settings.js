const { query } = require('../config/database');

const formatSettings = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    userId: row.user_id,
    notificationsEnabled: row.notifications_enabled,
    emailAlerts: row.email_alerts,
    wateringReminders: row.watering_reminders,
    weeklyReports: row.weekly_reports,
    darkMode: row.dark_mode,
    language: row.language,
    timezone: row.timezone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const Settings = {
  findByUser: async (userId) => {
    const result = await query(
      `SELECT id, user_id, notifications_enabled, email_alerts, watering_reminders, weekly_reports, dark_mode, language, timezone, created_at, updated_at
       FROM settings
       WHERE user_id = $1
       LIMIT 1`,
      [userId]
    );
    return formatSettings(result.rows[0]);
  },

  createDefault: async (userId) => {
    const result = await query(
      `INSERT INTO settings (user_id, notifications_enabled, email_alerts, watering_reminders, weekly_reports, dark_mode, language, timezone)
       VALUES ($1, TRUE, TRUE, TRUE, FALSE, FALSE, 'English', 'UTC')
       ON CONFLICT (user_id) DO UPDATE SET updated_at = settings.updated_at
       RETURNING id, user_id, notifications_enabled, email_alerts, watering_reminders, weekly_reports, dark_mode, language, timezone, created_at, updated_at`,
      [userId]
    );
    return formatSettings(result.rows[0]);
  },

  upsertByUser: async (
    userId,
    { notificationsEnabled, emailAlerts, wateringReminders, weeklyReports, darkMode, language, timezone }
  ) => {
    const existing = await Settings.findByUser(userId);
    const merged = {
      notificationsEnabled: notificationsEnabled !== undefined ? Boolean(notificationsEnabled) : (existing ? existing.notificationsEnabled : true),
      emailAlerts: emailAlerts !== undefined ? Boolean(emailAlerts) : (existing ? existing.emailAlerts : true),
      wateringReminders: wateringReminders !== undefined ? Boolean(wateringReminders) : (existing ? existing.wateringReminders : true),
      weeklyReports: weeklyReports !== undefined ? Boolean(weeklyReports) : (existing ? existing.weeklyReports : false),
      darkMode: darkMode !== undefined ? Boolean(darkMode) : (existing ? existing.darkMode : false),
      language: language || (existing ? existing.language : 'English'),
      timezone: timezone || (existing ? existing.timezone : 'UTC'),
    };

    const result = await query(
      `INSERT INTO settings (user_id, notifications_enabled, email_alerts, watering_reminders, weekly_reports, dark_mode, language, timezone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id) DO UPDATE
       SET notifications_enabled = EXCLUDED.notifications_enabled,
           email_alerts = EXCLUDED.email_alerts,
           watering_reminders = EXCLUDED.watering_reminders,
           weekly_reports = EXCLUDED.weekly_reports,
           dark_mode = EXCLUDED.dark_mode,
           language = EXCLUDED.language,
           timezone = EXCLUDED.timezone,
           updated_at = NOW()
       RETURNING id, user_id, notifications_enabled, email_alerts, watering_reminders, weekly_reports, dark_mode, language, timezone, created_at, updated_at`,
      [
        userId,
        merged.notificationsEnabled,
        merged.emailAlerts,
        merged.wateringReminders,
        merged.weeklyReports,
        merged.darkMode,
        merged.language,
        merged.timezone,
      ]
    );
    return formatSettings(result.rows[0]);
  },

  updateNotificationsByUser: async (
    userId,
    { notificationsEnabled, emailAlerts, wateringReminders, weeklyReports }
  ) => {
    const result = await query(
      `UPDATE settings
       SET notifications_enabled = COALESCE($1, notifications_enabled),
           email_alerts = COALESCE($2, email_alerts),
           watering_reminders = COALESCE($3, watering_reminders),
           weekly_reports = COALESCE($4, weekly_reports),
           updated_at = NOW()
       WHERE user_id = $5
       RETURNING id, user_id, notifications_enabled, email_alerts, watering_reminders, weekly_reports, dark_mode, language, timezone, created_at, updated_at`,
      [
        notificationsEnabled !== undefined ? Boolean(notificationsEnabled) : null,
        emailAlerts !== undefined ? Boolean(emailAlerts) : null,
        wateringReminders !== undefined ? Boolean(wateringReminders) : null,
        weeklyReports !== undefined ? Boolean(weeklyReports) : null,
        userId,
      ]
    );
    return formatSettings(result.rows[0]);
  },
};

module.exports = Settings;
