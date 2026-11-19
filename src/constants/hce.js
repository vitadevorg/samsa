// Catálogos de la Historia Clínica Electrónica (HCE) del panel médico.
// Siguen la Ley 26.529 de Derechos del Paciente y su decreto reglamentario (datos obligatorios,
// documentos que la integran y plazos de conservación) y la estructura clínica habitual:
// evolución en formato SOAP, antecedentes heredofamiliares / personales y registros por sección.

// Secciones de la historia: agrupan los registros como los lee el profesional.
export const RECORD_SECTIONS = Object.freeze([
  { value: 'all', label: 'Todos' },
  { value: 'evolucion', label: 'Evoluciones' },
  { value: 'terapeutica', label: 'Indicaciones y medicación' },
  { value: 'enfermeria', label: 'Enfermería' },
  { value: 'estudios', label: 'Estudios complementarios' },
  { value: 'procedimientos', label: 'Procedimientos y consentimientos' },
  { value: 'antecedentes', label: 'Antecedentes' },
]);

// Signos vitales (campo `vitals`). `pattern` / `min` / `max` validan valores plausibles.
export const VITAL_SIGNS = Object.freeze([
  { key: 'bp', short: 'TA', label: 'Tensión arterial', unit: 'mmHg', placeholder: '120/80', pattern: /^\d{2,3}\/\d{2,3}$/ },
  { key: 'hr', short: 'FC', label: 'Frecuencia cardíaca', unit: 'lpm', placeholder: '72', min: 20, max: 250 },
  { key: 'rr', short: 'FR', label: 'Frecuencia respiratoria', unit: 'rpm', placeholder: '16', min: 5, max: 60 },
  { key: 'temp', short: 'T', label: 'Temperatura axilar', unit: '°C', placeholder: '36,5', min: 30, max: 43 },
  { key: 'spo2', short: 'SatO₂', label: 'Saturación de O₂', unit: '%', placeholder: '98', min: 50, max: 100 },
  { key: 'weight', short: 'Peso', label: 'Peso', unit: 'kg', placeholder: '70', min: 0.5, max: 350 },
]);

