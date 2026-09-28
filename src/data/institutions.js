// Datos de prueba de las instituciones (clínicas y hospital).
// No hay backend: todo esto vive en memoria. Cuando exista una API,
// estas funciones se reemplazan por llamadas al servidor.

// ---------------------------------------------------------------------------
// Clínicas: cada una tiene sus áreas (especialidades que atiende).
// ---------------------------------------------------------------------------
export const CLINICS = [
  {
    id: 'clinica-del-norte',
    name: 'Clínica del Norte',
    address: 'Av. Aconquija 1200, Yerba Buena, Tucumán',
    areas: ['Cardiología', 'Clínica Médica', 'Nutrición', 'Pediatría'],
  },
  {
    // Clínica con una sola área
    id: 'centro-dermatologico',
    name: 'Centro Dermatológico del Jardín',
    address: 'Calle 25 de Mayo 850, San Miguel de Tucumán',
    areas: ['Dermatología'],
  },
];

// ---------------------------------------------------------------------------
// Hospital: en lugar de "áreas" se organiza por sectores.
// ---------------------------------------------------------------------------
export const HOSPITALS = [
  {
    id: 'hospital-central',
    name: 'Hospital Central SAMSA',
    address: 'Av. Mate de Luna 2500, San Miguel de Tucumán',
    sectors: ['Pediatría', 'Cardiología', 'Medicina General'],
  },
];

