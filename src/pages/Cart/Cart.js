import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaShoppingBag, FaPlus, FaMinus, FaSpinner, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useCartActions } from '../../hooks/useCartActions';
import './Cart.css';

const Cart = () => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const { 
    items, 
    totalAmount, 
    itemCount, 
    loading, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCartActions();
  const navigate = useNavigate();

  // Calculate accurate totals
  const cartSummary = useMemo(() => {
    let subtotal = 0;
    
    if (items && items.length > 0) {
      subtotal = items.reduce((sum, item) => {
        // Handle cases where product or price might be null/undefined
        const price = item.product?.price || item.price || 0;
        return sum + (parseFloat(price) * (item.quantity || 1));
      }, 0);
    }
    
    const taxRate = 0.1; // 10% tax
    const estimatedTax = subtotal * taxRate;
    const shippingCost = subtotal > 0 ? 5 : 0; // $5 shipping if there are items
    const finalTotal = subtotal + estimatedTax + shippingCost;
    
    return {
      subtotal: subtotal.toFixed(2),
      tax: estimatedTax.toFixed(2),
      shipping: shippingCost.toFixed(2),
      total: finalTotal.toFixed(2)
    };
  }, [items]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    console.log(`Updating item ${productId} to quantity ${newQuantity}`);
    // In some cases, the item._id should be used instead of product._id
    await updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    console.log(`Removing item ${productId} from cart`);
    // In some cases, the item._id should be used instead of product._id
    await removeFromCart(productId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to continue to checkout");
      navigate("/signin", { state: { from: "/cart" } });
    } else {
      navigate("/checkout");
    }
  };

  // Helper function to get image URL
  const getImageUrl = (product) => {
    if (!product) return '/placeholder-image.png';
    
    // Check various possible image properties
    if (product.images && product.images.length > 0) {
      const imagePath = product.images[0];
      return imagePath.startsWith('http') 
        ? imagePath 
        : `http://localhost:4000/${imagePath}`;
    }
    
    if (product.imageUrls && product.imageUrls.length > 0) {
      const imagePath = product.imageUrls[0];
      return imagePath.startsWith('http') 
        ? imagePath 
        : `http://localhost:4000/${imagePath}`;
    }
    
    if (product.image) {
      return product.image.startsWith('http')
        ? product.image
        : `http://localhost:4000/${product.image}`;
    }
    
    return '/placeholder-image.png';
  };

  if (loading) {
    return (
      <div className="cart-container cart-loading">
        <FaSpinner className="spinner" />
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="cart-container empty-cart-container">
        <div className="empty-cart">
          <FaShoppingCart className="empty-cart-icon" />
          <h2>Your cart is empty</h2>
          <p>Add items to your cart to continue shopping</p>
          <Link to="/shop" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <Link to="/shop" className="back-to-shop">
          <FaArrowLeft /> Continue Shopping
        </Link>
      </div>

      <div className="cart-wrapper">
        <div className="cart-items-container">
          <div className="cart-items-header">
            <span className="item-header">Product</span>
            <span className="price-header">Price</span>
            <span className="quantity-header">Quantity</span>
            <span className="total-header">Total</span>
            <span className="action-header"></span>
          </div>

          {items.map((item) => {
            // Ensure we have a valid item ID, fallback to an index if needed
            const itemId = item._id || (item.product && item.product._id) || item.id || `item-${Math.random()}`;
            // Get price safely, checking for nulls
            const price = parseFloat(item.product?.price || item.price || 0);
            
            return (
              <div key={itemId} className="cart-item">
                <div className="item-info">
                  <img 
                    src={getImageUrl(item.product)}
                    alt={item.product?.name || 'Product Image'}
                    className="item-image" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.png';
                    }}
                  />
                  <div className="item-details">
                    <h3 className="item-name">{item.product?.name || 'Product'}</h3>
                    {item.product?.category && (
                      <p className="item-category">{item.product.category}</p>
                    )}
                    {item.product?.inventoryItem?.modelName && (
                      <p className="item-model">Model: {item.product.inventoryItem.modelName}</p>
                    )}
                  </div>
                </div>

                <div className="item-price">
                  ${price.toFixed(2)}
                </div>

                <div className="item-quantity">
                  <button 
                    onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="quantity-btn"
                    aria-label="Decrease quantity"
                  >
                    <FaMinus />
                  </button>
                  <span className="quantity-value">{item.quantity || 1}</span>
                  <button 
                    onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                    className="quantity-btn"
                    aria-label="Increase quantity"
                  >
                    <FaPlus />
                  </button>
                </div>

                <div className="item-total">
                  ${(price * (item.quantity || 1)).toFixed(2)}
                </div>

                <button 
                  onClick={() => handleRemoveItem(itemId)} 
                  className="remove-btn"
                  aria-label="Remove item"
                >
                  <FaTrash />
                </button>
              </div>
            );
          })}

          <button 
            onClick={handleClearCart} 
            className="clear-cart-btn"
          >
            Clear Cart
          </button>
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-details">
            <div className="summary-row">
              <span>Subtotal ({itemCount} items)</span>
              <span>${cartSummary.subtotal}</span>
            </div>
            
            <div className="summary-row">
              <span>Estimated Tax (10%)</span>
              <span>${cartSummary.tax}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping</span>
              <span>${cartSummary.shipping}</span>
            </div>
            
            <div className="summary-row total-row">
              <span>Estimated Total</span>
              <span>${cartSummary.total}</span>
            </div>
          </div>
          
          <button 
            onClick={handleCheckout} 
            className="checkout-btn"
          >
            Proceed to Checkout
          </button>
          
          <div className="secure-checkout">
            <p>Secure Checkout</p>
            <p className="payment-methods">All major payment methods accepted</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
