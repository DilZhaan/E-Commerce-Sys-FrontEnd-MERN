import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaSearch, FaEye, FaTimes, FaDownload, FaMoneyBillWave, FaCreditCard, FaTrash, FaBroom } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { clearCancelledOrders, clearAllCancelledOrders, cancelOrder, getUserOrders, getAllOrders } from '../../services/orderServices';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [clearingOrders, setClearingOrders] = useState(false);
  
  // Get current user
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        // Use the service functions instead of direct axios calls
        if (isAdmin) {
          response = await getAllOrders();
        } else {
          response = await getUserOrders();
        }
        
        console.log('Orders API response:', response);
        
        if (response && response.success) {
          setOrders(response.data || []);
          console.log('Orders loaded:', response.data.length);
        } else {
          toast.error('Failed to load orders');
          setError('Failed to load orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error(error.response?.data?.message || 'Error loading orders');
        setError(error.response?.data?.message || 'Error loading orders');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, isAdmin]);

  // Filter orders based on search query, status, and date
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery 
      ? order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.user?.fName + ' ' + order.user?.lName)?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesStatus = filterStatus 
      ? order.status?.toLowerCase() === filterStatus.toLowerCase()
      : true;
      
    const matchesDate = dateFilter
      ? new Date(order.createdAt).toISOString().split('T')[0] === dateFilter
      : true;
      
    return matchesSearch && matchesStatus && matchesDate;
  });
  
  // Handle order cancellation
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      // Use the service function instead of direct axios call
      const response = await cancelOrder(selectedOrder._id);
      
      if (response && response.success) {
        // Update the order status in the local state
        setOrders(prev => 
          prev.map(order => 
            order._id === selectedOrder._id 
              ? { ...order, status: 'cancelled' } 
              : order
          )
        );
        
        toast.success('Order cancelled successfully');
      } else {
        toast.error('Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Error cancelling order');
    } finally {
      setCancelModalOpen(false);
      setSelectedOrder(null);
    }
  };
  
  // Handle clearing all cancelled orders
  const handleClearCancelledOrders = async () => {
    try {
      setClearingOrders(true);
      
      // Call the appropriate function based on user role
      const response = isAdmin 
        ? await clearAllCancelledOrders() 
        : await clearCancelledOrders();
      
      if (response && response.success) {
        // Remove all cancelled orders from the local state
        setOrders(prev => prev.filter(order => order.status !== 'cancelled'));
        
        const count = response.count || 0;
        if (count > 0) {
          toast.success(`${count} cancelled ${count === 1 ? 'order' : 'orders'} cleared successfully`);
        } else {
          toast.info('No cancelled orders to clear');
        }
      } else {
        toast.error('Failed to clear cancelled orders');
      }
    } catch (error) {
      console.error('Error clearing cancelled orders:', error);
      toast.error(error.response?.data?.message || 'Error clearing cancelled orders');
    } finally {
      setClearingOrders(false);
      setClearModalOpen(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate total items in an order
  const getTotalItems = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  };
  
  // Order detail modal
  const OrderDetailModal = () => {
    if (!selectedOrder) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Order Information</h3>
                <p><span className="font-medium">Order ID:</span> {selectedOrder._id}</p>
                <p><span className="font-medium">Date:</span> {formatDate(selectedOrder.createdAt)}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium 
                    ${selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                    selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                    selectedOrder.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                    selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'}`}
                  >
                    {selectedOrder.status}
                  </span>
                </p>
                {selectedOrder.paymentInfo && (
                  <p><span className="font-medium">Payment Status:</span> 
                    {selectedOrder.paymentInfo.status === 'completed' ? 
                      <span className="text-green-600 ml-2">Paid</span> : 
                      <span className="text-red-600 ml-2">Unpaid</span>
                    }
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Shipping Address</h3>
                {selectedOrder.shippingAddress ? (
                  <>
                    <p><span className="font-medium">Name:</span> {selectedOrder.shippingAddress.fullName}</p>
                    <p><span className="font-medium">Address:</span> {selectedOrder.shippingAddress.address}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                    <p><span className="font-medium">Country:</span> {selectedOrder.shippingAddress.country}</p>
                    <p><span className="font-medium">Phone:</span> {selectedOrder.shippingAddress.phone}</p>
                  </>
                ) : (
                  <p>No shipping information available</p>
                )}
              </div>
            </div>
            
            <h3 className="font-semibold text-lg mb-3">Order Items</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left font-semibold text-gray-600">Product</th>
                    <th className="py-2 px-4 text-left font-semibold text-gray-600">Price</th>
                    <th className="py-2 px-4 text-left font-semibold text-gray-600">Quantity</th>
                    <th className="py-2 px-4 text-left font-semibold text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items && selectedOrder.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-3 px-4">{item.name || 'Product'}</td>
                      <td className="py-3 px-4">${(item.price || 0).toFixed(2)}</td>
                      <td className="py-3 px-4">{item.quantity}</td>
                      <td className="py-3 px-4">${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg mb-2">
                <span className="font-semibold">Subtotal:</span>
                <span>${selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-lg mb-2">
                <span className="font-semibold">Shipping:</span>
                <span>${(selectedOrder.shippingCost || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-2 pt-2 border-t">
                <span>Total:</span>
                <span>${((selectedOrder.totalAmount || 0) + (selectedOrder.shippingCost || 0)).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              <button 
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
              
              {!['delivered', 'cancelled'].includes(selectedOrder.status) && (
                <button 
                  onClick={() => {
                    setModalOpen(false);
                    setCancelModalOpen(true);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Cancel Order
                </button>
              )}
              
              {selectedOrder.status === 'pending' && !selectedOrder.isPaid && (
                <Link 
                  to={`/payment/${selectedOrder._id}`}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                >
                  <FaCreditCard className="mr-2" /> Make Payment
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Cancel confirmation modal
  const CancelConfirmationModal = () => {
    if (!selectedOrder) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <h3 className="text-xl font-semibold mb-4">Cancel Order?</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              No, Keep Order
            </button>
            <button
              onClick={handleCancelOrder}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Yes, Cancel Order
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Clear cancelled orders confirmation modal
  const ClearCancelledOrdersModal = () => {
    // Count cancelled orders
    const cancelledOrdersCount = orders.filter(order => order.status === 'cancelled').length;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <h3 className="text-xl font-semibold mb-4">Clear Cancelled Orders?</h3>
          
          {cancelledOrdersCount > 0 ? (
            <p className="text-gray-600 mb-6">
              Are you sure you want to permanently delete {cancelledOrdersCount} cancelled {cancelledOrdersCount === 1 ? 'order' : 'orders'}? This action cannot be undone.
            </p>
          ) : (
            <p className="text-gray-600 mb-6">
              There are no cancelled orders to clear.
            </p>
          )}
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setClearModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            
            {cancelledOrdersCount > 0 && (
              <button
                onClick={handleClearCancelledOrders}
                disabled={clearingOrders}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
              >
                {clearingOrders ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaTrash className="mr-2" />
                    Yes, Clear Orders
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full py-10 px-4 bg-gray-50">
      <div className="max-w-container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{isAdmin ? 'All Orders' : 'My Orders'}</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? 'Manage customer orders' : 'Track and manage your orders'}
            </p>
          </div>
          <Link to="/dashboard" className="text-blue-600 hover:underline font-medium">
            Back to Dashboard
          </Link>
        </div>
        
        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder={isAdmin ? "Search by order ID or customer..." : "Search orders..."} 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primeColor"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <select 
              className="py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primeColor bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <input 
              type="date" 
              className="py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primeColor"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
        
        {/* Management Actions */}
        <div className="flex justify-end mb-6">
          {/* Only show the button if there are cancelled orders */}
          {orders.some(order => order.status === 'cancelled') && (
            <button
              onClick={() => setClearModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaBroom />
              Clear Cancelled Orders
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primeColor"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-lg text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primeColor text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Order ID</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Date</th>
                    {isAdmin && (
                      <th className="py-3 px-4 text-left font-semibold text-gray-600">Customer</th>
                    )}
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Items</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Total</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Status</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{order._id.substring(0, 8)}...</td>
                      <td className="py-3 px-4">{formatDate(order.createdAt)}</td>
                      {isAdmin && (
                        <td className="py-3 px-4">
                          {order.user?.fName} {order.user?.lName}
                        </td>
                      )}
                      <td className="py-3 px-4">{getTotalItems(order.items)} items</td>
                      <td className="py-3 px-4">${(order.totalAmount || 0).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'}`}
                        >
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Order"
                          >
                            <FaEye />
                          </button>
                          
                          {/* Show cancel button only for pending orders */}
                          {order.status === 'pending' && (
                            <button 
                              onClick={() => {
                                setSelectedOrder(order);
                                setCancelModalOpen(true);
                              }}
                              className="text-red-600 hover:text-red-800"
                              title="Cancel Order"
                            >
                              <FaTimes />
                            </button>
                          )}

                          {/* Payment button */}
                          {order.status === 'pending' && !order.isPaid && (
                            <Link 
                              to={`/payment/${order._id}`}
                              className="text-green-600 hover:text-green-800"
                              title="Make Payment"
                            >
                              <FaCreditCard />
                            </Link>
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
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <FaClipboardList className="mx-auto mb-4 text-gray-400 text-5xl" />
            <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus || dateFilter 
                ? 'No orders match your search criteria. Try adjusting your filters.'
                : "You haven't placed any orders yet."}
            </p>
            <Link 
              to="/shop" 
              className="inline-block px-6 py-3 bg-primeColor text-white rounded-lg hover:bg-blue-600"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
      
      {/* Modals */}
      {modalOpen && <OrderDetailModal />}
      {cancelModalOpen && <CancelConfirmationModal />}
      {clearModalOpen && <ClearCancelledOrdersModal />}
    </div>
  );
};

export default Orders; 