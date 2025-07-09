// Get the API URL from environment variables with fallback
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
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
  }
};

export default API_URLS; 