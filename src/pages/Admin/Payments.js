import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaDownload, FaEye, FaCheckCircle, FaTimesCircle, FaSpinner, FaSearch, FaFileAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  
  // Get user authentication state
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  // Fetch payments data
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        
        // Check if user is admin
        if (!isAuthenticated || !isAdmin) {
          toast.error('Admin access required');
          return;
        }
        
        const response = await axios.get('http://localhost:4000/api/payments', {
          withCredentials: true
        });
        
        if (response.data && response.data.success) {
          setPayments(response.data.payments || []);
        } else {
          toast.error('Failed to load payments');
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast.error(error.response?.data?.message || 'Error loading payments');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && isAdmin) {
      fetchPayments();
    }
  }, [isAuthenticated, isAdmin]);
  
  // Filter payments based on search query, status, and date
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchQuery 
      ? payment.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.paymentId?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesStatus = statusFilter 
      ? payment.status === statusFilter 
      : true;
      
    const matchesDate = dateFilter
      ? new Date(payment.createdAt).toISOString().split('T')[0] === dateFilter
      : true;
      
    return matchesSearch && matchesStatus && matchesDate;
  });
  
  // Update payment status
  const handleUpdateStatus = async (paymentId, newStatus) => {
    try {
      setProcessingAction(true);
      
      const response = await axios.put(
        `http://localhost:4000/api/payments/${paymentId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      
      if (response.data && response.data.success) {
        // Update payment in state
        setPayments(prev => 
          prev.map(payment => 
            payment._id === paymentId
              ? { ...payment, status: newStatus }
              : payment
          )
        );
        
        if (selectedPayment && selectedPayment._id === paymentId) {
          setSelectedPayment({ ...selectedPayment, status: newStatus });
        }
        
        toast.success(`Payment status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error(error.response?.data?.message || 'Error updating payment status');
    } finally {
      setProcessingAction(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return parseFloat(amount).toFixed(2);
  };
  
  return (
    <div className="w-full py-10 px-4 bg-gray-50">
      <div className="max-w-container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Payment Management</h1>
            <p className="text-gray-600 mt-1">View and manage all customer payments</p>
          </div>
          <Link to="/admin/dashboard" className="text-blue-600 hover:underline font-medium">
            Back to Dashboard
          </Link>
        </div>
        
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Search by order ID, payment ID or customer..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primeColor"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <select 
              className="py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primeColor bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
            
            <input 
              type="date" 
              className="py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primeColor"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
        
        {/* Payments Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primeColor"></div>
          </div>
        ) : filteredPayments.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Payment ID</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Order ID</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Customer</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Date</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Amount</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Method</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Status</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4">{payment.paymentId}</td>
                      <td className="py-3 px-4">{payment.order.orderId}</td>
                      <td className="py-3 px-4">{payment.customerName}</td>
                      <td className="py-3 px-4">{formatDate(payment.createdAt)}</td>
                      <td className="py-3 px-4">${formatCurrency(payment.amount)}</td>
                      <td className="py-3 px-4 capitalize">{payment.paymentMethod}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${payment.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          payment.status === 'Failed' ? 'bg-red-100 text-red-800' : 
                          payment.status === 'Refunded' ? 'bg-purple-100 text-purple-800' : 
                          'bg-yellow-100 text-yellow-800'}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedPayment(payment);
                              setDetailsModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          
                          {payment.receiptUrl && (
                            <a 
                              href={payment.receiptUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800"
                              title="Download Receipt"
                            >
                              <FaDownload />
                            </a>
                          )}
                          
                          {payment.paymentMethod === 'bankTransfer' && payment.bankSlipUrl && (
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setSlipModalOpen(true);
                              }}
                              className="text-purple-600 hover:text-purple-800"
                              title="View Bank Slip"
                            >
                              <FaFileAlt />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaFileAlt className="text-3xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No Payments Found</h2>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter || dateFilter 
                ? "No payments match your current filters. Try adjusting your search criteria."
                : "There are no payment records in the system yet."}
            </p>
          </div>
        )}
      </div>
      
      {/* Payment Details Modal */}
      {detailsModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Payment Details</h2>
                <button 
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setSelectedPayment(null);
                  }} 
                  className="text-gray-500 hover:text-gray-800"
                >
                  <FaTimesCircle />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h3 className="font-semibold text-xl">Payment #{selectedPayment.paymentId}</h3>
                    <p className="text-gray-600">{formatDate(selectedPayment.createdAt)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium 
                    ${selectedPayment.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    selectedPayment.status === 'Failed' ? 'bg-red-100 text-red-800' : 
                    selectedPayment.status === 'Refunded' ? 'bg-purple-100 text-purple-800' : 
                    'bg-yellow-100 text-yellow-800'}`}
                  >
                    {selectedPayment.status}
                  </span>
                </div>
              </div>
              
              {/* Payment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Payment Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="mb-2"><span className="font-medium">Amount:</span> ${formatCurrency(selectedPayment.amount)}</p>
                    <p className="mb-2"><span className="font-medium">Method:</span> {selectedPayment.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Transfer'}</p>
                    <p className="mb-2"><span className="font-medium">Status:</span> {selectedPayment.status}</p>
                    {selectedPayment.paymentMethod === 'card' && (
                      <p className="mb-2"><span className="font-medium">Card:</span> **** **** **** {selectedPayment.cardLastFour}</p>
                    )}
                    {selectedPayment.paymentMethod === 'bankTransfer' && (
                      <>
                        <p className="mb-2"><span className="font-medium">Bank:</span> {selectedPayment.bankName}</p>
                        <p className="mb-2"><span className="font-medium">Account Name:</span> {selectedPayment.accountName}</p>
                        <p className="mb-2"><span className="font-medium">Reference:</span> {selectedPayment.referenceNumber}</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Order Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="mb-2"><span className="font-medium">Order ID:</span> {selectedPayment.order.orderId}</p>
                    <p className="mb-2"><span className="font-medium">Order Date:</span> {formatDate(selectedPayment.order.createdAt)}</p>
                    <p className="mb-2"><span className="font-medium">Customer:</span> {selectedPayment.customerName}</p>
                    <p className="mb-2"><span className="font-medium">Email:</span> {selectedPayment.customerEmail}</p>
                    <Link 
                      to={`/admin/orders/${selectedPayment.order._id}`}
                      className="text-blue-600 hover:underline mt-2 inline-block"
                    >
                      View Order Details
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Admin Actions */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-lg mb-3">Update Payment Status</h3>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleUpdateStatus(selectedPayment._id, 'Completed')} 
                    className={`px-4 py-2 rounded-md flex items-center gap-1 ${
                      selectedPayment.status === 'Completed' 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    disabled={selectedPayment.status === 'Completed' || processingAction}
                  >
                    {processingAction ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />} Mark as Completed
                  </button>
                  
                  <button 
                    onClick={() => handleUpdateStatus(selectedPayment._id, 'Failed')}
                    className={`px-4 py-2 rounded-md flex items-center gap-1 ${
                      selectedPayment.status === 'Failed' 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                    disabled={selectedPayment.status === 'Failed' || processingAction}
                  >
                    {processingAction ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />} Mark as Failed
                  </button>
                  
                  <button 
                    onClick={() => handleUpdateStatus(selectedPayment._id, 'Refunded')}
                    className={`px-4 py-2 rounded-md flex items-center gap-1 ${
                      selectedPayment.status === 'Refunded' 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                    disabled={selectedPayment.status === 'Refunded' || processingAction}
                  >
                    {processingAction ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />} Mark as Refunded
                  </button>
                </div>
              </div>
              
              {/* Close Button */}
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setSelectedPayment(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Bank Slip Image Modal */}
      {slipModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-lg">
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Bank Transfer Slip</h3>
              <button 
                onClick={() => setSlipModalOpen(false)} 
                className="text-gray-500 hover:text-gray-800"
              >
                <FaTimesCircle />
              </button>
            </div>
            {selectedPayment.bankSlipUrl ? (
              <div className="flex justify-center p-4">
                {selectedPayment.bankSlipType?.startsWith('image/') ? (
                  <img 
                    src={selectedPayment.bankSlipUrl} 
                    alt="Bank transfer slip" 
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <FaFileAlt className="text-5xl mx-auto mb-4 text-gray-400" />
                    <p>This is a PDF document.</p>
                    <a 
                      href={selectedPayment.bankSlipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline mt-4 inline-block"
                    >
                      Open PDF Document
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-600">Bank slip image not available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments; 