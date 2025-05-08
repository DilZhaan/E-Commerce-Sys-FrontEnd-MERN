import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllIssues, deleteIssue } from '../../services/issueServices';
import { toast } from 'react-toastify';
import { FaPlus, FaSearch, FaFilter, FaTrash, FaEye } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';
import Loading from '../../components/Loading';

const statusColors = {
  'Pending': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800'
  },
  'In Progress': {
    bg: 'bg-blue-100',
    text: 'text-blue-800'
  },
  'Resolved': {
    bg: 'bg-green-100',
    text: 'text-green-800'
  },
  'Rejected': {
    bg: 'bg-red-100',
    text: 'text-red-800'
  }
};

function Issues() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin (this is just a placeholder - implement based on your auth system)
    const checkIfAdmin = () => {
      // Example implementation - replace with your actual admin check
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setIsAdmin(user.role === 'admin');
    };

    checkIfAdmin();
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await getAllIssues();
      setIssues(response.data);
    } catch (err) {
      console.error('Error fetching issues:', err);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIssue = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this issue?')) {
      return;
    }
    
    try {
      setDeleteLoading(true);
      await deleteIssue(id);
      setIssues(issues.filter(issue => issue._id !== id));
      toast.success('Issue deleted successfully');
    } catch (err) {
      console.error('Error deleting issue:', err);
      toast.error('Failed to delete issue');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === '' || issue.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    fetchIssues();
    setSearchQuery('');
    setStatusFilter('');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">My Issues</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            <MdRefresh className="mr-2" />
            Refresh
          </button>
          <Link
            to="/account/issues/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Report New Issue
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="md:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {filteredIssues.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter
              ? "No issues match your current filters."
              : "You haven't reported any issues yet."}
          </p>
          {searchQuery || statusFilter ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Clear Filters
            </button>
          ) : (
            <Link
              to="/account/issues/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              <FaPlus className="mr-2 -ml-1" />
              Report an Issue
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIssues.map((issue) => {
                  const statusStyle = statusColors[issue.status] || {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800'
                  };
                  
                  return (
                    <tr 
                      key={issue._id}
                      onClick={() => navigate(`/account/issues/${issue._id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-start">
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">{issue.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{issue.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{issue.location}</div>
                        <div className="text-xs text-gray-500">{issue.district}, {issue.province}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(issue.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={(e) => navigate(`/account/issues/${issue._id}`)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View details"
                          >
                            <FaEye />
                          </button>
                          
                          {(isAdmin || issue.status === 'Pending') && (
                            <button
                              onClick={(e) => handleDeleteIssue(issue._id, e)}
                              disabled={deleteLoading}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete issue"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Issues; 