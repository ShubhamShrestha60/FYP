import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001/api',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance; 