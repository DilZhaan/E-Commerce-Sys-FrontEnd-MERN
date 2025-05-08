import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Process a payment
export const processPayment = async (orderId, paymentData) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/${orderId}`,
      paymentData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': paymentData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

// Get all payments (admin only)
export const getAllPayments = async () => {
  try {
    const response = await axios.get(`${API_URL}/payments`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all payments:', error);
    throw error;
  }
};

// Get payments for current user
export const getUserPayments = async () => {
  try {
    const response = await axios.get(`${API_URL}/payments/my-payments`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user payments:', error);
    throw error;
  }
};

// Get payment by ID
export const getPaymentById = async (paymentId) => {
  try {
    const response = await axios.get(`${API_URL}/payments/${paymentId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment ${paymentId}:`, error);
    throw error;
  }
};

// Update payment status (admin only)
export const updatePaymentStatus = async (paymentId, status, adminNote) => {
  try {
    const payload = { status };
    
    // Add admin note if provided
    if (adminNote) {
      payload.adminNote = adminNote;
    }
    
    const response = await axios.put(
      `${API_URL}/payments/${paymentId}/status`,
      payload,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating payment ${paymentId} status:`, error);
    throw error;
  }
};

// Download payment receipt
export const downloadReceipt = async (paymentId) => {
  try {
    const response = await axios.get(`${API_URL}/payments/${paymentId}/receipt`, {
      withCredentials: true,
      responseType: 'blob'
    });
    
    // Create a download link and trigger it
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `receipt-${paymentId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    console.error(`Error downloading receipt for payment ${paymentId}:`, error);
    throw error;
  }
}; 