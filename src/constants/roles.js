export const ROLES = Object.freeze({
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  SECRETARY: 'secretary',
  ADMIN: 'admin',
});

export const ROLE_HOME = Object.freeze({
  [ROLES.PATIENT]: '/',
  [ROLES.DOCTOR]: '/doctor/turns',
  [ROLES.SECRETARY]: '/secretary/dashboard',
  [ROLES.ADMIN]: '/admin/doctors',
});

export const getHomeForRole = (role) => ROLE_HOME[role] ?? '/';
