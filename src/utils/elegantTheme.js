// Elegant Art Gallery Color Palette - Professional & Sophisticated
// No orange - refined burgundy, charcoal, cream, and gold accents

export const ELEGANT_COLORS = {
  // Primary - Deep Burgundy/Wine (sophisticated gallery color)
  primary: {
    50: '#faf5f7',
    100: '#f5e8ed',
    200: '#ebd1db',
    300: '#daa8bc',
    400: '#c47795',
    500: '#a64d6d',
    600: '#8b3654',
    700: '#6d2842',
    800: '#5a2338',
    900: '#4c1f31',
  },
  
  // Secondary - Warm Gold (refined luxury accent)
  gold: {
    50: '#fdfbf7',
    100: '#faf5e8',
    200: '#f4e8c6',
    300: '#ecd79a',
    400: '#e1bc5d',
    500: '#d4a343',
    600: '#b8862f',
    700: '#926729',
    800: '#78542a',
    900: '#644727',
  },
  
  // Accent - Soft Sage (calming gallery walls)
  sage: {
    50: '#f6f8f6',
    100: '#e3efec',
    200: '#c7ded7',
    300: '#9ec4b8',
    400: '#70a596',
    500: '#508978',
    600: '#3d6d60',
    700: '#33594f',
    800: '#2c4842',
    900: '#263c37',
  },
  
  // Neutral - Charcoal & Cream (sophisticated base)
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f3',
    200: '#e8e7e5',
    300: '#d4d2ce',
    400: '#a9a5a0',
    500: '#7c7771',
    600: '#5d5955',
    700: '#4a4642',
    800: '#383530',
    900: '#2d2a27',
  }
};

export const ELEGANT_GRADIENTS = {
  // Primary burgundy gradients
  primary: 'from-[#6d2842] via-[#8b3654] to-[#a64d6d]',
  primaryLight: 'from-[#f5e8ed] via-[#ebd1db] to-[#daa8bc]',
  
  // Gold luxury gradients
  gold: 'from-[#b8862f] via-[#d4a343] to-[#e1bc5d]',
  goldLight: 'from-[#faf5e8] via-[#f4e8c6] to-[#ecd79a]',
  
  // Charcoal elegant gradients
  elegant: 'from-[#2d2a27] via-[#4a4642] to-[#5d5955]',
  elegantLight: 'from-[#fafaf9] via-[#f5f5f3] to-[#e8e7e5]',
  
  // Sage calming gradients
  sage: 'from-[#508978] via-[#70a596] to-[#9ec4b8]',
  sageLight: 'from-[#f6f8f6] via-[#e3efec] to-[#c7ded7]',
  
  // Hero backgrounds
  hero: 'from-[#fafaf9] via-[#f5f5f3] to-[#e8e7e5]',
  heroDark: 'from-[#2d2a27] via-[#383530] to-[#4a4642]',
};

export const ELEGANT_STYLES = {
  // Input focus states
  inputFocus: 'focus:border-[#8b3654] dark:focus:border-[#d4a343] focus:ring-4 focus:ring-[#8b3654]/20 dark:focus:ring-[#d4a343]/20',
  inputBorder: 'border-[#d4d2ce] dark:border-[#4a4642]',
  
  // Button styles
  buttonPrimary: 'bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] hover:from-[#5a2338] hover:via-[#6d2842] hover:to-[#8b3654]',
  buttonGold: 'bg-gradient-to-r from-[#b8862f] via-[#d4a343] to-[#e1bc5d] hover:from-[#926729] hover:via-[#b8862f] hover:to-[#d4a343]',
  buttonOutline: 'border-2 border-[#8b3654] text-[#8b3654] hover:bg-[#8b3654] hover:text-white dark:border-[#d4a343] dark:text-[#d4a343] dark:hover:bg-[#d4a343] dark:hover:text-[#2d2a27]',
  
  // Card styles
  card: 'bg-white dark:bg-[#2d2a27] border border-[#e8e7e5] dark:border-[#4a4642]',
  cardHover: 'hover:border-[#8b3654] dark:hover:border-[#d4a343] hover:shadow-xl hover:shadow-[#8b3654]/10 dark:hover:shadow-[#d4a343]/10',
  
  // Text colors
  textPrimary: 'text-[#2d2a27] dark:text-[#fafaf9]',
  textSecondary: 'text-[#5d5955] dark:text-[#d4d2ce]',
  textMuted: 'text-[#7c7771] dark:text-[#a9a5a0]',
  textAccent: 'text-[#8b3654] dark:text-[#c47795]',
  textGold: 'text-[#b8862f] dark:text-[#e1bc5d]',
  
  // Background colors
  bgPrimary: 'bg-[#fafaf9] dark:bg-[#2d2a27]',
  bgSecondary: 'bg-[#f5f5f3] dark:bg-[#383530]',
  bgAccent: 'bg-[#f5e8ed] dark:bg-[#4c1f31]',
  
  // Title gradients
  titleGradient: 'bg-gradient-to-r from-[#6d2842] via-[#8b3654] to-[#a64d6d] bg-clip-text text-transparent',
  titleGradientDark: 'dark:from-[#c47795] dark:via-[#e1bc5d] dark:to-[#d4a343]',
};
