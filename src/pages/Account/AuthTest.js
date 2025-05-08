import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { signIn, checkAuth } from '../../redux/authSlice';

const AuthTest = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // Trigger a check auth on load
    dispatch(checkAuth());
  }, [dispatch]);

  const handleTestLogin = () => {
    // Example credentials - replace with actual test credentials
    dispatch(signIn({ email: 'test@example.com', pwd: 'password123' }));
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Current Auth State</h2>
        <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-auto">
          {JSON.stringify({ isAuthenticated, user, token, loading, error }, null, 2)}
        </pre>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={handleTestLogin}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Test Login
        </button>
        
        <button
          onClick={() => dispatch(checkAuth())}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Check Auth Status
        </button>
        
        <Link to="/" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 inline-flex items-center justify-center">
          Return Home
        </Link>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Authentication Endpoint:</strong> 
            <code className="bg-gray-100 px-2 py-1 rounded">{`${window.location.origin}/api/auth/signin`}</code>
          </li>
          <li>
            <strong>Auth Check Endpoint:</strong> 
            <code className="bg-gray-100 px-2 py-1 rounded">{`${window.location.origin}/api/auth/check`}</code>
          </li>
          <li>
            <strong>withCredentials:</strong> <code className="bg-gray-100 px-2 py-1 rounded">true</code>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AuthTest; 