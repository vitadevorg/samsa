// CUIL/CUIT argentino: XX-XXXXXXXX-X (tipo, documento, dígito verificador).
// Para personas humanas (tipos 20, 23, 24, 27) los 8 dígitos del medio son el DNI.

const CHECK_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
const PERSON_TYPES = ['20', '23', '24', '27'];
const COMPANY_TYPES = ['30', '33', '34'];

export const cuilDigits = (value) => value.replace(/\D/g, '').slice(0, 11);

// Formatea mientras se escribe: "20123456786" -> "20-12345678-6".
export const formatCuil = (value) => {
  const d = cuilDigits(value);
  if (d.length <= 2) return d;
  if (d.length <= 10) return `${d.slice(0, 2)}-${d.slice(2)}`;
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`;
};

// Valida largo, tipo y dígito verificador (módulo 11).
export const isValidCuil = (value) => {
  const d = cuilDigits(value);
  if (d.length !== 11) return false;
  const type = d.slice(0, 2);
  if (!PERSON_TYPES.includes(type) && !COMPANY_TYPES.includes(type)) return false;
  const sum = CHECK_WEIGHTS.reduce((acc, weight, i) => acc + weight * Number(d[i]), 0);
  const remainder = 11 - (sum % 11);
  const expected = remainder === 11 ? 0 : remainder;
  return expected !== 10 && expected === Number(d[10]);
};

// DNI a partir de un CUIL válido de persona humana; null si no aplica (p. ej. CUIT de empresa).
export const dniFromCuil = (value) => {
  if (!isValidCuil(value)) return null;
  const d = cuilDigits(value);
  if (!PERSON_TYPES.includes(d.slice(0, 2))) return null;
  return String(Number(d.slice(2, 10)));
};

// ¿Los 8 dígitos del medio del CUIL coinciden con el DNI? Un DNI de 7 dígitos se
// compara con un 0 adelante (DNI 1234567 -> XX-01234567-X).
export const cuilMatchesDni = (cuil, dni) => {
  const d = cuilDigits(cuil ?? '');
  const doc = String(dni ?? '').replace(/\D/g, '');
  if (d.length !== 11 || !doc || doc.length > 8) return false;
  return d.slice(2, 10) === doc.padStart(8, '0');
};

/**
 * Valida un CUIL/CUIT opcional contra el DNI de la persona. Devuelve el mensaje de error o null.
 * - Vacío: válido (el campo es opcional).
 * - `requireComplete = false`: mientras se escribe solo avisa cuando ya tiene los 11 dígitos.
 * - `requireComplete = true`: al enviar, además marca el CUIL incompleto.
 */
export const validateOptionalCuil = (cuil, dni, { requireComplete = true } = {}) => {
  const d = cuilDigits(cuil ?? '');
  if (!d) return null;
  if (d.length < 11) return requireComplete ? 'El CUIT/CUIL debe tener 11 dígitos (XX-XXXXXXXX-X)' : null;
  const doc = String(dni ?? '').replace(/\D/g, '');
  if (doc && !cuilMatchesDni(d, doc)) {
    return 'Los datos del CUIT/CUIL no coinciden con el DNI';
  }
  if (!isValidCuil(d)) return 'CUIT/CUIL inválido: revisá el tipo (primeros 2 dígitos) y el último dígito';
  return null;
};

export const formatDni = (dni) => (dni ? Number(dni).toLocaleString('es-AR') : '');
