// api/dashboardApi.js
import apiClient from './axiosConfig';

const dashboardAPI = {
  // Get dashboard summary
  getDashboardSummary: () => {
    return apiClient.get('/dashboard/summary');
  },

  // Get order history with filters
  getOrderHistory: (params = {}) => {
    return apiClient.get('/dashboard/orders/history', { params });
  },

  // Get pickup history
  getPickupHistory: (params = {}) => {
    return apiClient.get('/dashboard/pickups/history', { params });
  },

  // Get voucher history
  getVoucherHistory: (params = {}) => {
    return apiClient.get('/dashboard/vouchers/history', { params });
  },
};

export default dashboardAPI;