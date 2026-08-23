import api from './api';

export const authService = {
  /**
   * Customer Login with Phone Number and Password.
   * @param {Object} data { phoneNumber, password }
   */
  login: async ({ phoneNumber, password }) => {
    try {
      const response = await api.post('/api/auth/login', { phoneNumber, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Invalid mobile number or password.');
    }
  },

  /**
   * Customer Registration with Name, Phone Number, and Password.
   * @param {Object} data { name, phoneNumber, password }
   */
  register: async ({ name, phoneNumber, password }) => {
    try {
      const response = await api.post('/api/auth/register', { name, phoneNumber, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Unable to create account. Please try again.');
    }
  },

  /**
   * Customer Logout API.
   */
  logout: async () => {
    try {
      const response = await api.post('/api/auth/logout');
      return response.data;
    } catch (error) {
      return { success: true };
    }
  },
};
