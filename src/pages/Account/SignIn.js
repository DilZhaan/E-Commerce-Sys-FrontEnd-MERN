import React, { useState, useEffect } from "react";
import { BsCheckCircleFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { logo, logoLight } from "../../assets/images";
import { useDispatch, useSelector } from "react-redux";
import { signIn, clearError, clearSuccessMessage, resetLoading } from "../../redux/authSlice";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, successMessage, user } = useSelector((state) => state.auth);

  // ============= Initial State Start here =============
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // ============= Initial State End here ===============
  // ============= Error Msg Start here =================
  const [errEmail, setErrEmail] = useState("");
  const [errPassword, setErrPassword] = useState("");

  // ============= Error Msg End here ===================
  // ============= Event Handler Start here =============
  const handleEmail = (e) => {
    setEmail(e.target.value);
    setErrEmail("");
    dispatch(clearError());
  };
  const handlePassword = (e) => {
    setPassword(e.target.value);
    setErrPassword("");
    dispatch(clearError());
  };
  
  // Check if authenticated and redirect if needed
  useEffect(() => {
    console.log("SignIn - Auth state updated:", { isAuthenticated, user });
    
    if (isAuthenticated) {
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
    
    // Clear success message when component unmounts
    return () => {
      dispatch(clearSuccessMessage());
      dispatch(resetLoading()); // Reset loading state when unmounting
    };
  }, [isAuthenticated, navigate, dispatch, user]);
  
  // Reset loading state if it gets stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        dispatch(resetLoading());
      }
    }, 10000); // Reset loading after 10 seconds if it's still true
    
    return () => clearTimeout(timer);
  }, [loading, dispatch]);
  
  // ============= Event Handler End here ===============
  const handleSignIn = (e) => {
    e.preventDefault();
    console.log("SignIn - Submitting credentials");

    if (!email) {
      setErrEmail("Enter your email");
      return;
    }

    if (!password) {
      setErrPassword("Enter your password");
      return;
    }
    
    // Dispatch login action
    dispatch(signIn({ email, pwd: password }));
  };
  
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left Column - Info with Brand Image */}
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-primeColor to-blue-500">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-600/70 to-transparent"></div>
          
          <div className="relative flex flex-col items-center justify-center h-full py-12 px-8 text-white z-10">
            <div className="w-24 h-24 bg-white rounded-2xl p-2 flex items-center justify-center mb-8 shadow-lg transform hover:rotate-3 transition-transform duration-300">
              <img src={logo} alt="Logo" className="w-full object-contain" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-center text-white">Welcome Back</h1>
            <p className="text-lg mb-10 opacity-90 text-center text-white/90">Sign in to continue your shopping journey</p>
            
            <div className="space-y-6 w-full max-w-md">
              <div className="flex items-start gap-3 backdrop-blur-sm bg-white/10 p-4 rounded-lg transform hover:translate-x-2 transition-transform duration-300">
                <span className="p-1 bg-green-400 rounded-full mt-1 flex-shrink-0">
                  <BsCheckCircleFill className="text-white" />
                </span>
                <div>
                  <h3 className="font-semibold text-xl">Access Your Orders</h3>
                  <p className="opacity-90">Track purchases and manage returns with ease</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 backdrop-blur-sm bg-white/10 p-4 rounded-lg transform hover:translate-x-2 transition-transform duration-300">
                <span className="p-1 bg-green-400 rounded-full mt-1 flex-shrink-0">
                  <BsCheckCircleFill className="text-white" />
                </span>
                <div>
                  <h3 className="font-semibold text-xl">Save Your Favorites</h3>
                  <p className="opacity-90">Create wishlists for future purchases</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 backdrop-blur-sm bg-white/10 p-4 rounded-lg transform hover:translate-x-2 transition-transform duration-300">
                <span className="p-1 bg-green-400 rounded-full mt-1 flex-shrink-0">
                  <BsCheckCircleFill className="text-white" />
                </span>
                <div>
                  <h3 className="font-semibold text-xl">Faster Checkout</h3>
                  <p className="opacity-90">Save your details for quicker shopping</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Form */}
        <div className="lg:col-span-3 p-8 lg:p-12">
          {/* Show mobile logo on smaller screens */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primeColor to-blue-500 rounded-2xl p-3 flex items-center justify-center shadow-lg">
              <img src={logo} alt="Logo" className="w-full object-contain" />
            </div>
          </div>
          
          {(successMessage || isAuthenticated) ? (
            <div className="w-full h-full flex flex-col justify-center items-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-pulse">
                <BsCheckCircleFill className="text-green-500 text-4xl" />
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-center bg-gradient-to-r from-primeColor to-blue-600 bg-clip-text text-transparent">Sign In Successful!</h2>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                {successMessage || "You have successfully signed in. Redirecting to home page..."}
              </p>
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto">
              <div className="mb-8">
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primeColor to-blue-600 bg-clip-text text-transparent">Sign In</h2>
                <p className="text-gray-600">Welcome back! Please enter your details</p>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg animate-pulse">
                  <p className="font-medium">Authentication Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSignIn} className="space-y-6">
                {/* Email */}
                <div className="group">
                  <label className="block text-gray-700 font-medium mb-2 transition group-hover:text-primeColor">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-hover:text-primeColor transition">
                      <FaEnvelope />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmail}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primeColor focus:border-primeColor transition shadow-sm hover:shadow-md"
                      placeholder="your@email.com"
                    />
                  </div>
                  {errEmail && (
                    <p className="text-red-500 text-sm mt-1">{errEmail}</p>
                  )}
                </div>

                {/* Password */}
                <div className="group">
                  <div className="flex justify-between mb-2">
                    <label className="block text-gray-700 font-medium transition group-hover:text-primeColor">Password</label>
                    <a href="#" className="text-sm text-primeColor hover:underline">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-hover:text-primeColor transition">
                      <FaLock />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={handlePassword}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primeColor focus:border-primeColor transition shadow-sm hover:shadow-md"
                      placeholder="Enter your password"
                    />
                  </div>
                  {errPassword && (
                    <p className="text-red-500 text-sm mt-1">{errPassword}</p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 text-primeColor focus:ring-primeColor rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-gray-700 text-sm">
                    Remember me for 30 days
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg text-white font-medium transition duration-300 flex items-center justify-center gap-2 shadow-lg ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-primeColor to-blue-600 hover:from-blue-600 hover:to-primeColor"}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    <>
                      <FaSignInAlt />
                      Sign In
                    </>
                  )}
                </button>
                
                {/* Sign Up Link */}
                <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-white text-sm text-gray-500">Don't have an account?</span>
                  </div>
                </div>
                
                <Link to="/signup" className="block w-full text-center py-3 border border-gray-300 rounded-lg text-primeColor font-medium hover:bg-gray-50 hover:shadow-md transition duration-300">
                  Create Account
                </Link>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
