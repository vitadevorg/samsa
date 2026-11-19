// Datos SINTÉTICOS de la Historia Clínica Electrónica. Ningún dato corresponde a personas reales.
// Las fechas se calculan respecto de hoy para que el seguimiento (pendiente / vencida) tenga sentido.
// TODO(api): reemplazar por la API real; este archivo solo lo importa src/services/hceService.js.

const daysFromNow = (days, hour = 10, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

// Profesionales que firman los registros de ejemplo.
export const mockProfessionals = {
  zelarayan: { name: 'Dr. Jesús Zelarayan', license: 'M.P. 4821', specialty: 'Cardiología' },
  gomez: { name: 'Dra. Priscila Gómez', license: 'M.P. 5310', specialty: 'Clínica Médica' },
  fernandez: { name: 'Dr. Augusto Fernández', license: 'M.P. 3977', specialty: 'Cirugía General' },
  enfermeria: { name: 'Lic. Marta Ibáñez', license: 'M.P. 7702', specialty: 'Enfermería' },
};

export const mockPatients = [
  {
    historyId: 'HC-40111',
    name: 'Lucas Gabriel Lazarte',
    dni: '40.111.222',
    birthDate: '2001-03-14',
    sex: 'Masculino',
    phone: '381-0000001',
    email: 'lucas.lazarte@example.com',
    address: 'San Miguel de Tucumán',
    img: '/img/patients/masc4.jpg',
    insurance: { name: 'OSDE', plan: '210', memberNumber: '60123456701' },
    startedAt: daysFromNow(-420, 9, 0),
    allergies: ['Penicilina'],
    activeProblems: ['Hipertensión arterial (I10)'],
    family: [
      { name: 'Graciela Lazarte', relation: 'Madre', phone: '381-0000010' },
      { name: 'Martín Lazarte', relation: 'Hermano', phone: '' },
    ],
  },
  {
    historyId: 'HC-98212',
    name: 'Luis Coronel',
    dni: '33.982.120',
    birthDate: '1993-07-02',
    sex: 'Masculino',
    phone: '381-5550001',
    email: 'luis.coronel@example.com',
    address: 'Yerba Buena',
    img: '/img/patients/masc1.jpg',
    insurance: { name: 'Subsidio de Salud', plan: 'General', memberNumber: '1209834' },
    startedAt: daysFromNow(-200, 11, 0),
    allergies: [],
    activeProblems: ['Asma leve intermitente (J45.2)'],
    family: [{ name: 'Ana Coronel', relation: 'Esposa', phone: '381-5550002' }],
  },
  {
    historyId: 'HC-33421',
    name: 'Ramiro Vides',
    dni: '26.334.210',
    birthDate: '1980-11-21',
    sex: 'Masculino',
    phone: '381-5550003',
    email: '',
    address: 'Tafí Viejo',
    img: '/img/patients/masc2.avif',
    insurance: { name: 'Particular', plan: '', memberNumber: '' },
    startedAt: daysFromNow(-90, 8, 30),
    allergies: ['AINEs'],
    activeProblems: [],
    family: [],
  },
  {
    historyId: 'HC-12399',
    name: 'Carlos Rodriguez',
    dni: '18.123.990',
    birthDate: '1967-05-09',
    sex: 'Masculino',
    phone: '381-5550004',
    email: 'carlos.r@example.com',
    address: 'Banda del Río Salí',
    img: '/img/patients/masc3.jpg',
    insurance: { name: 'PAMI', plan: '', memberNumber: '15039912340' },
    startedAt: daysFromNow(-1500, 10, 0),
    allergies: [],
    activeProblems: ['Diabetes tipo 2 (E11)', 'Dislipemia (E78.5)'],
    family: [{ name: 'Rosa Rodriguez', relation: 'Hija', phone: '381-5550005' }],
  },
  {
    historyId: 'HC-99887',
    name: 'Sofia Bermudez',
    dni: '42.998.870',
    birthDate: '1996-01-30',
    sex: 'Femenino',
    phone: '381-5550006',
    email: 'sofia.b@example.com',
    address: 'San Miguel de Tucumán',
    img: '/img/patients/fem1.jpg',
    insurance: { name: 'Swiss Medical', plan: 'SMG20', memberNumber: '80099887' },
    startedAt: daysFromNow(-30, 16, 0),
    allergies: ['Látex'],
    activeProblems: [],
    family: [],
  },
  {
    historyId: 'HC-55112',
    name: 'Pedro Sanchez',
    dni: '14.551.120',
    birthDate: '1965-09-12',
    sex: 'Masculino',
    phone: '381-5550007',
    email: '',
    address: 'Lules',
    img: '/img/patients/masc5.jpg',
    insurance: { name: 'PAMI', plan: '', memberNumber: '15055112000' },
    startedAt: daysFromNow(-700, 9, 0),
    allergies: [],
    activeProblems: ['Fibrilación auricular (I48)'],
    family: [{ name: 'Elena Sanchez', relation: 'Esposa', phone: '381-5550008' }],
  },
];

// Registros de la historia. `amendedBy` / `amends` enlazan una enmienda con el original.
// La evolución sigue el formato SOAP (Subjetivo, Objetivo, Evaluación, Plan).
export const mockEntries = [
  {
    id: 'e-101', historyId: 'HC-40111', type: 'background', createdAt: daysFromNow(-420, 9, 15),
    professional: mockProfessionals.gomez,
    data: { backgroundKind: 'genetic', detail: 'Padre con HTA e infarto agudo de miocardio a los 55 años. Madre con diabetes mellitus tipo 2.' },
  },
  {
    id: 'e-102', historyId: 'HC-40111', type: 'background', createdAt: daysFromNow(-420, 9, 18),
    professional: mockProfessionals.gomez,
    data: { backgroundKind: 'pathological', detail: 'Alergia a penicilina (urticaria generalizada, 2015). Sin cirugías ni internaciones previas.' },
  },
  {
    id: 'e-109', historyId: 'HC-40111', type: 'background', createdAt: daysFromNow(-420, 9, 20),
    professional: mockProfessionals.gomez,
    data: { backgroundKind: 'physiological', detail: 'Ex tabaquista (10 paquetes/año, abandonó en 2022). Alcohol ocasional. Sedentario. Calendario de vacunación completo.' },
  },
  {
    id: 'e-106', historyId: 'HC-40111', type: 'nursing', createdAt: daysFromNow(-60, 9, 20),
    professional: mockProfessionals.enfermeria,
    data: { vitals: { bp: '150/95', hr: '82', rr: '16', temp: '36,4', spo2: '98', weight: '84' }, procedures: 'Control de signos vitales y antropometría previo a la consulta. Dos tomas de TA con 5 minutos de diferencia.' },
  },
  {
    id: 'e-103', historyId: 'HC-40111', type: 'evolution', createdAt: daysFromNow(-60, 9, 40),
    professional: mockProfessionals.zelarayan,
    data: {
      reason: 'Control de presión arterial',
      subjective: 'Refiere cefalea occipital matinal ocasional. Niega dolor precordial, disnea y palpitaciones. Registros domiciliarios de TA entre 140/90 y 155/95 mmHg.',
      vitals: { bp: '150/95', hr: '82', spo2: '98', weight: '84' },
      objective: 'Lúcido, orientado en tiempo y espacio. R1 y R2 normofonéticos, sin soplos. Pulsos periféricos presentes y simétricos. Sin edemas en miembros inferiores.',
      assessment: 'Hipertensión arterial esencial, estadio 1, no controlada',
      code: 'I10',
      plan: 'Inicia enalapril 5 mg c/12 h. Dieta hiposódica. Solicito ecocardiograma Doppler y laboratorio (perfil lipídico, función renal, ionograma). Control en 30 días.',
    },
  },
  {
    id: 'e-104', historyId: 'HC-40111', type: 'prescription', createdAt: daysFromNow(-60, 9, 45),
    professional: mockProfessionals.zelarayan,
    data: { drug: 'Enalapril 5 mg', dose: '1 comprimido cada 24 h', route: 'vo', duration: '30 días' },
    amendedBy: 'e-105',
  },
  {
    id: 'e-105', historyId: 'HC-40111', type: 'prescription', createdAt: daysFromNow(-60, 10, 5),
    professional: mockProfessionals.zelarayan,
    data: { drug: 'Enalapril 5 mg', dose: '1 comprimido cada 12 h', route: 'vo', duration: '30 días', notes: 'Control de TA domiciliario dos veces por día.' },
    amends: 'e-104', amendReason: 'Error en la frecuencia de administración consignada.',
  },
  {
    id: 'e-107', historyId: 'HC-40111', type: 'study', createdAt: daysFromNow(-40, 11, 0),
    professional: mockProfessionals.zelarayan,
    data: { category: 'cardio', title: 'Ecocardiograma Doppler color', studyStatus: 'done', result: 'Ventrículo izquierdo de dimensiones normales con hipertrofia concéntrica leve (septum 12 mm). Fracción de eyección conservada (62 %). Disfunción diastólica grado I. Válvulas sin alteraciones.', diagnosis: 'Cardiopatía hipertensiva sin insuficiencia cardíaca', code: 'I11.9' },
  },
  {
    id: 'e-108', historyId: 'HC-40111', type: 'diet', createdAt: daysFromNow(-40, 11, 10),
    professional: mockProfessionals.zelarayan,
    data: { dietType: 'hyposodic', calories: '2000', notes: 'Sal menor a 5 g/día. Evitar embutidos, fiambres y enlatados. Fraccionada en 4 comidas.' },
  },
  {
    id: 'e-110', historyId: 'HC-40111', type: 'evolution', createdAt: daysFromNow(-25, 10, 15),
    professional: mockProfessionals.zelarayan,
    data: {
      reason: 'Control de hipertensión arterial con estudios',
      subjective: 'Buena adherencia al tratamiento. Sin cefalea. Tolera la medicación, niega tos.',
      vitals: { bp: '135/85', hr: '74', spo2: '98', weight: '82' },
      objective: 'Examen cardiovascular sin cambios respecto del control previo.',
      assessment: 'Hipertensión arterial esencial en mejoría. Cardiopatía hipertensiva',
      code: 'I11.9',
      plan: 'Continúa enalapril 5 mg c/12 h. Pendiente laboratorio. Control de TA en 1 mes.',
    },
  },
  {
    id: 'e-201', historyId: 'HC-98212', type: 'evolution', createdAt: daysFromNow(-20, 10, 0),
    professional: mockProfessionals.gomez,
    data: {
      reason: 'Disnea de esfuerzo',
      subjective: 'Disnea ante esfuerzos moderados de 2 semanas de evolución, con tos seca nocturna. Niega fiebre.',
      vitals: { bp: '120/75', hr: '88', rr: '20', temp: '36,6', spo2: '96' },
      objective: 'Murmullo vesicular conservado con sibilancias espiratorias aisladas bilaterales. Sin tiraje.',
      assessment: 'Asma leve intermitente',
      code: 'J45.2',
      plan: 'Salbutamol inhalado 2 puff a demanda. Solicito espirometría con prueba broncodilatadora. Interconsulta con Neumonología.',
    },
  },
  {
    id: 'e-203', historyId: 'HC-98212', type: 'prescription', createdAt: daysFromNow(-20, 10, 5),
    professional: mockProfessionals.gomez,
    data: { drug: 'Salbutamol 100 mcg/dosis', dose: '2 inhalaciones a demanda (máximo 4 veces por día)', route: 'inh', duration: 'A demanda' },
  },
  {
    id: 'e-202', historyId: 'HC-98212', type: 'study', createdAt: daysFromNow(-15, 9, 0),
    professional: mockProfessionals.gomez,
    data: { category: 'resp', title: 'Espirometría con prueba broncodilatadora', studyStatus: 'abandoned', result: 'El paciente no completó las maniobras por accesos de tos. Se reprograma.' },
  },
  {
    id: 'e-301', historyId: 'HC-33421', type: 'consent', createdAt: daysFromNow(-10, 8, 0),
    professional: mockProfessionals.fernandez,
    data: { procedure: 'Hernioplastia inguinal derecha', consentStatus: 'granted', risks: 'Infección del sitio quirúrgico, hematoma, recidiva herniaria, dolor inguinal crónico, lesión del cordón espermático.', alternatives: 'Conducta expectante con faja herniaria. Abordaje laparoscópico.' },
  },
  {
    id: 'e-302', historyId: 'HC-33421', type: 'surgery', createdAt: daysFromNow(-9, 13, 0),
    professional: mockProfessionals.fernandez,
    data: { procedure: 'Hernioplastia inguinal derecha según técnica de Lichtenstein', preopDx: 'Hernia inguinal derecha', postopDx: 'Hernia inguinal indirecta derecha', code: 'K40.9', anesthesia: 'spinal', team: 'Cirujano: Dr. Fernández. Ayudante: Dra. Gómez. Anestesiólogo: Dr. Paz.', technique: 'Incisión inguinal derecha. Saco herniario indirecto que se diseca y reduce. Colocación de malla de polipropileno fijada con sutura continua. Cierre por planos.', complications: 'Sin complicaciones' },
  },
  {
    id: 'e-303', historyId: 'HC-33421', type: 'medication', createdAt: daysFromNow(-9, 15, 30),
    professional: mockProfessionals.enfermeria,
    data: { drug: 'Ketorolac 30 mg', dose: '1 ampolla', route: 'iv', notes: 'Refiere alivio del dolor a los 30 minutos (EVA 6/10 a 2/10).' },
  },
  {
    id: 'e-401', historyId: 'HC-12399', type: 'evolution', createdAt: daysFromNow(-120, 10, 0),
    professional: mockProfessionals.gomez,
    data: {
      reason: 'Control de diabetes',
      subjective: 'Refiere poliuria leve. Cumple parcialmente el plan alimentario.',
      vitals: { bp: '130/80', hr: '76', weight: '91' },
      objective: 'IMC 31. Pies sin lesiones, pulsos pedios presentes, sensibilidad conservada con monofilamento.',
      assessment: 'Diabetes mellitus tipo 2 con control metabólico subóptimo (HbA1c 7,8 %)',
      code: 'E11.9',
      plan: 'Aumenta metformina a 850 mg c/12 h. Plan alimentario para diabéticos. Fondo de ojo anual. Control con HbA1c en 3 meses.',
    },
  },
  {
    id: 'e-402', historyId: 'HC-12399', type: 'dental', createdAt: daysFromNow(-100, 15, 0),
    professional: mockProfessionals.gomez,
    data: { teeth: '36', diagnosis: 'Caries oclusal', treatment: 'Se deriva a Odontología para obturación.' },
  },
];

export const mockFollowups = [
  {
    id: 'f-1', historyId: 'HC-40111', kind: 'control', title: 'Control de presión arterial', dueDate: daysFromNow(-3),
    status: 'pending', createdAt: daysFromNow(-40), createdBy: mockProfessionals.zelarayan.name, history: [],
  },
  {
    id: 'f-2', historyId: 'HC-40111', kind: 'study', title: 'Laboratorio: perfil lipídico y función renal', dueDate: daysFromNow(12),
    status: 'pending', createdAt: daysFromNow(-40), createdBy: mockProfessionals.zelarayan.name, history: [],
  },
  {
    id: 'f-3', historyId: 'HC-40111', kind: 'study', title: 'Ecocardiograma Doppler', dueDate: daysFromNow(-45),
    status: 'done', createdAt: daysFromNow(-60), createdBy: mockProfessionals.zelarayan.name,
    history: [{ status: 'done', at: daysFromNow(-40, 11, 5), by: mockProfessionals.zelarayan.name }],
  },
  {
    id: 'f-4', historyId: 'HC-98212', kind: 'referral', title: 'Interconsulta con Neumonología', dueDate: daysFromNow(7),
    status: 'pending', createdAt: daysFromNow(-20), createdBy: mockProfessionals.gomez.name, history: [],
  },
  {
    id: 'f-5', historyId: 'HC-12399', kind: 'medication', title: 'Renovar receta de metformina', dueDate: daysFromNow(-10),
    status: 'pending', createdAt: daysFromNow(-120), createdBy: mockProfessionals.gomez.name, history: [],
  },
];

export const mockAccessLog = [
  { id: 'a-1', historyId: 'HC-40111', action: 'view', at: daysFromNow(-60, 9, 30), by: mockProfessionals.zelarayan.name, detail: '' },
  { id: 'a-2', historyId: 'HC-40111', action: 'amend', at: daysFromNow(-60, 10, 5), by: mockProfessionals.zelarayan.name, detail: 'Prescripción · Error en la dosis consignada.' },
];
