// Forma canónica de un email para compararlo (sin espacios y en minúsculas).
// Sirve para saber quién es el destinatario de una notificación, el autor de un ticket o de una nota.
export const normalizeEmail = (email) => (email ?? '').trim().toLowerCase();
