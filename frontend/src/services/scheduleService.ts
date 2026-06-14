// Schedule Service — handles all schedule-related API calls

import type { ApiResponse, ScheduleItem } from '../types';
import apiConfig from '../utils/apiConfig';

class ScheduleService {
  async getAllSchedules(): Promise<ApiResponse<{ schedules: ScheduleItem[] }>> {
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

  async getUpcomingSchedules(days = 7): Promise<ApiResponse<{ schedules: ScheduleItem[] }>> {
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

  async createSchedule(data: {
    plantId: string;
    plantName: string;
    task: string;
    dueDate: string;
    time?: string;
    priority?: 'high' | 'medium' | 'low';
  }): Promise<ApiResponse<{ schedule: ScheduleItem }>> {
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

  async updateSchedule(
    id: string,
    data: Partial<{ task: string; dueDate: string; time: string; priority: string; completed: boolean }>
  ): Promise<ApiResponse<{ schedule: ScheduleItem }>> {
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

  async deleteSchedule(id: string): Promise<ApiResponse<null>> {
    try {
      return await apiConfig.delete(`/schedules/${id}`);
    } catch {
      return { success: false, error: 'Failed to delete schedule' };
    }
  }

  async markTaskComplete(id: string): Promise<ApiResponse<{ schedule: ScheduleItem }>> {
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
  async toggleCompletion(id: string, completed: boolean): Promise<ApiResponse<{ schedule: ScheduleItem }>> {
    if (completed) {
      return this.markTaskComplete(id);
    }
    return this.updateSchedule(id, { completed: false });
  }
}

const normalizeSchedule = (raw: any): ScheduleItem => ({
  ...raw,
  id: raw._id || raw.id,
});

export default new ScheduleService();
