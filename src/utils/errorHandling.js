import { toast } from 'react-toastify';

/**
 * Global error handler for displaying consistent error messages throughout the application
 * @param {Error} error - The error object
 * @param {string} customMessage - Optional custom message to display
 * @param {Object} options - Additional options for toast
 */
export const handleError = (error, customMessage = '', options = {}) => {
  console.error('Error occurred:', error);

  // Get the most specific error message
  let errorMessage = customMessage;

  if (!errorMessage) {
    // Try to extract message from axios or other error response
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = 'An error occurred. Please try again.';
    }
  }

  // Show toast notification with error message
  toast.error(errorMessage, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options
  });
};

/**
 * Global success handler for displaying consistent success messages
 * @param {string} message - The success message to display
 * @param {Object} options - Additional options for toast
 */
export const handleSuccess = (message, options = {}) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options
  });
};

/**
 * Global warning handler for displaying warning messages
 * @param {string} message - The warning message to display
 * @param {Object} options - Additional options for toast
 */
export const handleWarning = (message, options = {}) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options
  });
};

/**
 * Global info handler for displaying info messages
 * @param {string} message - The info message to display
 * @param {Object} options - Additional options for toast
 */
export const handleInfo = (message, options = {}) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options
  });
}; 