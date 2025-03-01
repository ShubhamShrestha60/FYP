import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add axios interceptor to handle token
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('adminToken');
          setUser(null);
          setAdminUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Check if it's an admin route
        const isAdminRoute = config.url?.includes('/admin') || false;
        const token = isAdminRoute 
          ? localStorage.getItem('adminToken')
          : localStorage.getItem('token');
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        const adminResponse = await axios.get(`${API_BASE_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        if (adminResponse.data.user.role === 'admin') {
          setAdminUser(adminResponse.data.user);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('adminToken');
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password, isAdminLogin = false) => {
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { user, token } = response.data;
        
        if (isAdminLogin) {
          if (user.role !== 'admin') {
            throw new Error('Unauthorized access');
          }
          localStorage.removeItem('token');
          localStorage.setItem('adminToken', token);
          setUser(null);
          setAdminUser(user);
        } else {
          localStorage.removeItem('adminToken');
          localStorage.setItem('token', token);
          setAdminUser(null);
          setUser(user);
        }
        return response.data;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = (isAdmin = false) => {
    if (isAdmin) {
      localStorage.removeItem('adminToken');
      setAdminUser(null);
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      adminUser, 
      loading, 
      login, 
      logout, 
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 