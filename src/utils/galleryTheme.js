// Art Gallery Color Theme for ArtyVincy
// Inspired by classic art galleries and museums

export const GALLERY_COLORS = {
  // Primary - Rich burgundy/wine (elegant, art-focused)
  primary: {
    50: '#fdf2f4',
    100: '#fbe8ec',
    200: '#f8d4dc',
    300: '#f2adb9',
    400: '#e97d91',
    500: '#dc4d6a',
    600: '#c43053',
    700: '#a52344',
    800: '#891f3d',
    900: '#731c38',
  },
  
  // Secondary - Warm gold (luxury, prestige)
  secondary: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },
  
  // Accent - Elegant teal (sophistication, creativity)
  accent: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  
  // Neutral - Museum gray (clean, professional)
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  }
};

// Gradient combinations for art gallery theme
export const GALLERY_GRADIENTS = {
  // Elegant burgundy to gold
  primary: 'from-rose-800 via-red-700 to-amber-600',
  primaryLight: 'from-rose-100 via-red-50 to-amber-50',
  
  // Warm sunset (for buttons, highlights)
  sunset: 'from-amber-500 via-orange-500 to-rose-600',
  
  // Cool museum (for backgrounds)
  museum: 'from-gray-50 via-stone-50 to-slate-50',
  museumDark: 'from-gray-900 via-stone-900 to-slate-900',
  
  // Artistic teal
  artistic: 'from-teal-500 via-cyan-500 to-blue-500',
  artisticLight: 'from-teal-50 via-cyan-50 to-blue-50',
  
  // Luxury gold shimmer
  luxury: 'from-yellow-600 via-amber-500 to-orange-600',
};

// Border colors
export const GALLERY_BORDERS = {
  light: 'border-stone-200',
  dark: 'border-stone-700',
  accent: 'border-rose-600',
  gold: 'border-amber-500',
};

// Text colors
export const GALLERY_TEXT = {
  primary: 'text-gray-900 dark:text-gray-100',
  secondary: 'text-gray-700 dark:text-gray-300',
  muted: 'text-gray-600 dark:text-gray-400',
  accent: 'text-rose-700 dark:text-rose-400',
  gold: 'text-amber-700 dark:text-amber-400',
};

// Background colors
export const GALLERY_BG = {
  base: 'bg-stone-50 dark:bg-gray-900',
  card: 'bg-white/90 dark:bg-gray-800/90',
  input: 'bg-stone-50 dark:bg-gray-900/50',
  hover: 'hover:bg-stone-100 dark:hover:bg-gray-800',
};
