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
  [ROLES.HOSPITAL_ADMIN]: '/hospital/doctors',
  [ROLES.VITADEV_ADMIN]: '/vitadev/dashboard',
});

export const getHomeForRole = (role) => ROLE_HOME[role] ?? '/';

// Clínica y hospital usan las mismas pantallas de administración (src/pages/clinic/);
// solo cambia la ruta base: /clinic/... o /hospital/...
export const INSTITUTION_ADMIN_PATHS = Object.freeze({
  [ROLES.CLINIC_ADMIN]: '/clinic',
  [ROLES.HOSPITAL_ADMIN]: '/hospital',
});
