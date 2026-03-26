import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '@/services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('taskflow_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.auth.me();
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
      localStorage.removeItem('taskflow_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (credentials) => {
    const response = await api.auth.login(credentials);
    const { access_token, user } = response.data;
    localStorage.setItem('taskflow_token', access_token);
    setUser(user);
    return response;
  };

  const register = async (userData) => {
    const response = await api.auth.register(userData);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('taskflow_token');
    setUser(null);
    window.location.href = '/login';
  };

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
