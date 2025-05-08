import React from 'react';
import { Link, useRouteError } from 'react-router-dom';

/**
 * Error boundary component for React Router v6
 * Displays a friendly error message when routes throw errors
 */
const ErrorBoundary = () => {
  const error = useRouteError();
  console.error('Route error:', error);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <p className="text-gray-700 mb-4">
          We're sorry, an unexpected error has occurred. Our team has been notified.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          {error?.message || 'Unknown error'}
        </p>
        <div className="flex justify-center">
          <Link
            to="/"
            className="px-4 py-2 bg-primeColor text-white rounded hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary; 