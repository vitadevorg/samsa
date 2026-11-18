import { ROLES } from '../constants/roles';

// Datos fijos del módulo de soporte: categorías, estados y textos de los tickets.

export const TICKET_CATEGORIES = ['Error en la aplicación', 'Problema con mi cuenta', 'Turnos', 'Consulta u otro tema'];

export const TICKET_STATUS = Object.freeze({
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
});

export const TICKET_STATUS_META = {
  [TICKET_STATUS.OPEN]: { label: 'Abierto', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  [TICKET_STATUS.IN_PROGRESS]: { label: 'En curso', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  [TICKET_STATUS.RESOLVED]: { label: 'Resuelto', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

// "Rol" de quien reporta sin tener cuenta (desde Preguntas Frecuentes). No es un rol del sistema.
export const GUEST_ROLE = 'guest';

export const ROLE_LABELS = {
  [ROLES.PATIENT]: 'Paciente',
  [ROLES.DOCTOR]: 'Médico',
  [ROLES.SECRETARY]: 'Secretaría',
  [ROLES.CLINIC_ADMIN]: 'Admin de clínica',
  [ROLES.HOSPITAL_ADMIN]: 'Admin de hospital',
  [ROLES.VITADEV_ADMIN]: 'Admin SAMSA',
  [GUEST_ROLE]: 'Invitado (sin cuenta)',
};

// Ruta del módulo de tickets del admin SAMSA, con el ticket abierto.
export const adminTicketPath = (ticketId) => `/vitadev/support?ticket=${ticketId}`;

export const SUPPORT_AUTHOR = 'Soporte SAMSA';
export const SUBJECT_MAX = 80;
export const DESCRIPTION_MIN = 10;
export const DESCRIPTION_MAX = 1000;
