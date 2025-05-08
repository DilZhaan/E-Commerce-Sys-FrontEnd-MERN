import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTruck, FaInfoCircle, FaShoppingBag, FaSpinner } from 'react-icons/fa';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:4000/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log('Order details response:', response.data);
        
        if (response.data && response.data.data) {
          setOrder(response.data.data);
        } else {
          setError('Order details not found');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to fetch order details');
        toast.error('Could not load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0.00';
    return parseFloat(amount).toFixed(2);
  };

  if (loading) {
    return (
      <div className="order-confirmation-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-confirmation-container">
        <div className="error-container">
          <FaInfoCircle size={40} color="#dc3545" />
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <Link to="/dashboard/orders" className="btn-primary">View My Orders</Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-confirmation-container">
        <div className="error-container">
          <FaInfoCircle size={40} color="#dc3545" />
          <h2>Order Not Found</h2>
          <p>We couldn't find the order you're looking for.</p>
          <Link to="/dashboard/orders" className="btn-primary">View My Orders</Link>
        </div>
      </div>
    );
  }

  // Extract shipping information - handle different property names in API
  const shippingInfo = order.shippingAddress || order.shippingInfo || {};
  
  // Extract payment information
  const paymentInfo = order.paymentInfo || {};
  const paymentStatus = paymentInfo.status || order.paymentStatus || 'unpaid';
  const paymentMethod = paymentInfo.method || order.paymentMethod || 'Not specified';
  
  // Extract order items
  const items = order.items || order.orderItems || [];

  return (
    <div className="order-confirmation-container">
      <div className="order-success">
        <div className="check-container">
          <div className="check-icon"></div>
        </div>
        <h1>Thank You for Your Order!</h1>
        <p className="success-message">Your order has been placed successfully.</p>
      </div>

      <div className="order-details">
        <h2>Order Details</h2>
        <div className="detail-row">
          <span>Order Number:</span>
          <span>{order._id}</span>
        </div>
        <div className="detail-row">
          <span>Order Date:</span>
          <span>{formatDate(order.createdAt)}</span>
        </div>
        <div className="detail-row">
          <span>Order Status:</span>
          <span className={`status status-${order.status}`}>{order.status}</span>
        </div>
        <div className="detail-row">
          <span>Payment Method:</span>
          <span>{paymentMethod}</span>
        </div>
        <div className="detail-row">
          <span>Payment Status:</span>
          <span className={`status status-${paymentStatus}`}>{paymentStatus}</span>
        </div>
      </div>

      <div className="shipping-details">
        <h2>Shipping Details</h2>
        {shippingInfo && (
          <>
            <div className="detail-row">
              <span>Name:</span>
              <span>{shippingInfo.fullName || shippingInfo.name || 'Not provided'}</span>
            </div>
            <div className="detail-row">
              <span>Address:</span>
              <span>
                {shippingInfo.address || 'Not provided'}, 
                {shippingInfo.city || 'Not provided'}, 
                {shippingInfo.state || 'Not provided'} {shippingInfo.postalCode || shippingInfo.zipCode || 'Not provided'}
              </span>
            </div>
            <div className="detail-row">
              <span>Country:</span>
              <span>{shippingInfo.country || 'Not provided'}</span>
            </div>
            <div className="detail-row">
              <span>Phone:</span>
              <span>{shippingInfo.phone || 'Not provided'}</span>
            </div>
          </>
        )}
      </div>

      <div className="order-items">
        <h2>Order Items</h2>
        <div className="items-list">
          {items && items.length > 0 ? (
            items.map((item, index) => {
              const itemName = item.name || (item.product && item.product.name) || 'Product';
              const itemPrice = item.price || (item.product && item.product.price) || 0;
              const itemQuantity = item.quantity || 1;
              const itemImage = item.image || (item.product && item.product.images && item.product.images[0]);
              const imageUrl = itemImage && itemImage.startsWith('http') 
                ? itemImage 
                : `http://localhost:4000${itemImage}`;

              return (
                <div className="order-item" key={index}>
                  <div className="item-image">
                    <img 
                      src={imageUrl} 
                      alt={itemName} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  <div className="item-details">
                    <h3>{itemName}</h3>
                    <p className="item-price">${formatCurrency(itemPrice)} × {itemQuantity}</p>
                  </div>
                  <div className="item-total">
                    ${formatCurrency(itemPrice * itemQuantity)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-items">
              <p>No items found in this order.</p>
            </div>
          )}
        </div>
      </div>

      <div className="order-summary">
        <h2>Order Summary</h2>
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(order.subtotal || order.itemsPrice)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping:</span>
          <span>${formatCurrency(order.shippingCost || order.shippingPrice)}</span>
        </div>
        <div className="summary-row">
          <span>Tax:</span>
          <span>${formatCurrency(order.taxAmount || order.taxPrice)}</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>${formatCurrency(order.total || order.totalAmount || order.totalPrice)}</span>
        </div>
      </div>

      <div className="action-buttons">
        <Link to="/dashboard/orders" className="btn-secondary">View All Orders</Link>
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default OrderConfirmation; 