import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SalaryHistory from './SalaryHistory';
import LoanDetails from './LoanDetails';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const SalaryManagement = ({ employee, token, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [newBasicSalary, setNewBasicSalary] = useState(employee.employeeDetails?.basicSalary || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Allowance form
  const [allowanceName, setAllowanceName] = useState('');
  const [allowanceAmount, setAllowanceAmount] = useState('');
  const [allowanceDescription, setAllowanceDescription] = useState('');
  
  // Loan form
  const [loanAmount, setLoanAmount] = useState('');
  const [loanReason, setLoanReason] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  
  // Generate salary form
  const [salaryMonth, setSalaryMonth] = useState('');
  const [salaryYear, setSalaryYear] = useState(new Date().getFullYear());
  
  useEffect(() => {
    // Reset form when employee changes
    setNewBasicSalary(employee.employeeDetails?.basicSalary || '');
    setError(null);
    setSuccess(null);
  }, [employee]);
  
  // Update basic salary
  const handleUpdateBasicSalary = async (e) => {
    e.preventDefault();
    
    if (!newBasicSalary) {
      setError('Please enter a basic salary');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/finance/employees/salary/update`,
        {
          employeeId: employee._id,
          basicSalary: parseFloat(newBasicSalary)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setSuccess('Basic salary updated successfully');
        if (onUpdate) onUpdate();
      } else {
        setError('Failed to update basic salary');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Add allowance
  const handleAddAllowance = async (e) => {
    e.preventDefault();
    
    if (!allowanceName || !allowanceAmount) {
      setError('Allowance name and amount are required');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/finance/employees/allowance/add`,
        {
          employeeId: employee._id,
          name: allowanceName,
          amount: parseFloat(allowanceAmount),
          description: allowanceDescription
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setSuccess('Allowance added successfully');
        setAllowanceName('');
        setAllowanceAmount('');
        setAllowanceDescription('');
        if (onUpdate) onUpdate();
      } else {
        setError('Failed to add allowance');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Add loan
  const handleAddLoan = async (e) => {
    e.preventDefault();
    
    if (!loanAmount || !installmentAmount || !totalInstallments) {
      setError('Loan amount, installment amount, and total installments are required');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/finance/employees/loan/add`,
        {
          employeeId: employee._id,
          amount: parseFloat(loanAmount),
          reason: loanReason,
          installmentAmount: parseFloat(installmentAmount),
          totalInstallments: parseInt(totalInstallments)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setSuccess('Loan added successfully');
        setLoanAmount('');
        setLoanReason('');
        setInstallmentAmount('');
        setTotalInstallments('');
        if (onUpdate) onUpdate();
      } else {
        setError('Failed to add loan');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Generate monthly salary
  const handleGenerateSalary = async (e) => {
    e.preventDefault();
    
    if (!salaryMonth || !salaryYear) {
      setError('Month and year are required');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/finance/employees/salary/generate`,
        {
          employeeId: employee._id,
          month: parseInt(salaryMonth),
          year: parseInt(salaryYear)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setSuccess('Salary generated successfully');
        setSalaryMonth('');
        if (onUpdate) onUpdate();
      } else {
        setError('Failed to generate salary');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Function to generate salary breakdown data for charts
  const generateSalaryBreakdownData = () => {
    if (!employee.employeeDetails) return [];
    
    const basicSalary = employee.employeeDetails.basicSalary || 0;
    const totalAllowances = employee.employeeDetails.additionalAllowances?.reduce((sum, allowance) => sum + allowance.amount, 0) || 0;
    const loanDeductions = employee.employeeDetails.loans?.filter(loan => loan.status === 'ACTIVE')
      .reduce((sum, loan) => sum + loan.installmentAmount, 0) || 0;
    
    // Calculate EPF and ETF
    const epfEmployee = basicSalary * 0.08;
    const epfEmployer = basicSalary * 0.12;
    const etf = basicSalary * 0.03;
    
    return [
      { name: 'Basic Salary', value: basicSalary, color: '#8884d8' },
      { name: 'Allowances', value: totalAllowances, color: '#82ca9d' },
      { name: 'Loan Deductions', value: loanDeductions, color: '#ff8042' },
      { name: 'EPF (Employee)', value: epfEmployee, color: '#ffc658' },
    ];
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('allowances')}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'allowances'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Allowances
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'loans'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Loans
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'generate'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Generate Salary
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Salary History
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {employee.fName} {employee.lName}
                </h2>
                <p className="text-gray-600">{employee.email}</p>
                <p className="text-gray-600">{employee.employeeDetails?.position || 'No position set'}</p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => setActiveTab('generate')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Generate Monthly Salary
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Salary Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">Basic Salary</p>
                  <p className="text-xl font-bold text-blue-800">
                    ${employee.employeeDetails?.basicSalary?.toFixed(2) || '0.00'}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">Total Allowances</p>
                  <p className="text-xl font-bold text-green-800">
                    ${employee.employeeDetails?.additionalAllowances?.reduce((sum, allowance) => sum + allowance.amount, 0).toFixed(2) || '0.00'}
                  </p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">Loan Deductions</p>
                  <p className="text-xl font-bold text-red-800">
                    ${employee.employeeDetails?.loans?.filter(loan => loan.status === 'ACTIVE')
                      .reduce((sum, loan) => sum + loan.installmentAmount, 0).toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
              
              {/* Salary Breakdown Chart */}
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-700 mb-3">Salary Breakdown</h4>
                <div className="h-72 mt-4" style={{ width: '100%', minHeight: '250px' }}>
                  {typeof window !== 'undefined' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={generateSalaryBreakdownData()}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {generateSalaryBreakdownData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
              
              {/* EPF and ETF Calculations */}
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-700 mb-3">EPF and ETF</h4>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">EPF (Employee Contribution - 8%)</span>
                    <span className="font-medium">${(employee.employeeDetails?.basicSalary * 0.08).toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">EPF (Employer Contribution - 12%)</span>
                    <span className="font-medium">${(employee.employeeDetails?.basicSalary * 0.12).toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ETF (Employer Contribution - 3%)</span>
                    <span className="font-medium">${(employee.employeeDetails?.basicSalary * 0.03).toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Update Basic Salary Form */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Update Basic Salary</h3>
              {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
              {success && <div className="mb-4 text-green-500 text-sm">{success}</div>}
              
              <form onSubmit={handleUpdateBasicSalary} className="space-y-4">
                <div>
                  <label htmlFor="newBasicSalary" className="block text-sm font-medium text-gray-700 mb-1">
                    New Basic Salary ($)
                  </label>
                  <input
                    type="number"
                    id="newBasicSalary"
                    value={newBasicSalary}
                    onChange={(e) => setNewBasicSalary(parseFloat(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  disabled={submitting}
                >
                  {submitting ? 'Updating...' : 'Update Salary'}
                </button>
              </form>
            </div>
          </div>
        )}
        
        {/* Allowances Tab */}
        {activeTab === 'allowances' && (
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Add Allowance</h3>
              <form onSubmit={handleAddAllowance}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="allowanceName" className="block text-sm font-medium text-gray-700 mb-1">
                      Allowance Name
                    </label>
                    <input
                      type="text"
                      id="allowanceName"
                      value={allowanceName}
                      onChange={(e) => setAllowanceName(e.target.value)}
                      placeholder="E.g., Housing, Transport, Bonus"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="allowanceAmount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        id="allowanceAmount"
                        value={allowanceAmount}
                        onChange={(e) => setAllowanceAmount(e.target.value)}
                        placeholder="Amount"
                        step="0.01"
                        min="0"
                        className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="allowanceDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="allowanceDescription"
                    value={allowanceDescription}
                    onChange={(e) => setAllowanceDescription(e.target.value)}
                    placeholder="Description of the allowance"
                    rows="2"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full md:w-auto px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                      submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                  >
                    {submitting ? 'Adding...' : 'Add Allowance'}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Current Allowances</h3>
              {employee.employeeDetails?.additionalAllowances?.length === 0 ? (
                <p className="text-gray-500">No allowances have been added yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-3 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                        <th className="py-3 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employee.employeeDetails?.additionalAllowances?.map((allowance, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-3 px-4 border-b">{allowance.name}</td>
                          <td className="py-3 px-4 border-b">${allowance.amount.toFixed(2)}</td>
                          <td className="py-3 px-4 border-b">{allowance.description || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Loans Tab */}
        {activeTab === 'loans' && (
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Add Loan</h3>
              <form onSubmit={handleAddLoan}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        id="loanAmount"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        placeholder="Total loan amount"
                        step="0.01"
                        min="0"
                        className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="loanReason" className="block text-sm font-medium text-gray-700 mb-1">
                      Reason (Optional)
                    </label>
                    <input
                      type="text"
                      id="loanReason"
                      value={loanReason}
                      onChange={(e) => setLoanReason(e.target.value)}
                      placeholder="Purpose of the loan"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="installmentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Installment
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        id="installmentAmount"
                        value={installmentAmount}
                        onChange={(e) => setInstallmentAmount(e.target.value)}
                        placeholder="Monthly deduction amount"
                        step="0.01"
                        min="0"
                        className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="totalInstallments" className="block text-sm font-medium text-gray-700 mb-1">
                      Total Installments
                    </label>
                    <input
                      type="number"
                      id="totalInstallments"
                      value={totalInstallments}
                      onChange={(e) => setTotalInstallments(e.target.value)}
                      placeholder="Number of installments"
                      min="1"
                      step="1"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full md:w-auto px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                      submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                  >
                    {submitting ? 'Adding...' : 'Add Loan'}
                  </button>
                </div>
              </form>
            </div>
            
            <LoanDetails loans={employee.employeeDetails?.loans || []} />
          </div>
        )}
        
        {/* Generate Salary Tab */}
        {activeTab === 'generate' && (
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Generate Monthly Salary</h3>
              <form onSubmit={handleGenerateSalary}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="salaryMonth" className="block text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <select
                      id="salaryMonth"
                      value={salaryMonth}
                      onChange={(e) => setSalaryMonth(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select month</option>
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="salaryYear" className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      id="salaryYear"
                      value={salaryYear}
                      onChange={(e) => setSalaryYear(e.target.value)}
                      placeholder="Year"
                      min="2000"
                      max="2100"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-md mb-4">
                  <p className="text-yellow-700 text-sm">
                    Generating a salary will automatically calculate the net salary based on the basic salary, allowances, and active loan deductions.
                    It will also update the remaining installments for any active loans.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <h4 className="text-blue-800 font-medium mb-2">Mandatory Deductions</h4>
                  <ul className="list-disc pl-5 text-sm text-blue-700">
                    <li className="mb-1">EPF Deduction: 12% of Basic Salary (${(employee.employeeDetails?.basicSalary * 0.12).toFixed(2) || '0.00'})</li>
                    <li className="mb-1">ETF Deduction: 3% of Basic Salary (${(employee.employeeDetails?.basicSalary * 0.03).toFixed(2) || '0.00'})</li>
                    <li className="font-medium">Total Deductions: ${(employee.employeeDetails?.basicSalary * 0.15).toFixed(2) || '0.00'}</li>
                  </ul>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full md:w-auto px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                      submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                  >
                    {submitting ? 'Generating...' : 'Generate Salary'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Salary History Tab */}
        {activeTab === 'history' && (
          <SalaryHistory 
            salaryHistory={employee.employeeDetails?.salaryHistory || []} 
            onUpdate={onUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default SalaryManagement; 