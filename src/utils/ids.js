export const createId = () => crypto.randomUUID();

// Código corto y legible para comprobantes (10 caracteres alfanuméricos).
export const generateTransactionId = () =>
  crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase();

// Hash simple y determinístico: el mismo texto siempre da el mismo número.
// Útil para datos mock que deben verse iguales en cada render (no es criptográfico).
// El mezclado final (avalanche) hace que textos parecidos den resultados muy distintos.
const mix = (h) => {
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
};

export const stableHash = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (Math.imul(hash, 31) + text.charCodeAt(i)) | 0;
  }
  return mix(hash);
};

// Código alfanumérico estable derivado de un texto (p. ej. el id de un estudio).
export const stableCode = (text, length = 10) => {
  const h = stableHash(text);
  const code = mix(h).toString(36) + mix(h ^ 0x9e3779b9).toString(36);
  return code.toUpperCase().padEnd(length, '0').slice(0, length);
};
