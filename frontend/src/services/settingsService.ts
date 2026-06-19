// Settings Service — handles settings, user-info, and password API calls

import type { ApiResponse, AppSettings, UserInfo } from '../types';
import apiConfig from '../utils/apiConfig';

class SettingsService {
  async getSettings(): Promise<ApiResponse<{ settings: AppSettings }>> {
    try {
      return await apiConfig.get('/settings');
    } catch {
      return { success: false, error: 'Failed to fetch settings' };
    }
  }

  async updateSettings(data: Partial<AppSettings>): Promise<ApiResponse<{ settings: AppSettings }>> {
    try {
      return await apiConfig.put('/settings', data);
    } catch {
      return { success: false, error: 'Failed to update settings' };
    }
  }

  async getUserInfo(): Promise<ApiResponse<{ userInfo: UserInfo }>> {
    try {
      return await apiConfig.get('/settings/user-info');
    } catch {
      return { success: false, error: 'Failed to fetch user info' };
    }
  }

  async updateUserInfo(data: { name: string }): Promise<ApiResponse<{ userInfo: UserInfo }>> {
    try {
      return await apiConfig.put('/settings/user-info', data);
    } catch {
      return { success: false, error: 'Failed to update user info' };
    }
  }

  async deleteAccount(): Promise<ApiResponse<null>> {
    try {
      return await apiConfig.delete('/settings/account');
    } catch {
      return { success: false, error: 'Failed to delete account' };
    }
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<null>> {
    try {
      return await apiConfig.post('/settings/change-password', data);
    } catch {
      return { success: false, error: 'Failed to change password' };
    }
  }
}

export default new SettingsService();
