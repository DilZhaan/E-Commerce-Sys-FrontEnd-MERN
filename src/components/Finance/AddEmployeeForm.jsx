import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const AddEmployeeForm = ({ onEmployeeAdded }) => {
  const [regularUsers, setRegularUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [selectedUserId, setSelectedUserId] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  
  const { token } = useSelector((state) => state.auth);
  
  useEffect(() => {
    fetchRegularUsers();
  }, [token]);
  
  const fetchRegularUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/admin/general`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setRegularUsers(response.data.data);
      } else {
        setError('Failed to fetch regular users');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUserId || !basicSalary) {
      setError('Please select a user and enter a basic salary');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/finance/employees/set`,
        {
          userId: selectedUserId,
          basicSalary: parseFloat(basicSalary)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setSuccess('Employee added successfully');
        setSelectedUserId('');
        setBasicSalary('');
        
        // Refresh the employee list and notify parent component
        if (onEmployeeAdded) {
          onEmployeeAdded();
        }
      } else {
        setError('Failed to add employee');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">Add Employee</h2>
      
      {regularUsers.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-md mb-6">
          <p className="text-yellow-700">There are no regular users available to convert to employees.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-lg">
          {error && (
            <div className="bg-red-50 p-4 rounded-md mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 p-4 rounded-md mb-6">
              <p className="text-green-700">{success}</p>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="userId" className="block text-gray-700 text-sm font-medium mb-2">
              Select User
            </label>
            <select
              id="userId"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">-- Select a user --</option>
              {regularUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.fName} {user.lName} ({user.email})
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label htmlFor="basicSalary" className="block text-gray-700 text-sm font-medium mb-2">
              Basic Salary
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                id="basicSalary"
                value={basicSalary}
                onChange={(e) => setBasicSalary(e.target.value)}
                placeholder="Enter basic salary"
                step="0.01"
                min="0"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-medium ${
                submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {submitting ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddEmployeeForm; 