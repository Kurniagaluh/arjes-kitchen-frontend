import apiClient from './axiosConfig';

export const mejaAPI = {
  // Get semua meja
  getAll: async () => {
    const response = await apiClient.get('/meja');
    return response.data;
  },

  getAvailable: async () => {
    
    const response = await apiClient.get('/meja/available');
    console.log(response.data);
    return response.data;
  },

  // Get tipe meja
  getTipe: async () => {
    const response = await apiClient.get('/meja-tipe');
    return response.data;
  },

  // Create meja baru
  create: async (data) => {
    const response = await apiClient.post('/meja', data);
    return response.data;
  },

  // Update meja
  update: async (id, data) => {
    const response = await apiClient.put(`/meja/${id}`, data);
    return response.data;
  },

  // Delete meja
  delete: async (id) => {
    const response = await apiClient.delete(`/meja/${id}`);
    return response.data;
  },

  // Create tipe meja
  createTipe: async (data) => {
    const response = await apiClient.post('/meja-tipe', data);
    return response.data;
  },
};