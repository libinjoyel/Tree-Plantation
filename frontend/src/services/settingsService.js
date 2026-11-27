// Settings Service — handles settings, user-info, and password API calls

import apiConfig from '../utils/apiConfig';

class SettingsService {
  async getSettings() {
    try {
      return await apiConfig.get('/settings');
    } catch {
      return { success: false, error: 'Failed to fetch settings' };
    }
  }

  async updateSettings(data) {
    try {
      return await apiConfig.put('/settings', data);
    } catch {
      return { success: false, error: 'Failed to update settings' };
    }
  }

  async getUserInfo() {
    try {
      return await apiConfig.get('/settings/user-info');
    } catch {
      return { success: false, error: 'Failed to fetch user info' };
    }
  }

  async updateUserInfo(data) {
    try {
      return await apiConfig.put('/settings/user-info', data);
    } catch {
      return { success: false, error: 'Failed to update user info' };
    }
  }

  async deleteAccount() {
    try {
      return await apiConfig.delete('/settings/account');
    } catch {
      return { success: false, error: 'Failed to delete account' };
    }
  }

  async changePassword(data) {
    try {
      return await apiConfig.post('/settings/change-password', data);
    } catch {
      return { success: false, error: 'Failed to change password' };
    }
  }
}

export default new SettingsService();
