export const ROLES = Object.freeze({
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  SECRETARY: 'secretary',
  ADMIN: 'admin',
  // Roles de administración por institución
  CLINIC_ADMIN: 'clinic_admin',     // administra una clínica
  HOSPITAL_ADMIN: 'hospital_admin', // administra un hospital (base preparada)
  VITADEV_ADMIN: 'vitadev_admin',   // administración general de VitaDev (base preparada)
});

export const ROLE_HOME = Object.freeze({
  [ROLES.PATIENT]: '/',
  [ROLES.DOCTOR]: '/doctor/turns',
  [ROLES.SECRETARY]: '/secretary/dashboard',
  [ROLES.ADMIN]: '/admin/doctors',
  [ROLES.CLINIC_ADMIN]: '/clinic/doctors',
  [ROLES.HOSPITAL_ADMIN]: '/hospital/dashboard',
  [ROLES.VITADEV_ADMIN]: '/vitadev/dashboard',
});

export const getHomeForRole = (role) => ROLE_HOME[role] ?? '/';
