import { ROLES } from '../../constants/roles';
import { doctorsData } from '../../data/doctors';
import { getDoctorEmail } from '../../data/institutions';
import { stripTitle, getTitleFromName } from '../../utils/doctorName';

// Tipos de usuario que maneja VitaDev (la clave se usa para filtrar en la pantalla Usuarios).
// No incluye pacientes: VitaDev no los ve.
export const USER_GROUPS = {
  doctor: { label: 'Médicos', single: 'Médico', role: ROLES.DOCTOR, badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  secretary: { label: 'Secretarias', single: 'Secretaria', role: ROLES.SECRETARY, badge: 'bg-pink-100 text-pink-700 border-pink-200' },
  clinicAdmin: { label: 'Admins de clínica', single: 'Admin de clínica', role: ROLES.CLINIC_ADMIN, badge: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  hospitalAdmin: { label: 'Admins de hospital', single: 'Admin de hospital', role: ROLES.HOSPITAL_ADMIN, badge: 'bg-teal-100 text-teal-700 border-teal-200' },
};

export const PARTICULAR_LABEL = 'Atención particular';


// Arma una sola lista con todas las personas que tienen cuenta, a partir del estado compartido
// (ver ClinicDataProvider). Solo incluye datos de identidad y contacto: nunca nada clínico.
// Cada elemento: { key, group, name, email, where (institución), phone, profile }.
// `profile` son los datos con los que se crea la cuenta si todavía no existía (ver resetPassword).
export const buildUserDirectory = ({ allAssignments, particularDoctors, allSecretaries, institutions, institutionAdmins }) => {
  const institutionName = (id) => institutions.find((i) => i.id === id)?.name ?? '';
  const isHospital = (id) => Boolean(institutions.find((i) => i.id === id)?.sectors);

  // Médicos de clínicas y hospitales: uno por médico, aunque atienda en varias instituciones.
  const clinicDoctors = [];
  allAssignments.forEach((assignment) => {
    const existing = clinicDoctors.find((d) => d.doctorId === assignment.doctorId);
    const where = institutionName(assignment.institutionId);
    if (existing) {
      existing.where = `${existing.where} · ${where}`;
      return;
    }
    const doctor = doctorsData.find((d) => d.id === assignment.doctorId);
    if (!doctor) return;
    clinicDoctors.push({
      key: `doctor-${assignment.doctorId}`,
      doctorId: assignment.doctorId,
      group: 'doctor',
      name: doctor.name,
      email: getDoctorEmail(assignment.doctorId),
      where,
      profile: { name: stripTitle(doctor.name), title: getTitleFromName(doctor.name), role: ROLES.DOCTOR, img: doctor.img },
    });
  });

  const particular = particularDoctors.map((d) => ({
    key: `doctor-${d.id}`,
    group: 'doctor',
    name: d.name,
    email: d.email,
    phone: d.phone,
    where: PARTICULAR_LABEL,
    profile: { name: stripTitle(d.name), title: getTitleFromName(d.name), role: ROLES.DOCTOR },
  }));

  const secretaries = allSecretaries.map((s) => ({
    key: `secretary-${s.id}`,
    group: 'secretary',
    name: s.name,
    email: s.email,
    phone: s.phone,
    where: s.institutionId ? institutionName(s.institutionId) : 'Médicos particulares',
    profile: { name: s.name, role: ROLES.SECRETARY },
  }));

  const admins = institutionAdmins.map((a) => {
    const hospital = isHospital(a.institutionId);
    return {
      key: `admin-${a.id}`,
      group: hospital ? 'hospitalAdmin' : 'clinicAdmin',
      name: a.name,
      email: a.email,
      phone: a.phone,
      where: institutionName(a.institutionId),
      profile: {
        name: a.name,
        role: hospital ? ROLES.HOSPITAL_ADMIN : ROLES.CLINIC_ADMIN,
        institutionId: a.institutionId,
      },
    };
  });

  return [...clinicDoctors, ...particular, ...secretaries, ...admins];
};
