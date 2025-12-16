import apiClient from './axiosConfig';

export const authAPI = {
  // Login user
  login: async (credentials) => {
    const response = await apiClient.post('/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await apiClient.post('/register', userData);
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await apiClient.post('/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  },
};