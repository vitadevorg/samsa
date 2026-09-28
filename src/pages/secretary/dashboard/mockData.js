import { getToday } from './dates';
import { firstWorkingDate, getScheduleSlots } from './agenda';
import { doctorsData } from '../../../data/doctors';
import { getInstitutionById } from '../../../data/institutions';

// Médicos cuyas agendas maneja la secretaria (los que le asignó el admin de su
// clínica), con los datos que usa el panel:
// { id (el de doctors.js), name, specialty (su área en la clínica), location, schedule }
// `assignments` son las vinculaciones actuales (del estado compartido).
export const buildSecretaryDoctors = (secretary, assignments) =>
  (secretary?.doctorIds ?? [])
    .map((doctorId) => {
      const doctor = doctorsData.find((d) => d.id === doctorId);
      const assignment = assignments.find(
        (a) => a.doctorId === doctorId && a.institutionId === secretary.institutionId
      );
      // Si el médico ya no está vinculado a la clínica, no se muestra.
      if (!doctor || !assignment) return null;
      return {
        id: doctorId,
        name: doctor.name,
        specialty: assignment.area,
        location: `${getInstitutionById(assignment.institutionId)?.name} - ${assignment.office}`,
        schedule: { days: assignment.days, startTime: assignment.startTime, endTime: assignment.endTime },
      };
    })
    .filter(Boolean);

const REGISTERED_PATIENTS = {
  '40111222': { patient: 'Lucas Gabriel Lazarte', phone: '3810000001', email: 'lucas.lazarte@example.com', obraSocial: 'OSDE', dob: '1995-04-12' },
  '32111222': { patient: 'Luis Coronel', phone: '3814445555', email: 'luis.coronel@hotmail.com', obraSocial: 'Prensa', dob: '1988-08-20' },
  '40123456': { patient: 'Ana Gomez', phone: '3811234567', email: 'ana.gomez@yahoo.com', obraSocial: 'Swiss Medical', dob: '1998-11-05' },
  '38634095': { patient: 'Juan Pérez', phone: '3815551234', email: 'jperez@gmail.com', obraSocial: 'Subsidio de Salud', dob: '2000-01-01' },
};

export const findPatientByDni = (dni) =>
  REGISTERED_PATIENTS[dni] ? { dni, ...REGISTERED_PATIENTS[dni] } : null;

export const findPatientByName = (name) => {
  const entry = Object.entries(REGISTERED_PATIENTS).find(([, data]) => data.patient === name);
  return entry ? { dni: entry[0], ...entry[1] } : null;
};

// Pacientes de ejemplo para llenar las agendas.
const SAMPLE_PATIENTS = [
  { patient: 'Lucas Gabriel Lazarte', phone: '3810000001', type: 'Presencial' },
  { patient: 'Luis Coronel', phone: '3814445555', type: 'Telefónico' },
  { patient: 'Carlos Rodriguez', phone: '3815556666', type: 'Presencial' },
  { patient: 'Ana Gomez', phone: '3811234567', type: 'Presencial' },
  { patient: 'Ramiro Vides', phone: '3812223333', type: 'Presencial' },
  { patient: 'María Sánchez', phone: '3813334444', type: 'Telefónico' },
];

// Turnos de ejemplo: 3 por médico, en el primer día que atiende (hoy o el
// siguiente) y dentro de su horario. Se construye al montar el panel (no al
// importar) para que "hoy" sea la fecha real de uso.
export const buildInitialAppointments = (doctors) => {
  const today = getToday();
  const appointments = {};
  let nextId = 1;
  doctors.forEach((doctor, doctorIndex) => {
    const date = firstWorkingDate(doctor.schedule);
    const times = getScheduleSlots(doctor.schedule).slice(0, 3);
    appointments[doctor.id] = times.map((time, i) => {
      const sample = SAMPLE_PATIENTS[(doctorIndex * 3 + i) % SAMPLE_PATIENTS.length];
      // Si el turno es hoy, el primero ya está siendo atendido y el segundo espera en sala.
      const status = date === today ? ['attending', 'waiting', 'pending'][i] : 'pending';
      return { id: nextId++, date, time, status, ...sample };
    });
  });
  return appointments;
};
