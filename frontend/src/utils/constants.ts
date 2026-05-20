// API Configuration
export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

// Routes
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
} as const;

// Messages
export const MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  ERROR: 'An error occurred',
  LOADING: 'Loading...',
} as const;

// Validation Patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-\+\(\)]{10,}$/,
} as const;
