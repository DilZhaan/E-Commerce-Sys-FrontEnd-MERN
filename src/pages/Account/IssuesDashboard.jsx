import React, { useState, useEffect } from 'react';
import { getUserIssues, deleteIssue, downloadIssuesCSV } from '../../services/issueServices';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { MdAdd, MdDelete, MdMessage, MdArrowBack, MdDownload } from 'react-icons/md';
import { toast } from 'react-toastify';
import axios from 'axios';

const statusColors = {
  'PENDING': 'bg-yellow-100 text-yellow-800',
  'IN_PROGRESS': 'bg-blue-100 text-blue-800',
  'RESOLVED': 'bg-green-100 text-green-800',
  'CLOSED': 'bg-gray-100 text-gray-800'
};

function IssuesDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Helper function to get token from cookies
  const getToken = async () => {
    // The token is stored in a cookie, so we just need to make an authenticated request
    // We'll be using the withCredentials: true option in axios
    return null; // We don't need to return a token since we use cookies
  };

  const fetchIssues = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getUserIssues(null, page);
      setIssues(response.issues);
      setTotalPages(response.pagination.pages);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message || 'Failed to fetch issues');
      toast.error('Failed to load your issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchIssues(1);
    } else {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  const handleDeleteIssue = async (issueId) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        setLoading(true);
        await deleteIssue(issueId, null);
        toast.success('Issue deleted successfully');
        // Refresh issues list
        fetchIssues(currentPage);
      } catch (err) {
        toast.error(err.message || 'Failed to delete issue');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePageChange = (page) => {
    fetchIssues(page);
  };

  const handleDownloadCSV = async () => {
    try {
      setDownloadingCSV(true);
      await downloadIssuesCSV();
      toast.success('Issues report downloaded successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to download issues report');
    } finally {
      setDownloadingCSV(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <MdArrowBack className="text-xl mr-1" />
        </button>
        <h1 className="text-2xl font-bold flex-grow">My Issues</h1>
        
        <div className="flex space-x-3">
          {issues.length > 0 && (
            <button 
              onClick={handleDownloadCSV}
              disabled={downloadingCSV}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md mr-2"
            >
              <MdDownload className="mr-1 text-xl" /> 
              {downloadingCSV ? 'Downloading...' : 'Download CSV'}
            </button>
          )}
          
          <Link 
            to="/account/issues/new" 
            className="flex items-center px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md"
          >
            <MdAdd className="mr-1 text-xl" /> Report New Issue
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r">
        <h2 className="text-lg font-semibold text-blue-800 mb-1">Issue Reporting System</h2>
        <p className="text-sm text-blue-700">
          Use this system to report and track any issues you're experiencing. Our team will review your report and respond as soon as possible.
        </p>
      </div>

      {loading && !issues.length ? (
        <div className="text-center py-8">
          <div className="spinner"></div>
          <p className="mt-2">Loading your issues...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      ) : !issues.length ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg shadow-sm">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Issues Reported Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">You haven't reported any issues yet. Click the button below to create your first issue report.</p>
          <Link 
            to="/account/issues/new" 
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md inline-flex items-center"
          >
            <MdAdd className="mr-1" /> Report an Issue
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{issue.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{issue.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{issue.district}</div>
                      <div className="text-sm text-gray-500">{issue.province}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[issue.status]}`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(issue.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-3">
                        <Link
                          to={`/account/issues/${issue._id}`}
                          className="text-blue-500 hover:text-blue-700 transition flex items-center"
                          title="View Issue & Messages"
                        >
                          <MdMessage className="text-xl" />
                        </Link>
                        <button
                          onClick={() => handleDeleteIssue(issue._id)}
                          className="text-red-500 hover:text-red-700 transition flex items-center"
                          title="Delete Issue"
                        >
                          <MdDelete className="text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                {[...Array(totalPages).keys()].map((page) => (
                  <button
                    key={page + 1}
                    onClick={() => handlePageChange(page + 1)}
                    className={`px-3 py-1 border border-gray-300 text-sm font-medium ${
                      currentPage === page + 1
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default IssuesDashboard; 