import React from 'react';
import { Navigate } from 'react-router-dom';

interface RoleCheckProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleCheck: React.FC<RoleCheckProps> = ({ children, allowedRoles }) => {
  const roleName = localStorage.getItem('role_name')?.toLowerCase();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roleName && allowedRoles.includes(roleName)) {
    return <>{children}</>;
  }

  // If role is not allowed, redirect to home or a forbidden page
  return <Navigate to="/" replace />;
};

export default RoleCheck;
