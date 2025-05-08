import React, { useState, useEffect } from 'react';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import { useSelector } from 'react-redux';

const SalaryHistory = ({ salaryHistory = [], onUpdate }) => {
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [salaryToDelete, setSalaryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  
  const { token } = useSelector((state) => state.auth);
  
  // Sort salary history by date (newest first)
  const sortedHistory = [...salaryHistory].sort((a, b) => {
    const dateA = new Date(a.year, a.month - 1);
    const dateB = new Date(b.year, b.month - 1);
    return dateB - dateA;
  });
  
  // Format month name
  const getMonthName = (monthNum) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNum - 1];
  };
  
  // View salary details
  const viewSalaryDetails = (salary) => {
    setSelectedSalary(salary);
  };
  
  // Close modal
  const closeModal = () => {
    setSelectedSalary(null);
  };

  // Open delete confirmation modal
  const confirmDelete = (salary) => {
    setSalaryToDelete(salary);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setTimeout(() => {
      setSalaryToDelete(null);
      setDeleteError(null);
    }, 300);
  };

  // Delete salary history entry
  const deleteSalaryHistory = async () => {
    if (!salaryToDelete || !salaryToDelete._id) {
      setDeleteError("Invalid salary record");
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);

      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/finance/employees/salary/${salaryToDelete._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Close the modal first
        closeDeleteModal();
        
        // If there's an onUpdate callback, call it to refresh the data
        if (onUpdate && typeof onUpdate === 'function') {
          onUpdate();
        }
      } else {
        setDeleteError(response.data.message || "Failed to delete salary record");
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Something went wrong. Please try again later.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Download salary slip as PDF
  const downloadSalarySlip = (salary) => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Add company logo/header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('DataVerse', 105, 20, null, null, 'center');
      
      doc.setFontSize(16);
      doc.text('Salary Slip', 105, 30, null, null, 'center');
      
      doc.setFontSize(12);
      doc.text(`Period: ${getMonthName(salary.month)} ${salary.year}`, 105, 40, null, null, 'center');
      
      // Add line separator
      doc.setLineWidth(0.5);
      doc.line(20, 45, 190, 45);
      
      // Employee Info
      doc.setFontSize(11);
      doc.text('Employee Details', 20, 55);
      doc.setFontSize(10);
      doc.text(`Employee ID: ${salary.employeeId || 'N/A'}`, 20, 65);
      doc.text(`Payment Date: ${salary.paymentDate ? new Date(salary.paymentDate).toLocaleDateString() : 'Pending'}`, 20, 73);
      doc.text(`Payment Status: ${salary.paymentStatus}`, 20, 81);
      
      // Earnings table
      doc.setFontSize(11);
      doc.text('Earnings', 20, 95);
      
      const earningsBody = [
        ['Basic Salary', `$${salary.basicSalary.toFixed(2)}`]
      ];
      
      if (salary.allowances && Array.isArray(salary.allowances)) {
        salary.allowances.forEach(allowance => {
          earningsBody.push([allowance.name, `$${allowance.amount.toFixed(2)}`]);
        });
      }
      
      // Use autotable plugin
      autoTable(doc, {
        startY: 100,
        head: [['Description', 'Amount']],
        body: earningsBody,
        theme: 'grid',
        headStyles: { fillColor: [66, 135, 245] },
        margin: { left: 20, right: 20 }
      });
      
      // Get the y position after the table
      let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 130;
      
      // Deductions table
      const deductionsY = finalY + 15;
      doc.setFontSize(11);
      doc.text('Deductions', 20, deductionsY);
      
      const deductionsBody = [];
      
      if (salary.deductions && Array.isArray(salary.deductions) && salary.deductions.length > 0) {
        salary.deductions.forEach(deduction => {
          deductionsBody.push([deduction.name, `$${deduction.amount.toFixed(2)}`]);
        });
      }
      
      if (salary.loanDeductions > 0) {
        deductionsBody.push(['Loan Installment', `$${salary.loanDeductions.toFixed(2)}`]);
      }
      
      if (deductionsBody.length === 0) {
        deductionsBody.push(['No deductions', '$0.00']);
      }
      
      // Use autotable plugin
      autoTable(doc, {
        startY: deductionsY + 5,
        head: [['Description', 'Amount']],
        body: deductionsBody,
        theme: 'grid',
        headStyles: { fillColor: [239, 83, 80] },
        margin: { left: 20, right: 20 }
      });
      
      // Get the y position after the table
      finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : deductionsY + 50;
      
      // Summary table
      const summaryY = finalY + 15;
      doc.setFontSize(11);
      doc.text('Summary', 20, summaryY);
      
      const totalEarnings = salary.basicSalary + 
        (salary.allowances && Array.isArray(salary.allowances) 
          ? salary.allowances.reduce((sum, allowance) => sum + allowance.amount, 0)
          : 0);
      
      const totalDeductions = (salary.deductions && Array.isArray(salary.deductions)
          ? salary.deductions.reduce((sum, deduction) => sum + deduction.amount, 0)
          : 0) + 
        (salary.loanDeductions || 0);
      
      // Use autotable plugin
      autoTable(doc, {
        startY: summaryY + 5,
        body: [
          ['Total Earnings', `$${totalEarnings.toFixed(2)}`],
          ['Total Deductions', `$${totalDeductions.toFixed(2)}`],
          ['Net Salary', `$${salary.netSalary.toFixed(2)}`]
        ],
        theme: 'grid',
        bodyStyles: { 
          fillColor: [249, 249, 249],
          textColor: [0, 0, 0] 
        },
        alternateRowStyles: {
          fillColor: [249, 249, 249]
        },
        columnStyles: {
          0: { font: 'bold' },
          1: { halign: 'right' }
        },
        margin: { left: 20, right: 20 }
      });
      
      // Get the y position after the table
      finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : summaryY + 50;
      
      // Footer
      const footerY = finalY + 20;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('This is a computer-generated document. No signature is required.', 105, footerY, null, null, 'center');
      
      // Save the PDF
      doc.save(`Salary_Slip_${getMonthName(salary.month)}_${salary.year}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again later.");
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Salary History</h2>
      
      {sortedHistory.length === 0 ? (
        <p className="text-gray-500">No salary history available yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-3 px-4 bg-gray-100 text-left text-gray-600 font-semibold">Period</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-gray-600 font-semibold">Net Salary</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-gray-600 font-semibold">Status</th>
                <th className="py-3 px-4 bg-gray-100 text-left text-gray-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((salary, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-3 px-4 border-b">
                    {getMonthName(salary.month)} {salary.year}
                  </td>
                  <td className="py-3 px-4 border-b font-medium">${salary.netSalary.toFixed(2)}</td>
                  <td className="py-3 px-4 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                      ${salary.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {salary.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => viewSalaryDetails(salary)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          try {
                            downloadSalarySlip(salary);
                          } catch (error) {
                            console.error("Error downloading PDF:", error);
                            alert("Failed to download salary sheet. Please try again.");
                          }
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF
                      </button>
                      <button 
                        onClick={() => confirmDelete(salary)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Salary Details Modal */}
      {selectedSalary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Salary Slip - {getMonthName(selectedSalary.month)} {selectedSalary.year}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6 p-4 border-b">
              <h4 className="text-lg font-semibold mb-2 text-gray-700">Earnings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-600">Basic Salary:</p>
                  <p className="text-gray-800">${selectedSalary.basicSalary.toFixed(2)}</p>
                </div>
                
                {selectedSalary.allowances.map((allowance, index) => (
                  <div key={index}>
                    <p className="font-medium text-gray-600">{allowance.name}:</p>
                    <p className="text-gray-800">${allowance.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6 p-4 border-b">
              <h4 className="text-lg font-semibold mb-2 text-gray-700">Deductions</h4>
              <div className="grid grid-cols-2 gap-4">
                {selectedSalary.deductions.length > 0 ? (
                  selectedSalary.deductions.map((deduction, index) => (
                    <div key={index}>
                      <p className="font-medium text-gray-600">{deduction.name}:</p>
                      <p className="text-gray-800">${deduction.amount.toFixed(2)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No deductions applied</p>
                )}
                
                {selectedSalary.loanDeductions > 0 && (
                  <div>
                    <p className="font-medium text-gray-600">Loan Installment:</p>
                    <p className="text-gray-800">${selectedSalary.loanDeductions.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-700">Net Salary:</h4>
                <p className="text-xl font-bold text-green-600">${selectedSalary.netSalary.toFixed(2)}</p>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-600">Payment Status:</h4>
                <p className={`text-sm font-semibold ${selectedSalary.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {selectedSalary.paymentStatus}
                </p>
              </div>
              {selectedSalary.paymentDate && (
                <div className="mt-2 flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-600">Payment Date:</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedSalary.paymentDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-center space-x-4">
              <button 
                onClick={() => window.print()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  try {
                    downloadSalarySlip(selectedSalary);
                  } catch (error) {
                    console.error("Error downloading PDF:", error);
                    alert("Failed to download salary sheet. Please try again.");
                  }
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">Confirm Deletion</h3>
              <p className="text-gray-600 mt-2">
                Are you sure you want to delete the salary record for {getMonthName(salaryToDelete?.month)} {salaryToDelete?.year}?
                This action cannot be undone.
              </p>
              
              {deleteError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{deleteError}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-4">
              <button 
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={deleteSalaryHistory}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryHistory; 