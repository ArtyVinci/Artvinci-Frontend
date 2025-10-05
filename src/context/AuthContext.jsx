import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { STORAGE_KEYS } from '../utils/constants';
import { getStoredUser, getStoredToken } from '../utils/helpers';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const storedUser = getStoredUser();
      const token = getStoredToken();

      if (storedUser && token) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login
  const login = async (credentials) => {
    try {
      setLoading(true);
      const data = await authService.login(credentials);
      
      if (data && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('✅ User authenticated:', data.user);
        return { success: true, data };
      } else {
        console.error('❌ Invalid response from login service');
        return {
          success: false,
          error: 'Invalid server response. Please try again.',
        };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = 
        error.response?.data?.password?.[0] ||
        error.response?.data?.email?.[0] ||
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.detail ||
        error.message ||
        'Login failed. Please check your credentials.';
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (userData) => {
    try {
      setLoading(true);
      const data = await authService.register(userData);
      
      console.log('🔍 Registration response:', data);
      console.log('🔍 Has requires_verification?', data?.requires_verification);
      console.log('🔍 Has user?', !!data?.user);
      console.log('🔍 Has tokens?', !!data?.tokens);
      
      // IMPORTANT: Check for verification requirement FIRST
      if (data && data.requires_verification) {
        console.log('✅ User registered, email verification required');
        // DO NOT set user or authenticate - they need to verify email first
        return { 
          success: true, 
          data,
          requiresVerification: true,
          email: data.email
        };
      }
      
      // Only authenticate if tokens are provided AND no verification is required
      if (data && data.user && data.tokens) {
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('✅ User registered and authenticated:', data.user);
        return { success: true, data };
      }
      
      console.error('❌ Invalid response from register service');
      return {
        success: false,
        error: 'Invalid server response. Please try again.',
      };
    } catch (error) {
      console.error('❌ Registration error:', error);
      // Handle validation errors from Django
      const errorMessage = 
        error.response?.data?.username?.[0] ||
        error.response?.data?.email?.[0] ||
        error.response?.data?.password?.[0] ||
        error.response?.data?.detail ||
        error.message ||
        'Registration failed. Please check your information.';
      return {
        success: false,
        error: errorMessage,
        errors: error.response?.data || {},
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      await authService.logout(refreshToken);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Authenticate user after email verification
  const authenticateVerifiedUser = (userData, tokens) => {
    setUser(userData);
    setIsAuthenticated(true);
    console.log('✅ User authenticated after email verification:', userData);
  };

  // Update user profile
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  };

  // Refresh user profile from server
  const refreshUserProfile = async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
      return { success: true, data: userData };
    } catch (error) {
      console.error('Refresh profile error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to refresh profile',
      };
    }
  };

  // Update profile with new data (including image upload)
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const data = await authService.updateProfile(profileData);
      // Update state and localStorage with new user data
      setUser(data.user);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      console.log('✅ Profile updated, user data refreshed:', data.user);
      return { success: true, data };
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = 
        error.response?.data?.username?.[0] ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to update profile.';
      return {
        success: false,
        error: errorMessage,
        errors: error.response?.data || {},
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    authenticateVerifiedUser,
    refreshUserProfile,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
