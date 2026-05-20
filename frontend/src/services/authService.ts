// Services to handle authentication API calls

import { ApiResponse, User, LoginCredentials } from '../types';
import apiConfig from '../utils/apiConfig';

class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await apiConfig.post('/auth/login', credentials);
      if (response.success && response.data?.token) {
        localStorage.setItem('token', response.data.token);
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
  }): Promise<ApiResponse<User>> {
    try {
      const response = await apiConfig.post('/auth/register', data);
      if (response.success && response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
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
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      return await apiConfig.get('/auth/me');
    } catch (error) {
      return { success: false, error: 'Failed to fetch user' };
    }
  }
}

export default new AuthService();
