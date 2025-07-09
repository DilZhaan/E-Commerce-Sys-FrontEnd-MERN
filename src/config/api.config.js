import axios from 'axios';

// Get the API URL from environment variables with fallback
const getBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In Docker, use the container service name if in production
  if (process.env.NODE_ENV === 'production') {
    // Use the actual backend URL in production
    return 'http://40.76.251.17:5000';
  }
  
  // Local development fallback
  return 'http://localhost:5000';
};

const BASE_URL = getBaseUrl();
const API_URL = `${BASE_URL}/api`;

// Log the API configuration
console.log('API Configuration:', {
  baseUrl: BASE_URL,
  apiUrl: API_URL,
  environment: process.env.NODE_ENV
});

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

// Create axios instance with default config
const axiosInstance = axios.create({
  ...axiosConfig,
  baseURL: API_URL,
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(config => {
  console.log('Request Config:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    withCredentials: config.withCredentials
  });
  return config;
});

export { axiosInstance };
export default API_URLS; 