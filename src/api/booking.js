import apiClient from '../api/axiosConfig';

const bookingAPI = {
  // Get all bookings (admin) (tetap sama)
  getAll: (params = {}) => {
    return apiClient.get('/bookings/get', { params });
  },

  // Get user's bookings (tetap sama)
  getMyBookings: () => {
    return apiClient.get('/bookings/my-bookings');
  },

  // Create booking (tetap sama)
  create: (data) => {
    return apiClient.post('/bookings', data);
  },

  // Get available tables - MODIFIKASI
  getAvailableTables: (params) => {
    // Hanya kirim parameter yang ada dan tidak null/undefined
    const filteredParams = {};
    if (params.tanggal) filteredParams.tanggal = params.tanggal;
    if (params.waktu_selesai) filteredParams.waktu_selesai = params.waktu_selesai;
    if (params.jumlah_orang) filteredParams.jumlah_orang = params.jumlah_orang; // Opsional
    
    return apiClient.get('/bookings/available-tables', { params: filteredParams });
  },

  // Get booking detail (tetap sama)
  getById: (id) => {
    return apiClient.get(`/bookings/${id}`);
  },

  // Update booking status (admin) (tetap sama)
  updateStatus: (id, status) => {
    return apiClient.put(`/bookings/${id}/status`, { status });
  },

  // Cancel booking (user) (tetap sama)
  cancel: (id) => {
    return apiClient.put(`/bookings/${id}/cancel`);
  },

  // Get statistics (tetap sama)
  getStatistics: () => {
    return apiClient.get('/bookings/statistics');
  },
};

export default bookingAPI;