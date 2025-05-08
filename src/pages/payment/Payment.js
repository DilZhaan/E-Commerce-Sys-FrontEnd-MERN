import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { toast } from "react-toastify";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { FaCreditCard, FaMoneyBillWave, FaFileUpload, FaSpinner, FaCheckCircle, FaArrowLeft, FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover, FaLock } from "react-icons/fa";
import "./Payment.css";
import { resetCart } from '../../redux/cartSlice';
import { clearCartFromBackend } from '../../redux/cartSlice';

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [ccNumber, setCCNumber] = useState('');
  const [cardType, setCardType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [cardDetails, setCardDetails] = useState({
    nameOnCard: "",
    expiryDate: "",
    cvv: "",
  });
  const [bankSlip, setBankSlip] = useState(null);
  const [bankTransferDetails, setBankTransferDetails] = useState({
    accountName: "",
    bankName: "",
    transferDate: "",
    referenceNumber: ""
  });
  const [previewImage, setPreviewImage] = useState(null);
  
  // Get authentication state
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        toast.error("Order ID is required");
        return navigate("/dashboard/orders");
      }
      
      try {
        setLoading(true);
        
        // First try to get the order details directly from orders API
        const response = await axios.get(`http://localhost:4000/api/orders/${orderId}`, {
          withCredentials: true
        });
        
        console.log("Order details response:", response.data);
        
        if (response.data && response.data.success) {
          setOrder(response.data.data);
          
          // If order is already paid, redirect to order details
          if (response.data.data.paymentStatus === 'completed') {
            toast.info("This order has already been paid");
            return navigate("/dashboard/orders");
          }
        } else {
          toast.error("Failed to load order details");
          navigate("/dashboard/orders");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error(error.response?.data?.message || "Error loading order");
        navigate("/dashboard/orders");
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && orderId) {
      fetchOrderDetails();
    } else if (!isAuthenticated) {
      toast.error("Please log in to access payment");
      navigate("/signin");
    }
  }, [orderId, isAuthenticated, navigate]);

  // Card detection function
  const detectCardType = (number) => {
    if (!number) return ''; // Return empty if number is undefined or empty
    const regexPatterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/
    };

    // Clean input of spaces and hyphens
    const cleanNumber = number.replace(/[ -]/g, '');
    
    // Test the number against each pattern
    for (const [type, regex] of Object.entries(regexPatterns)) {
      if (regex.test(cleanNumber)) {
        return type;
      }
    }
    return '';
  };

  // Handle CC number input with formatting
  const handleCCNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    let formatted = '';
    
    // Apply formatting based on card type
    if (value) {
      // Detect card type
      const type = detectCardType(value);
      setCardType(type);
      
      // Format the number differently depending on card type
      if (type === 'amex') {
        // XXXX XXXXXX XXXXX for American Express
        for (let i = 0; i < value.length; i++) {
          if (i === 4 || i === 10) formatted += ' ';
          formatted += value[i];
        }
      } else {
        // XXXX XXXX XXXX XXXX for others
        for (let i = 0; i < value.length; i++) {
          if (i > 0 && i % 4 === 0) formatted += ' ';
          formatted += value[i];
        }
      }
    }
    
    setCCNumber(formatted);
  };

  // Handle card input changes
  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === "cardNumber") {
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
      
      const cardType = detectCardType(formattedValue);
      
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue,
        cardType
      }));
      return;
    }
    
    // Name on card - prevent adding numbers
    if (name === "nameOnCard") {
      // Only allow letters, spaces, and special characters like hyphens
      const formattedValue = value.replace(/[0-9]/g, '');
      
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    // Format expiry date
    if (name === "expiryDate") {
      const formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .slice(0, 5);
      
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    // Limit CVV to 3-4 digits
    if (name === "cvv") {
      const formattedValue = value.replace(/\D/g, '').slice(0, 4);
      
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    // For other fields
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle bank transfer details input changes
  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    
    // For bankName, prevent adding numbers
    if (name === "bankName") {
      // Only allow letters, spaces, and special characters like hyphens
      const formattedValue = value.replace(/[0-9]/g, '');
      
      setBankTransferDetails(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    // For accountName, prevent adding numbers
    if (name === "accountName") {
      // Only allow letters, spaces, and special characters like hyphens
      const formattedValue = value.replace(/[0-9]/g, '');
      
      setBankTransferDetails(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    // For other fields
    setBankTransferDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle bank slip file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid file (JPG, PNG, or PDF)");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      setBankSlip(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewImage(null);
      }
    }
  };

  // Handle payment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!order) {
      toast.error("Order details not found. Please try again later.");
      return;
    }
    
    try {
      setIsProcessing(true);
      setErrorMessage('');
      
      // Validate payment method
      if (!paymentMethod) {
        toast.error("Please select a payment method");
        setIsProcessing(false);
        return;
      }
      
      // Create the payment data object to match backend expectations
      let paymentRequestData = {
        orderId: order._id,
        amount: order.totalAmount,
        paymentMethod: paymentMethod
      };

      // Add method-specific details
      if (paymentMethod === "card") {
        // Validate card details
        if (!ccNumber || !cardDetails.nameOnCard || !cardDetails.expiryDate || !cardDetails.cvv) {
          toast.error("Please fill in all card details");
          setIsProcessing(false);
          return;
        }
        
        // Validate name on card (should not contain numbers)
        if (/\d/.test(cardDetails.nameOnCard)) {
          toast.error("Name on card should not contain numbers");
          setIsProcessing(false);
          return;
        }
        
        // Basic validation for card number (at least 13 digits)
        if (ccNumber.replace(/\s/g, '').length < 13) {
          toast.error("Please enter a valid card number");
          setIsProcessing(false);
          return;
        }
        
        // Expiry date validation
        const [month, year] = cardDetails.expiryDate.split('/');
        const currentYear = new Date().getFullYear() % 100; // Last 2 digits of current year
        const currentMonth = new Date().getMonth() + 1; // Current month (1-12)
        
        if (!month || !year || 
            parseInt(month) < 1 || parseInt(month) > 12 || 
            parseInt(year) < currentYear || 
            (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
          toast.error("Card has expired");
          setIsProcessing(false);
          return;
        }
        
        // Use dedicated card payment endpoint
        try {
          console.log("Preparing card payment request...");
          // Create card payment request - simplified for testing
          const cardPaymentRequest = {
            orderId: order._id,
            cardDetails: {
              number: ccNumber.replace(/\s/g, ''),
              name: cardDetails.nameOnCard,
              expiry: cardDetails.expiryDate,
              cvv: cardDetails.cvv,
              type: cardType || 'visa'
            }
          };
          
          console.log("Sending card payment request to:", `http://localhost:4000/api/payments/card`);
          console.log("Request data:", JSON.stringify(cardPaymentRequest, null, 2));
          
          // Process card payment
          const cardResponse = await axios.post(
            `http://localhost:4000/api/payments/card`,
            cardPaymentRequest,
            { 
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log("Card payment response:", cardResponse.data);
          
          if (!cardResponse.data.success) {
            setErrorMessage(cardResponse.data.message || "Payment failed");
            toast.error(cardResponse.data.message || "Payment failed");
            setIsProcessing(false);
            return;
          }
          
          toast.success("Card payment successful! Your order has been processed.");
          handlePaymentSuccess();
          
          return; // Exit early as payment is processed
        } catch (error) {
          console.error("Card payment error:", error);
          if (error.response) {
            console.error("Error status:", error.response.status);
            console.error("Error data:", error.response.data);
          } else if (error.request) {
            console.error("No response received:", error.request);
          } else {
            console.error("Error setting up request:", error.message);
          }
          
          setErrorMessage(error.response?.data?.message || "Error processing card payment");
          toast.error(error.response?.data?.message || "Error processing card payment");
          setIsProcessing(false);
          return;
        }
      } else if (paymentMethod === "bankTransfer") {
        // Validate bank transfer details
        if (!bankTransferDetails.accountName || !bankTransferDetails.bankName || !bankTransferDetails.transferDate || !bankTransferDetails.referenceNumber) {
          toast.error("Please fill in all bank transfer details");
          setIsProcessing(false);
          return;
        }
        
        // Validate bank name (should not contain numbers)
        if (/\d/.test(bankTransferDetails.bankName)) {
          toast.error("Bank name should not contain numbers");
          setIsProcessing(false);
          return;
        }
        
        // Validate account name (should not contain numbers)
        if (/\d/.test(bankTransferDetails.accountName)) {
          toast.error("Account name should not contain numbers");
          setIsProcessing(false);
          return;
        }
        
        // Add bank transfer details to the request
        paymentRequestData.bankTransferDetails = bankTransferDetails;
        
        // Add bank slip if available
        if (bankSlip) {
          // Create FormData to handle file upload properly
          const formData = new FormData();
          
          // Add all payment data to FormData
          Object.keys(paymentRequestData).forEach(key => {
            if (key === 'bankTransferDetails') {
              // For the nested object, we need to stringify it
              formData.append(key, JSON.stringify(paymentRequestData[key]));
            } else {
              formData.append(key, paymentRequestData[key]);
            }
          });
          
          // Add the file with field name 'bankSlip'
          formData.append('bankSlip', bankSlip);
          
          console.log("Processing bank transfer with file upload");
          
          // Send the payment with FormData for file upload
          const response = await axios.post(
            `http://localhost:4000/api/payments`,
            formData,
            { 
              withCredentials: true,
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          
          console.log("Payment response:", response.data);
          
          // Show success message
          toast.success("Bank transfer details submitted. Your order will be processed once payment is verified.");
          handlePaymentSuccess();
          
          return; // Exit early since we've handled the payment
        } else {
          // No bank slip provided, proceed with regular JSON request
          console.log("Processing bank transfer without file upload");
        }
      }
      
      console.log("Processing payment with data:", paymentRequestData);
      
      // Default request for non-file uploads
      const response = await axios.post(
        `http://localhost:4000/api/payments`,
        paymentRequestData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Payment response:", response.data);
      
      // Show appropriate success message based on payment method
      if (paymentMethod === "bankTransfer") {
        toast.success("Bank transfer details submitted. Your order will be processed once payment is verified.");
      } else if (paymentMethod === "card") {
        toast.success("Card payment successful! Your order has been processed.");
      } else {
        toast.success("Payment successful! Your order has been processed.");
      }
      
      handlePaymentSuccess();
      
    } catch (error) {
      console.error("Payment error:", error);
      setErrorMessage(error.response?.data?.message || "Error processing payment");
      toast.error(error.response?.data?.message || "Error processing payment");
    } finally {
      setIsProcessing(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  // Check if order has items
  const hasItems = order && order.items && Array.isArray(order.items) && order.items.length > 0;

  // After successful payment
  const handlePaymentSuccess = () => {
    // Make sure cart is cleared even if it wasn't cleared during order creation
    console.log("Payment successful, clearing cart from both frontend and backend");
    dispatch(clearCartFromBackend()); // This will clear backend first
    dispatch(resetCart()); // Also reset locally
    setPaymentSuccess(true);
    
    // After successful payment, redirect to order confirmation
    setTimeout(() => {
      navigate(`/dashboard/orders`);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <div className="spinner">
          <FaSpinner className="animate-spin" />
        </div>
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="max-w-container mx-auto px-4 py-10">
        <Breadcrumbs title="Payment Success" />
        <div className="bg-white rounded-lg shadow-md p-8 max-w-xl mx-auto text-center">
          <div className="text-green-500 text-6xl mb-4">
            <FaCheckCircle className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your payment has been processed successfully. We'll send a confirmation email with your receipt.</p>
          <p className="text-gray-600 mb-6">Redirecting to your orders...</p>
          <Link to="/dashboard/orders" className="bg-primeColor text-white px-6 py-2 rounded-md hover:bg-black transition duration-300">
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container mx-auto px-4 py-10">
      <Breadcrumbs title="Payment" />
      
      {order ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Payment Method</h2>
                <Link to="/dashboard/orders" className="flex items-center text-gray-600 hover:text-primeColor">
                  <FaArrowLeft className="mr-2" /> Back to Orders
                </Link>
              </div>
              
              {/* Payment Method Selection */}
              <div className="mb-8">
                <div className="flex gap-4 mb-6">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border rounded-md ${
                      paymentMethod === "card" 
                        ? "border-primeColor bg-blue-50 text-primeColor" 
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <FaCreditCard /> Credit/Debit Card
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod("bankTransfer")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border rounded-md ${
                      paymentMethod === "bankTransfer" 
                        ? "border-primeColor bg-blue-50 text-primeColor" 
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <FaMoneyBillWave /> Bank Transfer
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                {/* Credit Card Form */}
                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cardNumber" className="block text-gray-700 mb-1">Card Number</label>
                      <div className="card-number-input">
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="XXXX XXXX XXXX XXXX"
                          value={ccNumber}
                          onChange={handleCCNumberChange}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primeColor"
                          maxLength="19"
                          required
                        />
                        <div className="card-icons">
                          <FaCcVisa className={cardType === "visa" ? "active" : ""} />
                          <FaCcMastercard className={cardType === "mastercard" ? "active" : ""} />
                          <FaCcAmex className={cardType === "amex" ? "active" : ""} />
                          <FaCcDiscover className={cardType === "discover" ? "active" : ""} />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="nameOnCard" className="block text-gray-700 mb-1">Name on Card</label>
                      <input
                        type="text"
                        id="nameOnCard"
                        name="nameOnCard"
                        placeholder="John Doe"
                        value={cardDetails.nameOnCard}
                        onChange={handleCardInputChange}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primeColor"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiryDate" className="block text-gray-700 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={cardDetails.expiryDate}
                          onChange={handleCardInputChange}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primeColor"
                          maxLength="5"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="cvv" className="block text-gray-700 mb-1">CVV</label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          placeholder="XXX"
                          value={cardDetails.cvv}
                          onChange={handleCardInputChange}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primeColor"
                          maxLength="4"
                          required
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <p>For testing, you can use:</p>
                      <p>Card Number: 4242 4242 4242 4242</p>
                      <p>Expiry: Any future date (MM/YY)</p>
                      <p>CVV: Any 3 digits</p>
                      <p>Name: Any name</p>
                    </div>
                  </div>
                )}
                
                {/* Bank Transfer Form */}
                {paymentMethod === "bankTransfer" && (
                  <div>
                    <div className="bg-gray-50 p-4 rounded-md mb-6">
                      <h3 className="font-semibold text-lg mb-2">Bank Account Details</h3>
                      <p className="text-gray-700 mb-1">Bank Name: DataVerse Bank</p>
                      <p className="text-gray-700 mb-1">Account Name: DataVerse Store</p>
                      <p className="text-gray-700 mb-1">Account Number: 123-456-7890</p>
                      <p className="text-gray-700 mb-1">Branch: Main Branch</p>
                      <p className="text-gray-700 mb-4">Reference: Order-{order.orderId}</p>
                      <p className="text-sm text-gray-500">Please include your Order ID as reference when making the transfer.</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="bankName" className="block text-gray-700 mb-1">Your Bank Name</label>
                        <input
                          type="text"
                          id="bankName"
                          name="bankName"
                          placeholder="Enter your bank name"
                          value={bankTransferDetails.bankName}
                          onChange={handleBankDetailsChange}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primeColor"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="accountName" className="block text-gray-700 mb-1">Your Account Name</label>
                        <input
                          type="text"
                          id="accountName"
                          name="accountName"
                          placeholder="Enter account name"
                          value={bankTransferDetails.accountName}
                          onChange={handleBankDetailsChange}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primeColor"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="transferDate" className="block text-gray-700 mb-1">Transfer Date</label>
                        <input
                          type="date"
                          id="transferDate"
                          name="transferDate"
                          value={bankTransferDetails.transferDate}
                          onChange={handleBankDetailsChange}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primeColor"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="referenceNumber" className="block text-gray-700 mb-1">Reference Number</label>
                        <input
                          type="text"
                          id="referenceNumber"
                          name="referenceNumber"
                          placeholder="Enter transaction reference"
                          value={bankTransferDetails.referenceNumber}
                          onChange={handleBankDetailsChange}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primeColor"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="bankSlip" className="block text-gray-700 mb-1">Upload Bank Slip</label>
                        <div className="border border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-gray-50 transition cursor-pointer">
                          <input 
                            type="file"
                            id="bankSlip"
                            name="bankSlip"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                            required
                          />
                          <label htmlFor="bankSlip" className="cursor-pointer w-full block">
                            {bankSlip ? (
                              <div className="flex items-center justify-center flex-col">
                                <div className="text-green-500 mb-2">
                                  <FaCheckCircle className="text-3xl mx-auto" />
                                </div>
                                <p className="text-gray-700 font-medium">{bankSlip.name}</p>
                                <p className="text-gray-500 text-sm">{(bankSlip.size / 1024 / 1024).toFixed(2)} MB</p>
                                {previewImage && (
                                  <div className="mt-2 w-40 h-40 mx-auto">
                                    <img 
                                      src={previewImage} 
                                      alt="Bank slip preview" 
                                      className="w-full h-full object-contain border rounded"
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center flex-col">
                                <FaFileUpload className="text-3xl text-gray-400 mb-2" />
                                <p className="text-gray-700">Click to upload your bank slip</p>
                                <p className="text-gray-500 text-sm">(JPEG, PNG, or PDF, max 5MB)</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-8">
                  <button 
                    type="submit"
                    className="w-full bg-primeColor text-white py-3 px-4 rounded-md font-medium hover:bg-black transition-colors flex items-center justify-center"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Processing Payment...
                      </>
                    ) : (
                      `Pay $${formatCurrency(order.totalAmount)}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="border-b pb-4 mb-4">
                <div className="text-sm text-gray-600 mb-2">Order #{order.orderId || order._id}</div>
                <div className="font-medium">
                  {hasItems ? `${order.items.length} ${order.items.length === 1 ? 'item' : 'items'}` : '0 items'}
                </div>
              </div>
              
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {hasItems ? (
                  order.items.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-16 h-16 shrink-0">
                        <img 
                          src={item.product && item.product.images && item.product.images.length > 0 
                            ? `http://localhost:4000/${item.product.images[0]}`
                            : 'http://localhost:4000/placeholder-image.jpg'} 
                          alt={item.product?.title || item.product?.name || 'Product'} 
                          className="w-full h-full object-cover rounded border"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium line-clamp-1">{item.product?.title || item.product?.name || 'Product'}</div>
                        <div className="text-gray-600 text-sm">Qty: {item.quantity}</div>
                        <div className="text-gray-800">${formatCurrency(item.price * item.quantity)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4">No items in this order</div>
                )}
              </div>
              
              <div className="space-y-2 border-t border-b py-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${formatCurrency(order.subtotal || (order.totalAmount ? (order.totalAmount - (order.shippingCost || 0)) : 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>${formatCurrency(order.shippingCost || 0)}</span>
                </div>
                {order.taxAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>${formatCurrency(order.taxAmount)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${formatCurrency(order.totalAmount || 0)}</span>
              </div>
              
              {order.status && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Order Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                      order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-600 mb-4">No order details found.</p>
          <Link to="/dashboard/orders" className="text-blue-600 hover:underline">
            Return to My Orders
        </Link>
      </div>
      )}
    </div>
  );
};

export default Payment;
