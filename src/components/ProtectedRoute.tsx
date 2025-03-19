import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { currentUser, loading, userRole } = useAuth();

  // If still loading auth state, render nothing
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If admin only and user is not admin, redirect to homepage
  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute; 