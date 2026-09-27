import { getToday, addDays } from './dates';

export const ASSIGNED_DOCTORS = [
  { id: 'd1', name: 'Dr. Jesús Zelarayan', specialty: 'Cardiología', location: 'Sede Centro - Consultorio 4' },
  { id: 'd2', name: 'Dra. Sofía López', specialty: 'Pediatría', location: 'Sede Norte - Consultorio 12' },
  { id: 'd3', name: 'Dr. Martín Gómez', specialty: 'Cardiología', location: 'Sede Centro - Consultorio 5' },
  { id: 'd4', name: 'Dra. Ana Torres', specialty: 'Dermatología', location: 'Sede Sur - Consultorio 2' },
];

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

// Se construye al montar (no al importar) para que "hoy" sea la fecha real de uso.
export const buildInitialAppointments = () => {
  const today = getToday();
  const tomorrow = addDays(1);
  return {
    d1: [
      { id: 1, date: today, time: '09:00', patient: 'Lucas Gabriel Lazarte', status: 'attending', type: 'Presencial', phone: '3810000001' },
      { id: 2, date: today, time: '09:30', patient: 'Luis Coronel', status: 'waiting', type: 'Telefónico', phone: '3814445555' },
      { id: 3, date: today, time: '10:00', patient: 'Carlos Rodriguez', status: 'pending', type: 'Presencial', phone: '3815556666' },
      { id: 6, date: tomorrow, time: '09:00', patient: 'Ana Gomez', status: 'pending', type: 'Presencial', phone: '3811234567' },
    ],
    d2: [
      { id: 4, date: today, time: '08:30', patient: 'Ramiro Vides', status: 'finished', type: 'Presencial', phone: '3812223333' },
      { id: 5, date: today, time: '11:00', patient: 'María Sánchez', status: 'pending', type: 'Presencial', phone: '3813334444' },
    ],
    d3: [],
    d4: [],
  };
};
