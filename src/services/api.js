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
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem(STORAGE_KEYS.TOKEN, access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, logout user
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Mock Users for Testing (when backend is not available)
const MOCK_USERS = [
  {
    email: 'artist@artvinci.com',
    password: 'Artist123!',
    user: {
      id: 1,
      name: 'Sarah Chen',
      email: 'artist@artvinci.com',
      role: 'artist',
      avatar: null,
    }
  },
  {
    email: 'buyer@artvinci.com',
    password: 'Buyer123!',
    user: {
      id: 2,
      name: 'John Doe',
      email: 'buyer@artvinci.com',
      role: 'buyer',
      avatar: null,
    }
  },
  {
    email: 'demo@artvinci.com',
    password: 'Demo123!',
    user: {
      id: 3,
      name: 'Demo User',
      email: 'demo@artvinci.com',
      role: 'buyer',
      avatar: null,
    }
  }
];

// Auth Services
export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login/', credentials);
      if (response.data.access) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.access);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      // If backend is not available, use mock login
      console.log('Backend not available, using mock login...');
      
      const mockUser = MOCK_USERS.find(
        u => u.email === credentials.email && u.password === credentials.password
      );

      if (mockUser) {
        const mockToken = 'mock-jwt-token-' + Date.now();
        const mockRefreshToken = 'mock-refresh-token-' + Date.now();
        
        localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, mockRefreshToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser.user));
        
        return {
          access: mockToken,
          refresh: mockRefreshToken,
          user: mockUser.user
        };
      } else {
        throw new Error('Invalid credentials');
      }
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      if (response.data.access) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.access);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      // If backend is not available, create mock user
      console.log('Backend not available, creating mock user...');
      
      const mockUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role || 'buyer',
        avatar: null,
      };

      const mockToken = 'mock-jwt-token-' + Date.now();
      const mockRefreshToken = 'mock-refresh-token-' + Date.now();
      
      localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, mockRefreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
      
      return {
        access: mockToken,
        refresh: mockRefreshToken,
        user: mockUser
      };
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password/', { email });
  },

  resetPassword: async (token, password) => {
    return await api.post('/auth/reset-password/', { token, password });
  },
};

// User Services
export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile/');
    return response.data;
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
