import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

// Get admin dashboard stats
export const getAdminDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/admin-stats`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    throw error;
  }
};

// Get user dashboard stats
export const getUserDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/user-stats`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user dashboard stats:', error);
    throw error;
  }
}; 