// Tipos de registro. Cada uno es un "agregado" a la historia: lleva fecha y hora, profesional
// (nombre, matrícula y especialidad) y firma.
// - `fields`: arma el formulario y el orden de lectura. `soap` marca la letra de la evolución.
// - `headline`: campo que se usa como título corto del registro.
// - `codedField`: campo de diagnóstico que admite código CIE-10 opcional (interoperabilidad).
export const ENTRY_TYPES = Object.freeze({
  evolution: {
    label: 'Evolución médica',
    section: 'evolucion',
    tone: 'blue',
    headline: 'reason',
    codedField: 'assessment',
    fields: [
      { name: 'reason', label: 'Motivo de consulta', kind: 'text', required: true, placeholder: 'Ej: Control de hipertensión arterial' },
      { name: 'subjective', soap: 'S', label: 'Subjetivo', hint: 'Anamnesis y enfermedad actual', kind: 'textarea', placeholder: 'Síntomas referidos, evolución desde el último control, adherencia al tratamiento.' },
      { name: 'vitals', label: 'Signos vitales', kind: 'vitals' },
      { name: 'objective', soap: 'O', label: 'Objetivo', hint: 'Examen físico', kind: 'textarea', placeholder: 'Ej: Lúcido, orientado. R1 y R2 normofonéticos, sin soplos. Murmullo vesicular conservado.' },
      { name: 'assessment', soap: 'A', label: 'Evaluación', hint: 'Impresión diagnóstica', kind: 'text', placeholder: 'Ej: Hipertensión arterial esencial no controlada' },
      { name: 'plan', soap: 'P', label: 'Plan', hint: 'Conducta terapéutica, estudios y control', kind: 'textarea', required: true, placeholder: 'Ej: Se ajusta enalapril a 10 mg c/12 h. Se solicita laboratorio. Control en 30 días.' },
    ],
  },
  dental: {
    label: 'Registro odontológico',
    section: 'evolucion',
    tone: 'slate',
    headline: 'teeth',
    fields: [
      { name: 'teeth', label: 'Piezas dentarias (notación FDI)', kind: 'text', required: true, placeholder: 'Ej: 36, 37' },
      { name: 'diagnosis', label: 'Diagnóstico', kind: 'text', placeholder: 'Ej: Caries oclusal' },
      { name: 'treatment', label: 'Tratamiento realizado', kind: 'textarea', required: true },
    ],
  },
  prescription: {
    label: 'Prescripción médica',
    section: 'terapeutica',
    tone: 'indigo',
    headline: 'drug',
    fields: [
      { name: 'drug', label: 'Fármaco (nombre genérico) y concentración', kind: 'text', required: true, placeholder: 'Ej: Enalapril 10 mg' },
      { name: 'dose', label: 'Posología', kind: 'text', required: true, placeholder: 'Ej: 1 comprimido cada 12 h' },
      { name: 'route', label: 'Vía de administración', kind: 'select', required: true, options: 'ROUTES' },
      { name: 'duration', label: 'Duración del tratamiento', kind: 'text', placeholder: 'Ej: 30 días / crónico' },
      { name: 'notes', label: 'Observaciones', kind: 'textarea' },
    ],
  },
  medication: {
    label: 'Administración de medicación',
    section: 'terapeutica',
    tone: 'indigo',
    headline: 'drug',
    fields: [
      { name: 'drug', label: 'Fármaco y concentración', kind: 'text', required: true, placeholder: 'Ej: Diclofenac 75 mg' },
      { name: 'dose', label: 'Dosis administrada', kind: 'text', required: true, placeholder: 'Ej: 1 ampolla, dosis única' },
      { name: 'route', label: 'Vía de administración', kind: 'select', required: true, options: 'ROUTES' },
      { name: 'notes', label: 'Respuesta y observaciones', kind: 'textarea' },
    ],
  },
  indication: {
    label: 'Indicaciones médicas',
    section: 'terapeutica',
    tone: 'blue',
    headline: 'orders',
    fields: [
      { name: 'orders', label: 'Indicaciones', kind: 'textarea', required: true, placeholder: 'Reposo, cuidados, controles y medidas higiénico-dietéticas.' },
      { name: 'warnings', label: 'Pautas de alarma', kind: 'textarea', placeholder: 'Ej: Consultar por guardia ante dolor precordial, disnea o cefalea intensa.' },
    ],
  },
  diet: {
    label: 'Prescripción dietoterápica',
    section: 'terapeutica',
    tone: 'emerald',
    headline: 'dietType',
    fields: [
      { name: 'dietType', label: 'Tipo de dieta', kind: 'select', required: true, options: 'DIET_TYPES' },
      { name: 'calories', label: 'Valor calórico total (kcal/día)', kind: 'text', placeholder: 'Ej: 1800' },
      { name: 'notes', label: 'Indicaciones', kind: 'textarea', placeholder: 'Ej: Fraccionada en 4 comidas y 2 colaciones. Sal menor a 5 g/día.' },
    ],
  },
  nursing: {
    label: 'Registro de enfermería',
    section: 'enfermeria',
    tone: 'emerald',
    headline: 'procedures',
    fields: [
      { name: 'vitals', label: 'Control de signos vitales', kind: 'vitals' },
      { name: 'procedures', label: 'Procedimientos realizados', kind: 'textarea', required: true, placeholder: 'Ej: Control de signos vitales y antropometría previo a la consulta.' },
      { name: 'notes', label: 'Observaciones', kind: 'textarea' },
    ],
  },
  study: {
    label: 'Estudio complementario',
    section: 'estudios',
    tone: 'cyan',
    headline: 'title',
    codedField: 'diagnosis',
    fields: [
      { name: 'category', label: 'Categoría', kind: 'select', required: true, options: 'STUDY_CATEGORIES' },
      { name: 'title', label: 'Estudio o práctica', kind: 'text', required: true, placeholder: 'Ej: Ecocardiograma Doppler color' },
      { name: 'studyStatus', label: 'Estado', kind: 'select', required: true, options: 'STUDY_STATUS' },
      { name: 'result', label: 'Informe / resultado', kind: 'textarea', required: true, placeholder: 'Hallazgos, o motivo del rechazo o abandono.' },
      { name: 'diagnosis', label: 'Conclusión diagnóstica', kind: 'text' },
    ],
  },
  consent: {
    label: 'Consentimiento informado',
    section: 'procedimientos',
    tone: 'amber',
    headline: 'procedure',
    fields: [
      { name: 'procedure', label: 'Procedimiento propuesto', kind: 'text', required: true, placeholder: 'Ej: Videoendoscopía digestiva alta' },
      { name: 'consentStatus', label: 'Decisión del paciente', kind: 'select', required: true, options: 'CONSENT_STATUS' },
      { name: 'risks', label: 'Riesgos y complicaciones informados', kind: 'textarea', required: true },
      { name: 'alternatives', label: 'Alternativas terapéuticas informadas', kind: 'textarea' },
    ],
  },
  surgery: {
    label: 'Protocolo quirúrgico',
    section: 'procedimientos',
    tone: 'rose',
    headline: 'procedure',
    codedField: 'postopDx',
    fields: [
      { name: 'procedure', label: 'Procedimiento realizado', kind: 'text', required: true, placeholder: 'Ej: Colecistectomía laparoscópica' },
      { name: 'preopDx', label: 'Diagnóstico preoperatorio', kind: 'text' },
      { name: 'postopDx', label: 'Diagnóstico posoperatorio', kind: 'text' },
      { name: 'anesthesia', label: 'Tipo de anestesia', kind: 'select', required: true, options: 'ANESTHESIA' },
      { name: 'team', label: 'Equipo quirúrgico', kind: 'text', placeholder: 'Cirujano, ayudantes, anestesiólogo, instrumentadora' },
      { name: 'technique', label: 'Descripción de la técnica y hallazgos', kind: 'textarea', required: true },
      { name: 'complications', label: 'Complicaciones intraoperatorias', kind: 'text', placeholder: 'Ej: Sin complicaciones' },
    ],
  },
  background: {
    label: 'Antecedente',
    section: 'antecedentes',
    tone: 'purple',
    headline: 'detail',
    fields: [
      { name: 'backgroundKind', label: 'Tipo de antecedente', kind: 'select', required: true, options: 'BACKGROUND_KINDS' },
      { name: 'detail', label: 'Descripción', kind: 'textarea', required: true, placeholder: 'Ej: Padre con IAM a los 55 años.' },
    ],
  },
});

