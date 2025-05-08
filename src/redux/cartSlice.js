import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { clearCart as clearCartService } from '../services/cartServices';

const initialState = {
  items: [],
  totalAmount: 0,
  itemCount: 0,
  loading: false,
  error: null
};

// Helper function to get price safely
const getItemPrice = (item) => {
  if (!item || !item.product) return 0;
  return parseFloat(item.product.price || item.price || 0);
};

// Helper function to calculate item count
const calculateItemCount = (items) => {
  return items.reduce((total, item) => total + (item.quantity || 1), 0);
};

// Helper function to calculate total amount
const calculateTotalAmount = (items) => {
  return items.reduce((total, item) => {
    const price = getItemPrice(item);
    return total + (price * (item.quantity || 1));
  }, 0);
};

// Add a thunk to clear cart
export const clearCartFromBackend = createAsyncThunk(
  'cart/clearFromBackend',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Clearing cart from backend...');
      const response = await clearCartService();
      console.log('Backend cart cleared response:', response);
      return response;
    } catch (error) {
      console.error('Error clearing cart from backend:', error);
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      state.totalAmount = action.payload.totalAmount || 0;
      state.itemCount = action.payload.itemCount || 0;
    },
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      if (!product) return; // Skip if product is null
      
      const existingItemIndex = state.items.findIndex(item => 
        item.product && product && item.product._id === product._id
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        state.items[existingItemIndex].quantity = (state.items[existingItemIndex].quantity || 1) + quantity;
      } else {
        // Add new item
        state.items.push({ product, quantity });
      }

      // Update counts
      state.itemCount = calculateItemCount(state.items);
      state.totalAmount = calculateTotalAmount(state.items);
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      if (!productId) return; // Skip if productId is null
      
      const itemIndex = state.items.findIndex(item => 
        (item.product && item.product._id === productId) || item._id === productId
      );

      if (itemIndex >= 0) {
        state.items[itemIndex].quantity = quantity;
        // Update counts
        state.itemCount = calculateItemCount(state.items);
        state.totalAmount = calculateTotalAmount(state.items);
      }
    },
    removeFromCart: (state, action) => {
      const productId = action.payload;
      if (!productId) return; // Skip if productId is null
      
      state.items = state.items.filter(item => 
        !((item.product && item.product._id === productId) || item._id === productId)
      );
      
      // Update counts
      state.itemCount = calculateItemCount(state.items);
      state.totalAmount = calculateTotalAmount(state.items);
    },
    resetCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.itemCount = 0;
    },
    updateCartState: (state, action) => {
      // Update cart with a new array of items
      state.items = action.payload;
      // Recalculate totals
      state.itemCount = calculateItemCount(state.items);
      state.totalAmount = calculateTotalAmount(state.items);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(clearCartFromBackend.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearCartFromBackend.fulfilled, (state) => {
        state.items = [];
        state.totalAmount = 0;
        state.itemCount = 0;
        state.loading = false;
      })
      .addCase(clearCartFromBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  resetCart,
  updateCartState,
  setLoading,
  setError
} = cartSlice.actions;

export default cartSlice.reducer; 