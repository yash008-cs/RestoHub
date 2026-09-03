import api from './api';

export const authService = {
  /**
   * Customer Login with Phone Number or Email and Password.
   * @param {Object} data { identifier, phoneNumber, password }
   */
  login: async ({ identifier, phoneNumber, password }) => {
    try {
      const rawId = (identifier || phoneNumber || '').trim();
      let targetId = rawId;

      // If user typed an email, resolve from stored map if present
      if (rawId.includes('@')) {
        try {
          const emailMap = JSON.parse(localStorage.getItem('restohub_email_to_phone') || '{}');
          const mappedPhone = emailMap[rawId.toLowerCase()];
          if (mappedPhone) {
            targetId = mappedPhone;
          }
        } catch (e) {
          // fallback
        }
      }

      const response = await api.post('/api/auth/login', {
        identifier: targetId,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Invalid email/mobile number or password.');
    }
  },

  /**
   * Customer Registration with Name, Email, Phone Number, and Password.
   * @param {Object} data { name, email, phoneNumber, password }
   */
  register: async ({ name, email, phoneNumber, password }) => {
    try {
      const response = await api.post('/api/auth/register', { name, email, phoneNumber, password });
      if (email && phoneNumber) {
        try {
          const emailMap = JSON.parse(localStorage.getItem('restohub_email_to_phone') || '{}');
          emailMap[email.toLowerCase().trim()] = phoneNumber.trim();
          localStorage.setItem('restohub_email_to_phone', JSON.stringify(emailMap));
        } catch (e) {}
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Unable to create account. Please try again.');
    }
  },

  /**
   * Resolves an email or phone number to the corresponding registered customer email.
   */
  resolveCustomerIdentifier: async (input) => {
    if (!input) return input;
    const clean = String(input).trim();

    // If input is an email, return directly
    if (clean.includes('@')) {
      return clean.toLowerCase();
    }

    // If 10-digit mobile number, find the registered email
    const digits = clean.replace(/[^0-9]/g, '');
    if (digits.length === 10) {
      try {
        const res = await api.get('/api/customers');
        const list = res.data || [];
        const match = list.find((c) => c.phone === digits || c.phoneNumber === digits);
        if (match && match.email) {
          return match.email.toLowerCase();
        }
      } catch (e) {}

      // Check local storage mapping
      try {
        const emailMap = JSON.parse(localStorage.getItem('restohub_email_to_phone') || '{}');
        for (const [em, ph] of Object.entries(emailMap)) {
          if (ph === digits) return em.toLowerCase();
        }
      } catch (e) {}
    }

    return clean;
  },

  /**
   * Request real SMTP 6-digit OTP email from Spring Boot backend.
   * @param {string} email
   */
  forgotPassword: async (email) => {
    try {
      const targetEmail = await authService.resolveCustomerIdentifier(email);
      const response = await api.post('/api/auth/forgot-password', { email: targetEmail });
      return {
        ...response.data,
        targetEmail,
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'No account found with this email address.');
    }
  },

  /**
   * Verify the 6-digit OTP code against the backend database.
   * @param {string} email
   * @param {string} otp
   */
  verifyResetOtp: async (email, otp) => {
    try {
      const targetEmail = await authService.resolveCustomerIdentifier(email);
      const cleanOtp = String(otp || '').trim();
      const response = await api.post('/api/auth/verify-reset-otp', {
        email: targetEmail,
        otp: cleanOtp,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Invalid or expired verification code.');
    }
  },

  /**
   * Resend SMTP OTP verification code with 60-second cooldown.
   * @param {string} email
   */
  resendResetOtp: async (email) => {
    try {
      const targetEmail = await authService.resolveCustomerIdentifier(email);
      const response = await api.post('/api/auth/resend-reset-otp', { email: targetEmail });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Could not resend verification code.');
    }
  },

  /**
   * Finalize password reset after successful SMTP OTP verification.
   * @param {string} email
   * @param {string} newPassword
   */
  resetPassword: async (email, newPassword) => {
    try {
      const targetEmail = await authService.resolveCustomerIdentifier(email);
      const response = await api.post('/api/auth/reset-password', {
        email: targetEmail,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Could not reset password. Please try again.');
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
