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
  /**
   * Get all artworks with optional filters
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by category
   * @param {string} params.search - Search in title, description, tags
   * @param {boolean} params.available - Filter by availability
   * @param {string} params.artist - Filter by artist ID
   * @param {number} params.min_price - Minimum price
   * @param {number} params.max_price - Maximum price
   * @param {boolean} params.is_featured - Filter featured artworks
   * @param {string} params.sort - Sort option (newest, oldest, price_low, price_high, popular, views)
   * @param {number} params.page - Page number
   * @param {number} params.page_size - Items per page
   * @returns {Promise} Paginated list of artworks
   */
  getArtworks: async (params = {}) => {
    const response = await api.get('/artworks/', { params });
    return response.data;
  },

  /**
   * Get artwork by slug
   * @param {string} slug - Artwork slug
   * @returns {Promise} Artwork details
   */
  getArtworkBySlug: async (slug) => {
    const response = await api.get(`/artworks/${slug}/`);
    return response.data;
  },

  /**
   * Get artwork by ID (legacy support)
   * @param {string} id - Artwork ID
   * @returns {Promise} Artwork details
   */
  getArtworkById: async (id) => {
    const response = await api.get(`/artworks/${id}/`);
    return response.data;
  },

  /**
   * Create new artwork (artists only)
   * @param {Object} artworkData - Artwork data
   * @returns {Promise} Created artwork
   */
  createArtwork: async (artworkData) => {
    const response = await api.post('/artworks/', artworkData);
    return response.data;
  },

  /**
   * Update artwork (owner only)
   * @param {string} slug - Artwork slug
   * @param {Object} artworkData - Updated artwork data
   * @returns {Promise} Updated artwork
   */
  updateArtwork: async (slug, artworkData) => {
    const response = await api.patch(`/artworks/${slug}/`, artworkData);
    return response.data;
  },

  /**
   * Delete artwork (owner only)
   * @param {string} slug - Artwork slug
   * @returns {Promise} Deletion confirmation
   */
  deleteArtwork: async (slug) => {
    const response = await api.delete(`/artworks/${slug}/`);
    return response.data;
  },

  /**
   * Toggle like/unlike artwork
   * @param {string} slug - Artwork slug
   * @returns {Promise} Like status
   */
  likeArtwork: async (slug) => {
    const response = await api.post(`/artworks/${slug}/like/`);
    return response.data;
  },

  /**
   * Upload image to artwork
   * @param {string} slug - Artwork slug
   * @param {FormData} formData - Image file and metadata
   * @returns {Promise} Upload confirmation
   */
  uploadImage: async (slug, formData) => {
    const response = await api.post(`/artworks/${slug}/upload-image/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Upload multiple images to artwork
   * @param {string} slug - Artwork slug
   * @param {Array<File>} imageFiles - Array of image files
   * @returns {Promise} Upload confirmation
   */
  uploadArtworkImages: async (slug, imageFiles) => {
    const formData = new FormData();
    imageFiles.forEach((file, index) => {
      formData.append('images', file);
    });
    
    const response = await api.post(`/artworks/${slug}/upload-image/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get user's own artworks
   * @returns {Promise} List of user's artworks
   */
  getMyArtworks: async () => {
    const response = await api.get('/artworks/my/');
    return response.data;
  },

  /**
   * Purchase artwork
   * @param {Object} purchaseData - { artwork_id, payment_method, transaction_id }
   * @returns {Promise} Purchase confirmation
   */
  purchaseArtwork: async (purchaseData) => {
    const response = await api.post('/artworks/purchase/', purchaseData);
    return response.data;
  },

  /**
   * Get user's purchases
   * @returns {Promise} List of purchases
   */
  getMyPurchases: async () => {
    const response = await api.get('/artworks/purchases/my/');
    return response.data;
  },

  /**
   * Get artist's sales (artists only)
   * @returns {Promise} List of sales
   */
  getMySales: async () => {
    const response = await api.get('/artworks/sales/my/');
    return response.data;
  },

  // ============================================================================
  // AI FEATURES
  // ============================================================================

  /**
   * Analyze artwork image using AI to detect style, colors, mood, tags
   * @param {Object} data - { image_url: string, artwork_id?: string }
   * @returns {Promise} AI analysis results with style, colors, tags, etc.
   */
  analyzeArtwork: async (data) => {
    const response = await api.post('/artworks/ai/analyze/', data);
    return response.data;
  },

  /**
   * Get AI-generated tag suggestions based on title and description
   * @param {Object} data - { title: string, description?: string }
   * @returns {Promise} Array of suggested tags
   */
  suggestTags: async (data) => {
    const response = await api.post('/artworks/ai/suggest-tags/', data);
    return response.data;
  },

  /**
   * Enhance or generate artwork description using AI
   * @param {Object} data - { title: string, description?: string }
   * @returns {Promise} Enhanced description
   */
  enhanceDescription: async (data) => {
    const response = await api.post('/artworks/ai/enhance-description/', data);
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

// Event Services
export const eventService = {
  /**
   * Get all published events with optional filters
   * @param {Object} params - Query parameters (category, search, is_online, is_free, is_featured, time, sort)
   * @returns {Promise} List of events
   */
  getEvents: async (params = {}) => {
    try {
      const response = await api.get('/events/', { params });
      return response.data;
    } catch (error) {
      console.error('Get events failed:', error);
      throw error;
    }
  },

  /**
   * Get event details by slug
   * @param {string} slug - Event slug
   * @returns {Promise} Event details
   */
  getEventBySlug: async (slug) => {
    try {
      const response = await api.get(`/events/${slug}/`);
      return response.data;
    } catch (error) {
      console.error('Get event failed:', error);
      throw error;
    }
  },

  /**
   * Create new event (artists only)
   * @param {Object} eventData - Event data
   * @returns {Promise} Created event
   */
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events/', eventData);
      return response.data;
    } catch (error) {
      console.error('Create event failed:', error);
      throw error;
    }
  },

  /**
   * Update event (artist owner only)
   * @param {string} slug - Event slug
   * @param {Object} eventData - Updated event data
   * @returns {Promise} Updated event
   */
  updateEvent: async (slug, eventData) => {
    try {
      const response = await api.patch(`/events/${slug}/`, eventData);
      return response.data;
    } catch (error) {
      console.error('Update event failed:', error);
      throw error;
    }
  },

  /**
   * Delete event (artist owner only)
   * @param {string} slug - Event slug
   * @returns {Promise}
   */
  deleteEvent: async (slug) => {
    try {
      const response = await api.delete(`/events/${slug}/`);
      return response.data;
    } catch (error) {
      console.error('Delete event failed:', error);
      throw error;
    }
  },

  /**
   * Upload images to event
   * @param {string} slug - Event slug
   * @param {FormData} formData - FormData with images
   * @returns {Promise} Upload result
   */
  uploadEventImages: async (slug, formData) => {
    try {
      const response = await api.post(`/events/${slug}/upload-images/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload event images failed:', error);
      throw error;
    }
  },

  /**
   * Get events created by the authenticated user
   * @param {Object} params - Query parameters (status)
   * @returns {Promise} List of user's events
   */
  getMyEvents: async (params = {}) => {
    try {
      const response = await api.get('/events/my-events/', { params });
      return response.data;
    } catch (error) {
      console.error('Get my events failed:', error);
      throw error;
    }
  },

  /**
   * Subscribe to an event
   * @param {string} slug - Event slug
   * @param {Object} subscriptionData - Subscription data (attendee_notes, special_requirements)
   * @returns {Promise} Subscription details
   */
  subscribeToEvent: async (slug, subscriptionData = {}) => {
    try {
      const response = await api.post(`/events/${slug}/subscribe/`, subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Subscribe to event failed:', error);
      throw error;
    }
  },

  /**
   * Unsubscribe from an event
   * @param {string} slug - Event slug
   * @returns {Promise}
   */
  unsubscribeFromEvent: async (slug) => {
    try {
      const response = await api.delete(`/events/${slug}/unsubscribe/`);
      return response.data;
    } catch (error) {
      console.error('Unsubscribe from event failed:', error);
      throw error;
    }
  },

  /**
   * Get user's event subscriptions
   * @param {Object} params - Query parameters (status)
   * @returns {Promise} List of subscriptions
   */
  getMySubscriptions: async (params = {}) => {
    try {
      const response = await api.get('/events/subscriptions/my-subscriptions/', { params });
      return response.data;
    } catch (error) {
      console.error('Get my subscriptions failed:', error);
      throw error;
    }
  },

  /**
   * Get attendees for an event (artist owner only)
   * @param {string} slug - Event slug
   * @param {Object} params - Query parameters (status)
   * @returns {Promise} List of attendees
   */
  getEventAttendees: async (slug, params = {}) => {
    try {
      const response = await api.get(`/events/${slug}/attendees/`, { params });
      return response.data;
    } catch (error) {
      console.error('Get event attendees failed:', error);
      throw error;
    }
  },

  /**
   * Generate AI event description using Gemini
   * @param {Object} data - { title, category, location, additional_info }
   * @returns {Promise} Generated description
   */
  generateEventDescription: async (data) => {
    try {
      const response = await api.post('/events/ai/generate-description/', data);
      return response.data;
    } catch (error) {
      console.error('Generate description failed:', error);
      throw error;
    }
  },

  /**
   * Send message to AI chatbot
   * @param {Object} data - { message, context }
   * @returns {Promise} Chatbot response with text and events
   */
  sendChatbotMessage: async (data) => {
    try {
      const response = await api.post('/events/ai/chatbot/', data);
      return response.data;
    } catch (error) {
      console.error('Chatbot message failed:', error);
      throw error;
    }
  },
};

// Forum Services
export const forumService = {
  getCategories: async () => {
    try {
      const resp = await api.get('/forum/categories/');
      return resp.data;
    } catch (err) {
      console.error('Get forum categories failed:', err);
      throw err;
    }
  },

  createCategory: async (payload) => {
    try {
      const resp = await api.post('/forum/categories/', payload);
      return resp.data;
    } catch (err) {
      console.error('Create category failed:', err);
      throw err;
    }
  },

  getTopics: async (params = {}) => {
    try {
      const resp = await api.get('/forum/topics/', { params });
      return resp.data;
    } catch (err) {
      console.error('Get topics failed:', err);
      throw err;
    }
  },

  createTopic: async (payload) => {
    try {
      const resp = await api.post('/forum/topics/', payload);
      return resp.data;
    } catch (err) {
      console.error('Create topic failed:', err);
      throw err;
    }
  },

  getTopic: async (id) => {
    try {
      const resp = await api.get(`/forum/topics/${id}/`);
      return resp.data;
    } catch (err) {
      console.error('Get topic failed:', err);
      throw err;
    }
  },

  createReply: async (topicId, payload) => {
    try {
      const resp = await api.post(`/forum/topics/${topicId}/replies/`, payload);
      return resp.data;
    } catch (err) {
      console.error('Create reply failed:', err);
      throw err;
    }
  },

  deleteReply: async (replyId) => {
    try {
      const resp = await api.delete(`/forum/replies/${replyId}/`);
      return resp.data;
    } catch (err) {
      console.error('Delete reply failed:', err);
      throw err;
    }
  },
  // Helpful voting
  helpfulTopic: async (topicId) => {
    try {
      const resp = await api.post(`/forum/topics/${topicId}/helpful/`);
      return resp.data;
    } catch (err) {
      console.error('Helpful topic failed:', err);
      throw err;
    }
  },

  helpfulReply: async (replyId) => {
    try {
      const resp = await api.post(`/forum/replies/${replyId}/helpful/`);
      return resp.data;
    } catch (err) {
      console.error('Helpful reply failed:', err);
      throw err;
    }
  },
};

export default api;
