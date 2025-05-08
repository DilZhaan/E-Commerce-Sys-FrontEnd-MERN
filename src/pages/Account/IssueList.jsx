import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserIssues } from '../../services/issueServices';
import { toast } from 'react-toastify';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import Loading from '../../components/Loading';
import moment from 'moment';
import EmptyState from '../../components/EmptyState';

const statusColors = {
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  'in-progress': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  resolved: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  rejected: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  }
};

function IssueList() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchIssues();
  }, [pagination.page, statusFilter]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await getUserIssues({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter === 'all' ? undefined : statusFilter
      });

      setIssues(response.data.issues);
      setPagination({
        ...pagination,
        total: response.data.total,
        totalPages: response.data.totalPages
      });
    } catch (err) {
      console.error('Error fetching issues:', err);
      toast.error(err.response?.data?.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchIssues();
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const filteredIssues = issues.filter(issue => 
    issue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Issues</h1>
          <button
            onClick={() => navigate('/account/issues/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Report Issue
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              <div className="flex-1 mb-4 md:mb-0">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </form>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative w-full md:w-48">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFilter className="text-gray-400" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loading />
            </div>
          ) : filteredIssues.length > 0 ? (
            <div>
              <ul className="divide-y divide-gray-200">
                {filteredIssues.map(issue => (
                  <li key={issue._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/account/issues/${issue._id}`)}>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-800 truncate">{issue.name}</h3>
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {issue.location}, {issue.district}, {issue.province}
                          </p>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{issue.description}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <span>Created {moment(issue.createdAt).fromNow()}</span>
                            {issue.comments?.length > 0 && (
                              <span className="ml-4 flex items-center">
                                <FaSearch className="mr-1" />
                                {issue.comments.length} {issue.comments.length === 1 ? 'comment' : 'comments'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[issue.status].bg} ${statusColors[issue.status].text} border ${statusColors[issue.status].border}`}>
                          {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {[...Array(pagination.totalPages).keys()].map((number) => {
                          number = number + 1;
                          // Only show pages close to current page
                          if (
                            number === 1 ||
                            number === pagination.totalPages ||
                            (number >= pagination.page - 1 && number <= pagination.page + 1)
                          ) {
                            return (
                              <button
                                key={number}
                                onClick={() => handlePageChange(number)}
                                className={`relative inline-flex items-center px-4 py-2 border ${
                                  pagination.page === number
                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                } text-sm font-medium`}
                              >
                                {number}
                              </button>
                            );
                          }
                          
                          // Show ellipsis for skipped pages
                          if (
                            (number === 2 && pagination.page > 3) ||
                            (number === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 2)
                          ) {
                            return (
                              <span
                                key={number}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            );
                          }
                          
                          return null;
                        })}
                        
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
          ) : (
            <EmptyState 
              title="No issues found"
              description={
                searchTerm 
                  ? "No issues match your search criteria. Try a different search term or clear your filters."
                  : "You haven't reported any issues yet."
              }
              actions={[
                {
                  label: "Clear Filters",
                  onClick: () => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  },
                  show: !!searchTerm || statusFilter !== 'all',
                  variant: 'secondary'
                }
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default IssueList; 