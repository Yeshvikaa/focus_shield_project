import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto Login
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));

          const res = await api.get('/auth/me');

          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Auto login failed:', err);
          logout();
        }
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', {
        email,
        password,
      });

      const { token, ...userData } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);

      return userData;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Login failed. Please check credentials.';

      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Signup
  const signup = async (
    name,
    email,
    password,
    role,
    avatar = ''
  ) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        avatar,
      });

      const { token, ...userData } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);

      return userData;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Signup failed. Please try again.';

      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  // Refresh User
  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');

      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));

      return res.data;
    } catch (err) {
      console.error('Profile sync failed:', err);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;