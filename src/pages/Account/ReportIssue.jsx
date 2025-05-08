import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCamera, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import { useSelector } from 'react-redux';

function ReportIssue() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    district: '',
    province: '',
    images: [],
    mobileNo: '',
    whatsappNo: '',
    address: ''
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone numbers
    if (name === 'mobileNo' || name === 'whatsappNo') {
      // Allow only numeric characters
      const numericValue = value.replace(/\D/g, '');
      
      // Restrict to 10 digits
      const truncatedValue = numericValue.slice(0, 10);
      
      setFormData(prev => ({ ...prev, [name]: truncatedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear validation error for this field if any
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.images.length + files.length > 5) {
      toast.error('You can upload maximum 5 images');
      return;
    }
    
    // Create preview URLs
    const newPreviewImages = [...previewImages];
    const newImages = [...formData.images];
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        newPreviewImages.push(URL.createObjectURL(file));
        newImages.push(file);
      } else {
        toast.error(`${file.name} is not an image`);
      }
    });
    
    setPreviewImages(newPreviewImages);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const removeImage = (index) => {
    const newPreviewImages = [...previewImages];
    const newImages = [...formData.images];
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index]);
    
    newPreviewImages.splice(index, 1);
    newImages.splice(index, 1);
    
    setPreviewImages(newPreviewImages);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Issue name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.district.trim()) errors.district = 'District is required';
    if (!formData.province.trim()) errors.province = 'Province is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    
    // Phone number validation
    if (!formData.mobileNo.trim()) {
      errors.mobileNo = 'Mobile number is required';
    } else if (formData.mobileNo.length !== 10) {
      errors.mobileNo = 'Mobile number must be exactly 10 digits';
    } else if (!/^\d+$/.test(formData.mobileNo)) {
      errors.mobileNo = 'Mobile number must contain only numeric characters';
    }
    
    // WhatsApp number validation
    if (!formData.whatsappNo.trim()) {
      errors.whatsappNo = 'WhatsApp number is required';
    } else if (formData.whatsappNo.length !== 10) {
      errors.whatsappNo = 'WhatsApp number must be exactly 10 digits';
    } else if (!/^\d+$/.test(formData.whatsappNo)) {
      errors.whatsappNo = 'WhatsApp number must contain only numeric characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Debug form data
    console.log("Form data before validation:", JSON.stringify(formData, null, 2));
    
    // We'll no longer use default values for phone numbers
    // We'll rely on the validateForm function to ensure they're valid
    
    if (!validateForm()) {
      console.log("Validation failed, errors:", validationErrors);
      toast.error("Please fix the validation errors and try again.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a JSON object for submission
      const issueData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        address: formData.address,
        district: formData.district,
        province: formData.province,
        mobileNo: formData.mobileNo,
        whatsappNo: formData.whatsappNo
      };
      
      // If user is authenticated, include the user ID
      if (isAuthenticated && user && user._id) {
        issueData.user = user._id;
        console.log('Including authenticated user ID:', user._id);
      }
      
      console.log('Submitting issue data:', issueData);
      
      // Use direct axios for submission
      const API_URL = process.env.REACT_APP_API_URL + "/api" || 'http://localhost:4000/api';
      
      // For JSON submission, we need to use separate endpoints
      // First submit JSON data to create the issue
      const response = await axios.post(`${API_URL}/issues`, issueData, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      let issueId = null;
      if (response.data && response.data.issue) {
        if (response.data.issue._id) {
          issueId = response.data.issue._id;
        } else if (typeof response.data.issue === 'string') {
          issueId = response.data.issue;
        }
      }
      
      // If we have images, submit them in a separate request
      if (formData.images && formData.images.length > 0 && issueId) {
        const imageFormData = new FormData();
        
        // Add images to form data
        formData.images.forEach((image, index) => {
          console.log(`Adding image ${index}:`, image.name, image.type, image.size);
          imageFormData.append('images', image);
        });
        
        // Submit images
        console.log(`Uploading images for issue ID: ${issueId}`);
        await axios.post(`${API_URL}/issues/${issueId}/images`, imageFormData, {
          withCredentials: true
        });
      }
      
      console.log('Response from server:', response.data);
      toast.success('Issue reported successfully!');
      
      // Navigate to the appropriate page
      if (issueId) {
        navigate(`/account/issues/${issueId}`);
      } else {
        navigate('/account/issues');
      }
    } catch (err) {
      console.error('Error submitting issue:', err);
      
      // More detailed error logging
      if (err.response) {
        console.error('Response error data:', err.response.data);
        console.error('Response error status:', err.response.status);
        
        // Show detailed validation errors if available
        if (err.response.data && err.response.data.error) {
          toast.error(`Validation error: ${err.response.data.error}`);
        } else {
          toast.error(`Server error: ${err.response.data?.message || 'Unknown server error'}`);
        }
      } else if (err.request) {
        console.error('Request made but no response received:', err.request);
        toast.error('No response from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', err.message);
        toast.error(`Error: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Report an Issue</h1>
          <p className="text-gray-600 mt-2">
            Fill out the form below to report an infrastructure issue in your area
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Issue Title*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border ${
                    validationErrors.name ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                  placeholder="E.g., Damaged Road, Broken Street Light"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border ${
                    validationErrors.description ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                  placeholder="Please describe the issue in detail..."
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location*
                </label>
                <div className={`mt-1 flex rounded-md shadow-sm ${
                  validationErrors.location ? 'border border-red-300 rounded-md' : ''
                }`}>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="Enter location"
                  />
                </div>
                {validationErrors.location && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.location}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                    District*
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border ${
                      validationErrors.district ? 'border-red-300' : 'border-gray-300'
                    } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                    placeholder="Enter district"
                  />
                  {validationErrors.district && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.district}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                    Province*
                  </label>
                  <input
                    type="text"
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border ${
                      validationErrors.province ? 'border-red-300' : 'border-gray-300'
                    } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                    placeholder="Enter province"
                  />
                  {validationErrors.province && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.province}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Full Address*
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border ${
                    validationErrors.address ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                  placeholder="Enter detailed address"
                />
                {validationErrors.address && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700">
                  Mobile Number* (10 digits)
                </label>
                <input
                  type="tel"
                  id="mobileNo"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  pattern="[0-9]{10}"
                  className={`mt-1 block w-full rounded-md border ${
                    validationErrors.mobileNo ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                  placeholder="Enter 10-digit number"
                  maxLength="10"
                />
                {validationErrors.mobileNo && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.mobileNo}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter numbers only. Example: 0123456789
                </p>
              </div>
              
              <div>
                <label htmlFor="whatsappNo" className="block text-sm font-medium text-gray-700">
                  WhatsApp Number* (10 digits)
                </label>
                <input
                  type="tel"
                  id="whatsappNo"
                  name="whatsappNo"
                  value={formData.whatsappNo}
                  onChange={handleInputChange}
                  pattern="[0-9]{10}"
                  className={`mt-1 block w-full rounded-md border ${
                    validationErrors.whatsappNo ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                  placeholder="Enter 10-digit number"
                  maxLength="10"
                />
                {validationErrors.whatsappNo && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.whatsappNo}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Same as mobile number? <button type="button" onClick={() => {
                    setFormData(prev => ({ ...prev, whatsappNo: formData.mobileNo }))
                    if (validationErrors.whatsappNo) {
                      setValidationErrors(prev => ({ ...prev, whatsappNo: '' }))
                    }
                  }} className="text-blue-500 hover:underline">Click to copy</button>
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Photos (up to 5)
                </label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {previewImages.map((src, index) => (
                    <div key={index} className="relative w-24 h-24">
                      <img 
                        src={src} 
                        alt={`Preview ${index}`}
                        className="w-24 h-24 object-cover rounded-md border border-gray-300" 
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-white rounded-full text-red-500 hover:text-red-700"
                      >
                        <FaTimesCircle size={18} />
                      </button>
                    </div>
                  ))}
                  
                  {previewImages.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 cursor-pointer"
                    >
                      <FaCamera className="text-gray-400 mb-1" size={24} />
                      <span className="text-xs text-gray-500">Add Photo</span>
                    </button>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Upload clear images of the issue to help us understand the problem better
                </p>
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/account/issues')}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-3 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReportIssue; 