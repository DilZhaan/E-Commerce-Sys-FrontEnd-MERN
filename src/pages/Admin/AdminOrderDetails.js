import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaRegCreditCard, FaUniversity, FaMoneyBill, FaEye, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { getOrderById, updateOrderStatus } from '../../services/orderServices';

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [viewingSlip, setViewingSlip] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch order details
        const orderResponse = await getOrderById(orderId);
        if (orderResponse && orderResponse.success) {
          setOrder(orderResponse.data);
          setNewStatus(orderResponse.data.status || 'pending');
          
          // Fetch payment details for this order
          try {
            // Get payment for this specific order
            const paymentResponse = await axios.get(`http://localhost:4000/api/payments`, {
              withCredentials: true
            });
            
            console.log("Payment response:", JSON.stringify(paymentResponse.data, null, 2));
            
            if (paymentResponse.data && paymentResponse.data.success) {
              // Find payment where payment.order equals orderId (handling all possible cases)
              const orderPayment = paymentResponse.data.data.find(p => {
                // If payment order is null, skip
                if (!p.order) return false;
                
                // If payment order is a string, compare directly
                if (typeof p.order === 'string') {
                  return p.order === orderId;
                }
                
                // If payment order is an object, check its _id
                if (typeof p.order === 'object') {
                  // Compare either as string or directly
                  return (p.order._id && p.order._id.toString() === orderId) || p.order._id === orderId;
                }
                
                return false;
              });
              
              if (orderPayment) {
                console.log("Found payment for order:", orderPayment);
                setPayment(orderPayment);
              } else {
                console.log("No payment found for order ID:", orderId);
              }
            }
          } catch (paymentError) {
            console.error('Error fetching payment:', paymentError);
          }
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Handle order status update
  const handleUpdateStatus = async () => {
    if (!order || newStatus === order.status) return;
    
    try {
      setProcessingAction(true);
      
      const response = await updateOrderStatus(orderId, newStatus);
      
      if (response && response.success) {
        setOrder(prev => ({ ...prev, status: newStatus }));
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setProcessingAction(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return <FaRegCreditCard className="text-blue-500" />;
      case 'bankTransfer':
        return <FaUniversity className="text-green-600" />;
      case 'cash_on_delivery':
        return <FaMoneyBill className="text-yellow-600" />;
      default:
        return null;
    }
  };

  // Get order status badge
  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Delivered</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Processing</span>;
      case 'shipped':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Shipped</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelled</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Pending</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status || 'Unknown'}</span>;
    }
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Failed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status || 'Unknown'}</span>;
    }
  };

  // Bank slip view modal
  const BankSlipModal = () => {
    if (!payment || !viewingSlip || payment.paymentMethod !== 'bankTransfer') return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Bank Transfer Slip</h3>
            <button 
              onClick={() => setViewingSlip(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Payment Details:</h4>
            <p><span className="font-medium">Bank Name:</span> {payment.bankTransferDetails?.bankName || 'N/A'}</p>
            <p><span className="font-medium">Account Name:</span> {payment.bankTransferDetails?.accountName || 'N/A'}</p>
            <p><span className="font-medium">Transfer Date:</span> {formatDate(payment.bankTransferDetails?.transferDate)}</p>
            <p><span className="font-medium">Reference Number:</span> {payment.bankTransferDetails?.referenceNumber || 'N/A'}</p>
          </div>
          
          {payment.bankSlip?.url ? (
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
              <img 
                src={payment.bankSlip.url} 
                alt="Bank Transfer Slip" 
                className="max-w-full max-h-96 object-contain"
              />
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-16 text-center">
              <p className="text-gray-500">No bank slip image available</p>
            </div>
          )}
          
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setViewingSlip(false)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full py-10 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Order Details</h1>
            <Link to="/admin/order-management" className="text-blue-600 hover:underline flex items-center">
              <FaArrowLeft className="mr-2" /> Back to Order Management
            </Link>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primeColor"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full py-10 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Order Details</h1>
            <Link to="/admin/order-management" className="text-blue-600 hover:underline flex items-center">
              <FaArrowLeft className="mr-2" /> Back to Order Management
            </Link>
          </div>
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-xl font-semibold mb-2">Order Not Found</p>
            <p className="text-gray-600">The order you're looking for doesn't exist or has been deleted.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-10 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Order Details</h1>
          <Link to="/admin/order-management" className="text-blue-600 hover:underline flex items-center">
            <FaArrowLeft className="mr-2" /> Back to Order Management
          </Link>
        </div>
        
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Order #{order._id}</h2>
              <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center">
                <span className="mr-2">Status:</span>
                {getOrderStatusBadge(order.status)}
              </div>
              {payment && (
                <div className="flex items-center mt-2">
                  <span className="mr-2">Payment:</span>
                  {getPaymentStatusBadge(payment.status)}
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex flex-col md:flex-row md:space-x-8">
              {/* Customer Info */}
              <div className="flex-1 mb-4 md:mb-0">
                <h3 className="text-lg font-medium mb-2">Customer</h3>
                <p className="mb-1">
                  {order.user?.fName} {order.user?.lName}
                </p>
                <p className="text-gray-600 mb-1">{order.user?.email}</p>
                <p className="text-gray-600">{order.user?.phone || 'No phone provided'}</p>
              </div>
              
              {/* Shipping Address */}
              <div className="flex-1 mb-4 md:mb-0">
                <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
                <p className="text-gray-600">{formatAddress(order.shippingAddress)}</p>
              </div>
              
              {/* Payment Method */}
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-2">Payment Method</h3>
                {payment ? (
                  <div className="flex items-center">
                    {getPaymentMethodIcon(payment.paymentMethod)}
                    <span className="ml-2">
                      {payment.paymentMethod === 'card' ? 'Credit/Debit Card' :
                       payment.paymentMethod === 'bankTransfer' ? 'Bank Transfer' :
                       payment.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' :
                       'Unknown'}
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-600">Payment information not available</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-3 px-4 text-left font-medium text-gray-600">Product</th>
                  <th className="py-3 px-4 text-center font-medium text-gray-600">Price</th>
                  <th className="py-3 px-4 text-center font-medium text-gray-600">Quantity</th>
                  <th className="py-3 px-4 text-right font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {item.product?.image ? (
                          <img 
                            src={item.product.image} 
                            alt={item.product.title} 
                            className="w-12 h-12 object-cover mr-4"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 mr-4"></div>
                        )}
                        <div>
                          <p className="font-medium">{item.product?.title || 'Product Unavailable'}</p>
                          <p className="text-gray-500 text-sm">SKU: {item.product?._id?.substring(0, 8) || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">${item.price?.toFixed(2) || '0.00'}</td>
                    <td className="py-3 px-4 text-center">{item.quantity}</td>
                    <td className="py-3 px-4 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="py-3 px-4 text-right font-medium">Subtotal:</td>
                  <td className="py-3 px-4 text-right">${order.subtotal?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="py-3 px-4 text-right font-medium">Shipping:</td>
                  <td className="py-3 px-4 text-right">${order.shippingCost?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="py-3 px-4 text-right font-medium">Tax:</td>
                  <td className="py-3 px-4 text-right">${order.tax?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr className="font-bold">
                  <td colSpan="3" className="py-3 px-4 text-right">Total:</td>
                  <td className="py-3 px-4 text-right">${order.totalAmount?.toFixed(2) || '0.00'}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        {/* Admin Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Admin Actions</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label htmlFor="orderStatus" className="block mb-2 text-sm font-medium text-gray-700">
                Update Order Status
              </label>
              <div className="flex">
                <select
                  id="orderStatus"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-primeColor"
                  disabled={processingAction}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={handleUpdateStatus}
                  disabled={processingAction || newStatus === order.status}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {processingAction ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
            </div>
            
            {payment && payment.status === 'completed' && (
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Payment Receipt
                </label>
                <button
                  onClick={() => {
                    window.open(`http://localhost:4000/api/payments/${payment._id}/receipt`, '_blank');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center w-full"
                >
                  <FaDownload className="mr-2" /> Download Receipt
                </button>
              </div>
            )}
            
            {payment && payment.paymentMethod === 'bankTransfer' && payment.bankSlip?.url && (
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Bank Transfer Slip
                </label>
                <button
                  onClick={() => setViewingSlip(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center w-full"
                >
                  <FaEye className="mr-2" /> View Bank Slip
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Order Notes */}
        {order.notes && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-2">Order Notes</h2>
            <p className="text-gray-600">{order.notes}</p>
          </div>
        )}
      </div>
      
      {/* Bank Slip Modal */}
      <BankSlipModal />
    </div>
  );
};

export default AdminOrderDetails; 