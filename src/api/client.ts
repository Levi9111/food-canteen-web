import axios from 'axios';
import { APP_CONFIG } from '../constants/canteen.constants';

export const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('baf_rts_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Graceful error extraction
    const message =
      error.response?.data?.message ||
      error.message ||
      'Network connection issue with server.';
    return Promise.reject(new Error(message));
  },
);
