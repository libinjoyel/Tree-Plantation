// Constants
// Define application constants

const constants = {
  // HTTP Status Codes
  HTTP_OK: 200,
  HTTP_CREATED: 201,
  HTTP_BAD_REQUEST: 400,
  HTTP_UNAUTHORIZED: 401,
  HTTP_FORBIDDEN: 403,
  HTTP_NOT_FOUND: 404,
  HTTP_SERVER_ERROR: 500,

  // Priorities
  PRIORITY_HIGH: 'high',
  PRIORITY_MEDIUM: 'medium',
  PRIORITY_LOW: 'low',

  // Task Status
  STATUS_PENDING: 'pending',
  STATUS_COMPLETED: 'completed',
  STATUS_IN_PROGRESS: 'in_progress',

  // Default Values
  DEFAULT_WATERING_SCHEDULE: 3, // Days
  DEFAULT_TIMEZONE: 'UTC',
  DEFAULT_LANGUAGE: 'English',

  // API Response Messages
  SUCCESS_MESSAGE: 'Operation successful',
  ERROR_MESSAGE: 'An error occurred',
  NOT_FOUND_MESSAGE: 'Resource not found',
  UNAUTHORIZED_MESSAGE: 'Unauthorized access',

  // Plant Health Status
  HEALTH_EXCELLENT: 100,
  HEALTH_GOOD: 75,
  HEALTH_FAIR: 50,
  HEALTH_POOR: 25,
  HEALTH_CRITICAL: 0
};

module.exports = constants;
