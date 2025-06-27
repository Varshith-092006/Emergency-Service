import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated && user?.role === 'admin' ? children : <Navigate to="/" />;
};

export default AdminRoute; 