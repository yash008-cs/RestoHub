import axios from 'axios';

// Dynamically determine API Base URL:
// 1. Explicit VITE_API_BASE_URL environment variable if provided
// 2. Otherwise fallback to deployed AWS backend http://13.204.64.220:8080
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8080';
  }
  return 'http://13.204.64.220:8080';
};

const API_BASE_URL = getApiBaseUrl();

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
        message = data?.message || 'Requested account or resource was not found.';
      } else if (error.response.status === 400) {
        message = data?.message || 'Invalid request. Please check your input.';
      } else if (error.response.status === 409) {
        message = 'Account with this email or phone number already exists.';
      } else if (error.response.status === 500) {
        message = data?.message || 'Internal server error. Please try again later.';
      }
    } else if (error.request) {
      message = `Unable to connect to RestoHub backend server at ${API_BASE_URL}. Please verify the backend is running.`;
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
