import apiClient from './axiosConfig';

export const menuAPI = {
  // Get semua menu
  getAll: async () => {
    const response = await apiClient.get('/menu');
    return response.data;
  },

  // Get menu by ID
  getById: async (id) => {
    const response = await apiClient.get(`/menu/${id}`);
    return response.data;
  },

  // Create menu baru
  create: async (data) => {
    const response = await apiClient.post('/menu', data);
    return response.data;
  },

  // Update menu
  update: async (id, data) => {
    const response = await apiClient.put(`/menu/${id}`, data);
    return response.data;
  },

  // Delete menu
  delete: async (id) => {
    const response = await apiClient.delete(`/menu/${id}`);
    return response.data;
  },

  // ============ UPLOAD GAMBAR ============
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('gambar', file);
    
    const response = await apiClient.post('/menu/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ============ DELETE GAMBAR ============
  deleteImage: async (id) => {
    const response = await apiClient.delete(`/menu/${id}/image`);
    return response.data;
  }
};