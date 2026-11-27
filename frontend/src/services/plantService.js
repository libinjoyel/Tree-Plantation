// Plant Service — handles all plant-related API calls

import apiConfig from '../utils/apiConfig';

// Normalise a raw backend plant (uses _id, lastWatered as string) -> Plant
const normalizePlant = (raw) => ({
  ...raw,
  id: raw._id || raw.id,
  lastWatered: new Date(raw.lastWatered),
});

class PlantService {
  async getAllPlants() {
    try {
      const response = await apiConfig.get('/plants');
      if (response.success && response.data?.plants) {
        response.data.plants = response.data.plants.map(normalizePlant);
      }
      return response;
    } catch {
      return { success: false, error: 'Failed to fetch plants' };
    }
  }

  async getPlantById(id) {
    try {
      const response = await apiConfig.get(`/plants/${id}`);
      if (response.success && response.data?.plant) {
        response.data.plant = normalizePlant(response.data.plant);
      }
      return response;
    } catch {
      return { success: false, error: 'Failed to fetch plant' };
    }
  }

  async createPlant(data) {
    try {
      const response = await apiConfig.post('/plants', data);
      if (response.success && response.data?.plant) {
        response.data.plant = normalizePlant(response.data.plant);
      }
      return response;
    } catch {
      return { success: false, error: 'Failed to create plant' };
    }
  }

  async updatePlant(id, data) {
    try {
      const response = await apiConfig.put(`/plants/${id}`, data);
      if (response.success && response.data?.plant) {
        response.data.plant = normalizePlant(response.data.plant);
      }
      return response;
    } catch {
      return { success: false, error: 'Failed to update plant' };
    }
  }

  async deletePlant(id) {
    try {
      return await apiConfig.delete(`/plants/${id}`);
    } catch {
      return { success: false, error: 'Failed to delete plant' };
    }
  }

  async waterPlant(id) {
    try {
      const response = await apiConfig.post(`/plants/${id}/water`);
      if (response.success && response.data?.plant) {
        response.data.plant = normalizePlant(response.data.plant);
      }
      return response;
    } catch {
      return { success: false, error: 'Failed to water plant' };
    }
  }

  async searchPlants(query) {
    try {
      const response = await apiConfig.get(`/plants/search?q=${encodeURIComponent(query)}`);
      if (response.success && response.data?.plants) {
        response.data.plants = response.data.plants.map(normalizePlant);
      }
      return response;
    } catch {
      return { success: false, error: 'Failed to search plants' };
    }
  }
}

export default new PlantService();
