import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import AuthGuard from './AuthGuard';

/**
 * Role-based authentication guard component that protects routes requiring specific user roles
 * Will redirect to appropriate page based on user's role
 */
const RoleBasedAuthGuard = ({ children, allowedRoles = [], redirectPath = "/dashboard" }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  // Helper function to check if user role is in allowed roles
  const hasAllowedRole = () => {
    if (!user || !user.role) return false;
    
    // Convert user role to uppercase for comparison (backend stores as uppercase)
    const userRole = user.role.toUpperCase();
    
    // Check if any of the allowed roles match the user's role
    return allowedRoles.some(role => role.toUpperCase() === userRole);
  };
  
  return (
    <AuthGuard>
      {/* After authentication check, verify role access */}
      {allowedRoles.length === 0 || hasAllowedRole() 
        ? children 
        : <Navigate to={redirectPath} state={{ from: location }} replace />
      }
    </AuthGuard>
  );
};

export default RoleBasedAuthGuard; 