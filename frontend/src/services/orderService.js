import apiClient from './api';

export const orderService = {
  async createOrder(orderData) {
    const response = await apiClient.post('/api/orders', orderData);
    return response.data;
  },

  async getOrderById(id) {
    const response = await apiClient.get(`/api/orders/${id}`);
    return response.data;
  },

  async getCustomerOrders(customerId) {
    const response = await apiClient.get(`/api/customers/${customerId}/orders`);
    return response.data;
  },

  async updateOrderStatus(id, status) {
    const response = await apiClient.put(`/api/orders/${id}/status`, { status });
    return response.data;
  },

  async cancelOrder(id) {
    const response = await apiClient.put(`/api/orders/${id}/cancel`);
    return response.data;
  },

  async addItemsToOrder(id, orderData) {
    const response = await apiClient.post(`/api/orders/${id}/items`, orderData);
    return response.data;
  },
};
