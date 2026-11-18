import React, { useCallback, useMemo, useState } from 'react';
import { NotificationsContext, isForUser } from './notifications-context';
import { createId } from '../utils/ids';
import { normalizeEmail } from '../utils/email';
import { ROLES } from '../constants/roles';

// Notificaciones de la app. Es un mock en memoria, como el resto de los datos: se conservan
// mientras la página esté abierta y se pierden al recargar. Con backend, el servidor las
// generaría y las entregaría a cada usuario.
//
// Cada notificación: { id, to, type, title, body, createdAt, action?, readBy[], dismissedBy[] }
//  - `to`: { email } o { roles, institutionId? } (ver isForUser).
//  - `action`: { type: 'link', to } abre una pantalla; { type: 'institution-link', path } abre una pantalla
//    del administrador de institución bajo la ruta de su rol (/clinic o /hospital); { type: 'ticket', ticketId }
//    abre el ticket de soporte.
//  - `readBy` / `dismissedBy`: correos de quienes la leyeron o la quitaron de su lista
//    (así una notificación dirigida a un rol se marca por persona).

// Una bienvenida por rol, para que la campana tenga contenido desde el primer ingreso.
const SEED_AT = '2026-11-10T09:00:00.000Z';
const welcome = (role, body) => ({
  id: `welcome-${role}`,
  to: { roles: [role] },
  type: 'info',
  title: 'Bienvenido a las notificaciones',
  body,
  createdAt: SEED_AT,
  readBy: [],
  dismissedBy: [],
});

const SEED_NOTIFICATIONS = [
  welcome(ROLES.PATIENT, 'Acá vas a ver tus turnos confirmados, cancelaciones y las respuestas de soporte.'),
  welcome(ROLES.DOCTOR, 'Acá vas a ver los turnos nuevos, cancelaciones, respuestas a tus solicitudes de horario y avisos de soporte.'),
  welcome(ROLES.SECRETARY, 'Acá vas a ver los avisos de tu agenda y las respuestas de soporte.'),
  welcome(ROLES.CLINIC_ADMIN, 'Acá vas a ver las solicitudes de tus médicos y las respuestas de soporte.'),
  welcome(ROLES.HOSPITAL_ADMIN, 'Acá vas a ver las solicitudes de tus médicos y las respuestas de soporte.'),
  welcome(ROLES.VITADEV_ADMIN, 'Acá vas a ver los tickets de soporte nuevos y sus respuestas.'),
];

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);

  // Crea una notificación. Devuelve su id.
  const push = useCallback(({ to, type = 'info', title, body, action }) => {
    const id = createId();
    setNotifications((prev) => [
      { id, to, type, title, body, action, createdAt: new Date().toISOString(), readBy: [], dismissedBy: [] },
      ...prev,
    ]);
    return id;
  }, []);

  const forUser = useCallback((user) => {
    const email = normalizeEmail(user?.email);
    return notifications
      .filter((n) => isForUser(n, user) && !n.dismissedBy.includes(email))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((n) => ({ ...n, read: n.readBy.includes(email) }));
  }, [notifications]);

  // Agrega el correo de `user` al campo `readBy` o `dismissedBy` de sus notificaciones:
  // solo la de `id` o, si no se indica, todas las suyas.
  const mark = useCallback((field, user, id) => {
    const email = normalizeEmail(user?.email);
    if (!email) return;
    setNotifications((prev) => prev.map((n) => (
      (id === undefined || n.id === id) && isForUser(n, user) && !n[field].includes(email)
        ? { ...n, [field]: [...n[field], email] }
        : n
    )));
  }, []);

  const markRead = useCallback((id, user) => mark('readBy', user, id), [mark]);
  const markAllRead = useCallback((user) => mark('readBy', user), [mark]);
  const dismiss = useCallback((id, user) => mark('dismissedBy', user, id), [mark]);
  const dismissAll = useCallback((user) => mark('dismissedBy', user), [mark]);

  const value = useMemo(
    () => ({ push, forUser, markRead, markAllRead, dismiss, dismissAll }),
    [push, forUser, markRead, markAllRead, dismiss, dismissAll]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};
