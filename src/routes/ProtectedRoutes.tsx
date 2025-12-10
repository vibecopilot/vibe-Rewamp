import React from 'react';
import { Navigate } from 'react-router-dom';
import { getItemInLocalStorage } from '../utils/localStorage';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = getItemInLocalStorage<string>('TOKEN') || null;
  
  if (!token) {
    toast.error('Please Login first!');
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
