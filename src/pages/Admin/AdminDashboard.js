import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getAdminDashboardStats } from "../../services/dashboardServices";
import { formatDistanceToNow, isValid } from 'date-fns';
import { FaBox, FaShoppingCart, FaUsers, FaMoneyBillWave, FaArrowLeft, FaUserCog, FaFileAlt, FaCashRegister, FaStore } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    revenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getAdminDashboardStats();
        
        if (response.success) {
          const { totalProducts, totalOrders, pendingOrders, totalUsers, revenue, recentActivity } = response.data;
          
          setStats({
            totalProducts,
            totalOrders,
            pendingOrders,
            totalUsers,
            revenue,
          });
          
          // Ensure all activity timestamps are valid dates
          const validActivity = (recentActivity || []).map(activity => ({
            ...activity,
            timestamp: activity.timestamp && isValid(new Date(activity.timestamp)) 
              ? activity.timestamp 
              : new Date().toISOString()
          }));
          
          setRecentActivity(validActivity);
        } else {
          setError("Failed to load dashboard data. Please try again later.");
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatActivityTime = (timestamp) => {
    try {
      if (!timestamp || !isValid(new Date(timestamp))) {
        return 'Just now';
      }
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Just now';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header with Back Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.fullName || user?.fName}</p>
          </div>
        </div>
      </div>

      {/* Management Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Link 
          to="/admin/users" 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <FaUserCog className="text-xl text-blue-500" />
          </div>
          <span className="font-medium text-gray-900">User Management</span>
        </Link>

        <Link 
          to="/admin/products" 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <FaBox className="text-xl text-green-500" />
          </div>
          <span className="font-medium text-gray-900">Inventory Management</span>
        </Link>

        <Link 
          to="/admin/shop-products" 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
            <FaStore className="text-xl text-indigo-500" />
          </div>
          <span className="font-medium text-gray-900">Shop Products</span>
        </Link>

        <Link 
          to="/admin/order-management" 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
            <FaShoppingCart className="text-xl text-purple-500" />
          </div>
          <span className="font-medium text-gray-900">Order Management</span>
        </Link>

        <Link 
          to="/admin/issues" 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <FaFileAlt className="text-xl text-red-500" />
          </div>
          <span className="font-medium text-gray-900">Issue Management</span>
        </Link>

        <Link 
          to="/admin/finance" 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <FaCashRegister className="text-xl text-red-500" />
          </div>
          <span className="font-medium text-gray-900">Finance Management</span>
        </Link>
        
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<FaBox className="text-2xl text-blue-500" />}
          title="Total Products"
          value={stats.totalProducts}
          label="Active products"
          trend="+12%"
          trendUp={true}
        />
        
        <StatCard 
          icon={<FaShoppingCart className="text-2xl text-green-500" />}
          title="Total Orders"
          value={stats.totalOrders}
          label="All time orders"
          trend="+8%"
          trendUp={true}
        />
        
        <StatCard 
          icon={<FaUsers className="text-2xl text-purple-500" />}
          title="Total Users"
          value={stats.totalUsers}
          label="Registered users"
          trend="+5%"
          trendUp={true}
        />
        
        <StatCard 
          icon={<FaMoneyBillWave className="text-2xl text-orange-500" />}
          title="Total Revenue"
          value={formatCurrency(stats.revenue)}
          label="All time revenue"
          trend="+15%"
          trendUp={true}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {activity.type === 'order' ? (
                    <FaShoppingCart className="text-gray-600" />
                  ) : activity.type === 'user' ? (
                    <FaUsers className="text-gray-600" />
                  ) : (
                    <FaBox className="text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatActivityTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, label, trend, trendUp }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">{label}</p>
            {trend && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                trendUp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 