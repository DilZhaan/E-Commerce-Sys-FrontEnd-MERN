import axios from 'axios';

// Make sure we have the correct API URL
const API_URL = process.env.REACT_APP_API_URL + "/api" || 'http://localhost:4000/api';
console.log('API URL initialized as:', API_URL);

// Create a new issue
export const createIssue = async (issueData, progressCallback) => {
    try {
        let formData;
        
        // Check if issueData is already FormData
        if (issueData instanceof FormData) {
            formData = issueData;
            console.log('Using existing FormData');
        } else {
            console.log('Creating new FormData from object');
            formData = new FormData();
            
            // Add text fields to form data
            Object.keys(issueData).forEach(key => {
                if (key !== 'images') {
                    formData.append(key, issueData[key]);
                }
            });
            
            // Add images to form data
            if (issueData.images && issueData.images.length > 0) {
                for (let i = 0; i < issueData.images.length; i++) {
                    formData.append('images', issueData.images[i]);
                }
            }
        }
        
        // Debug log the contents of the FormData
        console.log('API URL:', API_URL);
        console.log('Form data keys:');
        for (let pair of formData.entries()) {
            console.log(pair[0], ':', typeof pair[1] === 'object' ? 'File object' : pair[1]);
        }
        
        const config = {
            withCredentials: true
            // Important: DO NOT set Content-Type when using FormData
        };
        
        // Add onUploadProgress handler if callback provided
        if (progressCallback && typeof progressCallback === 'function') {
            config.onUploadProgress = progressCallback;
        }
        
        console.log('Sending request to:', `${API_URL}/issues`);
        const response = await axios.post(`${API_URL}/issues`, formData, config);
        console.log('Response received:', response);
        return response.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error.response?.data || { message: error.message };
    }
};

// Get all issues for a user
export const getUserIssues = async (token, page = 1, limit = 10) => {
    try {
        const response = await axios.get(`${API_URL}/issues/user?page=${page}&limit=${limit}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
};

// Get a specific issue by ID
export const getIssueById = async (issueId, token) => {
    try {
        const response = await axios.get(`${API_URL}/issues/${issueId}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
};

// Update issue status
export const updateIssueStatus = async (issueId, status, token) => {
    try {
        const response = await axios.patch(`${API_URL}/issues/${issueId}/status`, 
            { status },
            {
                withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
};

// Add a message to an issue
export const addMessage = async (issueId, content, token) => {
    try {
        const response = await axios.post(`${API_URL}/issues/${issueId}/messages`, 
            { content },
            {
                withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
};

// Add a comment to an issue
export const addCommentToIssue = async (issueId, comment, token) => {
    try {
        const response = await axios.post(`${API_URL}/issues/${issueId}/comments`, 
            { content: comment },
            {
                withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
};

// Mark messages as read
export const markMessagesAsRead = async (issueId, messageIds, token) => {
    try {
        const response = await axios.patch(`${API_URL}/issues/${issueId}/messages/read`, 
            { messageIds },
            {
                withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
};

// Delete an issue (this would need to be implemented on the backend)
export const deleteIssue = async (issueId, token) => {
    try {
        const response = await axios.delete(`${API_URL}/issues/${issueId}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
};

// Create a new issue using direct JSON submission
export const createIssueJSON = async (issueData) => {
    try {
        console.log('Submitting issue with direct JSON:', issueData);
        
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
        console.log('API URL for direct JSON submission:', API_URL);
        
        const response = await axios.post(`${API_URL}/issues`, issueData, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        
        console.log('Direct JSON submission response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error in direct JSON submission:', error);
        throw error.response?.data || { message: error.message };
    }
};

// Update an existing issue
export const updateIssue = async (issueId, issueData) => {
    try {
        console.log('Updating issue with data:', issueData);
        
        const response = await axios.put(`${API_URL}/issues/${issueId}`, issueData, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        
        console.log('Update issue response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating issue:', error);
        throw error.response?.data || { message: error.message };
    }
};

// Get all issues (admin only)
export const getAllIssues = async (page = 1, limit = 10, status = '') => {
    try {
        const queryParams = new URLSearchParams({
            page,
            limit
        });
        
        if (status) {
            queryParams.append('status', status);
        }
        
        const response = await axios.get(`${API_URL}/issues?${queryParams.toString()}`, {
            withCredentials: true
        });
        
        return response.data;
    } catch (error) {
        console.error('Error fetching all issues:', error);
        throw error.response?.data || { message: error.message };
    }
};

// Download issues as CSV
export const downloadIssuesCSV = async () => {
    try {
        // Use Blob type to handle file download
        const response = await axios.get(`${API_URL}/issues/download-csv`, {
            withCredentials: true,
            responseType: 'blob'  // Important for file downloads
        });

        // Create a blob URL and trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'issue-report.csv');
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return true;
    } catch (error) {
        console.error('Error downloading CSV:', error);
        throw error.response?.data || { message: error.message };
    }
};

// Download all issues as CSV (admin only)
export const downloadAllIssuesCSV = async () => {
    try {
        // Use Blob type to handle file download
        const response = await axios.get(`${API_URL}/issues/admin-download-csv`, {
            withCredentials: true,
            responseType: 'blob'  // Important for file downloads
        });

        // Create a blob URL and trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'all-issues-report.csv');
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return true;
    } catch (error) {
        console.error('Error downloading admin CSV:', error);
        throw error.response?.data || { message: error.message };
    }
};

// Assign technician to an issue
export const assignTechnician = async (issueId, technicianData) => {
    try {
        const response = await axios.post(`${API_URL}/issues/${issueId}/technician`, technicianData, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
};

// Remove technician from an issue
export const removeTechnician = async (issueId, message) => {
    try {
        const response = await axios.delete(`${API_URL}/issues/${issueId}/technician`, {
            data: { message },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
}; 