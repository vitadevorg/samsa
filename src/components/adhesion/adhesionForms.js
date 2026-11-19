// Solicitud de adhesión de la Home: datos, pasos y validaciones de los dos caminos
// (institución o médico particular). Los campos son los mismos que pide el admin SAMSA
// al asociar una clínica u hospital (VitadevInstitutions) o un médico particular (ParticularDoctorsPanel).
import {
  validateName, validateEmail, validatePhone, validateAddress, validateRequired, validateSchedule,
  validateExpiry, validateInstitutionName, validateLegalName, validateRefes, validateInstitutionCuit,
} from '../../pages/clinic/clinicValidation';
import { dniFromCuil, isValidCuil, cuilDigits } from '../../utils/cuil';

// --- Archivos ---------------------------------------------------------------
// Se envían por mail (base64): cada archivo hasta 1 MB y todos juntos hasta 3 MB,
// así el envío no supera el límite del servidor.
export const MAX_FILE_BYTES = 1024 * 1024;
export const MAX_TOTAL_BYTES = 3 * 1024 * 1024;

const IMAGE_TYPES = ['image/jpeg', 'image/png'];
const DOCUMENT_FILE_TYPES = ['application/pdf', ...IMAGE_TYPES];

// `type` coincide con la documentación que el admin SAMSA marca como recibida (DOCUMENT_TYPES).
// El Contrato no se pide: se firma recién cuando se aprueba la solicitud.
export const DOCTOR_FILES = [
  { key: 'license', type: 'Matrícula', label: 'Matrícula', hint: 'PDF, JPG o PNG', accept: DOCUMENT_FILE_TYPES, required: true, expires: true },
  { key: 'malpractice', type: 'Seguro de mala praxis', label: 'Seguro de mala praxis', hint: 'PDF, JPG o PNG', accept: DOCUMENT_FILE_TYPES, required: true, expires: true },
  { key: 'degree', type: 'Título', label: 'Título', hint: 'PDF, JPG o PNG', accept: DOCUMENT_FILE_TYPES, required: true, expires: false },
  { key: 'profilePic', label: 'Foto de perfil', hint: 'JPG o PNG', accept: IMAGE_TYPES, required: false, image: true },
  { key: 'cv', label: 'Currículum vitae', hint: 'PDF', accept: ['application/pdf'], required: false },
];

