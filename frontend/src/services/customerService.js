import apiClient from './api';

export const customerService = {
  async getAllCustomers() {
    const response = await apiClient.get('/api/customers');
    return response.data;
  },

  async getCustomerById(id) {
    const response = await apiClient.get(`/api/customers/${id}`);
    return response.data;
  },

  async registerCustomer(customerData) {
    const response = await apiClient.post('/api/customers', customerData);
    return response.data;
  },

  async login({ emailOrPhone, password }) {
    const response = await apiClient.post('/api/customers/login', {
      emailOrPhone,
      password,
    });
    return response.data;
  },

  async updateCustomer(id, customerData) {
    const response = await apiClient.put(`/api/customers/${id}`, customerData);
    return response.data;
  },

  async deleteCustomer(id) {
    await apiClient.delete(`/api/customers/${id}`);
  },

  async resetPassword({ emailOrPhone, newPassword }) {
    const response = await apiClient.post('/api/customers/reset-password', {
      emailOrPhone,
      newPassword,
    });
    return response.data;
  },
};
