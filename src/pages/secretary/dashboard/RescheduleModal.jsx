import React, { useState, useMemo, useId } from 'react';
import { Calendar, Clock, Activity, ChevronDown, AlertCircle } from 'lucide-react';
import SecretaryCalendar from './SecretaryCalendar';
import { SecretaryModalOverlay, SecretaryModalCard, SecretaryModalHeader, DoctorTag } from './SecretaryModal';
import { findNextFreeSlots, getScheduleSlots, isSlotTaken } from './agenda';
import { formatDateToLocale } from './dates';

const INITIAL_RESCHEDULE = { hasDate: 'yes', reason: '', notify: true, customDate: '', customTime: '' };

// Reprograma el turno `appointmentId` a otra fecha/hora libre, o lo manda a la bolsa de suspenso.
// `doctorSchedule`: horario del profesional; las sugerencias y horarios salen de ahí.
const RescheduleModal = ({ doctor, doctorAppointments, doctorSchedule, appointmentId, onSubmit, onClose }) => {
  const fieldId = useId();
  const [rescheduleData, setRescheduleData] = useState(INITIAL_RESCHEDULE);
  const [isSelectingCustomTime, setIsSelectingCustomTime] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState('');
  const suggestions = useMemo(
    () => findNextFreeSlots(doctorAppointments, doctorSchedule, 3, appointmentId),
    [doctorAppointments, doctorSchedule, appointmentId]
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
    <SecretaryModalOverlay onClose={onClose} zIndex="z-[100]" labelledBy={`${fieldId}-title`}>
      <SecretaryModalCard className="flex flex-col">
          <SecretaryModalHeader
              icon={Calendar}
              title="Reprogramación de Turno"
              subtitle="Elegí un nuevo horario o enviá el turno a la bolsa de suspenso."
              badge={<DoctorTag doctor={doctor} />}
              onClose={onClose}
              titleId={`${fieldId}-title`}
          />

          {isSelectingCustomTime ? (
              <div className="p-5 sm:p-8 space-y-6 flex-1 overflow-y-auto bg-gray-50/70">
                  <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> 
                          Seleccionar Fecha
                      </h3>
                      <div className="max-w-sm mx-auto bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <SecretaryCalendar inline={true} selectedDate={tempSelectedDate} onSelect={(d) => setTempSelectedDate(d)} onClose={() => {}} appointments={doctorAppointments} schedule={doctorSchedule} />
                      </div>
                  </div>

                  {tempSelectedDate && (
                      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
                          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                              <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> 
                              Seleccionar Horario Libre
                          </h3>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                              {getScheduleSlots(doctorSchedule).map(time => {
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
                                          : 'border-gray-100 hover:border-blue-500 hover:bg-blue-50 text-gray-700'
                                      }`}
                                  >
                                      <Clock className={`w-4 h-4 ${isTimeDisabled ? 'text-red-200' : 'text-gray-400'}`} />
                                      <span>{time}hs</span>
                                  </button>
                              )})}
                          </div>
                      </div>
                  )}
                  <div className="flex justify-center pt-4">
                      <button type="button" onClick={() => setIsSelectingCustomTime(false)} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">Cancelar y Volver</button>
                  </div>
              </div>
          ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6 sm:space-y-8 flex-1 overflow-y-auto">

              <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Auditoría
                  </h3>
                  <div>
                      <label htmlFor={`${fieldId}-motivo-de-reprogramacion`} className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Motivo de Reprogramación *</label>
                      <div className="relative">
                          <select id={`${fieldId}-motivo-de-reprogramacion`} required value={rescheduleData.reason} onChange={e => setRescheduleData({...rescheduleData, reason: e.target.value})} className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium text-gray-700 appearance-none shadow-sm transition-all">
                              <option value="">Seleccionar motivo...</option>
                              <option value="paciente">Solicitud del paciente</option>
                              <option value="medico">Ausencia/Demora del médico</option>
                              <option value="tecnica">Falla técnica del consultorio</option>
                              <option value="feriado">Feriado no previsto</option>
                          </select>
                          <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                  </div>
              </div>

              <div className="w-full h-px bg-gray-100"></div>

              <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Nueva Disponibilidad
                  </h3>
                  <p className="font-bold text-gray-900 mb-3 text-sm">¿El paciente ya tiene una nueva fecha definida?</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                      <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${rescheduleData.hasDate === 'yes' ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10' : 'border-gray-200 hover:border-blue-200 bg-gray-50 hover:bg-gray-100'}`}>
                          <input type="radio" name="hasDate" value="yes" checked={rescheduleData.hasDate === 'yes'} onChange={() => setRescheduleData({...rescheduleData, hasDate: 'yes'})} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                          <span className="font-bold text-gray-700">Sí, agendar ahora</span>
                      </label>
                      <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${rescheduleData.hasDate === 'no' ? 'border-amber-500 bg-amber-50 shadow-md shadow-amber-500/10' : 'border-gray-200 hover:border-amber-200 bg-gray-50 hover:bg-gray-100'}`}>
                          <input type="radio" name="hasDate" value="no" checked={rescheduleData.hasDate === 'no'} onChange={() => setRescheduleData({...rescheduleData, hasDate: 'no'})} className="w-5 h-5 text-amber-600 focus:ring-amber-500" />
                          <span className="font-bold text-gray-700">No (Bolsa de Suspenso)</span>
                      </label>
                  </div>
              </div>

              {rescheduleData.hasDate === 'yes' && (
                  <div className="space-y-4 animate-fadeIn">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Búsqueda Inteligente (Próximos libres)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          {suggestions.map(({ date, time }) => {
                              const isChosen = rescheduleData.customDate === date && rescheduleData.customTime === time;
                              return (
                                  <button key={`${date}-${time}`} type="button" onClick={() => setRescheduleData({...rescheduleData, customDate: date, customTime: time})} className={`p-3 text-sm font-bold rounded-xl transition-all shadow-sm focus:ring-2 focus:ring-blue-500 border-2 ${isChosen ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-blue-200'}`}>{formatDateToLocale(date)} - {time}hs</button>
                              );
                          })}
                          <div className="relative">
                              <button type="button" onClick={() => setIsSelectingCustomTime(true)} className={`w-full h-full p-3 text-sm font-bold border-2 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 ${hasChosenSlot && !isSuggestion ? 'bg-blue-600 text-white border-blue-600' : 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100'}`}>
                                  <Calendar className="w-4 h-4"/> {(rescheduleData.customDate && rescheduleData.customTime) ? `${formatDateToLocale(rescheduleData.customDate)} ${rescheduleData.customTime}hs` : 'Ver calendario...'}
                              </button>
                          </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                          <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
                              <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-5 h-5 bg-gray-50 border-gray-300" />
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

              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={rescheduleData.notify} onChange={e => setRescheduleData({...rescheduleData, notify: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-5 h-5" />
                      <span className="font-bold text-gray-700 text-sm">Notificar al paciente vía WhatsApp / Email automáticamente.</span>
                  </label>
              </div>

              <button type="submit" disabled={!canSubmit} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                  Confirmar Acción {rescheduleData.hasDate === 'yes' && rescheduleData.customDate && rescheduleData.customTime ? `(${formatDateToLocale(rescheduleData.customDate)} ${rescheduleData.customTime}hs)` : ''}
              </button>
          </form>
          )}
      </SecretaryModalCard>
    </SecretaryModalOverlay>
  );
};

export default RescheduleModal;
