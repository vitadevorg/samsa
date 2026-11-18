import { createContext, useContext } from 'react';
import { normalizeEmail } from '../utils/email';

// Contexto de las notificaciones (campana de la cabecera). Lo llena <NotificationsProvider>.
export const NotificationsContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de <NotificationsProvider>');
  }
  return context;
};

// ¿Esta notificación le corresponde a `user`?
// `to` puede ser { email } (una persona) o { roles, institutionId? } (todos los usuarios de esos
// roles y, si se indica, de esa institución).
export const isForUser = (notification, user) => {
  if (!user || !notification?.to) return false;
  const { email, roles, institutionId } = notification.to;
  if (email) return normalizeEmail(email) === normalizeEmail(user.email);
  if (roles) {
    if (!roles.includes(user.role)) return false;
    return !institutionId || institutionId === user.institutionId;
  }
  return false;
};
