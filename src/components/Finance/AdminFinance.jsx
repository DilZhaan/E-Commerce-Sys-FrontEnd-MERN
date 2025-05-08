import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import EmployeesList from './EmployeesList';
import AddEmployeeForm from './AddEmployeeForm';
import SalaryManagement from './SalaryManagement';

const AdminFinance = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchEmployees();
  }, [token, navigate]);
  
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/finance/employees`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setEmployees(response.data.data);
      } else {
        setError('Failed to fetch employees data');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setActiveTab('salary');
  };
  
  const handleEmployeeAdded = () => {
    fetchEmployees();
    setActiveTab('employees');
  };
  
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
            <Link to="/admin/dashboard" className="hover:text-blue-600">Admin Dashboard</Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-700 font-medium">Finance Management</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Back button and title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="mr-3 bg-white p-2 rounded-full shadow hover:bg-gray-50 transition-colors"
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Finance Management</h1>
          </div>
          <div className="flex items-center">
            <span className="bg-purple-100 text-purple-800 py-1 px-3 rounded-full text-sm font-medium">
              {user?.role === 'ADMIN' ? 'Administrator' : 'Staff'}
            </span>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setActiveTab('employees')}
              className={`px-6 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                activeTab === 'employees' 
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Employees
            </button>
            <button 
              onClick={() => setActiveTab('add')}
              className={`px-6 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                activeTab === 'add' 
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Add Employee
            </button>
            {selectedEmployee && (
              <button 
                onClick={() => setActiveTab('salary')}
                className={`px-6 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeTab === 'salary' 
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectedEmployee.fName} {selectedEmployee.lName} - Salary
              </button>
            )}
            {/* Dashboard Summary Button */}
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                activeTab === 'dashboard' 
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </button>
          </div>
        </div>
      
        {/* Active tab content */}
        <div className="space-y-6">
          {activeTab === 'dashboard' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-2">Finance Overview</h2>
              
              {/* Statistics cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-700 mb-2">Total Employees</h3>
                  <p className="text-2xl font-bold text-blue-800">{employees.length}</p>
                  <p className="text-sm text-blue-600 mt-1">Active employees in the system</p>
                </div>
                
                <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                  <h3 className="text-lg font-medium text-green-700 mb-2">Monthly Salary Budget</h3>
                  <p className="text-2xl font-bold text-green-800">
                    ${employees.reduce((sum, emp) => sum + (emp.employeeDetails?.basicSalary || 0), 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600 mt-1">Base salaries only</p>
                </div>
                
                <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-medium text-purple-700 mb-2">Active Loans</h3>
                  <p className="text-2xl font-bold text-purple-800">
                    {employees.reduce((sum, emp) => {
                      return sum + (emp.employeeDetails?.loans?.filter(loan => loan.status === 'ACTIVE').length || 0);
                    }, 0)}
                  </p>
                  <p className="text-sm text-purple-600 mt-1">Ongoing loan payments</p>
                </div>
              </div>
              
              {/* Generate salary trend data */}
              {(() => {
                // Generate salary trend data based on employees
                const monthlySalaryTrend = [
                  { name: 'Jan', salary: employees.reduce((sum, emp) => sum + ((emp.employeeDetails?.basicSalary || 0) * 0.95), 0).toFixed(2) },
                  { name: 'Feb', salary: employees.reduce((sum, emp) => sum + ((emp.employeeDetails?.basicSalary || 0) * 0.97), 0).toFixed(2) },
                  { name: 'Mar', salary: employees.reduce((sum, emp) => sum + ((emp.employeeDetails?.basicSalary || 0) * 0.99), 0).toFixed(2) },
                  { name: 'Apr', salary: employees.reduce((sum, emp) => sum + ((emp.employeeDetails?.basicSalary || 0) * 1.0), 0).toFixed(2) },
                  { name: 'May', salary: employees.reduce((sum, emp) => sum + ((emp.employeeDetails?.basicSalary || 0) * 1.02), 0).toFixed(2) },
                  { name: 'Jun', salary: employees.reduce((sum, emp) => sum + ((emp.employeeDetails?.basicSalary || 0) * 1.03), 0).toFixed(2) },
                ];
                
                // Generate loan distribution data
                const loanCategories = {};
                employees.forEach(emp => {
                  emp.employeeDetails?.loans?.forEach(loan => {
                    if (!loan) return;
                    const reasonCategory = loan.reason?.split(' ')[0] || 'Other'; // Simplify by taking first word
                    if (loanCategories[reasonCategory]) {
                      loanCategories[reasonCategory] += loan.amount;
                    } else {
                      loanCategories[reasonCategory] = loan.amount;
                    }
                  });
                });
                
                const loanDistributionData = Object.keys(loanCategories).map(category => ({
                  name: category,
                  value: loanCategories[category]
                }));
                
                const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
                
                return (
                  <>
                    {/* Charts Section */}
                    <div className="mt-8 mb-8">
                      <h3 className="text-xl font-semibold mb-4 text-gray-700">Salary & Loans Visualization</h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Salary Trend Chart */}
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                          <h4 className="text-md font-medium text-gray-700 mb-4">Monthly Salary Trend</h4>
                          <div className="h-64" style={{ width: '100%', minHeight: '250px' }}>
                            {typeof window !== 'undefined' && (
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={monthlySalaryTrend}
                                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip 
                                    formatter={(value) => [`$${value}`, 'Total Salary']}
                                    labelFormatter={(label) => `Month: ${label}`}
                                  />
                                  <Legend />
                                  <Line
                                    type="monotone"
                                    dataKey="salary"
                                    name="Total Salary"
                                    stroke="#8884d8"
                                    activeDot={{ r: 8 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </div>
                        
                        {/* Loan Distribution Chart */}
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                          <h4 className="text-md font-medium text-gray-700 mb-4">Loan Distribution by Purpose</h4>
                          <div className="h-64" style={{ width: '100%', minHeight: '250px' }}>
                            {typeof window !== 'undefined' && (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={loanDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                  >
                                    {loanDistributionData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
              
              {/* Quick action buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab('employees')}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Manage Employees
                </button>
                <button
                  onClick={() => setActiveTab('add')}
                  className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Add New Employee
                </button>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <EmployeesList 
                employees={employees} 
                onSelectEmployee={handleSelectEmployee} 
                refreshEmployees={fetchEmployees}
              />
            </div>
          )}
          
          {activeTab === 'add' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <AddEmployeeForm onEmployeeAdded={handleEmployeeAdded} />
            </div>
          )}
          
          {activeTab === 'salary' && selectedEmployee && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => setActiveTab('employees')}
                  className="mr-4 text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Employees
                </button>
                <h2 className="text-xl font-semibold text-gray-700">
                  Managing {selectedEmployee.fName} {selectedEmployee.lName}'s Salary
                </h2>
              </div>
              <SalaryManagement 
                employee={selectedEmployee} 
                token={token}
                onUpdate={() => {
                  fetchEmployees();
                  // Update the selected employee with fresh data
                  const updatedEmployee = employees.find(emp => emp._id === selectedEmployee._id);
                  if (updatedEmployee) {
                    setSelectedEmployee(updatedEmployee);
                  }
                }}
              />
            </div>
          )}
        </div>
        
        {/* Bottom navigation */}
        <div className="flex justify-between mt-8">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-md shadow-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Admin Dashboard
          </button>
          
          {activeTab === 'employees' && (
            <button 
              onClick={() => setActiveTab('add')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Employee
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFinance; 