// Opciones de los campos `select` (se referencian por nombre desde ENTRY_TYPES).
export const SELECT_OPTIONS = Object.freeze({
  ROUTES: [
    { value: 'vo', label: 'Oral (VO)' },
    { value: 'sl', label: 'Sublingual (SL)' },
    { value: 'im', label: 'Intramuscular (IM)' },
    { value: 'iv', label: 'Endovenosa (EV)' },
    { value: 'sc', label: 'Subcutánea (SC)' },
    { value: 'inh', label: 'Inhalatoria' },
    { value: 'top', label: 'Tópica' },
    { value: 'oft', label: 'Oftálmica' },
    { value: 'rec', label: 'Rectal' },
  ],
  DIET_TYPES: [
    { value: 'general', label: 'General' },
    { value: 'hyposodic', label: 'Hiposódica' },
    { value: 'lowfat', label: 'Hipograsa' },
    { value: 'diabetic', label: 'Para diabéticos (hidratos de carbono controlados)' },
    { value: 'hypocaloric', label: 'Hipocalórica' },
    { value: 'hyperprotein', label: 'Hiperproteica' },
    { value: 'soft', label: 'Blanda gástrica' },
    { value: 'liquid', label: 'Líquida' },
  ],
  STUDY_CATEGORIES: [
    { value: 'lab', label: 'Laboratorio' },
    { value: 'imaging', label: 'Diagnóstico por imágenes' },
    { value: 'cardio', label: 'Estudios cardiológicos' },
    { value: 'resp', label: 'Función respiratoria' },
    { value: 'endo', label: 'Endoscopía' },
    { value: 'path', label: 'Anatomía patológica' },
    { value: 'other', label: 'Otro' },
  ],
  STUDY_STATUS: [
    { value: 'done', label: 'Realizado' },
    { value: 'rejected', label: 'Rechazado por el paciente' },
    { value: 'abandoned', label: 'Abandonado' },
  ],
  CONSENT_STATUS: [
    { value: 'granted', label: 'Otorgado' },
    { value: 'revoked', label: 'Revocado' },
    { value: 'refused', label: 'Rechazado' },
  ],
  ANESTHESIA: [
    { value: 'general', label: 'General' },
    { value: 'spinal', label: 'Raquídea' },
    { value: 'epidural', label: 'Peridural' },
    { value: 'regional', label: 'Bloqueo regional' },
    { value: 'local', label: 'Local' },
    { value: 'sedation', label: 'Sedación' },
  ],
  BACKGROUND_KINDS: [
    { value: 'genetic', label: 'Heredofamiliares', hint: 'genéticos, enfermedades en familiares directos' },
    { value: 'physiological', label: 'Personales fisiológicos', hint: 'hábitos, inmunizaciones, gineco-obstétricos' },
    { value: 'pathological', label: 'Personales patológicos', hint: 'enfermedades, cirugías, internaciones, alergias' },
  ],
});

export const optionLabel = (listName, value) =>
  SELECT_OPTIONS[listName]?.find((o) => o.value === value)?.label ?? value;

// Clases de color por tono (completas para que Tailwind las detecte).
export const TONE_BADGE = Object.freeze({
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  rose: 'bg-rose-50 text-rose-700 border-rose-100',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-100',
});

// Seguimiento: tareas del plan de control del paciente.
export const FOLLOWUP_KINDS = Object.freeze([
  { value: 'control', label: 'Control clínico' },
  { value: 'study', label: 'Estudio pendiente' },
  { value: 'referral', label: 'Interconsulta' },
  { value: 'medication', label: 'Medicación' },
]);

export const FOLLOWUP_STATUS = Object.freeze({
  pending: { label: 'Pendiente', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  done: { label: 'Realizada', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  overdue: { label: 'Vencida', badge: 'bg-red-50 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelada', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
});

// Plazos legales.
export const RETENTION_YEARS = 10; // conservación mínima desde la última actuación
export const COPY_DEADLINE_HOURS = 48; // entrega de copia autenticada al paciente

// Acciones que quedan en la trazabilidad de la historia.
export const ACCESS_ACTIONS = Object.freeze({
  view: 'Consultó la historia',
  create: 'Agregó un registro',
  amend: 'Enmendó un registro',
  followup_create: 'Creó una tarea de seguimiento',
  followup_status: 'Cambió el estado de una tarea',
  copy_request: 'Registró un pedido de copia',
  copy_delivered: 'Entregó la copia autenticada',
});
