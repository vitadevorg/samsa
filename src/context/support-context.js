import { createContext, useContext } from 'react';
import { useAuth } from './useAuth';
import { ROLES } from '../constants/roles';

// Contexto de soporte: tickets que los usuarios reportan al administrador SAMSA.
export const SupportContext = createContext(null);

export const useSupport = () => {
  const context = useContext(SupportContext);
  if (!context) {
    throw new Error('useSupport debe usarse dentro de <SupportProvider>');
  }
  return context;
};

// ¿Puede el usuario actual reportar un problema? Cualquiera con sesión, salvo el admin SAMSA, que recibe los tickets.
export const useCanReportSupport = () => {
  const { user } = useAuth();
  return Boolean(user) && user.role !== ROLES.VITADEV_ADMIN;
};
