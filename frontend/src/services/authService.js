// Services to handle authentication API calls

import apiConfig from '../utils/apiConfig';

class AuthService {
  async login(credentials) {
    try {
      const response = await apiConfig.post('/auth/login', credentials);
      if (response.success && response.data?.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      return response;
    } catch {
      return { success: false, error: 'Login failed' };
    }
  }

  async register(data) {
    try {
      const response = await apiConfig.post('/auth/register', data);
      return response;
    } catch {
      return { success: false, error: 'Registration failed' };
    }
  }

  async logout() {
    try {
      await apiConfig.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser() {
    try {
      return await apiConfig.get('/auth/me');
    } catch {
      return { success: false, error: 'Failed to fetch user' };
    }
  }

  getStoredUser() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  async forgotPassword(email) {
    try {
      return await apiConfig.post('/auth/forgot-password', { email });
    } catch {
      return { success: false, error: 'Failed to process request' };
    }
  }

  async resetPassword(token, password) {
    try {
      return await apiConfig.post('/auth/reset-password', { token, password });
    } catch {
      return { success: false, error: 'Failed to reset password' };
    }
  }

  async restoreAccount(email, password) {
    try {
      const response = await apiConfig.post('/auth/restore', { email, password });
      if (response.success && response.data?.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      return response;
    } catch {
      return { success: false, error: 'Failed to restore account' };
    }
  }
}

export default new AuthService();
