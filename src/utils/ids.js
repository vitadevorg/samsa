export const createId = () => crypto.randomUUID();

// Código corto y legible para comprobantes (10 caracteres alfanuméricos).
export const generateTransactionId = () =>
  crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase();
