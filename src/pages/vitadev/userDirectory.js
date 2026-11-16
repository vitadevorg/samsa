import { ROLES } from '../../constants/roles';
import { doctorsData } from '../../data/doctors';
import { getDoctorEmail } from '../../data/institutions';
import { stripTitle, getTitleFromName } from '../../utils/doctorName';
import { getPatientAccounts } from '../../services/authService';

// Tipos de usuario que maneja VitaDev (la clave se usa para filtrar en la pantalla Usuarios).
// De los pacientes solo se muestran datos de contacto: nunca información clínica.
export const USER_GROUPS = {
  doctor: { label: 'Médicos', single: 'Médico', role: ROLES.DOCTOR, badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  secretary: { label: 'Secretarias', single: 'Secretaria', role: ROLES.SECRETARY, badge: 'bg-pink-100 text-pink-700 border-pink-200' },
  clinicAdmin: { label: 'Admins de clínica', single: 'Admin de clínica', role: ROLES.CLINIC_ADMIN, badge: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  hospitalAdmin: { label: 'Admins de hospital', single: 'Admin de hospital', role: ROLES.HOSPITAL_ADMIN, badge: 'bg-teal-100 text-teal-700 border-teal-200' },
  patient: { label: 'Pacientes', single: 'Paciente', role: ROLES.PATIENT, badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

export const PARTICULAR_LABEL = 'Atención particular';


// Arma una sola lista con todas las personas que tienen cuenta, a partir del estado compartido
// (ver ClinicDataProvider). Solo incluye datos de identidad y contacto: nunca nada clínico.
// Cada elemento: { key, group, particular, sourceId, name, email, where (institución), phone, profile }.
// `sourceId` es el id con el que se edita en el estado compartido.
// Los pacientes además traen `firstName` y `lastName` (su cuenta los guarda por separado).
// `particular` vale para médicos y secretarias: true si no pertenecen a ninguna clínica u hospital.
// `profile` son los datos con los que se crea la cuenta si todavía no existía (ver resetPassword).
export const buildUserDirectory = ({ allAssignments, particularDoctors, allSecretaries, institutions, institutionAdmins, doctorContacts = {} }) => {
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
    // Datos de contacto editados por VitaDev (si los hay) sobre los de doctors.js.
    const contact = doctorContacts[assignment.doctorId] ?? {};
    clinicDoctors.push({
      key: `doctor-${assignment.doctorId}`,
      doctorId: assignment.doctorId,
      group: 'doctor',
      particular: false,
      sourceId: assignment.doctorId,
      name: contact.name ?? doctor.name,
      email: contact.email ?? getDoctorEmail(assignment.doctorId),
      phone: contact.phone ?? '',
      where,
      profile: { name: stripTitle(doctor.name), title: getTitleFromName(doctor.name), role: ROLES.DOCTOR, img: doctor.img },
    });
  });

  const particular = particularDoctors.map((d) => ({
    key: `doctor-${d.id}`,
    group: 'doctor',
    particular: true,
    sourceId: d.id,
    name: d.name,
    email: d.email,
    phone: d.phone,
    where: PARTICULAR_LABEL,
    profile: { name: stripTitle(d.name), title: getTitleFromName(d.name), role: ROLES.DOCTOR },
  }));

  const secretaries = allSecretaries.map((s) => ({
    key: `secretary-${s.id}`,
    group: 'secretary',
    particular: !s.institutionId,
    sourceId: s.id,
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
      sourceId: a.id,
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

  // Pacientes: no pertenecen a una institución, así que la columna queda vacía.
  const patients = getPatientAccounts().map((p) => ({
    key: `patient-${p.email}`,
    group: 'patient',
    sourceId: p.email,
    firstName: p.firstName,
    lastName: p.lastName,
    name: p.name,
    email: p.email,
    phone: p.phone,
    where: '',
    profile: { name: p.name, role: ROLES.PATIENT },
  }));

  return [...clinicDoctors, ...particular, ...secretaries, ...admins, ...patients];
};
