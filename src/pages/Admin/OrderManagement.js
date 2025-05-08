import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaEye, FaCheck, FaTimes, FaDownload, FaRegCreditCard, FaUniversity, FaMoneyBill } from 'react-icons/fa';
import { FiFilter, FiSearch, FiArrowLeft, FiEye, FiCheck, FiX } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { getAllOrders, updateOrderStatus } from '../../services/orderServices';
import { updatePaymentStatus } from '../../services/paymentServices';

const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [viewingSlip, setViewingSlip] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  
  // Auth state
  const { user } = useSelector((state) => state.auth);

  // Fetch all orders with payment details
  useEffect(() => {
    const fetchOrdersAndPayments = async () => {
      try {
        setLoading(true);
        
        // Get all orders
        const ordersResponse = await getAllOrders();
        if (ordersResponse && ordersResponse.success) {
          setOrders(ordersResponse.data || []);
          
          // Fetch all payments at once
          try {
            const paymentsResponse = await axios.get(`http://localhost:4000/api/payments`, {
              withCredentials: true
            });
            
            if (paymentsResponse.data && paymentsResponse.data.success) {
              const allPayments = paymentsResponse.data.data || [];
              
              // Create a map of orderId -> payment
              const paymentMap = {};
              
              // Process each order to find its payment
              ordersResponse.data.forEach(order => {
                const orderId = order._id.toString();
                
                // Find payment for this order with proper type checking
                const orderPayment = allPayments.find(p => {
                  // Skip if payment order is null
                  if (!p.order) return false;
                  
                  // If payment order is a string, compare directly
                  if (typeof p.order === 'string') {
                    return p.order === orderId;
                  }
                  
                  // If payment order is an object, check its _id
                  if (typeof p.order === 'object') {
                    return (p.order._id && p.order._id.toString() === orderId) || p.order._id === orderId;
                  }
                  
                  return false;
                });
                
                if (orderPayment) {
                  paymentMap[orderId] = orderPayment;
                }
              });
              
              setPayments(paymentMap);
            }
          } catch (paymentError) {
            console.error('Error fetching payments:', paymentError);
          }
        }
      } catch (error) {
        console.error('Error fetching orders and payments:', error);
        toast.error('Failed to load orders and payments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrdersAndPayments();
  }, []);

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery
      ? order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.user?.fName + ' ' + order.user?.lName)?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesStatus = filterStatus
      ? order.status === filterStatus
      : true;
      
    const matchesPayment = filterPayment
      ? (payments[order._id]?.paymentMethod === filterPayment)
      : true;
      
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Handle approving a bank transfer payment
  const handleApprovePayment = async () => {
    if (!selectedPayment || !selectedOrder) return;
    
    try {
      setProcessingAction(true);
      
      // Update payment status to completed
      const paymentResponse = await updatePaymentStatus(selectedPayment._id, 'completed', adminNote);
      
      if (paymentResponse && paymentResponse.success) {
        // Update order status to processing
        const orderResponse = await updateOrderStatus(selectedOrder._id, 'processing');
        
        if (orderResponse && orderResponse.success) {
          // Update local state
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order._id === selectedOrder._id 
                ? { ...order, status: 'processing', paymentStatus: 'completed' } 
                : order
            )
          );
          
          setPayments(prevPayments => ({
            ...prevPayments,
            [selectedOrder._id]: {
              ...prevPayments[selectedOrder._id],
              status: 'completed'
            }
          }));
          
          toast.success('Payment approved and order moved to processing');
        }
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      toast.error(error.response?.data?.message || 'Failed to approve payment');
    } finally {
      setProcessingAction(false);
      setApproveModalOpen(false);
      setAdminNote('');
    }
  };

  // Handle rejecting a bank transfer payment
  const handleRejectPayment = async () => {
    if (!selectedPayment || !selectedOrder) return;
    
    try {
      setProcessingAction(true);
      
      // Update payment status to failed
      const paymentResponse = await updatePaymentStatus(selectedPayment._id, 'failed', adminNote);
      
      if (paymentResponse && paymentResponse.success) {
        // Update local state
        setPayments(prevPayments => ({
          ...prevPayments,
          [selectedOrder._id]: {
            ...prevPayments[selectedOrder._id],
            status: 'failed'
          }
        }));
        
        toast.success('Payment marked as failed');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error(error.response?.data?.message || 'Failed to reject payment');
    } finally {
      setProcessingAction(false);
      setRejectModalOpen(false);
      setAdminNote('');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  // Get payment status badge
  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-3 py-1 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-full text-xs font-medium">Completed</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>;
      case 'failed':
        return <span className="px-3 py-1 bg-gradient-to-r from-red-50 to-red-100 text-red-700 rounded-full text-xs font-medium">Failed</span>;
      default:
        return <span className="px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-full text-xs font-medium">{status || 'Unknown'}</span>;
    }
  };

  // Bank slip view modal
  const BankSlipModal = () => {
    if (!selectedPayment || !viewingSlip) return null;
    
    // In a real application, this would show the actual uploaded bank slip
    // For demonstration, we're showing a placeholder
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Bank Transfer Slip</h3>
            <button 
              onClick={() => setViewingSlip(false)}
              className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors duration-150"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="font-medium mb-3 text-gray-700">Payment Details:</h4>
            <p className="mb-2"><span className="font-medium">Bank Name:</span> {selectedPayment.bankTransferDetails?.bankName || 'N/A'}</p>
            <p className="mb-2"><span className="font-medium">Account Name:</span> {selectedPayment.bankTransferDetails?.accountName || 'N/A'}</p>
            <p className="mb-2"><span className="font-medium">Reference:</span> {selectedPayment.bankTransferDetails?.reference || 'N/A'}</p>
            <p className="mb-2"><span className="font-medium">Amount:</span> ${selectedPayment.amount?.toFixed(2) || '0.00'}</p>
            <p className="mb-2"><span className="font-medium">Date:</span> {formatDate(selectedPayment.createdAt)}</p>
          </div>
          
          {selectedPayment.bankTransferDetails?.slipImage && (
            <div className="bg-gray-50 rounded-xl overflow-hidden mb-6 border border-gray-100">
              <img 
                src={`http://localhost:4000/${selectedPayment.bankTransferDetails.slipImage}`}
                alt="Bank Transfer Slip"
                className="w-full h-auto max-h-[400px] object-contain"
              />
            </div>
          )}
          
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => {
                setViewingSlip(false);
                setSelectedOrder({_id: selectedPayment.order});
                setSelectedPayment(selectedPayment);
                setApproveModalOpen(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium flex items-center shadow-md"
              disabled={selectedPayment.status === 'completed'}
            >
              <FiCheck className="mr-2" />
              Approve Payment
            </button>
            
            <button
              onClick={() => {
                setViewingSlip(false);
                setSelectedOrder({_id: selectedPayment.order});
                setSelectedPayment(selectedPayment);
                setRejectModalOpen(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium flex items-center shadow-md"
              disabled={selectedPayment.status === 'failed'}
            >
              <FiX className="mr-2" />
              Reject Payment
            </button>
            
            <button
              onClick={() => setViewingSlip(false)}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Payment approval confirmation modal
  const ApprovalConfirmationModal = () => {
    if (!selectedPayment || !approveModalOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Approve Payment?</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to approve this bank transfer payment? This will mark the payment as completed and move the order to processing.
          </p>
          
          <div className="mb-6">
            <label htmlFor="adminNote" className="block text-gray-700 font-medium mb-2">Admin Note (Optional)</label>
            <textarea
              id="adminNote"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Add any notes about this payment approval..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setApproveModalOpen(false)}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              disabled={processingAction}
            >
              Cancel
            </button>
            <button
              onClick={handleApprovePayment}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md"
              disabled={processingAction}
            >
              {processingAction ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Confirm Approval'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Payment rejection confirmation modal
  const RejectionConfirmationModal = () => {
    if (!selectedPayment || !rejectModalOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Reject Payment?</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to reject this bank transfer payment? This will mark the payment as failed.
          </p>
          
          <div className="mb-6">
            <label htmlFor="adminNote" className="block text-gray-700 font-medium mb-2">Rejection Reason (Optional)</label>
            <textarea
              id="adminNote"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Add a reason for rejecting this payment..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              disabled={processingAction}
            >
              Cancel
            </button>
            <button
              onClick={handleRejectPayment}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-md"
              disabled={processingAction}
            >
              {processingAction ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium group"
        >
          <div className="bg-white p-2 rounded-full shadow-md mr-3 group-hover:bg-blue-50 transition-colors duration-200">
            <FiArrowLeft className="text-blue-600" />
          </div>
          Back to Dashboard
        </button>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <h1 className="text-2xl font-semibold mb-4 sm:mb-0">Order Management</h1>
              <p className="text-white text-opacity-90">Manage and process customer orders and payments</p>
            </div>
          </div>
          
          <div className="p-6">
            {/* Search & Filters */}
            <div className="mb-8 bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search by order ID or customer..." 
                      className="w-full p-3 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
                  </div>
                </div>
                
                <div className="w-full md:w-1/4">
                  <div className="relative">
                    <select 
                      className="w-full p-3 pl-12 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">All Order Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
                  </div>
                </div>
                
                <div className="w-full md:w-1/4">
                  <div className="relative">
                    <select 
                      className="w-full p-3 pl-12 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      value={filterPayment}
                      onChange={(e) => setFilterPayment(e.target.value)}
                    >
                      <option value="">All Payment Methods</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="bankTransfer">Bank Transfer</option>
                      <option value="cash_on_delivery">Cash on Delivery</option>
                    </select>
                    <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Orders Table */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="overflow-hidden rounded-xl shadow-lg border border-gray-100 bg-white backdrop-blur-sm bg-opacity-90">
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                        <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
                        <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                        <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                        <th className="py-4 px-6 text-center font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => {
                        const payment = payments[order._id];
                        return (
                          <tr key={order._id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150">
                            <td className="py-4 px-6 font-medium text-gray-800">{order._id.substring(0, 8)}...</td>
                            <td className="py-4 px-6 text-gray-600">{formatDate(order.createdAt)}</td>
                            <td className="py-4 px-6 text-gray-800">
                              {order.user?.fName} {order.user?.lName}
                            </td>
                            <td className="py-4 px-6 font-medium">${(order.totalAmount || 0).toFixed(2)}</td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                ${order.status === 'delivered' ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700' : 
                                order.status === 'cancelled' ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700' : 
                                order.status === 'processing' ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700' : 
                                order.status === 'shipped' ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700' :
                                'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700'}`}
                              >
                                {order.status || 'Pending'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <span className="mr-2">
                                  {getPaymentMethodIcon(payment?.paymentMethod)}
                                </span>
                                <span>
                                  {payment?.paymentMethod === 'card' 
                                    ? 'Credit/Debit Card' 
                                    : payment?.paymentMethod === 'bankTransfer' 
                                      ? 'Bank Transfer'
                                      : payment?.paymentMethod === 'cash_on_delivery'
                                        ? 'Cash on Delivery'
                                        : 'Unknown'}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              {getPaymentStatusBadge(payment?.status)}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center space-x-3">
                                <Link
                                  to={`/admin/orders/${order._id}`}
                                  className="text-gray-600 hover:text-blue-600 transition-colors duration-150 bg-gray-100 hover:bg-blue-100 p-2 rounded-full"
                                  title="View order details"
                                >
                                  <FiEye />
                                </Link>
                                
                                {/* Show View Slip button for bank transfers */}
                                {payment && payment.paymentMethod === 'bankTransfer' && payment.status === 'pending' && (
                                  <button
                                    onClick={() => {
                                      setSelectedPayment(payment);
                                      setViewingSlip(true);
                                    }}
                                    className="text-gray-600 hover:text-green-600 transition-colors duration-150 bg-gray-100 hover:bg-green-100 p-2 rounded-full"
                                    title="View bank transfer slip"
                                  >
                                    <FaDownload />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white p-10 rounded-xl shadow-md text-center border border-gray-100">
                <p className="text-xl font-semibold mb-3 text-gray-800">No Orders Found</p>
                <p className="text-gray-600">
                  {searchQuery || filterStatus || filterPayment
                    ? 'No orders match your search criteria. Try adjusting your filters.'
                    : 'There are no orders in the system yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <BankSlipModal />
      <ApprovalConfirmationModal />
      <RejectionConfirmationModal />
    </div>
  );
};

export default OrderManagement; 