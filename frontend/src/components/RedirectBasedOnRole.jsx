import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RedirectBasedOnRole = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Redirect based on user role
  if (user.roles?.includes('ROLE_ADMIN')) {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.roles?.includes('ROLE_DRIVER')) {
    return <Navigate to="/driver/dashboard" replace />;
  } else {
    return <Navigate to="/user/dashboard" replace />;
  }
};

export default RedirectBasedOnRole;