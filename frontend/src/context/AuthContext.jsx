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
        const userToken = localStorage.getItem('token');
        const adminToken = localStorage.getItem('adminToken');

        // For admin routes and admin prescription view
        if (config.url?.includes('/admin') || 
            (config.url?.includes('/prescriptions/admin'))) {
          if (adminToken) {
            config.headers.Authorization = `Bearer ${adminToken}`;
          }
        }
        // For user prescription routes
        else if (config.url?.includes('/prescriptions')) {
          if (userToken) {
            config.headers.Authorization = `Bearer ${userToken}`;
          }
        }
        // For all other routes
        else {
          const token = adminToken || userToken;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
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
      // Check admin token
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        const adminResponse = await axios.get(`${API_BASE_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        if (adminResponse.data.user.role === 'admin') {
          setAdminUser(adminResponse.data.user);
          setUser(null); // Ensure user is null when admin is logged in
        }
      }

      // Check user token
      const userToken = localStorage.getItem('token');
      if (userToken) {
        const userResponse = await axios.get(`${API_BASE_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        if (userResponse.data.user.role !== 'admin') {
          setUser(userResponse.data.user);
          setAdminUser(null); // Ensure admin is null when user is logged in
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear tokens and state on error
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      setAdminUser(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password, isAdminLogin = false) => {
    try {
      const endpoint = isAdminLogin ? 
        `${API_BASE_URL}/auth/admin/login` : 
        `${API_BASE_URL}/auth/login`;
        
      const response = await axios.post(endpoint, {
        email,
        password
      });

      if (response.data.success) {
        const { user, token } = response.data;
        
        // Clear all existing tokens first
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        setUser(null);
        setAdminUser(null);
        
        if (isAdminLogin) {
          localStorage.setItem('adminToken', token);
          setAdminUser(user);
        } else {
          localStorage.setItem('token', token);
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