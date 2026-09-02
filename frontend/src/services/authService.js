import api from './api';

export const authService = {
  /**
   * Customer Login with Phone Number or Email and Password.
   * @param {Object} data { identifier, phoneNumber, password }
   */
  login: async ({ identifier, phoneNumber, password }) => {
    try {
      const response = await api.post('/api/auth/login', {
        identifier: identifier || phoneNumber,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Invalid email/mobile number or password.');
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
   * Request 6-digit OTP for Forgot Password flow.
   * @param {string} email
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Could not send verification code.');
    }
  },

  /**
   * Verify the 6-digit OTP sent to the user's email.
   * @param {string} email
   * @param {string} otp
   */
  verifyResetOtp: async (email, otp) => {
    try {
      const response = await api.post('/api/auth/verify-reset-otp', { email, otp });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Invalid or expired verification code.');
    }
  },

  /**
   * Resend OTP verification code with 60-second cooldown.
   * @param {string} email
   */
  resendResetOtp: async (email) => {
    try {
      const response = await api.post('/api/auth/resend-reset-otp', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Could not resend verification code.');
    }
  },

  /**
   * Finalize password reset after successful OTP verification.
   * @param {string} email
   * @param {string} newPassword
   */
  resetPassword: async (email, newPassword) => {
    try {
      const response = await api.post('/api/auth/reset-password', { email, newPassword });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Could not reset password.');
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
