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

export const formatDni = (dni) => (dni ? Number(dni).toLocaleString('es-AR') : '');
