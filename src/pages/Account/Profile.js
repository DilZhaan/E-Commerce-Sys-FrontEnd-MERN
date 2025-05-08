import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { FaUser, FaCamera, FaSpinner } from 'react-icons/fa';

const Profile = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    profilePic: null
  });
  
  // Preview for profile image
  const [imagePreview, setImagePreview] = useState(null);
  
  // Fetch user profile data directly from the API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setFetchLoading(true);
        setError('');
        
        const response = await axios.get('http://localhost:4000/api/users/profile', {
          withCredentials: true
        });
        
        // Set profile data from API response
        if (response.data.data) {
          setProfileData(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile data');
      } finally {
        setFetchLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);
  
  // Initialize form with profile data when available
  useEffect(() => {
    if (profileData) {
      // Create a fullName from fName and lName if available
      const calculatedFullName = profileData.fullName || 
        (profileData.fName || profileData.lName ? 
          `${profileData.fName || ''} ${profileData.lName || ''}`.trim() : 
          '');
      
      // Set form data from profile
      setFormData({
        fullName: calculatedFullName,
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        city: profileData.city || '',
        profilePic: null
      });
      
      // Check for all possible profile picture field names
      const profilePicture = profileData.profilePic || profileData.proPic;
      
      if (profilePicture) {
        // The backend returns the full path including "uploads/" so adjust the URL accordingly
        const imageUrl = profilePicture.startsWith('http') 
          ? profilePicture 
          : `http://localhost:4000/${profilePicture}`;
        setImagePreview(imageUrl);
      } else {
        setImagePreview(null);
      }
    }
  }, [profileData]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle profile image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePic: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Submit updated profile data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Create form data object for the API request
    const profileFormData = new FormData();
    
    // Split full name into first and last name
    const nameParts = formData.fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Use backend field names
    profileFormData.append('fName', firstName);
    profileFormData.append('lName', lastName);
    profileFormData.append('email', formData.email);
    profileFormData.append('address', formData.address);
    
    // Only append fields if they are used in the form (even if empty)
    if (formData.phone !== undefined) {
      profileFormData.append('phone', formData.phone);
    }
    
    if (formData.city !== undefined) {
      profileFormData.append('city', formData.city);
    }
    
    // Only append profilePic if a new one was selected, using the correct field name
    if (formData.profilePic) {
      profileFormData.append('proPic', formData.profilePic);
    }
    
    try {
      // Make API request to update profile
      const response = await axios.put('http://localhost:4000/api/users/profile', 
        profileFormData, 
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update success message and refresh profile data
      setSuccess(response.data.message || 'Profile updated successfully');
      setIsEditing(false);
      
      // Update local profile data with the response data
      if (response.data.data) {
        setProfileData(response.data.data);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel editing and reset form
  const handleCancel = () => {
    setIsEditing(false);
    // Reset form with current profile data
    if (profileData) {
      // Create a fullName from fName and lName if available
      const calculatedFullName = profileData.fullName || 
        (profileData.fName || profileData.lName ? 
          `${profileData.fName || ''} ${profileData.lName || ''}`.trim() : 
          '');
      
      setFormData({
        fullName: calculatedFullName,
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        city: profileData.city || '',
        profilePic: null
      });
      
      // Check for all possible profile picture field names
      const profilePicture = profileData.profilePic || profileData.proPic;
      
      if (profilePicture) {
        // The backend returns the full path including "uploads/" so adjust the URL accordingly
        const imageUrl = profilePicture.startsWith('http') 
          ? profilePicture 
          : `http://localhost:4000/${profilePicture}`;
        setImagePreview(imageUrl);
      } else {
        setImagePreview(null);
      }
    }
    
    setError('');
    setSuccess('');
  };
  
  // Display user full name from available data
  const displayName = profileData?.fullName || 
    (profileData?.fName || profileData?.lName ? 
      `${profileData?.fName || ''} ${profileData?.lName || ''}`.trim() : 
      profileData?.email || 'User');

  // Show loading spinner while fetching profile data
  if (fetchLoading) {
    return (
      <div className="w-full py-20 flex justify-center items-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primeColor mx-auto mb-4" />
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full py-10 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primeColor to-blue-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
        </div>
        
        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 m-6">
            <p className="text-green-700">{success}</p>
          </div>
        )}
        
        <div className="md:flex">
          {/* Profile Image Section */}
          <div className="p-6 md:w-1/3 flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-200">
            <div className="relative mb-4">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <FaUser className="text-4xl text-gray-400" />
                </div>
              )}
              
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primeColor text-white p-2 rounded-full cursor-pointer">
                  <FaCamera />
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </label>
              )}
            </div>
            
            <h2 className="text-xl font-semibold">
              {displayName}
            </h2>
            <p className="text-gray-500 mb-4">{profileData?.role}</p>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2 bg-primeColor text-white rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Edit Profile
              </button>
            )}
          </div>
          
          {/* Profile Details Section */}
          <div className="p-6 md:w-2/3">
            <h3 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit Information' : 'Personal Information'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primeColor focus:border-primeColor"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="py-2">{displayName || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primeColor focus:border-primeColor"
                      placeholder="Your email address"
                      disabled // Email shouldn't be editable for security reasons
                    />
                  ) : (
                    <p className="py-2">{profileData?.email || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primeColor focus:border-primeColor"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="py-2">{profileData?.phone || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primeColor focus:border-primeColor"
                      placeholder="Enter your address"
                    />
                  ) : (
                    <p className="py-2">{profileData?.address || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primeColor focus:border-primeColor"
                      placeholder="Enter your city"
                    />
                  ) : (
                    <p className="py-2">{profileData?.city || 'Not provided'}</p>
                  )}
                </div>
              </div>
              
              {isEditing && (
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 bg-primeColor text-white rounded-lg hover:bg-blue-700 transition duration-300 ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 