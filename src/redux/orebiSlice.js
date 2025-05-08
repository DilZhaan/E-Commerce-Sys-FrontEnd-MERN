import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunks for cart operations
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:4000/api/cart", {
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch cart");
    }
  }
);

export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/cart/add",
        { productId, quantity },
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add item to cart");
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        "http://localhost:4000/api/cart/update",
        { itemId, quantity },
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update cart item");
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `http://localhost:4000/api/cart/item/${itemId}`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove item from cart");
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        "http://localhost:4000/api/cart/clear",
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to clear cart");
    }
  }
);

const initialState = {
  userInfo: [],
  cartItems: [],
  cartTotalAmount: 0,
  cartTotalQuantity: 0,
  loading: false,
  error: null,
  addItemSuccess: false,
  removeItemSuccess: false,
  updateItemSuccess: false,
};

export const orebiSlice = createSlice({
  name: "orebi",
  initialState,
  reducers: {
    clearCartSuccess: (state) => {
      state.addItemSuccess = false;
      state.removeItemSuccess = false;
      state.updateItemSuccess = false;
    },
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchCart
    builder.addCase(fetchCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.loading = false;
      state.cartItems = action.payload.items;
      state.cartTotalAmount = action.payload.totalPrice || 
        action.payload.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      state.cartTotalQuantity = action.payload.items.reduce((total, item) => total + item.quantity, 0);
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Handle addItemToCart
    builder.addCase(addItemToCart.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.addItemSuccess = false;
    });
    builder.addCase(addItemToCart.fulfilled, (state, action) => {
      state.loading = false;
      state.cartItems = action.payload.items;
      state.cartTotalAmount = action.payload.totalPrice || 
        action.payload.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      state.cartTotalQuantity = action.payload.items.reduce((total, item) => total + item.quantity, 0);
      state.addItemSuccess = true;
    });
    builder.addCase(addItemToCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.addItemSuccess = false;
    });

    // Handle updateCartItem
    builder.addCase(updateCartItem.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.updateItemSuccess = false;
    });
    builder.addCase(updateCartItem.fulfilled, (state, action) => {
      state.loading = false;
      state.cartItems = action.payload.items;
      state.cartTotalAmount = action.payload.totalPrice || 
        action.payload.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      state.cartTotalQuantity = action.payload.items.reduce((total, item) => total + item.quantity, 0);
      state.updateItemSuccess = true;
    });
    builder.addCase(updateCartItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.updateItemSuccess = false;
    });

    // Handle removeCartItem
    builder.addCase(removeCartItem.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.removeItemSuccess = false;
    });
    builder.addCase(removeCartItem.fulfilled, (state, action) => {
      state.loading = false;
      state.cartItems = action.payload.items;
      state.cartTotalAmount = action.payload.totalPrice || 
        action.payload.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      state.cartTotalQuantity = action.payload.items.reduce((total, item) => total + item.quantity, 0);
      state.removeItemSuccess = true;
    });
    builder.addCase(removeCartItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.removeItemSuccess = false;
    });

    // Handle clearCart
    builder.addCase(clearCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(clearCart.fulfilled, (state) => {
      state.loading = false;
      state.cartItems = [];
      state.cartTotalAmount = 0;
      state.cartTotalQuantity = 0;
    });
    builder.addCase(clearCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { clearCartSuccess, clearCartError } = orebiSlice.actions;
export default orebiSlice.reducer;
