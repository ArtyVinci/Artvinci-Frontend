import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        console.log('🔄 Token expired, attempting refresh...');
        console.log('🔑 Refresh token exists:', !!refreshToken);
        console.log('📍 Calling:', `${API_BASE_URL}/auth/token/refresh/`);
        
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        console.log('✅ Token refreshed successfully');
        localStorage.setItem(STORAGE_KEYS.TOKEN, access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, logout user
        console.error('🔴 Token refresh failed:', refreshError);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        // Don't remove pendingVerificationEmail - it's needed for OTP flow
        
        // Only redirect to login if we're not on auth pages
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
          console.log('🔄 Redirecting to login due to expired session');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  /**
   * Login user with email and password
   * @param {Object} credentials - { email, password }
   * @returns {Promise} Response with tokens and user data
   */
  login: async (credentials) => {
    try {
      console.log('📤 Sending login request to backend');
      const response = await api.post('/auth/login/', credentials);
      
      // Backend returns tokens at root level: { access, refresh, user, message }
      if (response.data.access && response.data.refresh && response.data.user) {
        // Store tokens and user data
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.access);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
        console.log('✅ Login successful, tokens stored');
        console.log('🔑 Access token:', response.data.access.substring(0, 20) + '...');
        console.log('🔑 Refresh token:', response.data.refresh.substring(0, 20) + '...');
      } else {
        console.error('❌ Invalid login response structure:', response.data);
      }
      
      // Return with tokens in nested structure for compatibility with AuthContext
      return {
        user: response.data.user,
        tokens: {
          access: response.data.access,
          refresh: response.data.refresh
        },
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Register new user
   * @param {Object|FormData} userData - User registration data (can be FormData for image upload)
   * @returns {Promise} Response with tokens and user data
   */
  register: async (userData) => {
    try {
      // Determine if we need to use FormData headers
      const isFormData = userData instanceof FormData;
      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {};

      console.log('📤 Sending registration data to backend:', userData);
      const response = await api.post('/auth/register/', userData, config);
      
      // NO LONGER AUTO-STORING TOKENS - user must verify email first
      console.log('✅ Registration successful, verification required');
      
      return response.data;
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Send OTP code to email
   * @param {string} email - User's email address
   * @returns {Promise} Response with success message
   */
  sendOTP: async (email) => {
    try {
      console.log('📤 Sending OTP to:', email);
      const response = await api.post('/auth/send-otp/', { email });
      console.log('✅ OTP sent successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to send OTP:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Verify OTP code and activate account
   * @param {Object} data - { email, code }
   * @returns {Promise} Response with tokens and user data
   */
  verifyOTP: async (data) => {
    try {
      console.log('📤 Verifying OTP for:', data.email);
      const response = await api.post('/auth/verify-otp/', data);
      
      // Backend returns tokens at root level: { access, refresh, user, message }
      if (response.data.access && response.data.refresh && response.data.user) {
        // Store tokens and user data after successful verification
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.access);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
        console.log('✅ OTP verified, account activated, tokens stored');
        console.log('🔑 Access token:', response.data.access.substring(0, 20) + '...');
        console.log('🔑 Refresh token:', response.data.refresh.substring(0, 20) + '...');
      } else {
        console.error('❌ Invalid OTP verification response structure:', response.data);
      }
      
      // Return with tokens in nested structure for compatibility
      return {
        user: response.data.user,
        tokens: {
          access: response.data.access,
          refresh: response.data.refresh
        },
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OTP verification failed:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Logout user and optionally blacklist refresh token
   * @param {string} refreshToken - Optional refresh token to blacklist
   * @returns {Promise}
   */
  logout: async (refreshToken = null) => {
    try {
      // Try to blacklist the refresh token on the backend
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.warn('Logout API call failed:', error.message);
    } finally {
      // Always clear local storage
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  /**
   * Get current user profile
   * @returns {Promise} User profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me/');
      
      // Update stored user data
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      console.error('Get profile failed:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {Object|FormData} profileData - Profile data to update (use FormData for image upload)
   * @returns {Promise} Updated user data
   */
  updateProfile: async (profileData) => {
    try {
      // Determine if we need to use FormData headers
      const isFormData = profileData instanceof FormData;
      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : {};

      const response = await api.patch('/auth/me/', profileData, config);
      
      // Update stored user data
      if (response.data.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  },

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken
   * @returns {Promise} New access token
   */
  refreshToken: async (refreshToken) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
        refresh: refreshToken,
      });
      
      if (response.data.access) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.access);
      }
      
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  },

  /**
   * Get stored user from localStorage
   * @returns {Object|null} User object or null
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  // Placeholder functions for future steps
  /**
   * Request password reset email
   * @param {string} email - User's email address
   * @returns {Promise} Response message
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password/', { email });
      console.log('✅ Password reset email sent');
      return response.data;
    } catch (error) {
      console.error('❌ Forgot password failed:', error);
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token from email
   * @param {string} password - New password
   * @returns {Promise} Response message
   */
  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password/', { token, password });
      console.log('✅ Password reset successful');
      return response.data;
    } catch (error) {
      console.error('❌ Reset password failed:', error);
      throw error;
    }
  },
};

// User Services (Legacy - redirect to authService)
export const userService = {
  getProfile: async () => {
    return await authService.getProfile();
  },

  updateProfile: async (data) => {
    const response = await api.patch('/users/profile/update/', data);
    return response.data;
  },
};

// Artwork Services
export const artworkService = {
  getArtworks: async (params = {}) => {
    const response = await api.get('/artworks/', { params });
    return response.data;
  },

  getArtworkById: async (id) => {
    const response = await api.get(`/artworks/${id}/`);
    return response.data;
  },

  createArtwork: async (formData) => {
    const response = await api.post('/artworks/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateArtwork: async (id, formData) => {
    const response = await api.patch(`/artworks/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteArtwork: async (id) => {
    await api.delete(`/artworks/${id}/`);
  },

  likeArtwork: async (id) => {
    const response = await api.post(`/artworks/${id}/like/`);
    return response.data;
  },

  addComment: async (id, comment) => {
    const response = await api.post(`/artworks/${id}/comments/`, { comment });
    return response.data;
  },

  getComments: async (id) => {
    const response = await api.get(`/artworks/${id}/comments/`);
    return response.data;
  },
};

// Artist Services
export const artistService = {
  getArtists: async (params = {}) => {
    const response = await api.get('/artists/', { params });
    return response.data;
  },

  getArtistById: async (id) => {
    const response = await api.get(`/artists/${id}/`);
    return response.data;
  },

  followArtist: async (id) => {
    const response = await api.post(`/artists/${id}/follow/`);
    return response.data;
  },

  getArtistArtworks: async (id, params = {}) => {
    const response = await api.get(`/artists/${id}/artworks/`, { params });
    return response.data;
  },
};

// Dashboard Services
export const dashboardService = {
  getMyArtworks: async () => {
    const response = await api.get('/dashboard/artworks/');
    return response.data;
  },

  getFavorites: async () => {
    const response = await api.get('/dashboard/favorites/');
    return response.data;
  },

  getPurchases: async () => {
    const response = await api.get('/dashboard/purchases/');
    return response.data;
  },
};

export default api;
