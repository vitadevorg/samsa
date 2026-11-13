import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { ROLES, getHomeForRole } from '../constants/roles';
import Home from '../pages/Home';

// Ruta "/": la landing pública es para visitantes. Un paciente con sesión iniciada ya no
// necesita la invitación a registrarse o iniciar sesión, así que va directo a su pantalla principal.
const HomeRoute = () => {
  const { user } = useAuth();

  if (user?.role === ROLES.PATIENT) {
    return <Navigate to={getHomeForRole(ROLES.PATIENT)} replace />;
  }
  return <Home />;
};

export default HomeRoute;
