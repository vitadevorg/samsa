import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getHomeForRole } from '../constants/roles';

// Sin `roles` solo exige sesión iniciada; con `roles` además restringe por rol.
const ProtectedRoute = ({ roles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getHomeForRole(user.role)} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
