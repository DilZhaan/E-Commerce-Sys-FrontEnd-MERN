import React, { useState, useEffect } from "react";
import { BsCheckCircleFill, BsUpload } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { logo, logoLight } from "../../assets/images";
import { useDispatch, useSelector } from "react-redux";
import { signUp, clearError, clearSuccessMessage, resetLoading } from "../../redux/authSlice";
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaCity, FaCalendarAlt, FaVenusMars, FaPhone, FaUserPlus } from "react-icons/fa";
import { toast } from "react-toastify";

// Email validation function
const EmailValidation = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
};

// Name validation function - only letters, spaces, and hyphens
const NameValidation = (name) => {
  return /^[A-Za-z\s-]+$/.test(name);
};

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((state) => state.auth);

  // ============= Initial State Start here =============
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("male");
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [checked, setChecked] = useState(false);
  // ============= Initial State End here ===============
  // ============= Error Msg Start here =================
  const [errFirstName, setErrFirstName] = useState("");
  const [errLastName, setErrLastName] = useState("");
  const [errEmail, setErrEmail] = useState("");
  const [errPassword, setErrPassword] = useState("");
  const [errConfirmPassword, setErrConfirmPassword] = useState("");
  const [errAddress, setErrAddress] = useState("");
  const [errCity, setErrCity] = useState("");
  const [errDob, setErrDob] = useState("");
  const [errPhone, setErrPhone] = useState("");
  // ============= Error Msg End here ===================
  
  // Get today's date for max date validation
  const today = new Date().toISOString().split('T')[0];
  
  // ============= Event Handler Start here =============
  const handleFirstName = (e) => {
    const value = e.target.value;
    // Check if name contains only letters
    if (value && !NameValidation(value)) {
      setErrFirstName("First name should only contain letters");
    } else {
      setFirstName(value);
      setErrFirstName("");
    }
    dispatch(clearError());
  };
  
  const handleLastName = (e) => {
    const value = e.target.value;
    // Check if name contains only letters
    if (value && !NameValidation(value)) {
      setErrLastName("Last name should only contain letters");
    } else {
      setLastName(value);
      setErrLastName("");
    }
    dispatch(clearError());
  };
  
  const handleEmail = (e) => {
    setEmail(e.target.value);
    setErrEmail("");
    dispatch(clearError());
  };
  
  const handlePassword = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setErrPassword("");
    
    // Check if confirm password is already entered and doesn't match
    if (confirmPassword && newPassword !== confirmPassword) {
      setErrConfirmPassword("Passwords do not match");
    } else if (confirmPassword && newPassword === confirmPassword) {
      setErrConfirmPassword("");
    }
    
    dispatch(clearError());
  };
  
  const handleConfirmPassword = (e) => {
    const confirmedPassword = e.target.value;
    setConfirmPassword(confirmedPassword);
    
    // Check if passwords match on every keydown
    if (confirmedPassword !== password) {
      setErrConfirmPassword("Passwords do not match");
    } else {
      setErrConfirmPassword("");
    }
    
    dispatch(clearError());
  };
  
  const handleAddress = (e) => {
    setAddress(e.target.value);
    setErrAddress("");
    dispatch(clearError());
  };
  
  const handleCity = (e) => {
    setCity(e.target.value);
    setErrCity("");
    dispatch(clearError());
  };
  
  const handleDob = (e) => {
    setDob(e.target.value);
    setErrDob("");
    dispatch(clearError());
  };
  
  const handleGender = (e) => {
    setGender(e.target.value);
    dispatch(clearError());
  };
  
  const handlePhone = (e) => {
    const input = e.target.value;
    
    // Allow only digits and limit to 10 digits
    const numericInput = input.replace(/\D/g, '');
    if (numericInput.length <= 10) {
      setPhone(numericInput);
      setErrPhone("");
    } else {
      setErrPhone("Phone number should not exceed 10 digits");
    }
    
    dispatch(clearError());
  };
  
  const handleProfilePic = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePic(file);
      
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
    dispatch(clearError());
  };

  // Clear messages when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearSuccessMessage());
      dispatch(clearError());
      dispatch(resetLoading());
    };
  }, [dispatch]);
  
  // Reset loading state if it gets stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        dispatch(resetLoading());
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [loading, dispatch]);
  
  // Navigate to sign in if registration was successful
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    }
  }, [successMessage, navigate]);
  
  // ============= Event Handler End here ===============
  const handleSignUp = (e) => {
    e.preventDefault();
    
    // Reset all error messages
    setErrFirstName("");
    setErrLastName("");
    setErrEmail("");
    setErrPassword("");
    setErrConfirmPassword("");
    setErrAddress("");
    setErrCity("");
    setErrDob("");
    setErrPhone("");
    
    // Validation checks
    let hasError = false;
    
    if (!firstName) {
      setErrFirstName("First name is required");
      hasError = true;
    } else if (!NameValidation(firstName)) {
      setErrFirstName("First name should only contain letters");
      hasError = true;
    }
    
    if (!lastName) {
      setErrLastName("Last name is required");
      hasError = true;
    } else if (!NameValidation(lastName)) {
      setErrLastName("Last name should only contain letters");
      hasError = true;
    }
    
    if (!email) {
      setErrEmail("Email is required");
      hasError = true;
    } else if (!EmailValidation(email)) {
      setErrEmail("Invalid email address");
      hasError = true;
    }
    
    if (!password) {
      setErrPassword("Password is required");
      hasError = true;
    } else if (password.length < 6) {
      setErrPassword("Password must be at least 6 characters");
      hasError = true;
    }
    
    if (!confirmPassword) {
      setErrConfirmPassword("Please confirm your password");
      hasError = true;
    } else if (confirmPassword !== password) {
      setErrConfirmPassword("Passwords do not match");
      hasError = true;
    }
    
    if (!address) {
      setErrAddress("Address is required");
      hasError = true;
    }
    
    if (!city) {
      setErrCity("City is required");
      hasError = true;
    }
    
    if (!dob) {
      setErrDob("Date of birth is required");
      hasError = true;
    }
    
    if (!phone) {
      setErrPhone("Phone number is required");
      hasError = true;
    } else if (phone.length < 10) {
      setErrPhone("Phone number should be 10 digits");
      hasError = true;
    }
    
    if (!checked) {
      toast.error("Please accept the terms and conditions");
      hasError = true;
    }
    
    if (hasError) {
      return;
    }
    
    // Prepare form data for API
    const formData = new FormData();
    formData.append('fName', firstName);
    formData.append('lName', lastName);
    formData.append('email', email);
    formData.append('pwd', password);
    formData.append('address', address);
    formData.append('city', city);
    formData.append('dob', dob);
    formData.append('gender', gender);
    formData.append('phone', phone); // Ensure same field name as backend expects
    
    // Only append profile picture if one was selected
    if (profilePic) {
      // Correct the field name to match what backend expects
      formData.append('proPic', profilePic, profilePic.name);
      console.log("Appending file:", profilePic.name, profilePic.size, profilePic.type);
    }
    
    // Log form data content for debugging
    console.log("Form data entries:", [...formData.entries()].map(e => 
      `${e[0]}: ${e[1] instanceof File ? `File(${e[1].name})` : e[1]}`
    ));
    
    // Dispatch sign up action
    dispatch(signUp(formData));
  };
  
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left Column - Information */}
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-primeColor to-blue-500">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-600/70 to-transparent"></div>
          
          <div className="relative flex flex-col items-center justify-center h-full py-12 px-8 text-white z-10">
            <div className="w-24 h-24 bg-white rounded-2xl p-2 flex items-center justify-center mb-8 shadow-lg transform hover:rotate-3 transition-transform duration-300">
              <img src={logo} alt="Logo" className="w-full object-contain" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-center text-white">Join Our Community</h1>
            <p className="text-lg mb-10 opacity-90 text-center text-white/90">Create an account for a personalized experience</p>
            
            <div className="space-y-6 w-full max-w-md">
              <div className="flex items-start gap-3 backdrop-blur-sm bg-white/10 p-4 rounded-lg transform hover:translate-x-2 transition-transform duration-300">
                <span className="p-1 bg-green-400 rounded-full mt-1 flex-shrink-0">
                  <BsCheckCircleFill className="text-white" />
                </span>
                <div>
                  <h3 className="font-semibold text-xl">Exclusive Deals</h3>
                  <p className="opacity-90">Get access to member-only discounts</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 backdrop-blur-sm bg-white/10 p-4 rounded-lg transform hover:translate-x-2 transition-transform duration-300">
                <span className="p-1 bg-green-400 rounded-full mt-1 flex-shrink-0">
                  <BsCheckCircleFill className="text-white" />
                </span>
                <div>
                  <h3 className="font-semibold text-xl">Order Tracking</h3>
                  <p className="opacity-90">Track all your purchases easily</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 backdrop-blur-sm bg-white/10 p-4 rounded-lg transform hover:translate-x-2 transition-transform duration-300">
                <span className="p-1 bg-green-400 rounded-full mt-1 flex-shrink-0">
                  <BsCheckCircleFill className="text-white" />
                </span>
                <div>
                  <h3 className="font-semibold text-xl">Saved Preferences</h3>
                  <p className="opacity-90">Save details for quick checkout</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Form */}
        <div className="lg:col-span-3 p-8 lg:p-12 overflow-y-auto max-h-screen">
          {/* Show mobile logo on smaller screens */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primeColor to-blue-500 rounded-2xl p-3 flex items-center justify-center shadow-lg">
              <img src={logo} alt="Logo" className="w-full object-contain" />
            </div>
          </div>
          
          {successMessage ? (
            <div className="w-full h-full flex flex-col justify-center items-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-pulse">
                <BsCheckCircleFill className="text-green-500 text-4xl" />
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-center bg-gradient-to-r from-primeColor to-blue-600 bg-clip-text text-transparent">Registration Successful!</h2>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                {successMessage}
              </p>
              <Link to="/signin">
                <button className="px-8 py-3 bg-gradient-to-r from-primeColor to-blue-600 hover:from-blue-600 hover:to-primeColor text-white rounded-lg text-base font-medium transition duration-300 shadow-lg">
                  Sign in
                </button>
              </Link>
            </div>
          ) : (
            <div className="w-full max-w-lg mx-auto">
              <div className="mb-6">
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primeColor to-blue-600 bg-clip-text text-transparent">Create Account</h2>
                <p className="text-gray-600">Join us for a better shopping experience</p>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg animate-pulse">
                  <p className="font-medium">Registration Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Profile Picture Upload */}
                <div className="mb-4 flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-white border-2 border-primeColor/30 flex items-center justify-center overflow-hidden shadow-lg">
                      {profilePicPreview ? (
                        <img 
                          src={profilePicPreview} 
                          alt="Profile Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser className="text-4xl text-gray-400" />
                      )}
                    </div>
                    <label 
                      htmlFor="profilePic" 
                      className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-r from-primeColor to-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer border-2 border-white shadow-md hover:scale-110 transition-transform"
                    >
                      <BsUpload />
                    </label>
                    <input 
                      type="file" 
                      id="profilePic"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePic}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="group">
                    <label className="block text-gray-700 text-sm font-medium mb-1 transition group-hover:text-primeColor">First Name*</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-hover:text-primeColor transition">
                        <FaUser />
                      </div>
                      <input
                        type="text"
                        onChange={handleFirstName}
                        value={firstName}
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primeColor focus:border-primeColor transition shadow-sm hover:shadow-md"
                        placeholder="Enter your first name"
                      />
                    </div>
                    {errFirstName && (
                      <p className="text-red-500 text-xs mt-1">{errFirstName}</p>
                    )}
                  </div>
                  
                  {/* Last Name */}
                  <div className="group">
                    <label className="block text-gray-700 text-sm font-medium mb-1 transition group-hover:text-primeColor">Last Name*</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-hover:text-primeColor transition">
                        <FaUser />
                      </div>
                      <input
                        type="text"
                        onChange={handleLastName}
                        value={lastName}
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primeColor focus:border-primeColor transition shadow-sm hover:shadow-md"
                        placeholder="Enter your last name"
                      />
                    </div>
                    {errLastName && (
                      <p className="text-red-500 text-xs mt-1">{errLastName}</p>
                    )}
                  </div>
                </div>
                
                {/* Email */}
                <div className="group">
                  <label className="block text-gray-700 text-sm font-medium mb-1 transition group-hover:text-primeColor">Email Address*</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-hover:text-primeColor transition">
                      <FaEnvelope />
                    </div>
                    <input
                      type="email"
                      onChange={handleEmail}
                      value={email}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primeColor focus:border-primeColor transition shadow-sm hover:shadow-md"
                      placeholder="your@email.com"
                    />
                  </div>
                  {errEmail && (
                    <p className="text-red-500 text-xs mt-1">{errEmail}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="group">
                    <label className="block text-gray-700 text-sm font-medium mb-1 transition group-hover:text-primeColor">Password*</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-hover:text-primeColor transition">
                        <FaLock />
                      </div>
                      <input
                        type="password"
                        onChange={handlePassword}
                        value={password}
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primeColor focus:border-primeColor transition shadow-sm hover:shadow-md"
                        placeholder="At least 6 characters"
                      />
                    </div>
                    {errPassword && (
                      <p className="text-red-500 text-xs mt-1">{errPassword}</p>
                    )}
                  </div>
                  
                  {/* Confirm Password */}
                  <div className="group">
                    <label className="block text-gray-700 text-sm font-medium mb-1 transition group-hover:text-primeColor">Confirm Password*</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-hover:text-primeColor transition">
                        <FaLock />
                      </div>
                      <input
                        type="password"
                        onChange={handleConfirmPassword}
                        value={confirmPassword}
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primeColor focus:border-primeColor transition shadow-sm hover:shadow-md"
                        placeholder="Confirm your password"
                      />
                    </div>
                    {errConfirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{errConfirmPassword}</p>
                    )}
                  </div>
                </div>
                
                {/* Address */}
                <div className="group">
                  <label className="block text-gray-700 text-sm font-medium mb-1 transition group-hover:text-primeColor">Address*</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-hover:text-primeColor transition">
                      <FaMapMarkerAlt />
                    </div>
                    <input
                      type="text"
                      onChange={handleAddress}
                      value={address}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primeColor focus:border-primeColor transition shadow-sm hover:shadow-md"
                      placeholder="Enter your address"
                    />
                  </div>
                  {errAddress && (
                    <p className="text-red-500 text-xs mt-1">{errAddress}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* City */}
                  <div className="group">
                    <label className="block text-gray-700 text-sm font-medium mb-1 transition group-hover:text-primeColor">City*</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-hover:text-primeColor transition">
                        <FaCity />
                      </div>
                      <input
                        type="text"
                        onChange={handleCity}
                        value={city}
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primeColor focus:border-primeColor transition shadow-sm hover:shadow-md"
                        placeholder="Enter your city"
                      />
                    </div>
                    {errCity && (
                      <p className="text-red-500 text-xs mt-1">{errCity}</p>
                    )}
                  </div>
                  
                  {/* Date of Birth */}
                  <div className="group">
                    <label className="block text-gray-700 text-sm font-medium mb-1 transition group-hover:text-primeColor">Date of Birth*</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-hover:text-primeColor transition">
                        <FaCalendarAlt />
                      </div>
                      <input
                        type="date"
                        onChange={handleDob}
                        value={dob}
                        max={today}
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primeColor focus:border-primeColor transition shadow-sm hover:shadow-md"
                      />
                    </div>
                    {errDob && (
                      <p className="text-red-500 text-xs mt-1">{errDob}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Gender */}
                  <div className="group">
                    <label className="block text-gray-700 text-sm font-medium mb-1 transition group-hover:text-primeColor">Gender</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-hover:text-primeColor transition">
                        <FaVenusMars />
                      </div>
                      <select
                        onChange={handleGender}
                        value={gender}
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primeColor focus:border-primeColor transition shadow-sm hover:shadow-md appearance-none bg-white cursor-pointer"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Phone Number */}
                  <div className="group">
                    <label className="block text-gray-700 text-sm font-medium mb-1 transition group-hover:text-primeColor">Phone Number*</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-hover:text-primeColor transition">
                        <FaPhone />
                      </div>
                      <input
                        type="tel"
                        onChange={handlePhone}
                        value={phone}
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primeColor focus:border-primeColor transition shadow-sm hover:shadow-md"
                        placeholder="10-digit phone number"
                      />
                    </div>
                    {errPhone && (
                      <p className="text-red-500 text-xs mt-1">{errPhone}</p>
                    )}
                  </div>
                </div>
                
                {/* Terms and Conditions */}
                <div className="flex items-start gap-2 mt-4 group">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={checked}
                    onChange={() => setChecked(!checked)}
                    className="mt-1 h-4 w-4 text-primeColor focus:ring-primeColor rounded cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 group-hover:text-gray-800 transition">
                    I agree to the <Link to="/terms" className="text-primeColor hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primeColor hover:underline">Privacy Policy</Link>
                  </label>
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg text-white font-medium transition duration-300 flex items-center justify-center gap-2 shadow-lg mt-4 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-primeColor to-blue-600 hover:from-blue-600 hover:to-primeColor"}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    <>
                      <FaUserPlus />
                      Create Account
                    </>
                  )}
                </button>
                
                {/* Sign In Link */}
                <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-white text-sm text-gray-500">Already have an account?</span>
                  </div>
                </div>
                
                <Link to="/signin" className="block w-full text-center py-3 border border-gray-300 rounded-lg text-primeColor font-medium hover:bg-gray-50 hover:shadow-md transition duration-300">
                  Sign In
                </Link>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
