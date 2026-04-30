import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('ebs_user');
    return u ? JSON.parse(u) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/api/auth/login', { email, password });
      localStorage.setItem('ebs_token', data.token);
      localStorage.setItem('ebs_user', JSON.stringify(data.user));
      setUser(data.user);
      // Return role so caller can redirect to the right dashboard
      return { success: true, role: data.user.role };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      await API.post('/auth/register', { name, email, password });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ebs_token');
    localStorage.removeItem('ebs_user');
    setUser(null);
  };

  const getDashboardPath = (role) => {
    if (role === 'customer') return '/customer/dashboard';
    return '/dashboard'; // admin, operator, viewer
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getDashboardPath }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
