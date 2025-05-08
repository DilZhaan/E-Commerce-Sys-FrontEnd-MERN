import React from 'react';

const LoanDetails = ({ loans = [] }) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate progress percentage
  const calculateProgress = (total, remaining) => {
    return ((total - remaining) / total) * 100;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Loan Details</h2>
      
      {loans.length === 0 ? (
        <p className="text-gray-500">No active loans.</p>
      ) : (
        <div className="space-y-6">
          {loans.map((loan, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    ${loan.amount.toFixed(2)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {loan.reason}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    loan.status === 'ACTIVE' 
                      ? 'bg-blue-100 text-blue-800' 
                      : loan.status === 'PAID' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {loan.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Date Issued</p>
                  <p className="text-sm font-medium">{formatDate(loan.dateIssued)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Installment Amount</p>
                  <p className="text-sm font-medium">${loan.installmentAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Installments</p>
                  <p className="text-sm font-medium">
                    {loan.totalInstallments - loan.remainingInstallments} of {loan.totalInstallments}
                  </p>
                </div>
              </div>
              
              {loan.status === 'ACTIVE' && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(((loan.totalInstallments - loan.remainingInstallments) / loan.totalInstallments) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${calculateProgress(loan.totalInstallments, loan.remainingInstallments)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Remaining: ${(loan.remainingInstallments * loan.installmentAmount).toFixed(2)}
                    {loan.remainingInstallments > 0 && ` (${loan.remainingInstallments} installments left)`}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoanDetails; 