import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Get cart items for the current user
export const getCartItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/cart`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};

// Add item to cart
export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await axios.post(
      `${API_URL}/cart`,
      { productId, quantity },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
};

// Update cart item quantity
export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const response = await axios.put(
      `${API_URL}/cart/${cartItemId}`,
      { quantity },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating cart item ${cartItemId}:`, error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (cartItemId) => {
  try {
    const response = await axios.delete(`${API_URL}/cart/${cartItemId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(`Error removing item ${cartItemId} from cart:`, error);
    throw error;
  }
};

// Clear entire cart
export const clearCart = async () => {
  try {
    const response = await axios.delete(`${API_URL}/cart`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}; 