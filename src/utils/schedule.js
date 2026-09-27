const DAY_INDEX = { Dom: 0, Lun: 1, Mar: 2, Mié: 3, Jue: 4, Vie: 5, Sáb: 6 };
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5];
const DEFAULT_SLOTS = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "16:00", "16:30", "17:00"];
const SLOT_MINUTES = 30;

export const startOfDay = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const startOfMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const addMonths = (date, offset) =>
  new Date(date.getFullYear(), date.getMonth() + offset, 1);

// Índices de día (0 = domingo) en los que atiende el profesional.
export const getWorkingDayIndexes = (dayNames) =>
  dayNames ? dayNames.map((name) => DAY_INDEX[name]) : DEFAULT_WORKING_DAYS;

// Hash simple y estable para simular ocupación sin Math.random():
// el mismo profesional/día/horario siempre da el mismo resultado.
const stableHash = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

/**
 * Celdas del calendario de un mes: huecos iniciales + un objeto por día
 * con estado 'available' | 'full' | 'closed'.
 */
export const buildCalendarMonth = (monthDate, workingDays, today = startOfDay()) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const cells = [];
  for (let i = 0; i < firstDayIndex; i++) cells.push({ type: 'empty', key: `empty-${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dayOfWeek = date.getDay();
    const isPast = date < today;
    const worksThisDay = workingDays.includes(dayOfWeek);
    // Mock: algunos días hábiles aparecen completos.
    const isFull = worksThisDay && !isPast && (d * (dayOfWeek + 1)) % 7 === 0;
    let status = 'available';
    if (isPast || !worksThisDay) status = 'closed';
    else if (isFull) status = 'full';
    cells.push({ type: 'day', key: `day-${d}`, day: d, date, status, gridStart: dayOfWeek === 0 ? 1 : dayOfWeek + 1 });
  }
  return cells;
};

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const toHHMM = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

// Horarios de inicio cada 30 minutos dentro de las franjas de atención.
export const buildTimeSlots = (hours) => {
  if (!hours) return DEFAULT_SLOTS;
  return hours.flatMap(({ start, end }) => {
    const slots = [];
    for (let t = toMinutes(start); t < toMinutes(end); t += SLOT_MINUTES) slots.push(toHHMM(t));
    return slots;
  });
};

// Mock de disponibilidad: ~30% de los turnos aparecen ocupados, de forma estable.
export const getSlotAvailability = (doctorId, date, times) => {
  const dayKey = `${doctorId ?? 'generic'}|${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  return times.map((time) => ({
    time,
    status: stableHash(`${dayKey}|${time}`) % 10 >= 7 ? 'busy' : 'available',
  }));
};
