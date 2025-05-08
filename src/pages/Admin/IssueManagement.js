import React, { useState, useEffect } from 'react';
import { getAllIssues, getIssueById, updateIssueStatus, addMessage, deleteIssue, downloadAllIssuesCSV, assignTechnician, removeTechnician } from '../../services/issueServices';
import { toast } from 'react-toastify';
import { FaSearch, FaFilter, FaEnvelope, FaEdit, FaTrash, FaExclamationTriangle, FaDownload, FaUserMinus, FaUserPlus } from 'react-icons/fa';
import { FiArrowLeft, FiFilter, FiSearch, FiMessageSquare, FiEdit, FiTrash2, FiAlertTriangle, FiDownload, FiUserPlus, FiUserMinus, FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  'PENDING': {
    bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-200'
  },
  'IN_PROGRESS': {
    bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  'RESOLVED': {
    bg: 'bg-gradient-to-r from-green-50 to-green-100',
    text: 'text-green-700',
    border: 'border-green-200'
  },
  'CLOSED': {
    bg: 'bg-gradient-to-r from-gray-50 to-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200'
  }
};

function IssueManagement() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [issueMessages, setIssueMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    type: '', // 'message', 'status', 'delete'
    issueId: null
  });
  const [technicianModal, setTechnicianModal] = useState({
    isOpen: false,
    issueId: null,
    type: 'assign', // 'assign' or 'remove'
    technicianData: {
      name: '',
      phone: '',
      message: ''
    }
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fetch issues
  useEffect(() => {
    fetchIssues(1);
  }, [statusFilter]);

  const fetchIssues = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await getAllIssues(page, limit, statusFilter);
      setIssues(response.issues || []);
      setTotalPages(response.pagination?.pages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      fetchIssues(newPage);
    }
  };

  // Open message modal
  const openMessageModal = async (issueId) => {
    try {
      setMessageLoading(true);
      const response = await getIssueById(issueId);
      setSelectedIssue(response.issue);
      setIssueMessages(response.issue.messages || []);
      setModal({
        isOpen: true,
        type: 'message',
        issueId
      });
    } catch (error) {
      console.error('Error fetching issue details:', error);
      toast.error('Failed to load issue details');
    } finally {
      setMessageLoading(false);
    }
  };

  // Open status change modal
  const openStatusModal = (issue) => {
    setSelectedIssue(issue);
    setModal({
      isOpen: true,
      type: 'status',
      issueId: issue._id
    });
  };

  // Open delete confirmation modal
  const openDeleteModal = (issue) => {
    setSelectedIssue(issue);
    setModal({
      isOpen: true,
      type: 'delete',
      issueId: issue._id
    });
  };

  // Close modal
  const closeModal = () => {
    setModal({
      isOpen: false,
      type: '',
      issueId: null
    });
    setSelectedIssue(null);
    setMessageContent('');
  };

  // Send message
  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast.warning('Please enter a message');
      return;
    }

    try {
      setMessageLoading(true);
      await addMessage(modal.issueId, messageContent);
      toast.success('Message sent successfully');
      
      // Refresh issue messages
      const response = await getIssueById(modal.issueId);
      setIssueMessages(response.issue.messages || []);
      setMessageContent('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setMessageLoading(false);
    }
  };

  // Update issue status
  const handleStatusUpdate = async (newStatus) => {
    try {
      setEditingStatus(true);
      await updateIssueStatus(modal.issueId, newStatus);
      toast.success(`Issue status updated to ${newStatus}`);
      
      // Update issue in the list
      setIssues(issues.map(issue => 
        issue._id === modal.issueId 
          ? { ...issue, status: newStatus } 
          : issue
      ));
      
      closeModal();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update issue status');
    } finally {
      setEditingStatus(false);
    }
  };

  // Delete issue
  const handleDeleteIssue = async () => {
    try {
      setLoading(true);
      await deleteIssue(modal.issueId);
      toast.success('Issue deleted successfully');
      
      // Remove issue from the list
      setIssues(issues.filter(issue => issue._id !== modal.issueId));
      closeModal();
    } catch (error) {
      console.error('Error deleting issue:', error);
      toast.error('Failed to delete issue');
    } finally {
      setLoading(false);
    }
  };

  // Filter issues by search term
  const filteredIssues = issues.filter(issue => {
    const searchLower = searchTerm.toLowerCase();
    return (
      issue.name?.toLowerCase().includes(searchLower) ||
      issue.description?.toLowerCase().includes(searchLower) ||
      issue.district?.toLowerCase().includes(searchLower) ||
      issue.province?.toLowerCase().includes(searchLower) ||
      issue.address?.toLowerCase().includes(searchLower)
    );
  });

  // Handle download CSV
  const handleDownloadCSV = async () => {
    try {
      setDownloadingCSV(true);
      await downloadAllIssuesCSV();
      toast.success('Issues report downloaded successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to download issues report');
    } finally {
      setDownloadingCSV(false);
    }
  };

  // Open technician assignment modal
  const openTechnicianModal = (issue, type = 'assign') => {
    setSelectedIssue(issue);
    setTechnicianModal({
      isOpen: true,
      issueId: issue._id,
      type,
      technicianData: {
        name: issue.technician?.name || '',
        phone: issue.technician?.phone || '',
        message: type === 'assign' 
          ? `You have been assigned to issue: ${issue.name}. Please contact the customer at ${issue.mobileNo}.`
          : `You have been removed from issue: ${issue.name}.`
      }
    });
  };

  // Close technician modal
  const closeTechnicianModal = () => {
    setTechnicianModal({
      isOpen: false,
      issueId: null,
      type: 'assign',
      technicianData: {
        name: '',
        phone: '',
        message: ''
      }
    });
  };

  // Handle technician assignment
  const handleTechnicianAction = async () => {
    try {
      setLoading(true);
      if (technicianModal.type === 'assign') {
        await assignTechnician(technicianModal.issueId, technicianModal.technicianData);
        toast.success('Technician assigned successfully');
      } else {
        await removeTechnician(technicianModal.issueId, technicianModal.technicianData.message);
        toast.success('Technician removed successfully');
      }
      
      // Refresh issues
      await fetchIssues(currentPage);
      closeTechnicianModal();
    } catch (error) {
      console.error('Error handling technician action:', error);
      toast.error(error.message || 'Failed to handle technician action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <button 
          onClick={() => navigate("/admin/dashboard")}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium group"
        >
          <div className="bg-white p-2 rounded-full shadow-md mr-3 group-hover:bg-blue-50 transition-colors duration-200">
            <FiArrowLeft className="text-blue-600" />
          </div>
          Back to Dashboard
        </button>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <h1 className="text-2xl font-semibold mb-4 sm:mb-0">Issue Management</h1>
              
              <button 
                onClick={handleDownloadCSV}
                disabled={downloadingCSV || loading || !issues.length}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 border border-white border-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiDownload className="mr-2" /> 
                {downloadingCSV ? 'Downloading...' : 'Download CSV Report'}
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Search and Filter */}
            <div className="mb-8 bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-3/4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name, description, location..."
                      className="w-full p-3 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
                  </div>
                </div>
                <div className="w-full md:w-1/4">
                  <div className="relative">
                    <select
                      className="w-full p-3 pl-12 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Issues Table */}
            <div className="overflow-hidden rounded-xl shadow-lg border border-gray-100 bg-white backdrop-blur-sm bg-opacity-90">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading issues...</p>
                </div>
              ) : filteredIssues.length === 0 ? (
                <div className="p-10 text-center">
                  <FiAlertTriangle className="text-yellow-500 text-5xl mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No issues found</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter
                      ? "No issues match your current filters."
                      : "There are no issues in the system."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                        <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                        <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider">User Info</th>
                        <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                        <th className="py-4 px-6 text-left font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="py-4 px-6 text-center font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIssues.map((issue) => {
                        const statusStyle = statusColors[issue.status] || statusColors.PENDING;
                        
                        return (
                          <tr key={issue._id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150">
                            <td className="px-6 py-4" onClick={(e) => { e.stopPropagation(); navigate(`/admin/issues/${issue._id}`);}}>
                              <div className="text-sm font-medium text-gray-900">{issue.name}</div>
                              <div className="text-xs text-gray-500 mt-1 line-clamp-2">{issue.description}</div>
                              <div className="text-xs text-blue-500 mt-1">
                                {issue.messages?.length || 0} message(s)
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {issue.user ? (
                                  <span>{issue.user.fName} {issue.user.lName}</span>
                                ) : (
                                  <span className="text-gray-500 italic">Anonymous</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">{issue.mobileNo}</div>
                              <div className="text-xs text-gray-500">WA: {issue.whatsappNo}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{issue.district}</div>
                              <div className="text-xs text-gray-500">{issue.province}</div>
                              <div className="text-xs text-gray-500 line-clamp-1">{issue.address}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                                {issue.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {issue.technician?.name ? (
                                <div className="space-y-1">
                                  <div className="text-sm text-gray-900">{issue.technician.name}</div>
                                  <div className="text-xs text-gray-500">{issue.technician.phone}</div>
                                  <div className="text-xs text-gray-500">
                                    Assigned: {format(new Date(issue.technician.assignedAt), 'dd/MM/yyyy')}
                                  </div>
                                  <div className="flex space-x-2 mt-1">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); openTechnicianModal(issue, 'remove');}}
                                      className="text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-100 p-1 rounded-full transition-colors duration-150"
                                      title="Remove Technician"
                                    >
                                      <FiUserMinus size={14} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <span className="text-xs text-gray-500 italic">No technician assigned</span>
                                  <div className="flex mt-1">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); openTechnicianModal(issue, 'assign');}}
                                      className="text-gray-600 hover:text-green-600 bg-gray-100 hover:bg-green-100 p-1 rounded-full transition-colors duration-150"
                                      title="Assign Technician"
                                    >
                                      <FiUserPlus size={14} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {issue.createdAt ? format(new Date(issue.createdAt), 'dd/MM/yyyy') : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex justify-center space-x-3">
                                <button
                                  onClick={(e) => { e.stopPropagation(); openMessageModal(issue._id);}}
                                  className="text-gray-600 hover:text-blue-600 transition-colors duration-150 bg-gray-100 hover:bg-blue-100 p-2 rounded-full"
                                  title="Message User"
                                >
                                  <FiMessageSquare />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); openStatusModal(issue);}}
                                  className="text-gray-600 hover:text-orange-600 transition-colors duration-150 bg-gray-100 hover:bg-orange-100 p-2 rounded-full"
                                  title="Update Status"
                                >
                                  <FiEdit />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); openDeleteModal(issue);}}
                                  className="text-gray-600 hover:text-red-600 transition-colors duration-150 bg-gray-100 hover:bg-red-100 p-2 rounded-full"
                                  title="Delete Issue"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-100">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * 10, (issues || []).length)}
                        </span>{' '}
                        of <span className="font-medium">{(issues || []).length}</span> issues
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-3 py-2 rounded-l-lg border ${
                            currentPage === 1 
                              ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed' 
                              : 'border-gray-300 bg-white text-gray-500 hover:bg-blue-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index}
                            onClick={() => handlePageChange(index + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === index + 1
                                ? 'z-10 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-3 py-2 rounded-r-lg border ${
                            currentPage === totalPages 
                              ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed' 
                              : 'border-gray-300 bg-white text-gray-500 hover:bg-blue-50'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {modal.isOpen && modal.type === 'message' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative mx-auto p-6 border w-full max-w-3xl shadow-2xl rounded-xl bg-white border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Issue: {selectedIssue?.name}</h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors duration-150"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 mb-6 max-h-96 overflow-y-auto">
              {messageLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading messages...</p>
                </div>
              ) : issueMessages.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No messages yet.</p>
              ) : (
                <div className="space-y-4">
                  {issueMessages.map((message, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-xl max-w-[80%] shadow-sm ${
                        message.sender === 'ADMIN' 
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 ml-auto border border-blue-200' 
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 mr-auto border border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-gray-600">
                          {message.sender === 'ADMIN' ? 'Admin' : 'User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp ? format(new Date(message.timestamp), 'dd/MM/yyyy HH:mm') : 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Technician Details Section */}
            {selectedIssue?.technician && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Assigned Technician</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-800 font-medium">{selectedIssue.technician.name}</p>
                    <p className="text-gray-600 text-sm">Phone: {selectedIssue.technician.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">
                      Assigned on: {format(new Date(selectedIssue.technician.assignedAt), 'dd MMM yyyy h:mm a')}
                    </p>
                    {selectedIssue.technician.removedAt && (
                      <p className="text-red-600 text-sm">
                        Removed on: {format(new Date(selectedIssue.technician.removedAt), 'dd MMM yyyy h:mm a')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Reply as Admin
              </label>
              <textarea
                id="message"
                rows="3"
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={messageLoading || !messageContent.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Status Update Modal */}
      {modal.isOpen && modal.type === 'status' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative mx-auto p-6 border w-full max-w-md shadow-2xl rounded-xl bg-white border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Update Issue Status</h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors duration-150"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <p className="mb-4 text-gray-600">Current status: <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[selectedIssue?.status].bg} ${statusColors[selectedIssue?.status].text}`}>
              {selectedIssue?.status.replace('_', ' ')}
            </span></p>
            
            <div className="space-y-3">
              {['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={editingStatus || status === selectedIssue?.status}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                    status === selectedIssue?.status
                      ? 'bg-gray-100 cursor-not-allowed'
                      : `${statusColors[status].bg} ${statusColors[status].text} hover:bg-opacity-80 shadow-sm hover:shadow`
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {modal.isOpen && modal.type === 'delete' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative mx-auto p-6 border w-full max-w-md shadow-2xl rounded-xl bg-white border-gray-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FiAlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Delete Issue</h3>
              <div className="mb-6">
                <p className="text-gray-600">
                  Are you sure you want to delete this issue? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={closeModal}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteIssue}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technician Assignment Modal */}
      {technicianModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative mx-auto p-6 border w-full max-w-md shadow-2xl rounded-xl bg-white border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {technicianModal.type === 'assign' ? 'Assign Technician' : 'Remove Technician'}
              </h3>
              <button 
                onClick={closeTechnicianModal}
                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors duration-150"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {technicianModal.type === 'assign' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Technician Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={technicianModal.technicianData.name}
                    onChange={(e) => setTechnicianModal(prev => ({
                      ...prev,
                      technicianData: {
                        ...prev.technicianData,
                        name: e.target.value
                      }
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={technicianModal.technicianData.phone}
                    onChange={(e) => setTechnicianModal(prev => ({
                      ...prev,
                      technicianData: {
                        ...prev.technicianData,
                        phone: e.target.value
                      }
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Message</label>
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    value={technicianModal.technicianData.message}
                    onChange={(e) => setTechnicianModal(prev => ({
                      ...prev,
                      technicianData: {
                        ...prev.technicianData,
                        message: e.target.value
                      }
                    }))}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to remove the technician from this issue?
                </p>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Message</label>
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    value={technicianModal.technicianData.message}
                    onChange={(e) => setTechnicianModal(prev => ({
                      ...prev,
                      technicianData: {
                        ...prev.technicianData,
                        message: e.target.value
                      }
                    }))}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeTechnicianModal}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleTechnicianAction}
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {loading ? 'Processing...' : technicianModal.type === 'assign' ? 'Assign' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IssueManagement; 