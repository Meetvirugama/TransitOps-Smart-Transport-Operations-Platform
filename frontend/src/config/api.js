import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('transitops_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401s (e.g. token expiration)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Only redirect if it's a 401 and not a login request
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('transitops_token');
      sessionStorage.removeItem('transitops_session');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
