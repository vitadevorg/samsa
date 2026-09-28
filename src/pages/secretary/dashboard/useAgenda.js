import { useReducer } from 'react';
import { buildInitialAppointments } from './mockData';
import { sortAppointments } from './agenda';
import { getToday } from './dates';

// Estado de dominio de la agenda: turnos por profesional y bolsa de suspenso.
// Un reducer centraliza todas las transiciones y deja a los componentes solo
// con estado de interfaz (qué modal está abierto, filtros, etc.).
const agendaReducer = (state, action) => {
  const { doctorId } = action;
  const list = state.appointments[doctorId] || [];
  const withList = (newList) => ({
    ...state,
    appointments: { ...state.appointments, [doctorId]: sortAppointments(newList) },
  });

  switch (action.type) {
    case 'create': {
      const next = withList([...list, action.appointment]);
      if (!action.fromSuspendedId) return next;
      return { ...next, suspended: next.suspended.filter((p) => p.id !== action.fromSuspendedId) };
    }
    case 'arrive':
      return withList(list.map((app) => (app.id === action.id ? { ...app, status: 'waiting' } : app)));
    case 'move':
      return withList(list.map((app) => (app.id === action.id ? { ...app, date: action.date, time: action.time } : app)));
    case 'cancel':
    case 'suspend': {
      const appointment = list.find((app) => app.id === action.id);
      if (!appointment) return state;
      const next = withList(list.filter((app) => app.id !== action.id));
      const toSuspended = action.type === 'suspend' || action.toSuspended;
      if (!toSuspended) return next;
      return { ...next, suspended: [...next.suspended, { ...appointment, doctorId, suspendDate: getToday() }] };
    }
    case 'removeSuspended':
      return { ...state, suspended: state.suspended.filter((p) => p.id !== action.id) };
    default:
      throw new Error(`Acción de agenda desconocida: ${action.type}`);
  }
};

// `doctors`: médicos de la secretaria; se usan solo para armar los turnos de ejemplo.
const initAgenda = (doctors) => ({ appointments: buildInitialAppointments(doctors), suspended: [] });

export const useAgenda = (doctors) => {
  const [state, dispatch] = useReducer(agendaReducer, doctors, initAgenda);
  return {
    appointments: state.appointments,
    suspended: state.suspended,
    createAppointment: (doctorId, appointment, fromSuspendedId = null) =>
      dispatch({ type: 'create', doctorId, appointment, fromSuspendedId }),
    markArrived: (doctorId, id) => dispatch({ type: 'arrive', doctorId, id }),
    moveAppointment: (doctorId, id, date, time) => dispatch({ type: 'move', doctorId, id, date, time }),
    cancelAppointment: (doctorId, id, toSuspended = false) => dispatch({ type: 'cancel', doctorId, id, toSuspended }),
    suspendAppointment: (doctorId, id) => dispatch({ type: 'suspend', doctorId, id }),
    removeSuspended: (id) => dispatch({ type: 'removeSuspended', id }),
  };
};
