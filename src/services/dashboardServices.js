import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Get admin dashboard stats
export const getAdminDashboardStats = async () => {
  try {
    console.log('Fetching admin dashboard stats');
    const response = await axios.get(`${API_URL}/dashboard/admin-stats`, {
      withCredentials: true
    });
    console.log('Admin dashboard stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    throw error;
  }
};

// Get user dashboard stats
export const getUserDashboardStats = async () => {
  try {
    console.log('Fetching user dashboard stats');
    const response = await axios.get(`${API_URL}/dashboard/user-stats`, {
      withCredentials: true
    });
    console.log('User dashboard stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user dashboard stats:', error);
    throw error;
  }
}; 