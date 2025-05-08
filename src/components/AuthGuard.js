import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { checkAuth } from '../redux/authSlice';

/**
 * Authentication guard component that protects routes requiring user authentication
 * Will redirect to signin page if user is not authenticated
 */
const AuthGuard = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  // Only check auth if we don't have a user or not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      dispatch(checkAuth());
    }
  }, [dispatch, isAuthenticated, loading]);

  if (loading) {
    // You could replace this with a loading spinner
    return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    // Save the location they were trying to access for redirecting after login
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthGuard; 