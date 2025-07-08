// Get the API URL from environment variables with fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Base URLs for different services
export const API_URLS = {
  base: API_URL,
  shop: `${API_URL}/api/shop-products`,
  auth: `${API_URL}/api/auth`,
  cart: `${API_URL}/api/cart`,
  orders: `${API_URL}/api/orders`,
  payments: `${API_URL}/api/payments`,
  feedback: `${API_URL}/api/feedback`,
  issues: `${API_URL}/api/issues`,
};

// Common axios config
export const axiosConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
};

export default API_URLS; 