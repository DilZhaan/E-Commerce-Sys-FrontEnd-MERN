import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:4000/api';

// Create a new order
export const placeOrder = async (orderData) => {
  try {
    // Validate order data before sending
    if (!orderData.shippingAddress) {
      throw new Error("Shipping address is required");
    }
    
    // Ensure items exist and are properly formatted
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error("Order must contain at least one item");
    }
    
    // Validate each item has required fields
    for (const item of orderData.items) {
      if (!item.product) {
        throw new Error("Each item must have a product ID");
      }
      if (!item.quantity || item.quantity < 1) {
        item.quantity = 1; // Fix invalid quantities
      }
      if (!item.price || isNaN(item.price)) {
        throw new Error("Each item must have a valid price");
      }
    }
    
    console.log("Sending validated order data:", orderData);
    
    const response = await axios.post(`${API_URL}/orders`, orderData, {
      withCredentials: true
    });
    return response;
  } catch (error) {
    console.error('Error placing order:', error);
    // Add more detail to the error
    if (error.response && error.response.data) {
      error.message = error.response.data.message || error.message;
    }
    throw error;
  }
};

// Get orders for current user
export const getUserOrders = async () => {
  try {
    console.log('Fetching user orders from:', `${API_URL}/orders/my-orders`);
    const response = await axios.get(`${API_URL}/orders/my-orders`, {
      withCredentials: true
    });
    console.log('User orders response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

// Get all orders (admin only)
export const getAllOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/orders`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}/orders/${orderId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.put(
      `${API_URL}/orders/${orderId}/status`,
      { status },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    throw error;
  }
};

// Cancel order
export const cancelOrder = async (orderId) => {
  try {
    console.log(`Cancelling order: ${orderId}`);
    const response = await axios.delete(
      `${API_URL}/orders/${orderId}`,
      { withCredentials: true }
    );
    console.log('Cancel order response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error canceling order ${orderId}:`, error);
    throw error;
  }
};

// Clear all cancelled orders for the current user
export const clearCancelledOrders = async () => {
  try {
    console.log('Clearing cancelled orders');
    const response = await axios.delete(
      `${API_URL}/orders/clear-cancelled`,
      { withCredentials: true }
    );
    console.log('Clear cancelled orders response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error clearing cancelled orders:', error);
    toast.error(error.response?.data?.message || 'Failed to clear cancelled orders');
    throw error;
  }
};

// Clear all cancelled orders (admin only)
export const clearAllCancelledOrders = async () => {
  try {
    console.log('Clearing all cancelled orders');
    const response = await axios.delete(
      `${API_URL}/orders/admin/clear-cancelled`,
      { withCredentials: true }
    );
    console.log('Clear all cancelled orders response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error clearing all cancelled orders:', error);
    toast.error(error.response?.data?.message || 'Failed to clear all cancelled orders');
    throw error;
  }
}; 