import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api/shop-products';

// Get all shop products with pagination, sorting, and filtering
export const getShopProducts = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/list`, { 
      params,
      withCredentials: true
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
    const response = await axios.get(`${API_BASE_URL}/search`, { 
      params: { q: searchTerm, ...params },
      withCredentials: true
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
    const response = await axios.get(`${API_BASE_URL}/detail/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching shop product with ID ${id}:`, error);
    throw error;
  }
}; 