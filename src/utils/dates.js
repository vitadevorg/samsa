// Fecha y hora completas en formato argentino (ej. 18/11/2026, 11:19).
export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// Tiempo transcurrido en texto corto: "Ahora", "Hace 5 min", "Hace 3 h", "Hace 2 d" o la fecha si pasó un mes.
export const timeAgo = (iso) => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Hace ${days} d`;
  return new Date(iso).toLocaleDateString('es-AR');
};

// Formatos de la historia clínica: siempre dd/mm/aaaa y hora de Argentina.
const AR_TZ = 'America/Argentina/Buenos_Aires';

export const formatDateAR = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: AR_TZ }) : '-';

export const formatDateTimeAR = (iso) =>
  iso
    ? `${formatDateAR(iso)} ${new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: AR_TZ })}`
    : '-';

// Valor para <input type="date"> (aaaa-mm-dd) desplazado `days` días desde hoy.
export const dateInputValue = (days = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-CA', { timeZone: AR_TZ });
};
