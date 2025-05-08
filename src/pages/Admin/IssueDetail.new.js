import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getIssueById, updateIssueStatus, addMessage, deleteIssue } from '../../services/issueServices';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FaArrowLeft, FaCheckCircle, FaSpinner, FaEnvelope, FaTrash, FaEdit, FaImage, FaExclamationTriangle } from 'react-icons/fa';

const statusColors = {
  'PENDING': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  'IN_PROGRESS': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  'RESOLVED': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  'CLOSED': {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  }
};

function AdminIssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    fetchIssueDetails();
  }, [id]);

  const fetchIssueDetails = async () => {
    try {
      setLoading(true);
      const response = await getIssueById(id);
      setIssue(response.issue);
    } catch (error) {
      console.error('Error fetching issue details:', error);
      toast.error('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await updateIssueStatus(id, newStatus);
      
      // Update local state
      setIssue(prevIssue => ({
        ...prevIssue,
        status: newStatus
      }));
      
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageContent.trim()) {
      toast.warning('Please enter a message');
      return;
    }
    
    try {
      setSendingMessage(true);
      await addMessage(id, messageContent);
      
      // Refresh issue data to get updated messages
      const response = await getIssueById(id);
      setIssue(response.issue);
      
      setMessageContent('');
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteIssue = async () => {
    try {
      setLoading(true);
      await deleteIssue(id);
      toast.success('Issue deleted successfully');
      navigate('/admin/issues');
    } catch (error) {
      console.error('Error deleting issue:', error);
      toast.error('Failed to delete issue');
      setLoading(false);
    }
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
    setModalOpen(true);
  };

  const closeImageModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy h:mm a');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-gray-600">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Issue not found</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>The requested issue does not exist or you don't have permission to view it.</p>
              </div>
              <div className="mt-4">
                <Link
                  to="/admin/issues"
                  className="text-sm font-medium text-red-800 hover:text-red-900"
                >
                  &larr; Back to Issue Management
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusStyle = statusColors[issue.status] || statusColors.PENDING;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <Link
            to="/admin/issues"
            className="mr-4 text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="text-lg" />
          </Link>
          <h1 className="text-2xl font-bold">{issue.name}</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">Confirm delete?</span>
              <button
                onClick={handleDeleteIssue}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-md flex items-center"
            >
              <FaTrash className="mr-1" /> Delete
            </button>
          )}
          
          <button
            onClick={() => setShowStatusModal(true)}
            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md flex items-center"
          >
            <FaEdit className="mr-1" /> Change Status
          </button>
        </div>
      </div>
      
      {/* Issue details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Main details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between mb-4">
              <div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                  {issue.status.replace('_', ' ')}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  Created {formatDateTime(issue.createdAt)}
                </span>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-4">Issue Details</h2>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-gray-800 whitespace-pre-line">{issue.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                <p className="text-gray-800">{issue.address}</p>
                <p className="text-gray-800">{issue.district}, {issue.province}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Contact Information</h3>
                <p className="text-gray-800">Mobile: {issue.mobileNo}</p>
                <p className="text-gray-800">WhatsApp: {issue.whatsappNo}</p>
              </div>
            </div>
            
            {/* Images */}
            {issue.images && issue.images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {issue.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={`http://localhost:4000${image}`}
                        alt={`Issue ${index + 1}`}
                        className="h-24 w-full object-cover rounded-md cursor-pointer"
                        onClick={() => openImageModal(`http://localhost:4000${image}`)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-200">
                        <FaImage className="text-white opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Messages */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Conversation</h2>
            
            <div className="mb-6 max-h-96 overflow-y-auto">
              {issue.messages && issue.messages.length > 0 ? (
                <div className="space-y-4">
                  {issue.messages.map((message, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg max-w-[80%] ${
                        message.sender === 'ADMIN' 
                          ? 'bg-blue-100 ml-auto' 
                          : 'bg-gray-100 mr-auto'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">
                          {message.sender === 'ADMIN' ? 'Admin' : 'User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp ? formatDateTime(message.timestamp) : 'N/A'}
                        </span>
                      </div>
                      <p className="text-gray-800">{message.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No messages yet.</div>
              )}
            </div>
            
            <form onSubmit={handleSendMessage}>
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Reply as Admin
                </label>
                <textarea
                  id="message"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Type your message here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  disabled={sendingMessage}
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                  disabled={sendingMessage || !messageContent.trim()}
                >
                  {sendingMessage ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaEnvelope className="mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div>
          {/* User information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Reported By</h2>
            
            {issue.user ? (
              <div>
                <div className="mb-4">
                  <p className="text-gray-800 font-medium">{issue.user.fName} {issue.user.lName}</p>
                  <p className="text-gray-600">{issue.user.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Anonymous Report</p>
            )}
          </div>
          
          {/* Issue timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Status History</h2>
            
            <div className="relative pl-8 border-l-2 border-gray-200 ml-4">
              <div className="mb-6 relative">
                <div className="absolute -left-[29px] mt-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-white text-xs" />
                </div>
                <h3 className="font-medium">Issue Created</h3>
                <p className="text-sm text-gray-500">
                  {formatDateTime(issue.createdAt)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Issue reported with status "PENDING"
                </p>
              </div>
              
              {/* This would be dynamic in a real implementation */}
              {issue.status !== 'PENDING' && (
                <div className="mb-6 relative">
                  <div className="absolute -left-[29px] mt-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="text-white text-xs" />
                  </div>
                  <h3 className="font-medium">Status Updated</h3>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(issue.updatedAt)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Status changed to "{issue.status}"
                  </p>
                </div>
              )}
              
              {/* Message history would be shown here in a real implementation */}
              {issue.messages && issue.messages.length > 0 && (
                <div className="relative">
                  <div className="absolute -left-[29px] mt-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="text-white text-xs" />
                  </div>
                  <h3 className="font-medium">Latest Communication</h3>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(issue.messages[issue.messages.length - 1].timestamp)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {issue.messages[issue.messages.length - 1].sender === 'ADMIN' 
                      ? 'Admin sent a message' 
                      : 'User sent a message'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Image Modal */}
      {modalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white text-xl"
            >
              &times;
            </button>
            <img
              src={selectedImage}
              alt="Issue"
              className="mx-auto max-h-[80vh] max-w-full"
            />
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Update Status</h3>
              <button 
                onClick={() => setShowStatusModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                &times;
              </button>
            </div>
            
            <p className="mb-4">Current status: <span className={`px-2 py-1 rounded-full text-xs ${statusStyle.bg} ${statusStyle.text}`}>
              {issue.status.replace('_', ' ')}
            </span></p>
            
            <div className="space-y-2 mb-6">
              {['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    handleStatusChange(status);
                    setShowStatusModal(false);
                  }}
                  disabled={updatingStatus || status === issue.status}
                  className={`w-full px-4 py-2 text-left rounded ${
                    status === issue.status
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : `${statusColors[status].bg} ${statusColors[status].text} hover:opacity-80`
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminIssueDetail; 