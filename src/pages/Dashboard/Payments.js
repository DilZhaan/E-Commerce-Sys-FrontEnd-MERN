import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaDownload, FaEye, FaSearch, FaFileAlt, FaCreditCard, FaMoneyBillWave, FaRegCreditCard } from 'react-icons/fa';
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
  const [connectionError, setConnectionError] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(null);
  
  // Get user auth state
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Fetch user payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setConnectionError(false);
      console.log("Fetching payments from:", 'http://localhost:4000/api/payments/my-payments');
      const response = await axios.get('http://localhost:4000/api/payments/my-payments', {
        withCredentials: true
      });
      
      console.log("Payments response:", response.data);
      
      if (response.data && response.data.success) {
        console.log("Setting payments:", response.data.payments || []);
        setPayments(response.data.payments || response.data.data || []);
      } else {
        console.error("Failed to load payments, response:", response.data);
        toast.error('Failed to load payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setConnectionError(true);
      
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        toast.error(`Error: ${error.response.data?.message || error.response.statusText || 'Failed to load payments'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('No response from server. Please check your connection.');
      } else {
        console.error('Error message:', error.message);
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments();
    }
  }, [isAuthenticated]);
  
  // Filter payments based on search query, status, and date
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchQuery 
      ? payment.order?.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return parseFloat(amount).toFixed(2);
  };
  
  // Download payment receipt
  const handleDownloadReceipt = async (paymentId) => {
    try {
      // Set downloading state
      setDownloadingReceipt(paymentId);
      
      // Show loading toast
      const toastId = toast.loading('Generating receipt...');
      
      try {
        // First try using the new route which handles redirects through our Redirect component
        window.location.href = `/dashboard/receipts/${paymentId}`;
        
        // Show success message
        toast.update(toastId, { 
          render: 'Receipt downloaded successfully', 
          type: 'success', 
          isLoading: false,
          autoClose: 3000
        });
      } catch (routeError) {
        console.warn('Error using route redirect for receipt, falling back to direct API call:', routeError);
        
        // Fallback to direct API call if the route doesn't work
        const link = document.createElement('a');
        link.href = `http://localhost:4000/api/payments/${paymentId}/receipt`;
        
        // Add auth cookies to the request by setting this attribute
        link.setAttribute('target', '_blank');
        
        // Append to document, click and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        toast.update(toastId, { 
          render: 'Receipt downloaded successfully', 
          type: 'success', 
          isLoading: false,
          autoClose: 3000
        });
      }
      
      // Clear downloading state after a delay to show feedback
      setTimeout(() => {
        setDownloadingReceipt(null);
      }, 2000);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
      setDownloadingReceipt(null);
    }
  };
  
  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return <FaCreditCard />;
      case 'bankTransfer':
        return <FaMoneyBillWave />;
      default:
        return <FaRegCreditCard />;
    }
  };
  
  // Get payment method display name
  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'bankTransfer':
        return 'Bank Transfer';
      default:
        return method;
    }
  };
  
  return (
    <div className="w-full py-10 px-4 bg-gray-50">
      <div className="max-w-container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Payments</h1>
            <p className="text-gray-600 mt-1">View your payment history and download receipts</p>
          </div>
          <Link to="/dashboard" className="text-blue-600 hover:underline font-medium">
            Back to Dashboard
          </Link>
        </div>
        
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Search by order ID or payment ID..." 
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
        
        {/* Payments List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primeColor"></div>
          </div>
        ) : connectionError ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaRegCreditCard className="text-3xl text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-6">
              We couldn't connect to the payment service. Please check your internet connection and try again.
            </p>
            <button 
              onClick={fetchPayments} 
              className="inline-block bg-primeColor text-white px-6 py-2 rounded-lg hover:bg-black transition duration-300"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredPayments.length > 0 ? (
          <div className="space-y-4">
            {filteredPayments.map(payment => (
              <div 
                key={payment._id} 
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                      <span className="block font-medium text-xl mb-1">Payment #{payment.paymentId}</span>
                      <span className="text-gray-500 text-sm">{formatDate(payment.createdAt)}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium mt-2 md:mt-0
                      ${payment.status.toUpperCase() === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                      payment.status.toUpperCase() === 'FAILED' ? 'bg-red-100 text-red-800' : 
                      payment.status.toUpperCase() === 'REFUNDED' ? 'bg-purple-100 text-purple-800' : 
                      'bg-yellow-100 text-yellow-800'}`}
                    >
                      {payment.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                      </div>
                      <div>
                        <span className="block text-sm text-gray-500">Payment Method</span>
                        <span className="font-medium">{getPaymentMethodName(payment.paymentMethod)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="block text-sm text-gray-500">Amount</span>
                      <span className="font-medium">${formatCurrency(payment.amount)}</span>
                    </div>
                    
                    <div>
                      <span className="block text-sm text-gray-500">Order ID</span>
                      <Link 
                        to={`/dashboard/orders`} 
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {payment.order?.orderId || 'N/A'}
                      </Link>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <button 
                      onClick={() => {
                        setSelectedPayment(payment);
                        setDetailsModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <FaEye /> View Details
                    </button>
                    
                    {payment.status.toUpperCase() === 'COMPLETED' && (
                      <button 
                        onClick={() => handleDownloadReceipt(payment._id)}
                        disabled={downloadingReceipt === payment._id}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primeColor text-white rounded-md hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {downloadingReceipt === payment._id ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <FaDownload /> Download Receipt
                          </>
                        )}
                      </button>
                    )}
                    
                    {payment.paymentMethod === 'bankTransfer' && payment.bankSlipUrl && (
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setSlipModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <FaFileAlt /> View Slip
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCreditCard className="text-3xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No Payments Found</h2>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter || dateFilter 
                ? "No payments match your current filters. Try adjusting your search criteria."
                : "You haven't made any payments yet."}
            </p>
            <Link to="/shop" className="inline-block bg-primeColor text-white px-6 py-2 rounded-lg hover:bg-black transition duration-300">
              Browse Products
            </Link>
          </div>
        )}
      </div>
      
      {/* Payment Details Modal */}
      {detailsModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Payment Details</h2>
                <button 
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setSelectedPayment(null);
                  }} 
                  className="text-gray-500 hover:text-gray-800 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h3 className="font-semibold text-xl">Payment #{selectedPayment.paymentId}</h3>
                    <p className="text-gray-600">{formatDate(selectedPayment.createdAt)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium 
                    ${selectedPayment.status.toUpperCase() === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                    selectedPayment.status.toUpperCase() === 'FAILED' ? 'bg-red-100 text-red-800' : 
                    selectedPayment.status.toUpperCase() === 'REFUNDED' ? 'bg-purple-100 text-purple-800' : 
                    'bg-yellow-100 text-yellow-800'}`}
                  >
                    {selectedPayment.status}
                  </span>
                </div>
              </div>
              
              {/* Payment Information */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Payment Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Amount</p>
                      <p className="font-medium">${formatCurrency(selectedPayment.amount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Payment Method</p>
                      <p className="font-medium">{getPaymentMethodName(selectedPayment.paymentMethod)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Payment ID</p>
                      <p className="font-medium">{selectedPayment.paymentId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Status</p>
                      <p className="font-medium">{selectedPayment.status}</p>
                    </div>
                  </div>
                  
                  {selectedPayment.paymentMethod === 'card' && selectedPayment.cardLastFour && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-gray-500 text-sm">Card Details</p>
                      <p className="font-medium">**** **** **** {selectedPayment.cardLastFour}</p>
                    </div>
                  )}
                  
                  {selectedPayment.paymentMethod === 'bankTransfer' && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-gray-500 text-sm mb-2">Bank Transfer Details</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 text-sm">Bank</p>
                          <p className="font-medium">{selectedPayment.bankName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Account Name</p>
                          <p className="font-medium">{selectedPayment.accountName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Reference Number</p>
                          <p className="font-medium">{selectedPayment.referenceNumber}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Receipt Link */}
                  {selectedPayment.status.toUpperCase() === 'COMPLETED' && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-gray-500 text-sm mb-2">Receipt</p>
                      <Link 
                        to={`/dashboard/receipts/${selectedPayment._id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <FaDownload className="text-sm" /> Download Payment Receipt
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Order Information */}
              {selectedPayment.order && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-2">Order Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500 text-sm">Order ID</p>
                        <p className="font-medium">{selectedPayment.order.orderId}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Order Date</p>
                        <p className="font-medium">{formatDate(selectedPayment.order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Items</p>
                        <p className="font-medium">{selectedPayment.order.items?.length || 0} items</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Order Status</p>
                        <p className="font-medium">{selectedPayment.order.status}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Link 
                        to="/dashboard/orders" 
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <FaEye className="text-sm" /> View Order Details
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                {selectedPayment.status.toUpperCase() === 'COMPLETED' && (
                  <button 
                    onClick={() => handleDownloadReceipt(selectedPayment._id)}
                    disabled={downloadingReceipt === selectedPayment._id}
                    className="flex items-center gap-1 px-4 py-2 bg-primeColor text-white rounded-md hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {downloadingReceipt === selectedPayment._id ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <FaDownload /> Download Receipt
                      </>
                    )}
                  </button>
                )}
                
                <button 
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setSelectedPayment(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
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
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-lg">
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Bank Transfer Slip</h3>
              <button 
                onClick={() => setSlipModalOpen(false)} 
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ×
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
                  <div className="text-center p-8">
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