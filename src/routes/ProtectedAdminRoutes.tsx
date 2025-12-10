import React from 'react';
import { Navigate } from 'react-router-dom';
import { getItemInLocalStorage } from '../utils/localStorage';
import toast from 'react-hot-toast';

interface ProtectedAdminRoutesProps {
  children: React.ReactNode;
}

const ProtectedAdminRoutes: React.FC<ProtectedAdminRoutesProps> = ({ children }) => {
  const token = getItemInLocalStorage<string>('TOKEN') || null;
  const user = getItemInLocalStorage<string>('USERTYPE');

  if (!token || (user !== 'pms_admin' && user !== 'auditor')) {
    toast.error('Not Authorized');
    return <Navigate to="/mytickets" />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoutes;
