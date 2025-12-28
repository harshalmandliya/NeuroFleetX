import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    // User is not authenticated
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some(role => user.roles?.includes(role))) {
    // User is authenticated but doesn't have the required role
    // Redirect to their default dashboard
    if (user.roles?.includes('ROLE_ADMIN')) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.roles?.includes('ROLE_DRIVER')) {
      return <Navigate to="/driver/dashboard" replace />;
    } else {
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;