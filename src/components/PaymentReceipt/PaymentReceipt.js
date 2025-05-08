import React, { useRef } from 'react';
import { FaDownload, FaPrint } from 'react-icons/fa';
import logo from '../../assets/images/logolight.png';
import { useReactToPrint } from 'react-to-print';

const PaymentReceipt = ({ payment, order }) => {
  const receiptRef = useRef();
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return parseFloat(amount).toFixed(2);
  };
  
  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Payment_Receipt_${payment._id}`,
  });
  
  if (!payment || !order) return null;
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-6">
      <div className="flex justify-end mb-4 space-x-2">
        <button
          onClick={handlePrint}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          <FaPrint className="mr-2" /> Print
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center px-4 py-2 bg-primeColor text-white rounded hover:bg-black"
        >
          <FaDownload className="mr-2" /> Download
        </button>
      </div>
      
      <div ref={receiptRef} className="p-8 border border-gray-200 rounded-lg">
        {/* Receipt Header */}
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <img src={logo} alt="DataVerse" className="h-12 mb-2" />
            <p className="text-sm text-gray-500">DataVerse Store</p>
            <p className="text-sm text-gray-500">123 Tech Street, Digital City</p>
            <p className="text-sm text-gray-500">support@dataverse.com</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">PAYMENT RECEIPT</h2>
            <p className="text-gray-500">Receipt #: {payment._id.substring(0, 8).toUpperCase()}</p>
            <p className="text-gray-500">Date: {formatDate(payment.createdAt)}</p>
            <p className="text-gray-500">Order #: {order._id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>
        
        {/* Customer Info */}
        <div className="border-b py-4">
          <h3 className="font-semibold mb-2">Customer Information</h3>
          <p>Name: {order.shippingAddress.fullName}</p>
          <p>Email: {payment.user.email}</p>
          <p>Phone: {order.shippingAddress.phone}</p>
          <p>
            Address: {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.postalCode}
          </p>
        </div>
        
        {/* Payment Details */}
        <div className="border-b py-4">
          <h3 className="font-semibold mb-2">Payment Details</h3>
          <div className="flex justify-between mb-1">
            <span>Payment Method:</span>
            <span className="font-medium">{payment.paymentMethod === 'card' ? 'Credit/Debit Card' : payment.paymentMethod === 'bankTransfer' ? 'Bank Transfer' : 'Bank Slip'}</span>
          </div>
          {payment.paymentMethod === 'card' && (
            <div className="flex justify-between mb-1">
              <span>Card:</span>
              <span>****{payment.cardDetails?.last4 || '****'}</span>
            </div>
          )}
          <div className="flex justify-between mb-1">
            <span>Status:</span>
            <span className={`font-medium ${payment.status === 'completed' ? 'text-green-600' : payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Transaction ID:</span>
            <span>{payment.transactionId || payment._id}</span>
          </div>
        </div>
        
        {/* Order Items */}
        <div className="py-4">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <table className="w-full mb-4">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.product.name}</td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-right py-2">${formatCurrency(item.price)}</td>
                  <td className="text-right py-2">${formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="flex justify-between border-t pt-2">
            <span>Subtotal:</span>
            <span>${formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>${formatCurrency(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total:</span>
            <span>${formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-gray-500 text-sm">
          <p>Thank you for your purchase!</p>
          <p>For any questions, please contact our support team at support@dataverse.com</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt; 