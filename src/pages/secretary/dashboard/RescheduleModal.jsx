import React, { useState, useMemo, useId } from 'react';
import { Calendar, XCircle, Clock, Activity, ChevronDown, AlertCircle } from 'lucide-react';
import SecretaryCalendar from './SecretaryCalendar';
import { AGENDA_SLOTS, findNextFreeSlots, isSlotTaken } from './agenda';
import { formatDateToLocale } from './dates';

const INITIAL_RESCHEDULE = { hasDate: 'yes', reason: '', notify: true, customDate: '', customTime: '' };

// Reprograma el turno `appointmentId` a otra fecha/hora libre, o lo manda a la bolsa de suspenso.
const RescheduleModal = ({ doctorAppointments, appointmentId, onSubmit, onClose }) => {
  const fieldId = useId();
  const [rescheduleData, setRescheduleData] = useState(INITIAL_RESCHEDULE);
  const [isSelectingCustomTime, setIsSelectingCustomTime] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState('');
  const suggestions = useMemo(
    () => findNextFreeSlots(doctorAppointments, 3, appointmentId),
    [doctorAppointments, appointmentId]
  );

  const hasChosenSlot = Boolean(rescheduleData.customDate && rescheduleData.customTime);
  const isSuggestion = suggestions.some(
    (s) => s.date === rescheduleData.customDate && s.time === rescheduleData.customTime
  );
  const canSubmit = rescheduleData.hasDate === 'no' || hasChosenSlot;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) onSubmit(rescheduleData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 ring-1 ring-white/10 overflow-hidden flex flex-col">
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center sticky top-0 z-10 border-b border-slate-800 shrink-0">
              <h2 className="text-xl font-black flex items-center gap-3"><div className="bg-slate-800 p-2 rounded-lg"><Calendar className="w-5 h-5 text-blue-400"/></div> Reprogramación de Turno</h2>
              <button type="button" onClick={onClose} className="text-white/50 hover:text-white transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700"><XCircle className="w-6 h-6"/></button>
          </div>

          {isSelectingCustomTime ? (
              <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-slate-50">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> 
                          Seleccionar Fecha
                      </h3>
                      <div className="max-w-sm mx-auto bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <SecretaryCalendar inline={true} selectedDate={tempSelectedDate} onSelect={(d) => setTempSelectedDate(d)} onClose={() => {}} />
                      </div>
                  </div>

                  {tempSelectedDate && (
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fadeIn">
                          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                              <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> 
                              Seleccionar Horario Libre
                          </h3>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                              {AGENDA_SLOTS.map(time => {
                                  const isTimeDisabled = isSlotTaken(doctorAppointments, tempSelectedDate, time, appointmentId);
                                  return (
                                  <button 
                                      key={time} 
                                      type="button" 
                                      disabled={isTimeDisabled}
                                      onClick={() => {
                                          if (!isTimeDisabled) {
                                              setRescheduleData({...rescheduleData, customDate: tempSelectedDate, customTime: time});
                                              setIsSelectingCustomTime(false);
                                          }
                                      }} 
                                      className={`py-3 rounded-xl font-bold border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                                          isTimeDisabled 
                                          ? 'border-red-100 bg-red-50 text-red-300 cursor-not-allowed opacity-70 line-through' 
                                          : 'border-slate-100 hover:border-blue-500 hover:bg-blue-50 text-slate-700'
                                      }`}
                                  >
                                      <Clock className={`w-4 h-4 ${isTimeDisabled ? 'text-red-200' : 'text-slate-400'}`} />
                                      <span>{time}hs</span>
                                  </button>
                              )})}
                          </div>
                      </div>
                  )}
                  <div className="flex justify-center pt-4">
                      <button type="button" onClick={() => setIsSelectingCustomTime(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors">Cancelar y Volver</button>
                  </div>
              </div>
          ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-8 flex-1 overflow-y-auto">

              <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Auditoría
                  </h3>
                  <div>
                      <label htmlFor={`${fieldId}-motivo-de-reprogramacion`} className="block text-xs font-bold text-slate-500 mb-1.5">Motivo de Reprogramación *</label>
                      <div className="relative">
                          <select id={`${fieldId}-motivo-de-reprogramacion`} required value={rescheduleData.reason} onChange={e => setRescheduleData({...rescheduleData, reason: e.target.value})} className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 appearance-none shadow-sm transition-all">
                              <option value="">Seleccionar motivo...</option>
                              <option value="paciente">Solicitud del paciente</option>
                              <option value="medico">Ausencia/Demora del médico</option>
                              <option value="tecnica">Falla técnica del consultorio</option>
                              <option value="feriado">Feriado no previsto</option>
                          </select>
                          <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                  </div>
              </div>

              <div className="w-full h-px bg-slate-100"></div>

              <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Nueva Disponibilidad
                  </h3>
                  <p className="font-bold text-slate-800 mb-3 text-sm">¿El paciente ya tiene una nueva fecha definida?</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                      <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${rescheduleData.hasDate === 'yes' ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10' : 'border-slate-200 hover:border-blue-200 bg-slate-50 hover:bg-slate-100'}`}>
                          <input type="radio" name="hasDate" value="yes" checked={rescheduleData.hasDate === 'yes'} onChange={() => setRescheduleData({...rescheduleData, hasDate: 'yes'})} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                          <span className="font-bold text-slate-700">Sí, agendar ahora</span>
                      </label>
                      <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${rescheduleData.hasDate === 'no' ? 'border-amber-500 bg-amber-50 shadow-md shadow-amber-500/10' : 'border-slate-200 hover:border-amber-200 bg-slate-50 hover:bg-slate-100'}`}>
                          <input type="radio" name="hasDate" value="no" checked={rescheduleData.hasDate === 'no'} onChange={() => setRescheduleData({...rescheduleData, hasDate: 'no'})} className="w-5 h-5 text-amber-600 focus:ring-amber-500" />
                          <span className="font-bold text-slate-700">No (Bolsa de Suspenso)</span>
                      </label>
                  </div>
              </div>

              {rescheduleData.hasDate === 'yes' && (
                  <div className="space-y-4 animate-fadeIn">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Búsqueda Inteligente (Próximos libres)</p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                          {suggestions.map(({ date, time }) => {
                              const isChosen = rescheduleData.customDate === date && rescheduleData.customTime === time;
                              return (
                                  <button key={`${date}-${time}`} type="button" onClick={() => setRescheduleData({...rescheduleData, customDate: date, customTime: time})} className={`p-3 text-sm font-bold rounded-xl transition-all shadow-sm focus:ring-2 focus:ring-blue-500 border-2 ${isChosen ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-blue-200'}`}>{formatDateToLocale(date)} - {time}hs</button>
                              );
                          })}
                          <div className="relative">
                              <button type="button" onClick={() => setIsSelectingCustomTime(true)} className={`w-full h-full p-3 text-sm font-bold border-2 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 ${hasChosenSlot && !isSuggestion ? 'bg-blue-600 text-white border-blue-600' : 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100'}`}>
                                  <Calendar className="w-4 h-4"/> {(rescheduleData.customDate && rescheduleData.customTime) ? `${formatDateToLocale(rescheduleData.customDate)} ${rescheduleData.customTime}hs` : 'Ver calendario...'}
                              </button>
                          </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100">
                          <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors">
                              <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-5 h-5 bg-slate-50 border-slate-300" />
                              Derivar a otro profesional (Emergencia)
                          </label>
                      </div>
                  </div>
              )}

              {rescheduleData.hasDate === 'no' && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-3 text-amber-800 text-sm font-medium animate-fadeIn">
                      <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
                      <p>El turno se cancelará y el paciente pasará a la Bolsa de Suspenso. El sistema te recordará contactarlo en 7 días.</p>
                  </div>
              )}

              <div className="bg-slate-100 p-4 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={rescheduleData.notify} onChange={e => setRescheduleData({...rescheduleData, notify: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-5 h-5" />
                      <span className="font-bold text-slate-700 text-sm">Notificar al paciente vía WhatsApp / Email automáticamente.</span>
                  </label>
              </div>

              <button type="submit" disabled={!canSubmit} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed">
                  Confirmar Acción {rescheduleData.hasDate === 'yes' && rescheduleData.customDate && rescheduleData.customTime ? `(${formatDateToLocale(rescheduleData.customDate)} ${rescheduleData.customTime}hs)` : ''}
              </button>
          </form>
          )}
      </div>
    </div>
  );
};

export default RescheduleModal;
