import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    // If it's a network error, show a more user-friendly message
    if (!error.response) {
      console.error('Network error - backend might be unreachable');
    }
    return Promise.reject(error);
  }
);

export default apiClient;