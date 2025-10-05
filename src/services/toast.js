/**
 * Toast notification service using react-hot-toast
 * Provides elegant, customizable toast notifications matching the app's theme
 */

import toast from 'react-hot-toast';

const toastConfig = {
  // Default options for all toasts
  duration: 4000,
  position: 'top-right',
  
  // Styling to match elegant theme
  style: {
    borderRadius: '12px',
    background: '#2d2a27',
    color: '#fafaf9',
    padding: '16px',
    boxShadow: '0 10px 25px -5px rgba(109, 40, 66, 0.3), 0 8px 10px -6px rgba(109, 40, 66, 0.2)',
    border: '1px solid #4a4642',
  },
  
  // Icon theme
  iconTheme: {
    primary: '#8b3654',
    secondary: '#fafaf9',
  },
};

export const showToast = {
  /**
   * Show success toast
   * @param {string} message - Success message to display
   */
  success: (message) => {
    toast.success(message, {
      ...toastConfig,
      icon: '✓',
      style: {
        ...toastConfig.style,
        borderLeft: '4px solid #70a596', // Sage green for success
      },
    });
  },

  /**
   * Show error toast
   * @param {string} message - Error message to display
   */
  error: (message) => {
    toast.error(message, {
      ...toastConfig,
      icon: '✕',
      duration: 5000, // Show errors longer
      style: {
        ...toastConfig.style,
        borderLeft: '4px solid #ef4444', // Red for errors
      },
    });
  },

  /**
   * Show info/loading toast
   * @param {string} message - Info message to display
   */
  info: (message) => {
    toast(message, {
      ...toastConfig,
      icon: 'ℹ',
      style: {
        ...toastConfig.style,
        borderLeft: '4px solid #d4a343', // Gold for info
      },
    });
  },

  /**
   * Show loading toast with promise
   * @param {Promise} promise - Promise to track
   * @param {Object} messages - Success, error, and loading messages
   */
  promise: (promise, messages) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Error occurred',
      },
      toastConfig
    );
  },

  /**
   * Show custom toast
   * @param {string|React.Component} content - Content to display
   * @param {Object} options - Custom options
   */
  custom: (content, options = {}) => {
    toast.custom(content, {
      ...toastConfig,
      ...options,
    });
  },

  /**
   * Dismiss all toasts
   */
  dismiss: () => {
    toast.dismiss();
  },
};

export default showToast;
