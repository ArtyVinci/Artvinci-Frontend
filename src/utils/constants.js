// API Base URL
export const API_BASE_URL = 'http://localhost:8000/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  LOGOUT: '/auth/logout/',
  REFRESH_TOKEN: '/auth/token/refresh/',
  PROFILE: '/auth/me/',
  UPDATE_PROFILE: '/auth/me/update/',
  FORGOT_PASSWORD: '/auth/forgot-password/',
  RESET_PASSWORD: '/auth/reset-password/',
  
  // User (Legacy - use Auth endpoints instead)
  USER_PROFILE: '/auth/me/',
  
  // Artworks
  ARTWORKS: '/artworks/',
  ARTWORK_DETAIL: (id) => `/artworks/${id}/`,
  ARTWORK_LIKE: (id) => `/artworks/${id}/like/`,
  ARTWORK_COMMENT: (id) => `/artworks/${id}/comments/`,
  
  // Artists
  ARTISTS: '/artists/',
  ARTIST_DETAIL: (id) => `/artists/${id}/`,
  ARTIST_FOLLOW: (id) => `/artists/${id}/follow/`,
  ARTIST_ARTWORKS: (id) => `/artists/${id}/artworks/`,
  
  // Store
  STORE_ITEMS: '/store/',
  CATEGORIES: '/categories/',
  
  // Dashboard
  MY_ARTWORKS: '/dashboard/artworks/',
  MY_FAVORITES: '/dashboard/favorites/',
  MY_PURCHASES: '/dashboard/purchases/',
};

// Art Categories
export const ART_CATEGORIES = [
  { id: 'all', name: 'All', icon: '🎨' },
  { id: 'painting', name: 'Painting', icon: '🖼️' },
  { id: 'sculpture', name: 'Sculpture', icon: '🗿' },
  { id: 'digital', name: 'Digital Art', icon: '💻' },
  { id: 'photography', name: 'Photography', icon: '📷' },
  { id: 'drawing', name: 'Drawing', icon: '✏️' },
  { id: 'mixed-media', name: 'Mixed Media', icon: '🎭' },
];

// User Roles
export const USER_ROLES = {
  ARTIST: 'artist',
  BUYER: 'buyer',
  ADMIN: 'admin',
};

// Price Ranges for Filters
export const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'under-100', label: 'Under $100', min: 0, max: 100 },
  { id: '100-500', label: '$100 - $500', min: 100, max: 500 },
  { id: '500-1000', label: '$500 - $1000', min: 500, max: 1000 },
  { id: 'above-1000', label: 'Above $1000', min: 1000, max: Infinity },
];

// Sort Options
export const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'popular', label: 'Most Popular' },
];

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'artvinci_token',
  REFRESH_TOKEN: 'artvinci_refresh_token',
  USER: 'artvinci_user',
  THEME: 'artvinci_theme',
};

// Animation Variants
export const FADE_IN_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export const SLIDE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export const SCALE_VARIANTS = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 }
  }
};

export const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
