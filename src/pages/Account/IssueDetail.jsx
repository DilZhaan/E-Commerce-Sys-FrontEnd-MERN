import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssueById, addMessage, markMessagesAsRead, updateIssue } from '../../services/issueServices';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { MdArrowBack, MdSend, MdImage, MdEdit, MdSave, MdCancel } from 'react-icons/md';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import Loading from '../../components/Loading';

const statusColors = {
  'PENDING': 'bg-yellow-100 text-yellow-800',
  'IN_PROGRESS': 'bg-blue-100 text-blue-800',
  'RESOLVED': 'bg-green-100 text-green-800',
  'CLOSED': 'bg-gray-100 text-gray-800'
};

function IssueDetail() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  // Edit functionality
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // We don't need to get a token since we're using cookies
  const getToken = async () => {
    return null;
  };
  
  const fetchIssue = async () => {
    try {
      setLoading(true);
      const response = await getIssueById(id, null);
      setIssue(response.issue);
      
      // Initialize editedData with the current issue data
      setEditedData({
        name: response.issue.name,
        description: response.issue.description,
        location: response.issue.location,
        address: response.issue.address,
        district: response.issue.district,
        province: response.issue.province,
        mobileNo: response.issue.mobileNo,
        whatsappNo: response.issue.whatsappNo
      });
      
      // Debug images
      if (response.issue && response.issue.images) {
        console.log('Issue images:', response.issue.images);
        console.log('API URL:', process.env.REACT_APP_API_URL || 'http://localhost:4000');
      }
      
      // Mark unread admin messages as read
      const unreadMessageIds = response.issue.messages
        .filter(msg => msg.sender === 'ADMIN' && !msg.readStatus)
        .map(msg => msg._id);
        
      if (unreadMessageIds.length > 0) {
        await markMessagesAsRead(id, unreadMessageIds, null);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch issue details');
      toast.error('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchIssue();
    } else {
      navigate('/signin');
    }
  }, [id, isAuthenticated, navigate]);
  
  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [issue?.messages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }
    
    try {
      setSendingMessage(true);
      
      // Optimistically add the message to UI before server response
      const newMessage = {
        sender: 'USER',
        content: message,
        timestamp: new Date().toISOString(),
        readStatus: false,
        _id: 'temp-' + Date.now() // Temporary ID
      };
      
      // Update local state immediately with new message
      setIssue(prevIssue => ({
        ...prevIssue,
        messages: [...(prevIssue.messages || []), newMessage]
      }));
      
      // Clear input
      setMessage('');
      
      // Then send to server
      await addMessage(id, message, null);
      
      // Refresh issue to get the confirmed messages with proper IDs
      fetchIssue();
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
      // Revert optimistic update on error
      fetchIssue();
    } finally {
      setSendingMessage(false);
    }
  };
  
  // Handle changes to edit form fields
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Toggle edit mode on/off
  const toggleEditMode = () => {
    if (isEditMode) {
      // Reset edited data to original issue data
      setEditedData({
        name: issue.name,
        description: issue.description,
        location: issue.location,
        address: issue.address,
        district: issue.district,
        province: issue.province,
        mobileNo: issue.mobileNo,
        whatsappNo: issue.whatsappNo
      });
    }
    setIsEditMode(!isEditMode);
  };
  
  // Save changes to the issue
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      await updateIssue(id, editedData);
      toast.success('Issue updated successfully');
      setIsEditMode(false);
      // Refresh issue data
      fetchIssue();
    } catch (err) {
      console.error('Error updating issue:', err);
      toast.error(err.message || 'Failed to update issue');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading && !issue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate('/account/issues')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <MdArrowBack className="mr-1" /> Back to Issues
        </button>
      </div>
    );
  }
  
  if (!issue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p>Issue not found.</p>
          <button
            onClick={() => navigate('/account/issues')}
            className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <MdArrowBack className="mr-1" /> Back to Issues
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/account/issues')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold flex-grow">Issue Details</h1>
          {issue.status === 'PENDING' && (
            <div className="mr-4">
              {isEditMode ? (
                <div className="flex space-x-2">
                  <button 
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <MdSave className="mr-1" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={toggleEditMode}
                    className="flex items-center px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    <MdCancel className="mr-1" />
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={toggleEditMode}
                  className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <MdEdit className="mr-1" />
                  Edit
                </button>
              )}
            </div>
          )}
          <div className={`px-3 py-1 rounded-full ${statusColors[issue.status].bg} ${statusColors[issue.status].text}`}>
            {issue.status.replace('_', ' ').charAt(0).toUpperCase() + issue.status.slice(1).toLowerCase()}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Issue Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-start">
              <div>
                {isEditMode ? (
                  <input
                    type="text"
                    name="name"
                    value={editedData.name}
                    onChange={handleEditInputChange}
                    className="text-xl font-bold w-full border border-gray-300 rounded px-2 py-1"
                  />
                ) : (
                  <h1 className="text-xl font-bold">{issue.name}</h1>
                )}
                <p className="text-gray-500">
                  Reported on {format(new Date(issue.createdAt), 'dd MMM yyyy')}
                </p>
              </div>
            </div>
          </div>
          
          {/* Issue Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-4 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Location</p>
              {isEditMode ? (
                <>
                  <input
                    type="text"
                    name="location"
                    value={editedData.location}
                    onChange={handleEditInputChange}
                    className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
                    placeholder="Location"
                  />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      name="district"
                      value={editedData.district}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                      placeholder="District"
                    />
                    <input
                      type="text"
                      name="province"
                      value={editedData.province}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                      placeholder="Province"
                    />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={editedData.address}
                    onChange={handleEditInputChange}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    placeholder="Full Address"
                  />
                </>
              ) : (
                <>
                  <p>{issue.district}, {issue.province}</p>
                  <p className="mt-2 text-sm">{issue.address}</p>
                </>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact</p>
              {isEditMode ? (
                <>
                  <div className="mb-2">
                    <label className="text-xs text-gray-500">Mobile:</label>
                    <input
                      type="tel"
                      name="mobileNo"
                      value={editedData.mobileNo}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">WhatsApp:</label>
                    <input
                      type="tel"
                      name="whatsappNo"
                      value={editedData.whatsappNo}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                </>
              ) : (
                <>
                  <p>Mobile: {issue.mobileNo}</p>
                  {issue.whatsappNo && <p>WhatsApp: {issue.whatsappNo}</p>}
                </>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Description</p>
              {isEditMode ? (
                <textarea
                  name="description"
                  value={editedData.description}
                  onChange={handleEditInputChange}
                  rows="5"
                  className="w-full border border-gray-300 rounded px-2 py-1"
                />
              ) : (
                <p className="text-sm whitespace-pre-line">{issue.description}</p>
              )}
            </div>
          </div>
          
          {/* Technician Details */}
          {issue.technician && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Assigned Technician</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-800 font-medium">{issue.technician.name}</p>
                  <p className="text-gray-600 text-sm">Phone: {issue.technician.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">
                    Assigned on: {format(new Date(issue.technician.assignedAt), 'dd MMM yyyy h:mm a')}
                  </p>
                  {issue.technician.removedAt && (
                    <p className="text-red-600 text-sm">
                      Removed on: {format(new Date(issue.technician.removedAt), 'dd MMM yyyy h:mm a')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Images */}
          {issue.images && issue.images.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Images ({issue.images.length})</p>
              <div className="flex flex-wrap gap-3">
                {issue.images.map((image, index) => {
                  // For image URLs, we need to use the base server URL without the /api suffix
                  let baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
                  baseUrl = baseUrl.replace('/api', ''); // Remove /api from the URL for image paths
                  
                  const imageUrl = image.startsWith('http') 
                    ? image 
                    : `${baseUrl}${image}`;
                  
                  console.log(`Image ${index} URL:`, imageUrl);
                  
                  return (
                    <a 
                      key={index} 
                      href={imageUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={imageUrl}
                        alt={`Issue ${index + 1}`}
                        className="h-24 w-24 object-cover rounded border border-gray-300 hover:border-blue-600 transition"
                        onError={(e) => {
                          console.error(`Failed to load image: ${imageUrl}`);
                          e.target.src = 'https://via.placeholder.com/100?text=Image+Error';
                          e.target.alt = 'Failed to load image';
                        }}
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Chat Section */}
          <div className="px-6 py-4 h-96 flex flex-col">
            <div className="text-lg font-medium mb-4">Messages</div>
            
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto mb-4 pr-2">
              {issue.messages && issue.messages.length > 0 ? (
                <div className="space-y-4">
                  {issue.messages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender === 'USER' 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-gray-200 text-gray-800 rounded-tl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'USER' ? 'text-blue-300' : 'text-gray-500'}`}>
                          {format(new Date(msg.timestamp), 'dd MMM yyyy, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <MdImage className="mx-auto text-4xl mb-2" />
                  <p>No messages yet. Start the conversation by sending a message.</p>
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                disabled={sendingMessage || issue.status === 'CLOSED'}
              />
              <button
                type="submit"
                disabled={sendingMessage || !message.trim() || issue.status === 'CLOSED'}
                className={`${message.trim() ? 'bg-blue-600' : 'bg-gray-400'} text-white rounded-r-md px-4 flex items-center justify-center transition`}
              >
                {sendingMessage ? (
                  <div className="spinner-sm"></div>
                ) : (
                  <MdSend className="text-xl" />
                )}
              </button>
            </form>
            
            {issue.status === 'CLOSED' && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                This issue is closed. You cannot send more messages.
              </p>
            )}
          </div>
        </div>
        
        {/* Admin Notes - Only visible if there are notes and the issue has been processed */}
        {issue.adminNotes && issue.status !== 'pending' && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Official Response</h3>
            <p className="text-gray-600 whitespace-pre-line">{issue.adminNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default IssueDetail; 