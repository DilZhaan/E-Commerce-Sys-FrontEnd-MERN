import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssueById, updateIssueStatus } from '../../services/issueServices';
import { toast } from 'react-toastify';
import { MdArrowBack, MdLocationOn, MdCalendarToday, MdLabelImportant } from 'react-icons/md';
import { FaRegClock } from 'react-icons/fa';
import Loading from '../../components/Loading';

const statusColors = {
  'Pending': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  'In Progress': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  'Resolved': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  'Rejected': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  }
};

function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin (this is just a placeholder - implement based on your auth system)
    const checkIfAdmin = () => {
      // Example implementation - replace with your actual admin check
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setIsAdmin(user.role === 'admin');
    };

    checkIfAdmin();
    fetchIssueDetails();
  }, [id]);

  const fetchIssueDetails = async () => {
    try {
      setLoading(true);
      const response = await getIssueById(id);
      setIssue(response.data);
    } catch (err) {
      console.error('Error fetching issue details:', err);
      setError('Failed to load issue details. Please try again later.');
      toast.error('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdateStatusLoading(true);
      await updateIssueStatus(id, newStatus);
      setIssue({ ...issue, status: newStatus });
      toast.success(`Issue status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating issue status:', err);
      toast.error('Failed to update issue status');
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-red-50 p-6 rounded-lg border border-red-200">
          <h2 className="text-xl font-bold text-red-700 mb-4">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/account/issues')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-bold text-yellow-700 mb-4">Issue Not Found</h2>
          <p className="text-yellow-600">The issue you are looking for does not exist or has been removed.</p>
          <button
            onClick={() => navigate('/account/issues')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { status } = issue;
  const statusStyle = statusColors[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/account/issues')}
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <MdArrowBack className="text-xl mr-1" />
        </button>
        <h1 className="text-2xl font-bold">Issue Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Issue Header */}
        <div className="bg-gray-50 p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{issue.name}</h2>
              <div className="flex flex-wrap items-center mt-2 text-sm text-gray-600">
                <div className="flex items-center mr-4 mb-2">
                  <MdCalendarToday className="mr-1" />
                  {formatDate(issue.createdAt)}
                </div>
                <div className="flex items-center mb-2">
                  <FaRegClock className="mr-1" />
                  {formatTime(issue.createdAt)}
                </div>
              </div>
            </div>
            <div className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} border px-4 py-2 rounded-full text-sm font-medium mt-2 md:mt-0`}>
              {status}
            </div>
          </div>
        </div>

        {/* Issue Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Issue Details */}
            <div className="md:col-span-2">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="whitespace-pre-wrap">{issue.description}</p>
                </div>
              </div>

              {issue.image && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Attached Image</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={issue.image} 
                      alt="Issue attachment" 
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                </div>
              )}

              {issue.response && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Official Response</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="whitespace-pre-wrap text-blue-800">{issue.response}</p>
                    <div className="mt-2 text-sm text-blue-600">
                      <span>Responded on: {formatDate(issue.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Location and Admin Controls */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <h3 className="text-lg font-semibold mb-2">Location</h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <MdLocationOn className="text-red-600 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{issue.location}</p>
                      <p className="text-sm text-gray-600">{issue.district}, {issue.province}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <h3 className="text-lg font-semibold mb-2">Issue ID</h3>
                <div className="flex items-start">
                  <MdLabelImportant className="text-gray-600 mt-1 mr-2 flex-shrink-0" />
                  <code className="bg-gray-200 px-2 py-1 rounded text-sm">{issue._id}</code>
                </div>
              </div>

              {isAdmin && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-3">Admin Controls</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-2">Update Status:</p>
                    <div className="space-y-2">
                      {['Pending', 'In Progress', 'Resolved', 'Rejected'].map((statusOption) => (
                        <button
                          key={statusOption}
                          onClick={() => handleStatusUpdate(statusOption)}
                          disabled={updateStatusLoading || status === statusOption}
                          className={`w-full px-3 py-2 text-sm font-medium rounded-md ${
                            status === statusOption
                              ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                              : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {statusOption}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueDetails; 