import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaShoppingBag, FaClipboardList, FaCreditCard, FaExclamationTriangle, FaUser, FaCog, FaUserCog, FaMoneyBillWave, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { getUserDashboardStats } from '../../services/dashboardServices';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    cartItemCount: 0,
    totalSpent: 0,
    recentOrders: [],
    issueCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const isEmployee = user?.role?.toUpperCase() === 'EMPLOYEE';
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getUserDashboardStats();
        
        if (response.success) {
          setUserStats(response.data);
        } else {
          setError("Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Error loading dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
            {user?.profilePic || user?.proPic ? (
              <img 
              src={`http://localhost:4000/${user.profilePic || user.proPic}`}
              alt="Profile" 
              className="w-full h-full object-cover"
            />
            
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaUser className="text-4xl text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {user?.fullName || `${user?.fName || ''} ${user?.lName || ''}`.trim() || 'Welcome'}
            </h1>
            <p className="text-gray-600 mb-4">{user?.role || 'Customer'}</p>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link 
                to="/profile" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FaCog /> Edit Profile
              </Link>
              
              {isAdmin && (
                <Link 
                  to="/admin/dashboard" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <FaUserCog /> Admin Dashboard
                </Link>
              )}
              
              {isEmployee && (
                <Link 
                  to="/employee-dashboard" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FaMoneyBillWave /> Employee Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<FaShoppingBag className="text-2xl text-blue-500" />}
          title="My Cart"
          value={items?.length || userStats.cartItemCount || 0}
          label="Items in cart"
          link="/cart"
          linkText="View Cart"
        />
        
        <StatCard 
          icon={<FaClipboardList className="text-2xl text-green-500" />}
          title="Orders"
          value={userStats.totalOrders || 0}
          label="Order history"
          link="/dashboard/orders"
          linkText="View Orders"
        />
        
        <StatCard 
          icon={<FaCreditCard className="text-2xl text-orange-500" />}
          title="Total Spent"
          value={formatCurrency(userStats.totalSpent)}
          label="All time purchases"
          link="/dashboard/payments"
          linkText="View Payments"
        />
        
        <StatCard 
          icon={<FaExclamationTriangle className="text-2xl text-red-500" />}
          title="Issues"
          value={userStats.issueCount || 0}
          label="Track your issues"
          link="/account/issues"
          linkText="View Issues"
        />
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : userStats.recentOrders && userStats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Order ID</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Amount</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {userStats.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm text-gray-900">{order.orderId}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{formatCurrency(order.totalAmount)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link 
                        to={`/dashboard/orders/${order._id}`}
                        className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No recent orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, label, link, linkText }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
      {link && (
        <Link 
          to={link}
          className="mt-4 inline-block text-blue-500 hover:text-blue-600 text-sm font-medium"
        >
          {linkText}
        </Link>
      )}
    </div>
  );
};

export default Dashboard; 