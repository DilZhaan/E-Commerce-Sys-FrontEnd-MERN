import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setCart, setLoading, setError, resetCart } from './cartSlice';

const API_URL = 'http://localhost:4000/api';

// Fetch cart from server
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      console.log("Fetching cart data from API");
      
      const response = await axios.get(`${API_URL}/cart`, { withCredentials: true });
      console.log("Cart API response:", response.data);
      
      // Make sure we're handling the correct response structure
      // The backend may return data in a nested structure
      const cartData = response.data.success ? response.data.data : response.data;
      
      // Calculate items count from cart items
      const items = cartData.items || [];
      const itemCount = items.reduce((count, item) => count + (item.quantity || 0), 0);
      const totalAmount = cartData.totalPrice || 
                          items.reduce((total, item) => {
                            const price = item.product?.price || item.price || 0;
                            return total + (price * (item.quantity || 0));
                          }, 0);
      
      // Format cart data for the Redux store
      const formattedCart = {
        items: items.map(item => {
          // Make sure product data is properly structured
          if (item.product) {
            // If images are available, ensure they have proper URLs
            if (item.product.images && item.product.images.length > 0) {
              // Keep the server-side path as is, we'll add the prefix in the UI
              item.product.imageUrls = item.product.images.map(
                img => img.startsWith('http') ? img : img
              );
            }
          }
          return item;
        }),
        totalAmount: totalAmount,
        itemCount: itemCount
      };
      
      console.log("Formatted cart data:", formattedCart);
      dispatch(setCart(formattedCart));
      dispatch(setLoading(false));
      return formattedCart;
    } catch (error) {
      console.error("Error fetching cart:", error);
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch cart'));
      dispatch(setCart({ items: [], totalAmount: 0, itemCount: 0 }));
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

// Add item to cart
export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity = 1 }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      console.log(`Adding item ${productId} to cart with quantity ${quantity}`);
      
      const response = await axios.post(
        `${API_URL}/cart/add`,
        { productId, quantity },
        { withCredentials: true }
      );
      
      console.log('Add to cart response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to add item to cart');
      }
      
      // Refetch the entire cart to ensure we have the latest data
      dispatch(fetchCart());
      dispatch(setLoading(false));
      return true;
    } catch (error) {
      console.error("Error adding item to cart:", error);
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || error.message || 'Failed to add item to cart'));
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to add item to cart');
    }
  }
);

// Update item quantity in cart
export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateItem',
  async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      console.log(`Updating item ${productId} quantity to ${quantity}`);
      
      const response = await axios.put(
        `${API_URL}/cart/update`,
        { itemId: productId, quantity },
        { withCredentials: true }
      );
      
      console.log('Update item response:', response.data);
      
      // Refetch cart instead of parsing response
      dispatch(fetchCart());
      dispatch(setLoading(false));
      return true;
    } catch (error) {
      console.error("Error updating cart:", error);
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update cart item'));
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item');
    }
  }
);

// Remove item from cart
export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      console.log(`Removing item ${productId} from cart`);
      
      // Use the correct API endpoint
      const response = await axios.delete(`${API_URL}/cart/item/${productId}`, { 
        withCredentials: true 
      });
      
      console.log('Remove item response:', response.data);
      
      // Refetch cart instead of parsing response
      dispatch(fetchCart());
      dispatch(setLoading(false));
      return true;
    } catch (error) {
      console.error("Error removing item from cart:", error);
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to remove item from cart'));
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart');
    }
  }
);

// Clear entire cart
export const clearEntireCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      console.log('Clearing entire cart');
      
      const response = await axios.delete(`${API_URL}/cart/clear`, { 
        withCredentials: true 
      });
      
      console.log('Clear cart response:', response.data);
      
      dispatch(resetCart());
      dispatch(setLoading(false));
      return true;
    } catch (error) {
      console.error("Error clearing cart:", error);
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to clear cart'));
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
); 