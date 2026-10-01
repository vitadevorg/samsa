// Reglas de validación de los formularios de administración (clínica u hospital).
// Cada función devuelve el mensaje de error para mostrar debajo del campo,
// o '' (texto vacío) si el valor es válido.

// Letras (con tildes y ñ), espacios, guiones y apóstrofos: "María José O'Neill-Paz".
const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const NAME_MAX_LENGTH = 60;

export const validateName = (value) => {
  const name = value.trim();
  if (!name) return 'Ingresá el nombre completo.';
  if (!NAME_PATTERN.test(name)) return 'El nombre solo puede tener letras, espacios, guiones o apóstrofos.';
  if (name.split(/\s+/).length < 2) return 'Ingresá nombre y apellido.';
  if (name.length > NAME_MAX_LENGTH) return `El nombre no puede superar los ${NAME_MAX_LENGTH} caracteres.`;
  return '';
};

// Algo@algo.dominio, sin espacios.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// `takenEmails`: emails que ya usa otra persona (en minúsculas).
export const validateEmail = (value, takenEmails = []) => {
  const email = value.trim().toLowerCase();
  if (!email) return 'Ingresá el email.';
  if (!EMAIL_PATTERN.test(email)) return 'Ingresá un email válido, por ejemplo nombre@samsa.med.';
  if (takenEmails.includes(email)) return 'Ya hay otra persona registrada con ese email.';
  return '';
};

// Teléfono argentino: 10 dígitos contando el código de área (ej. 381 400-1001).
// Se aceptan espacios, guiones, paréntesis, el prefijo +54 9 y un 0 adelante,
// así que "(0381) 400-1001" y "+54 9 381 400-1001" también son válidos.
export const phoneDigits = (value) => {
  let digits = value.replace(/\D/g, '');            // solo los números
  if (digits.startsWith('54')) digits = digits.slice(2);                     // código de país
  if (digits.length === 11 && digits.startsWith('9')) digits = digits.slice(1); // 9 de celulares
  if (digits.startsWith('0')) digits = digits.slice(1);                      // 0 de larga distancia
  return digits;
};

export const validatePhone = (value, { required = false } = {}) => {
  if (!value.trim()) return required ? 'Ingresá el teléfono.' : '';
  if (/[^\d\s()+-]/.test(value)) return 'El teléfono solo puede tener números, espacios, guiones, paréntesis y +.';
  if (phoneDigits(value).length !== 10) {
    return 'Ingresá un teléfono con código de área (10 dígitos), por ejemplo 381 400-1001.';
  }
  return '';
};

const OFFICE_MAX_LENGTH = 40;

export const validateOffice = (value) => {
  const office = value.trim();
  if (!office) return 'Indicá el consultorio.';
  // Tiene que tener al menos una letra o un número ("!!!" o "---" no son un consultorio).
  if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/.test(office)) return 'El consultorio tiene que tener letras o números, por ejemplo "Consultorio 3".';
  if (office.length > OFFICE_MAX_LENGTH) return `El consultorio no puede superar los ${OFFICE_MAX_LENGTH} caracteres.`;
  return '';
};

// Mismo consultorio escrito distinto ("consultorio  3" y "Consultorio 3") cuenta como el mismo.
const normalizeOffice = (office) => office.trim().replace(/\s+/g, ' ').toLowerCase();

// Busca otro médico de la MISMA institución que use el mismo consultorio en un
// horario que se cruza. Devuelve esa vinculación, o undefined si está libre.
// `overlaps` es la función schedulesOverlap de institutions.js.
export const findOfficeConflict = ({ doctorId, institutionId, office, schedule }, assignments, overlaps) =>
  assignments.find(
    (a) =>
      a.institutionId === institutionId &&
      a.doctorId !== doctorId &&
      normalizeOffice(a.office) === normalizeOffice(office) &&
      overlaps(a, schedule)
  );

// Duración mínima de un horario de atención: lo que dura un turno (30 minutos).
export const MIN_SCHEDULE_MINUTES = 30;

// "08:30" -> 510 (minutos desde la medianoche).
const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Días y franja horaria: al menos un día, las dos horas y que alcance para un turno.
export const validateSchedule = ({ days, startTime, endTime }) => {
  if (days.length === 0) return 'Elegí al menos un día de atención.';
  if (!startTime || !endTime) return 'Indicá la hora de inicio y la de fin.';
  if (startTime >= endTime) return 'La hora de fin tiene que ser posterior a la de inicio.';
  if (toMinutes(endTime) - toMinutes(startTime) < MIN_SCHEDULE_MINUTES) {
    return `El horario tiene que durar al menos ${MIN_SCHEDULE_MINUTES} minutos (lo que dura un turno).`;
  }
  return '';
};

// Fecha de vencimiento de un documento: posterior a hoy y como mucho a 10 años.
export const MAX_EXPIRY_YEARS = 10;

// Fecha "AAAA-MM-DD" que cae `years` años después de `isoDate`.
export const addYearsISO = (isoDate, years) => {
  const year = Number(isoDate.slice(0, 4)); // "2026-09-29" -> 2026
  return `${year + years}${isoDate.slice(4)}`; // se le suma al año y se deja "-09-29"
};

export const validateExpiry = (value, today) => {
  if (!value) return 'Indicá la fecha de vencimiento.';
  if (value <= today) return 'La fecha de vencimiento tiene que ser posterior a hoy.';
  if (value > addYearsISO(today, MAX_EXPIRY_YEARS)) {
    return `La fecha de vencimiento no puede ser a más de ${MAX_EXPIRY_YEARS} años. Revisá el año.`;
  }
  return '';
};

// Campo obligatorio genérico (por ejemplo, un desplegable sin elegir).
export const validateRequired = (value, message) => (String(value ?? '').trim() ? '' : message);

// Clases de un campo: borde rojo si tiene error (se suman a las clases normales).
export const errorBorder = (hasError) => (hasError ? 'border-red-400 bg-red-50 focus:ring-red-400' : '');
