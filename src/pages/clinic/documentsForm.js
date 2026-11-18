import { DOCUMENT_TYPES, NON_EXPIRING_DOCUMENTS } from '../../data/institutions';
import { validateExpiry } from './clinicValidation';

// Documentación que se carga al dar de alta a un médico: por documento, si se recibió y hasta cuándo vale.
// La usan VitaDev (médicos particulares) y las clínicas y hospitales (sus médicos nuevos).
export const EMPTY_DOCS = Object.fromEntries(DOCUMENT_TYPES.map((type) => [type, { received: false, expiresAt: '' }]));
export const needsExpiry = (type) => !NON_EXPIRING_DOCUMENTS.includes(type);

// Lista `documents` lista para guardar a partir de lo marcado en el alta.
export const toDocuments = (docs) => DOCUMENT_TYPES.map((type) => (docs[type].received
  ? { type, status: 'vigente', expiresAt: needsExpiry(type) ? docs[type].expiresAt : null }
  : { type, status: 'pendiente', expiresAt: null }));

// La documentación es obligatoria para crear la cuenta: los cuatro documentos recibidos y los que vencen,
// con una fecha válida. Devuelve solo los documentos con error: { tipo: mensaje }.
// `purpose` completa el mensaje: "para crear la cuenta" (alta) o "para vincularlo" (médico existente).
export const validateDocs = (docs, today, purpose = 'para crear la cuenta') => Object.fromEntries(DOCUMENT_TYPES
  .map((type) => [type, !docs[type].received
    ? `Marcalo como recibido: es obligatorio ${purpose}.`
    : needsExpiry(type) ? validateExpiry(docs[type].expiresAt, today) : ''])
  .filter(([, message]) => message));

