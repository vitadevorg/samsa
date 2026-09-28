import { addDays, parseISODate } from './dates';

export const AGENDA_SLOTS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'];
export const MAX_DAILY_APPOINTMENTS = 12;
const SUGGESTION_LOOKAHEAD_DAYS = 30;

// Mock: domingos cerrados y el día 15 de cada mes bloqueado (p. ej. mantenimiento).
export const isDayBlocked = (date) => date.getDay() === 0 || date.getDate() === 15;

export const sortAppointments = (list) =>
  [...list].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

export const filterAgenda = (list = [], date, searchTerm) => {
  const term = searchTerm.toLowerCase();
  return list.filter((app) => app.date === date && app.patient.toLowerCase().includes(term));
};

export const isSlotTaken = (list = [], date, time, exceptId = null) =>
  list.some((app) => app.id !== exceptId && app.date === date && app.time === time && app.status !== 'cancelled');

// Próximos horarios libres a partir de mañana, salteando días bloqueados.
export const findNextFreeSlots = (list, count = 3, exceptId = null) => {
  const slots = [];
  for (let offset = 1; offset <= SUGGESTION_LOOKAHEAD_DAYS && slots.length < count; offset++) {
    const date = addDays(offset);
    if (isDayBlocked(parseISODate(date))) continue;
    for (const time of AGENDA_SLOTS) {
      if (!isSlotTaken(list, date, time, exceptId)) slots.push({ date, time });
      if (slots.length === count) break;
    }
  }
  return slots;
};
