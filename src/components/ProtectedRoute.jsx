import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-arjes-gold"></div>
      </div>
    );
  }

  // Jika belum login, redirect ke login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Jika require admin tapi bukan admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />; 
  }

  if (!user) {
    // Simpan URL yang dituju sebelum redirect ke login
    localStorage.setItem('redirectUrl', window.location.pathname);
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;