// ---------------------------------------------------------------------------
// Vinculación de médicos existentes (src/data/doctors.js) con una institución.
// `doctorId` es el `id` del médico en doctors.js; ese archivo no se modifica.
// `area` es el área de la clínica o el sector del hospital.
// Cada vinculación tiene su propio horario (`days`, `startTime`, `endTime`):
// un médico puede atender en varias instituciones en días u horas distintos.
// Las horas van en formato "HH:MM" de 24 hs.
// ---------------------------------------------------------------------------
export const DOCTOR_ASSIGNMENTS = [
  { id: 'asig-1', doctorId: 'juan-perez', institutionId: 'clinica-del-norte', area: 'Cardiología', office: 'Consultorio 4', days: ['Lun', 'Mié', 'Vie'], startTime: '08:00', endTime: '13:00' },
  { id: 'asig-2', doctorId: 'agustina-vega', institutionId: 'clinica-del-norte', area: 'Nutrición', office: 'Consultorio 8', days: ['Mar', 'Jue'], startTime: '16:00', endTime: '20:00' },
  { id: 'asig-3', doctorId: 'carlos-rodriguez', institutionId: 'clinica-del-norte', area: 'Clínica Médica', office: 'Consultorio 2', days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'], startTime: '09:00', endTime: '12:00' },
  // El Dr. Mateo Cruz atiende en dos instituciones, en días distintos (ver asig-7).
  { id: 'asig-9', doctorId: 'mateo-cruz', institutionId: 'clinica-del-norte', area: 'Cardiología', office: 'Consultorio 5', days: ['Mar', 'Jue'], startTime: '15:00', endTime: '19:00' },
  { id: 'asig-4', doctorId: 'laura-quiroga', institutionId: 'centro-dermatologico', area: 'Dermatología', office: 'Consultorio 1', days: ['Lun', 'Mié'], startTime: '09:00', endTime: '14:00' },
  { id: 'asig-5', doctorId: 'sofia-blanco', institutionId: 'centro-dermatologico', area: 'Dermatología', office: 'Consultorio 2', days: ['Mar', 'Vie'], startTime: '14:00', endTime: '18:00' },
  { id: 'asig-6', doctorId: 'sofia-bermudez', institutionId: 'hospital-central', area: 'Pediatría', office: 'Piso 1 - Box 3', days: ['Lun', 'Mar', 'Mié'], startTime: '08:00', endTime: '14:00' },
  { id: 'asig-7', doctorId: 'mateo-cruz', institutionId: 'hospital-central', area: 'Cardiología', office: 'Piso 2 - Box 1', days: ['Lun', 'Mié', 'Vie'], startTime: '08:00', endTime: '13:00' },
  { id: 'asig-8', doctorId: 'diego-herrera', institutionId: 'hospital-central', area: 'Medicina General', office: 'Guardia', days: ['Sáb', 'Dom'], startTime: '08:00', endTime: '20:00' },
];

// ---------------------------------------------------------------------------
// Secretarias de prueba (datos ficticios), vinculadas a una clínica
// o a un sector del hospital. `doctorIds` son los médicos cuyas agendas maneja
// (ids de doctors.js; tienen que estar vinculados a la misma institución).
// ---------------------------------------------------------------------------
export const SECRETARIES = [
  { id: 'sec-1', name: 'Ana Paula Díaz', email: 'ana.diaz@samsa.med', phone: '381 400-1001', institutionId: 'clinica-del-norte', area: 'Cardiología', doctorIds: ['juan-perez', 'mateo-cruz'] },
  { id: 'sec-2', name: 'Florencia Juárez', email: 'florencia.juarez@samsa.med', phone: '381 400-1002', institutionId: 'clinica-del-norte', area: 'Nutrición', doctorIds: ['agustina-vega', 'carlos-rodriguez'] },
  { id: 'sec-3', name: 'Micaela Soria', email: 'micaela.soria@samsa.med', phone: '381 400-1003', institutionId: 'centro-dermatologico', area: 'Dermatología', doctorIds: ['laura-quiroga', 'sofia-blanco'] },
  { id: 'sec-4', name: 'Rodrigo Paz', email: 'rodrigo.paz@samsa.med', phone: '381 400-1004', institutionId: 'hospital-central', area: 'Pediatría', doctorIds: ['sofia-bermudez'] },
];

// ---------------------------------------------------------------------------
// Funciones de consulta. Devuelven copias filtradas: quien las usa puede
// modificar su lista sin alterar estos datos originales.
// ---------------------------------------------------------------------------

// Busca una clínica u hospital por su id. Devuelve undefined si no existe.
export const getInstitutionById = (id) =>
  [...CLINICS, ...HOSPITALS].find((institution) => institution.id === id);

// Tipo de institución para mostrar: 'Clínica' u 'Hospital'.
export const getInstitutionType = (id) =>
  HOSPITALS.some((hospital) => hospital.id === id) ? 'Hospital' : 'Clínica';

// Todas las vinculaciones de médicos (de todas las instituciones), cada una con su documentación.
export const getAllDoctorAssignments = () =>
  DOCTOR_ASSIGNMENTS.map((assignment) => ({ ...assignment, documents: getAssignmentDocuments(assignment.id) }));

// Vinculaciones de médicos de una institución, cada una con su documentación.
export const getDoctorAssignments = (institutionId) =>
  getAllDoctorAssignments().filter((assignment) => assignment.institutionId === institutionId);

// Secretarias de una institución.
export const getSecretaries = (institutionId) =>
  SECRETARIES.filter((secretary) => secretary.institutionId === institutionId);

// ---------------------------------------------------------------------------
// Horarios
// ---------------------------------------------------------------------------

// ¿Dos horarios se superponen? Tienen que compartir al menos un día y que sus
// franjas horarias se crucen. Las horas "HH:MM" se pueden comparar como texto
// porque siempre tienen 2 dígitos ("08:00" < "13:00").
export const schedulesOverlap = (a, b) => {
  const shareDay = a.days.some((day) => b.days.includes(day));
  const hoursCross = a.startTime < b.endTime && b.startTime < a.endTime;
  return shareDay && hoursCross;
};

// Busca si el médico ya atiende en OTRA institución en un horario que se cruza
// con `schedule`. Devuelve esa vinculación, o undefined si no hay conflicto.
export const findScheduleConflict = (doctorId, schedule, institutionId) =>
  DOCTOR_ASSIGNMENTS.find(
    (assignment) =>
      assignment.doctorId === doctorId &&
      assignment.institutionId !== institutionId &&
      schedulesOverlap(assignment, schedule)
  );

// Texto legible de un horario, por ejemplo "Lun, Mié · 08:00 a 13:00".
export const formatSchedule = ({ days, startTime, endTime }) =>
  `${days.join(', ')} · ${startTime} a ${endTime}`;

// ---------------------------------------------------------------------------
// Documentación de cada médico vinculado
// `status`: 'vigente' | 'vencido' | 'pendiente' (todavía no se recibió).
// `expiresAt`: fecha de vencimiento "AAAA-MM-DD", o null si no vence (Título)
// o si todavía no se recibió.
// ---------------------------------------------------------------------------
export const DOCUMENT_TYPES = ['Contrato', 'Matrícula', 'Seguro de mala praxis', 'Título'];

// Documentos de un médico recién vinculado: todos pendientes.
export const pendingDocuments = () =>
  DOCUMENT_TYPES.map((type) => ({ type, status: 'pendiente', expiresAt: null }));

// Documentación de los médicos de Clínica del Norte (la clave es el id de la vinculación).
const DOCTOR_DOCUMENTS = {
  'asig-1': [
    { type: 'Contrato', status: 'vigente', expiresAt: '2027-03-31' },
    { type: 'Matrícula', status: 'vigente', expiresAt: '2027-12-31' },
    { type: 'Seguro de mala praxis', status: 'vencido', expiresAt: '2026-08-31' },
    { type: 'Título', status: 'vigente', expiresAt: null },
  ],
  'asig-2': [
    { type: 'Contrato', status: 'vigente', expiresAt: '2027-01-31' },
    { type: 'Matrícula', status: 'vencido', expiresAt: '2026-06-30' },
    { type: 'Seguro de mala praxis', status: 'vigente', expiresAt: '2027-05-15' },
    { type: 'Título', status: 'vigente', expiresAt: null },
  ],
  'asig-3': [
    { type: 'Contrato', status: 'vigente', expiresAt: '2026-12-31' },
    { type: 'Matrícula', status: 'vigente', expiresAt: '2028-02-28' },
    { type: 'Seguro de mala praxis', status: 'vigente', expiresAt: '2027-02-28' },
    { type: 'Título', status: 'pendiente', expiresAt: null },
  ],
  'asig-9': [
    { type: 'Contrato', status: 'pendiente', expiresAt: null },
    { type: 'Matrícula', status: 'vigente', expiresAt: '2027-09-30' },
    { type: 'Seguro de mala praxis', status: 'vigente', expiresAt: '2027-04-30' },
    { type: 'Título', status: 'vigente', expiresAt: null },
  ],
};

// Los médicos de otras instituciones arrancan con todo pendiente.
export const getAssignmentDocuments = (assignmentId) =>
  DOCTOR_DOCUMENTS[assignmentId] ?? pendingDocuments();

// Documentos que no vencen (no piden fecha de vencimiento).
export const NON_EXPIRING_DOCUMENTS = ['Título'];

// Estado real de un documento: si figura "vigente" pero su fecha ya pasó, está vencido.
// `today` es la fecha de hoy "AAAA-MM-DD" (las fechas así se comparan como texto).
export const getDocumentStatus = (doc, today) =>
  doc.status === 'vigente' && doc.expiresAt && doc.expiresAt < today ? 'vencido' : doc.status;

// ---------------------------------------------------------------------------
// Solicitudes de cambio de horario que los médicos le hacen a la institución.
// `status`: 'pendiente' | 'aceptada' | 'rechazada'. Fechas "AAAA-MM-DD".
// `currentSchedule` es el horario que tenía el médico cuando hizo el pedido.
// ---------------------------------------------------------------------------
export const SCHEDULE_REQUESTS = [
  {
    id: 'sol-1',
    doctorId: 'juan-perez',
    institutionId: 'clinica-del-norte',
    currentSchedule: { days: ['Lun', 'Mié', 'Vie'], startTime: '08:00', endTime: '13:00' },
    requestedSchedule: { days: ['Mar', 'Mié', 'Jue', 'Vie'], startTime: '14:00', endTime: '19:00' },
    reason: 'Empiezo una rotación hospitalaria por las mañanas y necesito pasar mis consultas a la tarde.',
    date: '2026-09-22',
    status: 'pendiente',
  },
  {
    id: 'sol-2',
    doctorId: 'agustina-vega',
    institutionId: 'clinica-del-norte',
    currentSchedule: { days: ['Mar', 'Jue'], startTime: '16:00', endTime: '20:00' },
    requestedSchedule: { days: ['Lun', 'Mar', 'Jue'], startTime: '16:00', endTime: '20:00' },
    reason: 'Tengo lista de espera de más de dos semanas; quiero sumar los lunes.',
    date: '2026-09-25',
    status: 'pendiente',
  },
  {
    // Este pedido choca con su horario del Hospital Central (Lun/Mié 08:00 a 13:00):
    // la pantalla no debería dejar aceptarlo.
    id: 'sol-3',
    doctorId: 'mateo-cruz',
    institutionId: 'clinica-del-norte',
    currentSchedule: { days: ['Mar', 'Jue'], startTime: '15:00', endTime: '19:00' },
    requestedSchedule: { days: ['Lun', 'Mié'], startTime: '10:00', endTime: '14:00' },
    reason: 'Quiero concentrar mis consultas en dos días.',
    date: '2026-09-26',
    status: 'pendiente',
  },
  {
    id: 'sol-4',
    doctorId: 'carlos-rodriguez',
    institutionId: 'clinica-del-norte',
    currentSchedule: { days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'], startTime: '08:00', endTime: '11:00' },
    requestedSchedule: { days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'], startTime: '09:00', endTime: '12:00' },
    reason: 'Cambio de horario escolar de mis hijos.',
    date: '2026-08-10',
    status: 'aceptada',
    resolvedAt: '2026-08-12',
  },
  {
    id: 'sol-5',
    doctorId: 'agustina-vega',
    institutionId: 'clinica-del-norte',
    currentSchedule: { days: ['Mar', 'Jue'], startTime: '16:00', endTime: '20:00' },
    requestedSchedule: { days: ['Sáb'], startTime: '09:00', endTime: '13:00' },
    reason: 'Quería probar atender los sábados.',
    date: '2026-07-15',
    status: 'rechazada',
    resolvedAt: '2026-07-18',
  },
];

// Solicitudes de una institución.
export const getScheduleRequests = (institutionId) =>
  SCHEDULE_REQUESTS.filter((request) => request.institutionId === institutionId);

// ---------------------------------------------------------------------------
// Cuentas de acceso del personal
// ---------------------------------------------------------------------------

// Emails de acceso de los médicos (datos ficticios; doctors.js no los tiene).
// Si un médico no figura acá, se usa "<id>@samsa.med".
const DOCTOR_EMAILS = {
  'juan-perez': 'jesus.zelarayan@samsa.med', // la cuenta de prueba del Dr. Zelarayan
};

export const getDoctorEmail = (doctorId) => DOCTOR_EMAILS[doctorId] ?? `${doctorId}@samsa.med`;
