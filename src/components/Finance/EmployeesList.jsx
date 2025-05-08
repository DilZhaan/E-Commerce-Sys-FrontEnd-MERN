import React, { useState } from 'react';

const EmployeesList = ({ employees, onSelectEmployee, refreshEmployees }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee => 
    employee.fName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.lName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Employees</h2>
        <div className="flex justify-between items-center mb-4">
          <div className="w-full sm:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Search employees..."
              />
            </div>
          </div>
          <button
            onClick={refreshEmployees}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Refresh"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      {filteredEmployees.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No employees found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Name</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Email</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Phone</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Basic Salary</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 border-b border-gray-200">
                    <div className="flex items-center">
                      {employee.proPic ? (
                        <img 
                          src={employee.proPic} 
                          alt={`${employee.fName} ${employee.lName}`} 
                          className="h-10 w-10 rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-800 font-semibold">
                            {employee.fName.charAt(0)}{employee.lName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{employee.fName} {employee.lName}</p>
                        <p className="text-xs text-gray-500">Since {new Date(employee.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 border-b border-gray-200 text-gray-700">{employee.email}</td>
                  <td className="py-4 px-4 border-b border-gray-200 text-gray-700">{employee.phone || 'N/A'}</td>
                  <td className="py-4 px-4 border-b border-gray-200 text-gray-700">
                    ${employee.employeeDetails?.basicSalary?.toFixed(2) || '0.00'}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-200">
                    <button
                      onClick={() => onSelectEmployee(employee)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeesList; 