import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { toast } from "react-toastify";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { resetCart, updateCartState, clearCartFromBackend } from "../../redux/cartSlice";
import { FaShoppingCart, FaCreditCard, FaSpinner, FaCheckCircle, FaTruck, FaMapMarkerAlt, FaArrowLeft } from "react-icons/fa";
import { placeOrder } from '../../services/orderServices';
import './Checkout.css';

// Validation functions
const nameValidation = (value) => /^[A-Za-z\s-]+$/.test(value);
const phoneValidation = (value) => /^\d{1,10}$/.test(value);
const zipCodeValidation = (value) => /^\d{5,6}$/.test(value);
const emailValidation = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: cartItems, totalAmount } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [formErrors, setFormErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [orderNote, setOrderNote] = useState("");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const shippingCost = shippingMethod === "express" ? 10 : 5;
  const [orderId, setOrderId] = useState(null);
  const [redirectToPayment, setRedirectToPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [subTotal, setSubTotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Redirect if not authenticated or cart is empty
    if (!isAuthenticated) {
      toast.error("Please log in to continue checkout");
      return navigate("/signin");
    }
    
    if (cartItems.length === 0) {
      toast.info("Your cart is empty");
      return navigate("/cart");
    }
    
    // Pre-fill shipping details if user info is available
    if (user) {
      setShippingInfo(prevDetails => ({
        ...prevDetails,
        fullName: user.name || "",
        phone: user.phone || "",
        address: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        zipCode: user.address?.postalCode || ""
      }));
    }
    
    // Calculate totals
    const subTotal = cartItems.reduce((acc, item) => {
      // Safely get price with fallback
      const price = item.product?.price || item.price || 0;
      return acc + (parseFloat(price) * (item.quantity || 1));
    }, 0);
    const taxRate = 0.1; // 10% tax
    const taxAmount = subTotal * taxRate;
    const totalAmount = subTotal + taxAmount + shippingCost;
    
    setSubTotal(subTotal);
    setTax(taxAmount);
    setTotal(totalAmount);
    setLoading(false);
  }, [cartItems, isAuthenticated, navigate, user, shippingCost]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    let error = '';

    // Apply validation based on field type
    switch (name) {
      case 'fullName':
      case 'country':
      case 'city':
      case 'state':
        // Only allow letters, spaces, and hyphens
        if (value && !nameValidation(value)) {
          // Replace any non-letter characters
          newValue = value.replace(/[^A-Za-z\s-]/g, '');
          error = `${name === 'fullName' ? 'Full Name' : name.charAt(0).toUpperCase() + name.slice(1)} can only contain letters`;
        }
        break;
      
      case 'phone':
        // Only allow digits and limit to 10
        newValue = value.replace(/\D/g, '').slice(0, 10);
        if (value !== newValue) {
          error = 'Phone number can only contain digits (max 10)';
        }
        break;
      
      case 'zipCode':
        // Only allow digits for zip code
        newValue = value.replace(/\D/g, '');
        if (value !== newValue) {
          error = 'Zip code can only contain digits';
        }
        break;
      
      case 'email':
        // Email validation happens in real-time
        if (value && !emailValidation(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      
      default:
        break;
    }

    // Update the shipping info
    setShippingInfo(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Update the form errors
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...formErrors };
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'country'];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!shippingInfo[field]) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
        isValid = false;
      }
    }
    
    // Validate field formats
    if (shippingInfo.fullName && !nameValidation(shippingInfo.fullName)) {
      newErrors.fullName = 'Full Name can only contain letters';
      isValid = false;
    }
    
    if (shippingInfo.country && !nameValidation(shippingInfo.country)) {
      newErrors.country = 'Country can only contain letters';
      isValid = false;
    }
    
    if (shippingInfo.city && !nameValidation(shippingInfo.city)) {
      newErrors.city = 'City can only contain letters';
      isValid = false;
    }
    
    if (shippingInfo.state && !nameValidation(shippingInfo.state)) {
      newErrors.state = 'State can only contain letters';
      isValid = false;
    }
    
    if (shippingInfo.email && !emailValidation(shippingInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (shippingInfo.phone) {
      if (!/^\d+$/.test(shippingInfo.phone)) {
        newErrors.phone = 'Phone number can only contain digits';
        isValid = false;
      } else if (shippingInfo.phone.length !== 10) {
        newErrors.phone = 'Phone number must be exactly 10 digits';
        isValid = false;
      }
    }
    
    if (shippingInfo.zipCode && !zipCodeValidation(shippingInfo.zipCode)) {
      newErrors.zipCode = 'Please enter a valid zip code (5-6 digits)';
      isValid = false;
    }
    
    setFormErrors(newErrors);
    
    // Show toast for the first error
    if (!isValid) {
      const firstError = Object.values(newErrors).find(error => error);
      if (firstError) {
        toast.error(firstError);
      }
    }
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Debug: Log the cart items to find what's invalid
      console.log('Cart items before filtering:', JSON.stringify(cartItems, null, 2));
      
      // Get valid cart items and collect any that are invalid
      const validItems = [];
      const invalidItems = [];
      
      cartItems.forEach(item => {
        if (item && item.product && item.product._id) {
          validItems.push(item);
        } else {
          invalidItems.push(item);
        }
      });
      
      console.log('Valid items:', validItems.length);
      console.log('Invalid items:', invalidItems.length);
      
      // If there are no valid items, show error and return
      if (validItems.length === 0) {
        setIsProcessing(false);
        toast.error("Your cart is empty or contains only invalid items. Please add products before placing an order.");
        return;
      }
      
      // Format shipping address to match the backend model structure
      const shippingAddress = {
        fullName: shippingInfo.fullName,
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        postalCode: shippingInfo.zipCode,
        country: shippingInfo.country,
        phone: shippingInfo.phone
      };
      
      const orderData = {
        items: validItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity || 1,
          price: parseFloat(item.product?.price || item.price || 0)
        })),
        shippingAddress: shippingAddress,
        taxAmount: tax,
        subtotal: subTotal,
        shippingCost,
        total
      };
      
      console.log('Submitting order with data:', orderData);
      
      const response = await placeOrder(orderData);
      console.log('Order response:', response);
      
      // Clear the cart after successful order placement
      console.log('About to reset cart in both frontend and backend');
      dispatch(clearCartFromBackend());
      dispatch(resetCart());
      console.log('Cart has been reset in both frontend and backend');
      
      setIsProcessing(false);
      toast.success('Order placed successfully!');
      
      // Check if there's an orderId in the response and navigate to payment page
      const orderId = response.data?.data?._id;
      if (orderId) {
        navigate(`/payment/${orderId}`);
      } else {
        toast.warning('Could not retrieve order ID. Please check your orders.');
        navigate('/dashboard/orders');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      setIsProcessing(false);
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  // Function to clean the cart by removing invalid items
  const cleanCart = () => {
    // Get only valid items (with product and product._id)
    const validItems = cartItems.filter(item => item && item.product && item.product._id);
    
    // Update the cart with only valid items
    dispatch(updateCartState(validItems));
    
    toast.success("Cart has been cleaned! Invalid items removed.");
    
    // Recalculate totals
    const subTotal = validItems.reduce((acc, item) => {
      const price = item.product?.price || item.price || 0;
      return acc + (parseFloat(price) * (item.quantity || 1));
    }, 0);
    const taxRate = 0.1; // 10% tax
    const taxAmount = subTotal * taxRate;
    const totalAmount = subTotal + taxAmount + shippingCost;
    
    setSubTotal(subTotal);
    setTax(taxAmount);
    setTotal(totalAmount);
  };
  
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading checkout...</p>
      </div>
    );
  }
  
  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>
          <FaShoppingCart /> Checkout
        </h1>
        <div className="header-buttons">
          <Link to="/cart" className="back-link">
            <FaArrowLeft /> Back to Cart
          </Link>
          
          {/* Add button to clean cart if needed */}
          {cartItems.some(item => !item || !item.product || !item.product._id) && (
            <button 
              onClick={cleanCart} 
              className="clean-cart-btn"
              type="button"
            >
              Remove Invalid Items
            </button>
          )}
        </div>
      </div>

      <div className="checkout-content">
        <div className="checkout-form-container">
          <h2>Shipping Information</h2>
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={shippingInfo.fullName}
                onChange={handleInputChange}
                className={formErrors.fullName ? 'input-error' : ''}
                required
              />
              {formErrors.fullName && <p className="error-text">{formErrors.fullName}</p>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={shippingInfo.email}
                  onChange={handleInputChange}
                  className={formErrors.email ? 'input-error' : ''}
                  required
                />
                {formErrors.email && <p className="error-text">{formErrors.email}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleInputChange}
                  className={formErrors.phone ? 'input-error' : ''}
                  placeholder="10 digits only"
                  maxLength={10}
                  required
                />
                {formErrors.phone && <p className="error-text">{formErrors.phone}</p>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={shippingInfo.address}
                onChange={handleInputChange}
                className={formErrors.address ? 'input-error' : ''}
                required
              />
              {formErrors.address && <p className="error-text">{formErrors.address}</p>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleInputChange}
                  className={formErrors.city ? 'input-error' : ''}
                  required
                />
                {formErrors.city && <p className="error-text">{formErrors.city}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleInputChange}
                  className={formErrors.state ? 'input-error' : ''}
                  required
                />
                {formErrors.state && <p className="error-text">{formErrors.state}</p>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zipCode">Zip Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={shippingInfo.zipCode}
                  onChange={handleInputChange}
                  className={formErrors.zipCode ? 'input-error' : ''}
                  maxLength={6}
                  required
                />
                {formErrors.zipCode && <p className="error-text">{formErrors.zipCode}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleInputChange}
                  className={formErrors.country ? 'input-error' : ''}
                  required
                />
                {formErrors.country && <p className="error-text">{formErrors.country}</p>}
              </div>
            </div>

            <div className="checkout-items">
              <h3>Order Summary</h3>
              {/* Order Items */}
              {cartItems.length > 0 ? cartItems.map((item, index) => {
                // Safely get item data with fallbacks
                const itemName = item.product?.name || 'Product';
                const itemPrice = parseFloat(item.product?.price || item.price || 0);
                const itemQuantity = item.quantity || 1;
                const itemTotal = itemPrice * itemQuantity;
                
                // Only render items with valid data
                if (!item.product) return null;
                
                return (
                  <div key={index} className="flex items-center justify-between border-b pb-4 mb-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 mr-4 overflow-hidden">
                        <img
                          src={item.product?.images && item.product.images.length > 0 
                            ? `http://localhost:4000/${item.product.images[0]}`
                            : '/placeholder-image.png'
                          }
                          alt={itemName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-image.png';
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{itemName}</h3>
                        <p className="text-sm text-gray-500">Qty: {itemQuantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">${itemTotal.toFixed(2)}</p>
                  </div>
                );
              }) : (
                <div className="text-center py-4">
                  <p>Your cart is empty</p>
                </div>
              )}
            </div>

            <div className="order-summary">
              <div className="summary-line">
                <span>Subtotal:</span>
                <span>${subTotal.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Tax (10%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Shipping:</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className="summary-line total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="place-order-btn"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 