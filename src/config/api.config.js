// Get the API URL from environment variables with fallback
const getBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In Docker, use the service name as hostname
  if (process.env.NODE_ENV === 'production') {
    return 'http://backend:5000';
  }
  
  // Local development fallback
  return 'http://localhost:5000';
};

const BASE_URL = getBaseUrl();
const API_URL = `${BASE_URL}/api`;

// Base URLs for different services
export const API_URLS = {
  base: BASE_URL,
  api: API_URL,
  shop: `${API_URL}/shop-products`,
  auth: `${API_URL}/auth`,
  cart: `${API_URL}/cart`,
  orders: `${API_URL}/orders`,
  payments: `${API_URL}/payments`,
  feedback: `${API_URL}/feedback`,
  issues: `${API_URL}/issues`,
};

// Common axios config
export const axiosConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure cookies are sent with requests
  credentials: 'include'
};

export default API_URLS; 