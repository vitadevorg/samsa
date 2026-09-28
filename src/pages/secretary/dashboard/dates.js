const pad = (n) => String(n).padStart(2, '0');

// Las fechas de la agenda se manejan como strings ISO locales "YYYY-MM-DD".
export const toISODate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const getToday = () => toISODate(new Date());

export const addDays = (days, from = new Date()) => {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return toISODate(d);
};

// Mediodía UTC evita que el huso horario corra la fecha un día.
export const parseISODate = (dateStr) => new Date(`${dateStr}T12:00:00Z`);

export const formatDateToLocale = (dateStr) =>
  parseISODate(dateStr)
    .toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace(',', '');

// Días visibles en la tira de fechas: dos hacia atrás y una semana hacia adelante.
export const buildDateCarousel = () => Array.from({ length: 10 }, (_, i) => addDays(i - 2));

const LATE_TOLERANCE_MINUTES = 15;

export const isLate = (timeStr, now = new Date()) => {
  const [h, m] = timeStr.split(':').map(Number);
  const appointment = new Date(now);
  appointment.setHours(h, m, 0, 0);
  return now.getTime() > appointment.getTime() + LATE_TOLERANCE_MINUTES * 60000;
};

export const daysSince = (dateStr, today = getToday()) =>
  Math.max(0, Math.round((parseISODate(today) - parseISODate(dateStr)) / 86400000));

export const calculateAge = (dob, today = new Date()) => {
  const birth = parseISODate(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age--;
  return age;
};
