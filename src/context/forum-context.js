import { createContext } from 'react';
import { ROLES } from '../constants/roles';

export const ForumContext = createContext(null);

// El administrador de VitaDev modera todo el foro: borra publicaciones de cualquier autor y las notas fijas.
// Los administradores de clínica u hospital solo moderan a los médicos de su institución (ver canModeratePost en ForumContext).
export const canModerate = (user) => user?.role === ROLES.VITADEV_ADMIN;

// Publican notas: médicos, VitaDev y los administradores de clínica u hospital.
export const canPublish = (user) => [ROLES.DOCTOR, ROLES.VITADEV_ADMIN, ROLES.CLINIC_ADMIN, ROLES.HOSPITAL_ADMIN].includes(user?.role);
