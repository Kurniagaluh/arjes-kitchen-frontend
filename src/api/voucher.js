import apiClient from '../api/axiosConfig';

const voucherAPI = {
  // Get semua voucher dengan filter
  getAll: (params = {}) => {
    return apiClient.get('/vouchers', { params });
  },

  // Get detail voucher
  getById: (id) => {
    return apiClient.get(`/vouchers/${id}`);
  },

  // Create voucher baru
  create: (data) => {
    return apiClient.post('/vouchers', data);
  },

  // Update voucher
  update: (id, data) => {
    return apiClient.put(`/vouchers/${id}`, data);
  },

  // Delete voucher
  delete: (id) => {
    return apiClient.delete(`/vouchers/${id}`);
  },

  // Get statistics voucher
  getStatistics: () => {
    return apiClient.get('/vouchers/statistics');
  },

  // Generate kode voucher
  generateCode: () => {
    return apiClient.get('/vouchers/generate-code');
  },

  // Check voucher validitas
  checkVoucher: (kode, totalOrder = 0) => {
    return apiClient.get(`/vouchers/check/${kode}`, {
      params: { total_order: totalOrder }
    });
  },

  // Search users untuk voucher terbatas
  searchUsers: (query, limit = 10) => {
    return apiClient.get('/users/search', {
      params: { q: query, limit }
    });
  },
};

export default voucherAPI;