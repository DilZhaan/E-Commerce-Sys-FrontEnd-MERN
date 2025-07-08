import axios from 'axios';
import { API_URLS, axiosConfig } from '../config/api.config';

// Get all shop products with pagination, sorting, and filtering
export const getShopProducts = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URLS.shop}/list`, { 
      ...axiosConfig,
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching shop products:', error);
    throw error;
  }
};

// Search shop products
export const searchShopProducts = async (searchTerm, params = {}) => {
  try {
    const response = await axios.get(`${API_URLS.shop}/search`, { 
      ...axiosConfig,
      params: { q: searchTerm, ...params },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching shop products:', error);
    throw error;
  }
};

// Get shop product details by ID
export const getShopProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URLS.shop}/detail/${id}`, axiosConfig);
    return response.data;
  } catch (error) {
    console.error(`Error fetching shop product with ID ${id}:`, error);
    throw error;
  }
}; 