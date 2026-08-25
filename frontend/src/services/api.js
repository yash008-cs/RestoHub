import axios from 'axios';

// Use environment variable VITE_API_BASE_URL, fallback to deployed AWS backend base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://43.204.130.230:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response Interceptor for user-friendly error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      const data = error.response.data;
      if (data && typeof data === 'object' && data.message) {
        message = data.message;
      } else if (typeof data === 'string' && data.trim()) {
        message = data;
      } else if (error.response.status === 401) {
        message = 'Invalid email or password. Please check your credentials.';
      } else if (error.response.status === 404) {
        message = 'Requested resource was not found.';
      } else if (error.response.status === 400) {
        message = 'Invalid email or password. Please check your credentials.';
      } else if (error.response.status === 409) {
        message = 'Account with this email or phone number already exists.';
      } else if (error.response.status === 500) {
        message = 'Internal server error. Please try again later.';
      }
    } else if (error.request) {
      message = 'Unable to connect to RestoHub backend server. Please verify backend is running on http://43.204.130.230:8080.';
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
