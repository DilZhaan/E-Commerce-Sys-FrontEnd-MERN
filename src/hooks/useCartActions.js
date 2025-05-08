import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  fetchCart, 
  addItemToCart, 
  updateCartItemQuantity, 
  removeCartItem, 
  clearEntireCart 
} from '../redux/cartActions';

/**
 * Custom hook to interact with cart functionality
 * Provides methods to fetch, add, update, remove items from cart
 */
export const useCartActions = () => {
  const dispatch = useDispatch();
  const { items, totalAmount, itemCount, loading, error } = useSelector(state => state.cart);
  const { isAuthenticated } = useSelector(state => state.auth);

  // Load cart data on mount if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  /**
   * Add a product to the cart
   * @param {Object} product - The product to add
   * @param {number} quantity - Quantity to add (default: 1)
   */
  const addToCart = async (product, quantity = 1) => {
    try {
      if (!isAuthenticated) {
        toast.error("Please sign in to add items to cart");
        return false;
      }
      
      // Get the product ID properly - handle both formats
      const productId = product._id;
      
      if (!productId) {
        toast.error("Invalid product");
        return false;
      }
      
      console.log(`Adding product ${productId} to cart with quantity ${quantity}`);
      
      // Use the backend API directly with fetch for more reliable operation
      const response = await fetch('http://localhost:4000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId, 
          quantity 
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add item to cart');
      }
      
      // Update Redux store with the new cart data
      dispatch(fetchCart());
      
      toast.success(`${product.name || 'Product'} added to cart successfully`);
      return true;
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(error.message || "Failed to add item to cart");
      return false;
    }
  };

  /**
   * Update the quantity of an item in the cart
   * @param {string} itemId - ID of the item to update
   * @param {number} quantity - New quantity
   */
  const updateQuantity = async (itemId, quantity) => {
    try {
      if (quantity < 1) {
        toast.error("Quantity cannot be less than 1");
        return false;
      }
      
      console.log(`Updating item ${itemId} to quantity ${quantity}`);
      
      // Direct API call for more reliable operation
      const response = await fetch('http://localhost:4000/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          itemId, 
          quantity 
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('Update item response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update item quantity');
      }
      
      // Update Redux store
      dispatch(fetchCart());
      
      toast.success("Cart updated successfully");
      return true;
    } catch (error) {
      console.error('Update quantity error:', error);
      toast.error(error.message || "Failed to update cart");
      return false;
    }
  };

  /**
   * Remove an item from the cart
   * @param {string} itemId - ID of the item to remove
   */
  const removeFromCart = async (itemId) => {
    try {
      console.log(`Removing item with ID: ${itemId} from cart`);
      
      // First try to directly call the API for more reliable operation
      const response = await fetch(`http://localhost:4000/api/cart/item/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('Remove item response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove item from cart');
      }
      
      // Update Redux store
      dispatch(fetchCart());
      
      toast.success("Item removed from cart");
      return true;
    } catch (error) {
      console.error('Remove from cart error:', error);
      toast.error(error.message || "Failed to remove item from cart");
      return false;
    }
  };

  /**
   * Clear all items from the cart
   */
  const clearCart = async () => {
    try {
      console.log('Clearing entire cart');
      
      // Direct API call for more reliable operation
      const response = await fetch('http://localhost:4000/api/cart/clear', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('Clear cart response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear cart');
      }
      
      // Update Redux store
      dispatch(fetchCart());
      
      toast.success("Cart cleared successfully");
      return true;
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error(error.message || "Failed to clear cart");
      return false;
    }
  };

  return {
    items,
    totalAmount,
    itemCount,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: () => dispatch(fetchCart())
  };
}; 