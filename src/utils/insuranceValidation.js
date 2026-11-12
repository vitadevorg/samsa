// Validación de los datos de afiliación a una obra social (solo formato, en frontend).
// La verificación real (que la persona figure en el padrón) la hace la secretaria
// en la consulta, con la credencial y el DNI.

// Valores que significan "sin cobertura": no piden número de afiliado.
const NO_COVERAGE = ['', 'Ninguna', 'particular'];

// Regla genérica para el número de afiliado: solo dígitos, entre 6 y 15.
const GENERIC_RULE = { min: 6, max: 15 };

// Reglas propias por obra social. Se completan cuando se confirme el formato real
// de cada una (ver docs/validacion-obra-social.md). Ej.: { PAMI: { min: 14, max: 14 } }
const AFFILIATE_RULES = {};

export const HOLDER_TYPES = { TITULAR: 'titular', ADHERENTE: 'adherente' };

export const emptyAffiliation = () => ({
  affiliateNumber: '',
  plan: '',
  holderType: HOLDER_TYPES.TITULAR,
  holderName: '',
  holderDni: '',
});

// Toma los datos de afiliación guardados en un usuario (o en cualquier objeto).
export const pickAffiliation = (source) => ({
  ...emptyAffiliation(),
  ...Object.fromEntries(
    Object.keys(emptyAffiliation())
      .filter((key) => source?.[key] != null)
      .map((key) => [key, source[key]])
  ),
});

export const requiresAffiliation = (insurance) => !NO_COVERAGE.includes(insurance ?? '');

export const getAffiliateRule = (insurance) => AFFILIATE_RULES[insurance] ?? GENERIC_RULE;

const describeRule = ({ min, max }) => (min === max ? `${min} dígitos` : `entre ${min} y ${max} dígitos`);

export const isValidDni = (dni) => /^\d{7,8}$/.test(String(dni ?? ''));

/**
 * Devuelve un objeto { campo: mensaje } con los errores encontrados.
 * - requireFilled = false: solo marca formato inválido en campos ya escritos
 *   (para avisar mientras la persona tipea).
 * - requireFilled = true: además marca los obligatorios vacíos (al enviar).
 */
export const validateAffiliation = (
  { insurance, affiliateNumber, holderType, holderName, holderDni, patientDni },
  { requireFilled = true } = {}
) => {
  const errors = {};
  if (!requiresAffiliation(insurance)) return errors;

  const number = String(affiliateNumber ?? '').trim();
  const rule = getAffiliateRule(insurance);
  if (!number) {
    if (requireFilled) errors.affiliateNumber = 'Ingresá tu número de afiliado';
  } else if (!/^\d+$/.test(number) || number.length < rule.min || number.length > rule.max) {
    errors.affiliateNumber = `Número de afiliado inválido: debe tener ${describeRule(rule)}`;
  }

  if (holderType === HOLDER_TYPES.ADHERENTE) {
    if (!String(holderName ?? '').trim()) {
      if (requireFilled) errors.holderName = 'Ingresá el nombre del titular';
    }
    const dni = String(holderDni ?? '').trim();
    if (!dni) {
      if (requireFilled) errors.holderDni = 'Ingresá el DNI del titular';
    } else if (!isValidDni(dni)) {
      errors.holderDni = 'DNI del titular inválido: debe tener 7 u 8 dígitos';
    } else if (patientDni && dni === String(patientDni).trim()) {
      errors.holderDni = 'El DNI del titular no puede ser el tuyo. Si sos el titular, elegí "Soy el titular"';
    }
  }

  return errors;
};
