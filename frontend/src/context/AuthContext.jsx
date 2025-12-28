import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile...');
      const response = await apiClient.get('/auth/me');
      console.log('User profile response:', response);
      if (response.data.success) {
        console.log('User data:', response.data.user);
        setUser(response.data.user);
        return response.data.user;
      } else {
        console.log('No user data in response');
        setUser(null);
        return null;
      }
    } catch (error) {
      // Not authenticated, which is fine
      console.log('Error fetching user profile:', error);
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await fetchUserProfile();
      } catch (error) {
        // Not authenticated, which is fine
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      return { success: false, message: error.response?.data || 'Login failed' };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      return { success: false, message: error.response?.data || 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Logout failed' };
    }
  };

  // Public method to refresh user profile
  const refreshUser = async () => {
    console.log('Refreshing user data...');
    setLoading(true);
    try {
      const userData = await fetchUserProfile();
      console.log('Refreshed user data:', userData);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    setUser,
    login,
    signup,
    logout,
    loading,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};