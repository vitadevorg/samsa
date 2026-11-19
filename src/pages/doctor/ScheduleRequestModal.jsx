import React, { useId, useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { WEEK_DAYS } from '../../constants/catalog';
import { getInstitutionById, formatSchedule, schedulesOverlap } from '../../data/institutions';

// Formulario para que el médico le pida a una institución cambiar su horario.
// No guarda nada: valida el pedido y se lo pasa a la página con `onSubmit`,
// que pide confirmación y lo envía a la clínica (addRequest del estado compartido).
// - `assignment`: su vinculación actual con esa institución (días y horario).
// - `otherAssignments`: sus vinculaciones con OTRAS instituciones (para no superponerse).
const ScheduleRequestModal = ({ institutionName, assignment, otherAssignments, onCancel, onSubmit }) => {
  const fieldId = useId();
  // El formulario arranca con el horario actual, así el médico solo cambia lo que necesita.
  const [days, setDays] = useState(assignment.days);
  const [startTime, setStartTime] = useState(assignment.startTime);
  const [endTime, setEndTime] = useState(assignment.endTime);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // Marca o desmarca un día, manteniendo el orden de la semana.
  const toggleDay = (day) => {
    setDays(prev => {
      const next = prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day];
      return WEEK_DAYS.filter(d => next.includes(d));
    });
    setError('');
  };

  // Devuelve el problema del pedido, o '' si está todo bien.
  const validate = (requested) => {
    if (requested.days.length === 0) return 'Elegí al menos un día.';
    if (requested.startTime >= requested.endTime) return 'La hora de fin tiene que ser posterior a la de inicio.';
    const isSameAsNow = requested.days.join() === assignment.days.join()
      && requested.startTime === assignment.startTime
      && requested.endTime === assignment.endTime;
    if (isSameAsNow) return 'El horario pedido es igual al que ya tenés.';
    const conflict = otherAssignments.find(other => schedulesOverlap(other, requested));
    if (conflict) {
      return `Se superpone con tu horario en ${getInstitutionById(conflict.institutionId)?.name} (${formatSchedule(conflict)}).`;
    }
    if (!reason.trim()) return 'Contá brevemente el motivo del cambio.';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // evita que el navegador recargue la página al enviar el form
    const requested = { days, startTime, endTime };
    const problem = validate(requested);
    if (problem) {
      setError(problem);
      return;
    }
    onSubmit({ requestedSchedule: requested, reason: reason.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="bg-blue-600 p-5 flex justify-between items-center text-white">
          <div>
            <h3 className="font-bold text-lg">Solicitar cambio de horario</h3>
            <p className="text-blue-100 text-sm">{institutionName} · actual: {formatSchedule(assignment)}</p>
          </div>
          <button type="button" onClick={onCancel} className="hover:bg-blue-700 p-1.5 rounded-full transition" title="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <p id={`${fieldId}-dias`} className="block text-sm font-bold text-gray-700 uppercase">Días pedidos</p>
            <div role="group" aria-labelledby={`${fieldId}-dias`} className="flex justify-between gap-1">
              {WEEK_DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  aria-pressed={days.includes(day)}
                  onClick={() => toggleDay(day)}
                  className={`w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition ${
                    days.includes(day) ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label htmlFor={`${fieldId}-desde`} className="block text-sm font-bold text-gray-700 uppercase mb-1">Desde</label>
              <input id={`${fieldId}-desde`} type="time" required value={startTime} onChange={(e) => { setStartTime(e.target.value); setError(''); }} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label htmlFor={`${fieldId}-hasta`} className="block text-sm font-bold text-gray-700 uppercase mb-1">Hasta</label>
              <input id={`${fieldId}-hasta`} type="time" required value={endTime} onChange={(e) => { setEndTime(e.target.value); setError(''); }} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label htmlFor={`${fieldId}-motivo`} className="block text-sm font-bold text-gray-700 uppercase mb-1">Motivo</label>
            <textarea
              id={`${fieldId}-motivo`}
              rows={3}
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(''); }}
              placeholder="Ej: empiezo una residencia por las mañanas."
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          {error && (
            <p role="alert" className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </p>
          )}
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition">Cancelar</button>
          <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2">
            <Send className="w-4 h-4" /> Enviar solicitud
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleRequestModal;
