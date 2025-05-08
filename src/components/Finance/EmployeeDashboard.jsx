import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import SalaryHistory from './SalaryHistory';
import LoanDetails from './LoanDetails';

const EmployeeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  // Function to fetch employee data
  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/finance/employee/salary`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setEmployeeData(response.data.data);
      } else {
        setError('Failed to fetch employee data');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchEmployeeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Go to Home
        </button>
      </div>
    );
  }
  
  if (!employeeData) {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-yellow-700 mb-2">No Data Found</h2>
        <p className="text-yellow-600">No employee data available. Please contact the administrator.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Go to Home
        </button>
      </div>
    );
  }
  
  // Calculate total earnings from current month or most recent salary
  const currentSalary = employeeData.salaryHistory?.length > 0 
    ? employeeData.salaryHistory[employeeData.salaryHistory.length - 1] 
    : null;
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Navigation and header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-2">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-500 py-2">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-700 font-medium">Employee Finance</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Back button and title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <button 
              onClick={() => navigate('/dashboard')}
              className="mr-3 bg-white p-2 rounded-full shadow hover:bg-gray-50 transition-colors"
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Employee Finance Dashboard</h1>
          </div>
          <div className="flex items-center">
            <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-medium">
              {user?.fullName || `${user?.fName || ''} ${user?.lName || ''}`}
            </span>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                activeTab === 'summary' 
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Salary Summary
            </button>
            <button 
              onClick={() => setActiveTab('allowances')}
              className={`px-6 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                activeTab === 'allowances' 
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Allowances
            </button>
            <button 
              onClick={() => setActiveTab('loans')}
              className={`px-6 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                activeTab === 'loans' 
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Loans
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                activeTab === 'history' 
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Salary History
            </button>
          </div>
        </div>
      
        {/* Active tab content */}
        <div className="space-y-6">
          {activeTab === 'summary' && (
            <>
              {/* Summary Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-2">Salary Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                    <h3 className="text-lg font-medium text-blue-700 mb-2">Basic Salary</h3>
                    <p className="text-2xl font-bold text-blue-800">${employeeData.basicSalary.toFixed(2)}</p>
                    <p className="text-sm text-blue-600 mt-1">Monthly base salary</p>
                  </div>
                  
                  <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                    <h3 className="text-lg font-medium text-green-700 mb-2">Total Allowances</h3>
                    <p className="text-2xl font-bold text-green-800">
                      ${employeeData.additionalAllowances.reduce((total, allowance) => total + allowance.amount, 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-green-600 mt-1">{employeeData.additionalAllowances.length} active allowances</p>
                  </div>
                  
                  <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
                    <h3 className="text-lg font-medium text-purple-700 mb-2">Latest Net Salary</h3>
                    <p className="text-2xl font-bold text-purple-800">
                      {currentSalary 
                        ? `$${currentSalary.netSalary.toFixed(2)}` 
                        : 'No salary processed yet'}
                    </p>
                    <p className="text-sm text-purple-600 mt-1">
                      {currentSalary 
                        ? `${currentSalary.month}/${currentSalary.year} - ${currentSalary.paymentStatus}` 
                        : 'Awaiting first salary'}
                    </p>
                  </div>
                </div>
                
                {/* EPF and ETF Deductions */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Mandatory Deductions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <h4 className="text-md font-medium text-red-700 mb-1">EPF (12%)</h4>
                      <p className="text-xl font-bold text-red-800">${(employeeData.basicSalary * 0.12).toFixed(2)}</p>
                      <p className="text-sm text-red-600 mt-1">Employee Provident Fund</p>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <h4 className="text-md font-medium text-red-700 mb-1">ETF (3%)</h4>
                      <p className="text-xl font-bold text-red-800">${(employeeData.basicSalary * 0.03).toFixed(2)}</p>
                      <p className="text-sm text-red-600 mt-1">Employee Trust Fund</p>
                    </div>
                  </div>
                </div>
                
                {/* Quick links */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('history')}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Salary History
                  </button>
                  <button
                    onClick={() => setActiveTab('loans')}
                    className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Manage Loans
                  </button>
                </div>
              </div>
              
              {/* Recent activity */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Activity</h2>
                {employeeData.salaryHistory && employeeData.salaryHistory.length > 0 ? (
                  <div className="space-y-3">
                    {employeeData.salaryHistory.slice(0, 3).map((salary, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Salary for {salary.month}/{salary.year}</p>
                            <p className="text-sm text-gray-500">
                              Status: <span className={salary.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}>
                                {salary.paymentStatus}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">${salary.netSalary.toFixed(2)}</p>
                          <button 
                            onClick={() => setActiveTab('history')}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent salary activity.</p>
                )}
              </div>
            </>
          )}
          
          {activeTab === 'allowances' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700 border-b pb-3">Allowances</h2>
              {employeeData.additionalAllowances.length === 0 ? (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600 text-lg">No allowances have been added yet.</p>
                  <p className="text-gray-500 mt-1">Allowances will appear here when they are assigned to you.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead>
                      <tr>
                        <th className="py-3 px-4 bg-gray-100 text-left text-gray-600 font-semibold">Name</th>
                        <th className="py-3 px-4 bg-gray-100 text-left text-gray-600 font-semibold">Amount</th>
                        <th className="py-3 px-4 bg-gray-100 text-left text-gray-600 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeData.additionalAllowances.map((allowance, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-3 px-4 border-b">{allowance.name}</td>
                          <td className="py-3 px-4 border-b font-medium">${allowance.amount.toFixed(2)}</td>
                          <td className="py-3 px-4 border-b">{allowance.description || 'N/A'}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-medium">
                        <td className="py-3 px-4 border-b">Total</td>
                        <td className="py-3 px-4 border-b text-green-700">
                          ${employeeData.additionalAllowances.reduce((total, allowance) => total + allowance.amount, 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 border-b"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'loans' && (
            <LoanDetails loans={employeeData.loans} />
          )}
          
          {activeTab === 'history' && (
            <SalaryHistory 
              salaryHistory={employeeData.salaryHistory} 
              onUpdate={() => {
                // Refresh employee data when a salary record is deleted
                fetchEmployeeData();
              }}
            />
          )}
        </div>
        
        {/* Bottom navigation */}
        <div className="flex justify-between mt-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-md shadow-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard; 