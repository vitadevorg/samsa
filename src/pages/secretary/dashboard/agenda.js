import { addDays, getToday, parseISODate } from './dates';
import { buildTimeSlots, getWorkingDayIndexes } from '../../../utils/schedule';

const SUGGESTION_LOOKAHEAD_DAYS = 30;

// Los horarios salen del horario del médico en la clínica:
// `schedule` = { days: ['Lun', ...], startTime: 'HH:MM', endTime: 'HH:MM' }.

// Turnos posibles de un médico: cada 30 minutos dentro de su franja horaria.
export const getScheduleSlots = (schedule) =>
  buildTimeSlots([{ start: schedule.startTime, end: schedule.endTime }]);

// ¿El médico atiende ese día? Sin horario (por ejemplo, el calendario general
// o el de fecha de nacimiento) todos los días son válidos.
export const isWorkingDay = (date, schedule = null) =>
  !schedule || getWorkingDayIndexes(schedule.days).includes(date.getDay());

// Primer día desde hoy (inclusive) en que atiende el médico, como "AAAA-MM-DD".
export const firstWorkingDate = (schedule) => {
  for (let offset = 0; offset < 7; offset++) {
    const date = addDays(offset);
    if (isWorkingDay(parseISODate(date), schedule)) return date;
  }
  return getToday();
};

export const sortAppointments = (list) =>
  [...list].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

export const filterAgenda = (list = [], date, searchTerm) => {
  const term = searchTerm.toLowerCase();
  return list.filter((app) => app.date === date && app.patient.toLowerCase().includes(term));
};

export const isSlotTaken = (list = [], date, time, exceptId = null) =>
  list.some((app) => app.id !== exceptId && app.date === date && app.time === time && app.status !== 'cancelled');

// Próximos horarios libres a partir de mañana, solo en los días y horas en que atiende.
export const findNextFreeSlots = (list, schedule, count = 3, exceptId = null) => {
  const slots = [];
  for (let offset = 1; offset <= SUGGESTION_LOOKAHEAD_DAYS && slots.length < count; offset++) {
    const date = addDays(offset);
    if (!isWorkingDay(parseISODate(date), schedule)) continue;
    for (const time of getScheduleSlots(schedule)) {
      if (!isSlotTaken(list, date, time, exceptId)) slots.push({ date, time });
      if (slots.length === count) break;
    }
  }
  return slots;
};
