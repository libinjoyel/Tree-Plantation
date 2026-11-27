// Schedule Service — handles all schedule-related API calls

import apiConfig from '../utils/apiConfig';

const normalizeSchedule = (raw) => ({
  ...raw,
  id: raw._id || raw.id,
});

class ScheduleService {
  async getAllSchedules() {
    try {
      const response = await apiConfig.get('/schedules');
      if (response.success && response.data?.schedules) {
        response.data.schedules = response.data.schedules.map(normalizeSchedule);
      }
      return response;
    } catch {
      return { success: false, error: 'Failed to fetch schedules' };
    }
  }

  async getUpcomingSchedules(days = 7) {
    try {
      const response = await apiConfig.get(`/schedules/upcoming?days=${days}`);
      if (response.success && response.data?.schedules) {
        response.data.schedules = response.data.schedules.map(normalizeSchedule);
      }
      return response;
    } catch {
      return { success: false, error: 'Failed to fetch upcoming schedules' };
    }
  }

  async createSchedule(data) {
    try {
      const response = await apiConfig.post('/schedules', data);
      if (response.success && response.data?.schedule) {
        response.data.schedule = normalizeSchedule(response.data.schedule);
      }
      return response;
    } catch {
      return { success: false, error: 'Failed to create schedule' };
    }
  }

  async updateSchedule(id, data) {
    try {
      const response = await apiConfig.put(`/schedules/${id}`, data);
      if (response.success && response.data?.schedule) {
        response.data.schedule = normalizeSchedule(response.data.schedule);
      }
      return response;
    } catch {
      return { success: false, error: 'Failed to update schedule' };
    }
  }

  async deleteSchedule(id) {
    try {
      return await apiConfig.delete(`/schedules/${id}`);
    } catch {
      return { success: false, error: 'Failed to delete schedule' };
    }
  }

  async markTaskComplete(id) {
    try {
      const response = await apiConfig.post(`/schedules/${id}/complete`);
      if (response.success && response.data?.schedule) {
        response.data.schedule = normalizeSchedule(response.data.schedule);
      }
      return response;
    } catch {
      return { success: false, error: 'Failed to mark task as complete' };
    }
  }

  // Toggle completion — uses markTaskComplete for true, updateSchedule for false
  async toggleCompletion(id, completed) {
    if (completed) {
      return this.markTaskComplete(id);
    }
    return this.updateSchedule(id, { completed: false });
  }
}

export default new ScheduleService();
