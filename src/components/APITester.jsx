import React, { useState } from 'react';
import axios from 'axios';

const APITester = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const testAPI = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);
    
    try {
      // Create FormData (what the backend expects)
      const formData = new FormData();
      formData.append('name', 'Test Issue');
      formData.append('description', 'This is a test issue');
      formData.append('location', 'Test Location');
      formData.append('address', '123 Test Street');
      formData.append('district', 'Test District');
      formData.append('province', 'Test Province');
      formData.append('mobileNo', '1234567890');
      formData.append('whatsappNo', '1234567890');
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
      console.log('Sending FormData test request to:', `${API_URL}/issues`);
      
      // Log what's in the FormData
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      // Important: DO NOT set Content-Type header when sending FormData
      // The browser will automatically set the correct Content-Type with boundary
      const result = await axios.post(`${API_URL}/issues`, formData, {
        withCredentials: true
      });
      
      setResponse(result.data);
      console.log('API test successful:', result.data);
    } catch (err) {
      setError(err);
      console.error('API test failed:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Test with JSON data instead of FormData
  const testAPIWithJSON = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);
    
    try {
      // Create a simple JSON object
      const jsonData = {
        name: "Test Issue JSON",
        description: "This is a test issue via JSON",
        location: "Test Location JSON",
        address: "123 Test Street",
        district: "Test District",
        province: "Test Province",
        mobileNo: "1234567890",
        whatsappNo: "1234567890"
      };
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
      console.log('Sending JSON test request to:', `${API_URL}/issues`);
      console.log('JSON data:', jsonData);
      
      const result = await axios.post(`${API_URL}/issues`, jsonData, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      setResponse(result.data);
      console.log('API JSON test successful:', result.data);
    } catch (err) {
      setError(err);
      console.error('API JSON test failed:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4">
      <h3 className="text-lg font-medium mb-2">API Direct Test</h3>
      <div className="flex space-x-4">
        <button 
          onClick={testAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test with FormData'}
        </button>
        
        <button 
          onClick={testAPIWithJSON}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test with JSON'}
        </button>
      </div>
      
      {response && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <h4 className="text-green-800 font-medium">Success!</h4>
          <pre className="mt-2 text-sm bg-white p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-red-800 font-medium">Error</h4>
          <div className="mt-2 text-sm">
            <p><strong>Message:</strong> {error.message}</p>
            {error.response && (
              <div className="mt-2">
                <p><strong>Status:</strong> {error.response.status}</p>
                <p><strong>Data:</strong></p>
                <pre className="mt-1 bg-white p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(error.response.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default APITester; 