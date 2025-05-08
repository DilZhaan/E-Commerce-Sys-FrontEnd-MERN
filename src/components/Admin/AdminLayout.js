import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUsers, FaShoppingBag, FaChartLine, FaClipboardList, FaHome, FaSignOutAlt, FaCog, FaStore } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const adminMenuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <FaChartLine /> },
    { path: '/admin/users', name: 'User Management', icon: <FaUsers /> },
    { path: '/admin/products', name: 'Inventory Management', icon: <FaShoppingBag /> },
    { path: '/admin/shop-products', name: 'Shop Products', icon: <FaStore /> },
    { path: '/admin/order-management', name: 'Order Management', icon: <FaClipboardList /> },
    { path: '/admin/settings', name: 'Settings', icon: <FaCog /> },
  ];

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      dispatch(logout());
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 p-4">
      {/* Admin Sidebar */}
      <div className="w-full md:w-1/5 bg-white rounded-lg shadow-md p-4 mb-4 md:mb-0 md:mr-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Admin Panel</h2>
          <p className="text-sm text-gray-600">Welcome, {user?.fName || user?.name || 'Admin'}</p>
        </div>
        
        <nav>
          <ul>
            {adminMenuItems.map((item, index) => (
              <li key={index} className="mb-2">
                <Link
                  to={item.path}
                  className={`flex items-center p-2 rounded hover:bg-gray-100 ${
                    location.pathname === item.path ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="mt-auto pt-6 border-t border-gray-200">
          <Link
            to="/"
            className="flex items-center p-2 rounded hover:bg-gray-100"
          >
            <span className="mr-3"><FaHome /></span>
            <span>Back to Store</span>
          </Link>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center p-2 rounded hover:bg-gray-100 mt-2"
          >
            <span className="mr-3"><FaSignOutAlt /></span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full md:w-4/5 bg-white rounded-lg shadow-md p-6">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout; 