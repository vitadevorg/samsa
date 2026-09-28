import React, { useState, useId } from 'react';
import {
  Calendar, Plus, XCircle, User, Hash, Phone, Mail, CreditCard, ShieldCheck,
  ChevronDown, Clock, Activity, CheckCircle, Check,
} from 'lucide-react';
import SecretaryCalendar from './SecretaryCalendar';
import { INSURANCE_OPTIONS } from '../../../constants/catalog';
import { getScheduleSlots, isSlotTaken, isWorkingDay } from './agenda';
import { findPatientByDni } from './mockData';
import { formatDateToLocale, getToday, parseISODate } from './dates';

const EMPTY_TURN = {
  patient: '', dni: '', cuit: '', dob: '', obraSocial: '', email: '', phone: '',
  date: '', time: '', type: 'Presencial', motivoConsulta: '', isReschedule: false,
};
const PATIENT_FIELDS_RESET = { patient: '', phone: '', email: '', obraSocial: '', dob: '' };

// El formulario vive en el modal; el padre lo monta con `initialData` y recibe el turno en `onSubmit`.
// `doctorSchedule`: horario del profesional en la clínica (días y franja horaria).
const NewTurnModal = ({ doctorAppointments, doctorSchedule, initialData, onSubmit, onClose }) => {
  const fieldId = useId();
  const [newTurnData, setNewTurnData] = useState(() => ({ ...EMPTY_TURN, ...initialData }));
  const [showDobCalendar, setShowDobCalendar] = useState(false);
  const [showNewTurnDateCalendar, setShowNewTurnDateCalendar] = useState(false);

  const handleDniChange = (e) => {
    const dni = e.target.value;
    const patientData = findPatientByDni(dni);
    setNewTurnData(prev => ({ ...prev, ...(patientData || PATIENT_FIELDS_RESET), dni }));
  };

  // Solo se ofrecen horarios si el profesional atiende el día elegido.
  const worksThatDay = Boolean(newTurnData.date) && isWorkingDay(parseISODate(newTurnData.date), doctorSchedule);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newTurnData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 ring-1 ring-white/10 overflow-hidden">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center sticky top-0 z-10 border-b border-slate-800">
                <h2 className="text-xl font-black flex items-center gap-3">
                    <div className="bg-slate-800 p-2 rounded-lg">
                        {newTurnData.isReschedule ? <Calendar className="w-5 h-5 text-amber-400"/> : <Plus className="w-5 h-5 text-blue-400"/>}
                    </div> 
                    {newTurnData.isReschedule ? 'Gestionar Reasignación de Turno' : 'Registrar Turno Manual'}
                </h2>
                <button onClick={onClose} className="text-white/50 hover:text-white transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700"><XCircle className="w-6 h-6"/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-8">

                <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" /> Datos del Paciente
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="col-span-1 md:col-span-2">
                            <label htmlFor={`${fieldId}-nombre-completo`} className="block text-xs font-bold text-slate-500 mb-1.5">Nombre Completo *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400" /></div>
                                <input id={`${fieldId}-nombre-completo`} type="text" required value={newTurnData.patient} onChange={e => setNewTurnData({...newTurnData, patient: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 transition-all shadow-sm" placeholder="Ej. Juan Pérez" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor={`${fieldId}-dni`} className="block text-xs font-bold text-slate-500 mb-1.5">DNI *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Hash className="h-5 w-5 text-slate-400" /></div>
                                <input id={`${fieldId}-dni`} type="text" required value={newTurnData.dni} onChange={handleDniChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 transition-all shadow-sm" placeholder="Nro de Documento" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor={`${fieldId}-fecha-de-nacimiento`} className="block text-xs font-bold text-slate-500 mb-1.5">Fecha de Nacimiento *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Calendar className="h-5 w-5 text-slate-400" /></div>
                                <button id={`${fieldId}-fecha-de-nacimiento`} 
                                    type="button"
                                    onClick={() => setShowDobCalendar(!showDobCalendar)}
                                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl outline-none font-semibold transition-all shadow-sm text-left ${newTurnData.dob ? 'text-slate-700 border-slate-200' : 'text-slate-400 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'}`}
                                >
                                    {newTurnData.dob ? formatDateToLocale(newTurnData.dob) : 'dd / mm / aaaa'}
                                </button>
                                {showDobCalendar && (
                                    <SecretaryCalendar 
                                        selectedDate={newTurnData.dob} 
                                        onSelect={(date) => setNewTurnData({...newTurnData, dob: date})} 
                                        onClose={() => setShowDobCalendar(false)} 
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor={`${fieldId}-telefono`} className="block text-xs font-bold text-slate-500 mb-1.5">Teléfono *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-slate-400" /></div>
                                <input id={`${fieldId}-telefono`} type="tel" required value={newTurnData.phone} onChange={e => setNewTurnData({...newTurnData, phone: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 transition-all shadow-sm" placeholder="Ej. 381 444 5555" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor={`${fieldId}-email`} className="block text-xs font-bold text-slate-500 mb-1.5">Email (Opcional)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
                                <input id={`${fieldId}-email`} type="email" value={newTurnData.email} onChange={e => setNewTurnData({...newTurnData, email: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 transition-all shadow-sm" placeholder="correo@ejemplo.com" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-slate-100"></div>

                <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Cobertura y Facturación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor={`${fieldId}-obra-social`} className="block text-xs font-bold text-slate-500 mb-1.5">Obra Social</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><ShieldCheck className="h-5 w-5 text-slate-400" /></div>
                                <select id={`${fieldId}-obra-social`} value={newTurnData.obraSocial} onChange={e => setNewTurnData({...newTurnData, obraSocial: e.target.value})} className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 appearance-none shadow-sm transition-all">
                                    {INSURANCE_OPTIONS.map(ins => (
                                        <option key={ins} value={ins}>{ins}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor={`${fieldId}-cuit-cuil`} className="block text-xs font-bold text-slate-500 mb-1.5">CUIT / CUIL (Opcional)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Hash className="h-5 w-5 text-slate-400" /></div>
                                <input id={`${fieldId}-cuit-cuil`} type="text" value={newTurnData.cuit} onChange={e => setNewTurnData({...newTurnData, cuit: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 transition-all shadow-sm" placeholder="XX-XXXXXXXX-X" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-slate-100"></div>

                <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Asignación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor={`${fieldId}-fecha-del-turno`} className="block text-xs font-bold text-slate-500 mb-1.5">Fecha del Turno *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Calendar className="h-5 w-5 text-slate-400" /></div>
                                <input id={`${fieldId}-fecha-del-turno`} 
                                    type="text" 
                                    readOnly
                                    required 
                                    value={newTurnData.date ? formatDateToLocale(newTurnData.date) : 'Seleccionar fecha...'} 
                                    onClick={() => setShowNewTurnDateCalendar(!showNewTurnDateCalendar)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 transition-all shadow-sm cursor-pointer hover:bg-slate-100" 
                                />
                                {showNewTurnDateCalendar && (
                                    <SecretaryCalendar 
                                        selectedDate={newTurnData.date || getToday()} 
                                        onSelect={(date) => setNewTurnData({...newTurnData, date, time: ''})} 
                                        onClose={() => setShowNewTurnDateCalendar(false)} 
                                        appointments={doctorAppointments}
                                        schedule={doctorSchedule}
                                    />
                                )}
                            </div>
                        </div>
                        <div>
                            <label htmlFor={`${fieldId}-canal-de-origen`} className="block text-xs font-bold text-slate-500 mb-1.5">Canal de Origen</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Activity className="h-5 w-5 text-slate-400" /></div>
                                <select id={`${fieldId}-canal-de-origen`} value={newTurnData.type} onChange={e => setNewTurnData({...newTurnData, type: e.target.value})} className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 appearance-none shadow-sm transition-all">
                                    <option>Presencial</option>
                                    <option>Telefónico</option>
                                </select>
                                <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 mt-2">
                            <p className="block text-xs font-bold text-slate-500 mb-3">Horarios Disponibles *</p>
                            {worksThatDay ? (
                                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                    {getScheduleSlots(doctorSchedule).map(t => {
                                        const isOccupied = isSlotTaken(doctorAppointments, newTurnData.date, t);
                                        return (
                                            <button 
                                                key={t}
                                                type="button" 
                                                disabled={isOccupied}
                                                onClick={() => setNewTurnData({...newTurnData, time: t})} 
                                                className={`p-2.5 text-sm font-bold rounded-xl transition-all border ${isOccupied ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : newTurnData.time === t ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:bg-blue-50'}`}
                                            >
                                                {t}
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm font-medium text-slate-500">
                                    {newTurnData.date
                                        ? 'El profesional no atiende ese día. Elegí otra fecha.'
                                        : 'Selecciona una fecha para ver los horarios disponibles.'}
                                </div>
                            )}
                        </div>

                        <div className="col-span-1 md:col-span-2 mt-2">
                            <label htmlFor={`${fieldId}-motivo-de-consulta`} className="block text-xs font-bold text-slate-500 mb-1.5">Motivo de Consulta</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><CheckCircle className="h-5 w-5 text-slate-400" /></div>
                                <select id={`${fieldId}-motivo-de-consulta`} value={newTurnData.motivoConsulta} onChange={e => setNewTurnData({...newTurnData, motivoConsulta: e.target.value})} className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 appearance-none shadow-sm transition-all">
                                    <option value="">Seleccione un motivo (Opcional)</option>
                                    <option value="Primera Vez">Primera vez</option>
                                    <option value="Control">Control</option>
                                    <option value="Receta">Receta</option>
                                    <option value="Apto Fisico">Apto Físico</option>
                                    <option value="Estudios">Presentación de estudios</option>
                                </select>
                                <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={!newTurnData.time || !newTurnData.date} className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl mt-4 ${(!newTurnData.time || !newTurnData.date) ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5'}`}>
                    <Check className="w-5 h-5" /> Registrar Turno {newTurnData.date && `(${formatDateToLocale(newTurnData.date)})`}
                </button>
            </form>
        </div>
    </div>
  );
};

export default NewTurnModal;
