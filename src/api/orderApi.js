// api/orderApi.js
import apiClient from './axiosConfig';

export const createOrder = async (orderData) => {
  const response = await apiClient.post('/order', orderData);
  return response;
};

export const createPickupOrder = async (pickupData) => {
  const response = await apiClient.post('/pickup', pickupData);
  return response;
};

export const uploadPaymentProof = async (orderId, file) => {
  const formData = new FormData();
  formData.append('bukti_bayar', file);
  formData.append('order_id', orderId);

  const response = await apiClient.post('/upload-payment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response;
};

export const getMyOrders = async () => {
  const response = await apiClient.get('/order/me');
  return response;
};

export const getAllOrders = async (params = {}) => {
  const response = await apiClient.get('/orders', { params });
  return response;
};

export const getMyPickups = async () => {
  const response = await apiClient.get('/pickup/me');
  return response;
};

export const getAllPickups = async () => {
  const response = await apiClient.get('/pickups');
  return response;
};

export const cancelOrder = async (orderId) => {
  const response = await apiClient.put(`/orders/${orderId}/cancel`);
  return response;
};

export const markOrderAsPaid = async (orderId) => {
  const response = await apiClient.put(`/orders/${orderId}/pay`);
  return response;
};

export const checkVoucher = async (voucherCode) => {
  const response = await apiClient.get(`/vouchers/check/${voucherCode}`);
  return response;
};

export const getOrderById = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response;
};