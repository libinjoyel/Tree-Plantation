// Services to handle authentication API calls

import type { ApiResponse, User, LoginCredentials } from '../types';
import apiConfig from '../utils/apiConfig';

class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await apiConfig.post('/auth/login', credentials);
      if (response.success && response.data?.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      return response;
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await apiConfig.post('/auth/register', data);
      return response;
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  }

  async logout(): Promise<void> {
    try {
      await apiConfig.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    try {
      return await apiConfig.get('/auth/me');
    } catch (error) {
      return { success: false, error: 'Failed to fetch user' };
    }
  }

  getStoredUser(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ resetToken?: string }>> {
    try {
      return await apiConfig.post('/auth/forgot-password', { email });
    } catch {
      return { success: false, error: 'Failed to process request' };
    }
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<null>> {
    try {
      return await apiConfig.post('/auth/reset-password', { token, password });
    } catch {
      return { success: false, error: 'Failed to reset password' };
    }
  }
}

export default new AuthService();
