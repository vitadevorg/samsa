// Reglas de las publicaciones del foro escritas por médicos.

// Categorías tomadas de la bajada del foro: novedades de la institución,
// avances médicos y consejos de salud preventiva.
export const FORUM_CATEGORIES = ['Salud Preventiva', 'Consejos de salud', 'Avances médicos', 'Novedades institucionales'];

export const TITLE_MIN = 10;
export const TITLE_MAX = 120;
export const BODY_MIN = 50;
export const BODY_MAX = 5000;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export const EMPTY_POST = { title: '', category: '', body: '', image: null };

// Devuelve { campo: mensaje } solo con los campos que tienen error.
export const validatePost = ({ title, category, body }) => {
  const errors = {};
  const cleanTitle = title.trim();
  const cleanBody = body.trim();
  if (!cleanTitle) errors.title = 'Ingresá un título.';
  else if (cleanTitle.length < TITLE_MIN) errors.title = `El título tiene que tener al menos ${TITLE_MIN} caracteres.`;
  else if (cleanTitle.length > TITLE_MAX) errors.title = `El título no puede superar los ${TITLE_MAX} caracteres.`;
  if (!FORUM_CATEGORIES.includes(category)) errors.category = 'Elegí una categoría.';
  if (!cleanBody) errors.body = 'Escribí el contenido de la nota.';
  else if (cleanBody.length < BODY_MIN) errors.body = `El contenido tiene que tener al menos ${BODY_MIN} caracteres.`;
  else if (cleanBody.length > BODY_MAX) errors.body = `El contenido no puede superar los ${BODY_MAX} caracteres.`;
  return errors;
};

// "2026-11-15T..." -> "15 de noviembre de 2026"
export const formatPostDate = (iso) =>
  new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

// Motivo que escribe VitaDev al borrar la nota de otro autor (lo ve el autor).
export const REASON_MIN = 10;
export const REASON_MAX = 300;

export const validateReason = (reason) => {
  const clean = reason.trim();
  if (!clean) return 'Escribí el motivo: el autor lo va a ver.';
  if (clean.length < REASON_MIN) return `El motivo tiene que tener al menos ${REASON_MIN} caracteres.`;
  if (clean.length > REASON_MAX) return `El motivo no puede superar los ${REASON_MAX} caracteres.`;
  return '';
};
