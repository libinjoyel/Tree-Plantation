// API Configuration
// Handles base URL and common fetch settings

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PUBLIC_AUTH_ENDPOINTS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/restore',
]);

const AUTH_EXEMPT_401_ENDPOINTS = new Set([
  ...PUBLIC_AUTH_ENDPOINTS,
  '/settings/change-password',
]);

const apiConfig = {
  baseURL: API_URL,

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : { success: false, error: `Request failed with status ${response.status}` };

      if (response.status === 401 && !AUTH_EXEMPT_401_ENDPOINTS.has(endpoint)) {
        if (token) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.assign('/login');
          }
        }
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};

export default apiConfig;