export const formatBytes = (bytes) => (bytes >= 1024 * 1024
  ? `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
  : `${Math.max(1, Math.round(bytes / 1024))} KB`);

// Error de un archivo recién elegido (formato o tamaño), o '' si se puede usar.
export const validateFile = (file, spec) => {
  if (!spec.accept.includes(file.type)) return `Formato no admitido: subí un archivo ${spec.hint}.`;
  if (file.size > MAX_FILE_BYTES) return `El archivo pesa ${formatBytes(file.size)}: el máximo es 1 MB.`;
  return '';
};

// --- Comunes ------------------------------------------------------------------
const PERSON_NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const validatePersonPart = (value, label) => {
  const text = value.trim();
  if (!text) return `Ingresá ${label}.`;
  if (!PERSON_NAME_PATTERN.test(text)) return 'Solo letras, espacios, guiones o apóstrofos.';
  if (text.length > 40) return 'No puede superar los 40 caracteres.';
  return '';
};

// CUIL/CUIT de una persona (20, 23, 24 o 27): de ahí se obtiene el DNI.
const validatePersonCuil = (value) => {
  const digits = cuilDigits(value);
  if (!digits) return 'Ingresá tu CUIT/CUIL.';
  if (digits.length !== 11) return 'El CUIT/CUIL tiene que tener 11 dígitos (XX-XXXXXXXX-X).';
  if (!isValidCuil(digits)) return 'CUIT/CUIL inválido: revisá los 11 dígitos.';
  if (!dniFromCuil(digits)) return 'Ingresá tu CUIT/CUIL personal (empieza con 20, 23, 24 o 27).';
  return '';
};

// Matrícula provincial o nacional: letras, números, espacios, puntos, guiones y barras (ej. "MP 12345").
const validateLicense = (value) => {
  const text = value.trim();
  if (!text) return 'Ingresá tu número de matrícula.';
  if (!/\d/.test(text)) return 'La matrícula tiene que incluir el número.';
  if (!/^[A-Za-z0-9 .\-/]+$/.test(text)) return 'Solo letras, números, espacios, puntos, guiones o barras.';
  if (text.length > 20) return 'La matrícula no puede superar los 20 caracteres.';
  return '';
};

export const clean = (text) => text.trim().replace(/\s+/g, ' ');

// Devuelve solo los campos con error: { campo: mensaje }.
const onlyErrors = (found) => Object.fromEntries(Object.entries(found).filter(([, message]) => message));

// --- Médico particular ----------------------------------------------------------
export const EMPTY_DOCTOR = {
  firstName: '', lastName: '', cuit: '', email: '', phone: '',
  specialty: '', licenseNumber: '', address: '',
  days: [], startTime: '08:00', endTime: '12:00', insurances: [],
  files: Object.fromEntries(DOCTOR_FILES.map((spec) => [spec.key, null])),
  expiry: Object.fromEntries(DOCTOR_FILES.filter((spec) => spec.expires).map((spec) => [spec.key, ''])),
  acceptedTerms: false,
};

const totalSize = (files) => Object.values(files).reduce((sum, file) => sum + (file?.size ?? 0), 0);

export const DOCTOR_STEPS = [
  {
    title: 'Datos personales y contacto',
    message: 'Comencemos con tus datos principales.',
    validate: (form) => onlyErrors({
      firstName: validatePersonPart(form.firstName, 'tus nombres'),
      lastName: validatePersonPart(form.lastName, 'tus apellidos'),
      cuit: validatePersonCuil(form.cuit),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone, { required: true }),
    }),
  },
  {
    title: 'Datos profesionales',
    message: '¡Excelente! Ahora contanos sobre tu perfil profesional.',
    validate: (form) => onlyErrors({
      specialty: validateRequired(form.specialty, 'Elegí tu especialidad.'),
      licenseNumber: validateLicense(form.licenseNumber),
      address: validateAddress(form.address),
    }),
  },
  {
    title: 'Atención',
    message: 'Indicá cuándo atendés y qué obras sociales aceptás.',
    validate: (form) => onlyErrors({ schedule: validateSchedule(form) }),
  },
  {
    title: 'Documentación',
    message: 'Estás a un paso. Subí tu documentación.',
    validate: (form, today) => {
      const found = {};
      DOCTOR_FILES.forEach((spec) => {
        if (spec.required && !form.files[spec.key]) found[spec.key] = `Subí ${spec.label === 'Título' ? 'tu título' : `tu ${spec.label.toLowerCase()}`}.`;
        if (spec.expires && form.files[spec.key]) {
          const message = validateExpiry(form.expiry[spec.key], today);
          if (message) found[`${spec.key}Expiry`] = message;
        }
      });
      if (totalSize(form.files) > MAX_TOTAL_BYTES) found.files = `Entre todos los archivos pesan ${formatBytes(totalSize(form.files))}: el máximo es 3 MB.`;
      if (!form.acceptedTerms) found.acceptedTerms = 'Aceptá los Términos y la Política de Privacidad para enviar la solicitud.';
      return found;
    },
  },
];

// --- Institución ------------------------------------------------------------------
export const INSTITUTION_KINDS = {
  clinic: { label: 'Clínica', article: 'la clínica', admin: 'de la clínica' },
  hospital: { label: 'Hospital', article: 'el hospital', admin: 'del hospital' },
};

export const EMPTY_INSTITUTION = {
  kind: 'clinic', name: '', legalName: '', refes: '', cuit: '', arcaVerified: false,
  address: '', phone: '', email: '', insurances: [], studies: [],
  adminName: '', adminEmail: '', adminPhone: '',
  acceptedTerms: false,
};

export const INSTITUTION_STEPS = [
  {
    title: 'Datos de la institución',
    message: 'Comencemos con los datos legales de la institución.',
    validate: (form) => onlyErrors({
      name: validateInstitutionName(form.name),
      legalName: validateLegalName(form.legalName),
      refes: validateRefes(form.refes),
      cuit: validateInstitutionCuit(form.cuit),
      arcaVerified: form.arcaVerified ? '' : 'La institución tiene que estar inscripta en ARCA.',
    }),
  },
  {
    title: 'Contacto y servicios',
    message: '¡Muy bien! Ahora contanos dónde están y qué ofrecen.',
    validate: (form) => onlyErrors({
      address: validateAddress(form.address),
      phone: validatePhone(form.phone, { required: true }),
      email: validateEmail(form.email),
    }),
  },
  {
    title: 'Administrador',
    message: 'Último paso: ¿quién va a administrar la cuenta?',
    validate: (form) => onlyErrors({
      adminName: validateName(form.adminName),
      adminEmail: validateEmail(form.adminEmail),
      adminPhone: validatePhone(form.adminPhone),
      acceptedTerms: form.acceptedTerms ? '' : 'Aceptá los Términos y la Política de Privacidad para enviar la solicitud.',
    }),
  },
];

// --- Envío ------------------------------------------------------------------------
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(String(reader.result).split(',')[1]); // solo la parte base64
  reader.onerror = reject;
});

export const buildDoctorPayload = async (form) => {
  const attachments = [];
  for (const spec of DOCTOR_FILES) {
    const file = form.files[spec.key];
    if (file) {
      attachments.push({
        label: spec.label,
        filename: file.name,
        expiresAt: spec.expires ? form.expiry[spec.key] : null,
        base64: await fileToBase64(file),
      });
    }
  }
  return {
    applicantType: 'doctor',
    firstName: clean(form.firstName),
    lastName: clean(form.lastName),
    cuit: form.cuit,
    dni: dniFromCuil(form.cuit),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.trim(),
    specialty: form.specialty,
    licenseNumber: clean(form.licenseNumber),
    address: clean(form.address),
    days: form.days,
    startTime: form.startTime,
    endTime: form.endTime,
    insurances: form.insurances,
    attachments,
  };
};

export const buildInstitutionPayload = (form) => ({
  applicantType: 'institution',
  institutionKind: form.kind,
  name: clean(form.name),
  legalName: clean(form.legalName),
  refes: form.refes,
  cuit: form.cuit,
  arcaVerified: form.arcaVerified,
  address: clean(form.address),
  phone: form.phone.trim(),
  email: form.email.trim().toLowerCase(),
  // Los hospitales no trabajan con obras sociales (igual que en el alta del admin SAMSA).
  insurances: form.kind === 'hospital' ? [] : form.insurances,
  studies: form.studies,
  admin: {
    name: clean(form.adminName),
    email: form.adminEmail.trim().toLowerCase(),
    phone: form.adminPhone.trim(),
  },
  attachments: [],
});
