import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001/api',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const isAdminRoute = config.url.startsWith('/admin') || config.url.startsWith('/products');
    const token = isAdminRoute ? 
      localStorage.getItem('adminToken') : 
      localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't override Content-Type for FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance; 