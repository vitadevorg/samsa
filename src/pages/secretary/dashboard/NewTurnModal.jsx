import React, { useState, useId } from 'react';
import {
  Calendar, Plus, User, Hash, Phone, Mail, CreditCard, ShieldCheck,
  ChevronDown, Clock, Activity, Check, AlertTriangle, Stethoscope, X,
} from 'lucide-react';
import SecretaryCalendar from './SecretaryCalendar';
import { SecretaryModalOverlay, SecretaryModalCard, SecretaryModalHeader, DoctorTag } from './SecretaryModal';
import AffiliationFields from '../../../components/AffiliationFields';
import { INSURANCE_OPTIONS } from '../../../constants/catalog';
import { emptyAffiliation, pickAffiliation, requiresAffiliation, validateAffiliation } from '../../../utils/insuranceValidation';
import { formatCuil, validateOptionalCuil } from '../../../utils/cuil';
import { getScheduleSlots, isSlotTaken, isWorkingDay } from './agenda';
import { findPatientByDni } from './mockData';
import { formatDateToLocale, getToday, parseISODate } from './dates';

const EMPTY_TURN = {
  patient: '', dni: '', cuit: '', dob: '', obraSocial: '', email: '', phone: '',
  date: '', time: '', type: 'Presencial', isReschedule: false,
};
const PATIENT_FIELDS_RESET = { patient: '', phone: '', email: '', obraSocial: '', dob: '' };

// Pantalla de salida: confirma el turno registrado con un resumen.
// Usa las mismas animaciones de entrada que la confirmación de la reserva del paciente.
const SummaryRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3">
      <div className="w-9 h-9 bg-white border border-gray-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><Icon className="w-4 h-4"/></div>
      <div className="min-w-0">
          <p className="text-xs text-gray-400 font-bold">{label}</p>
          <div className="text-sm font-bold text-gray-800 break-words">{children}</div>
      </div>
  </div>
);

const TurnCreatedView = ({ turn, doctor, titleId, onCreateAnother, onClose }) => {
  const isReschedule = turn.isReschedule;
  return (
    <div className="relative p-6 sm:p-10 text-center">
        <style>{`
            @keyframes turnCreatedPop { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
            @keyframes turnCreatedUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
            .turn-created-pop { animation: turnCreatedPop 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
            .turn-created-up { animation: turnCreatedUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
            @media (prefers-reduced-motion: reduce) { .turn-created-pop, .turn-created-up { animation: none; } }
        `}</style>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors"><X className="w-5 h-5"/></button>

        <div className="turn-created-pop w-20 h-20 mx-auto mb-6 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
            <Check className="w-10 h-10 text-white stroke-[3]" />
        </div>
        <h2 id={titleId} className="turn-created-up text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2" style={{ animationDelay: '0.15s' }}>
            Turno{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{isReschedule ? 'reasignado' : 'registrado'}</span>
        </h2>
        <p className="turn-created-up text-gray-500 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-6" style={{ animationDelay: '0.25s' }}>
            {turn.patient.trim() ? <>El turno de <span className="font-bold text-gray-800">{turn.patient}</span> quedó agendado el </> : 'Quedó agendado el '}
            <span className="font-bold text-blue-600">{formatDateToLocale(turn.date)}</span> a las <span className="font-bold text-blue-600">{turn.time} hs</span>.
        </p>

        <div className="turn-created-up text-left bg-gray-50 border border-gray-100 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8" style={{ animationDelay: '0.35s' }}>
            <SummaryRow icon={User} label="Paciente">
                {turn.patient}
                {turn.dni && <span className="block text-xs font-medium text-gray-500 font-mono">DNI {turn.dni}</span>}
            </SummaryRow>
            {doctor && (
                <SummaryRow icon={Stethoscope} label="Profesional">
                    {doctor.name}
                    {doctor.specialty && <span className="block text-xs font-medium text-gray-500">{doctor.specialty}</span>}
                </SummaryRow>
            )}
            <SummaryRow icon={Clock} label="Fecha y hora">{formatDateToLocale(turn.date)} · {turn.time} hs</SummaryRow>
            <SummaryRow icon={ShieldCheck} label="Cobertura">
                {requiresAffiliation(turn.obraSocial) ? turn.obraSocial : 'Atención particular'}
                {turn.affiliation?.affiliateNumber && <span className="block text-xs font-medium text-gray-500">Afiliado Nº {turn.affiliation.affiliateNumber}</span>}
            </SummaryRow>
            <SummaryRow icon={Activity} label="Canal de origen">{turn.type}</SummaryRow>
        </div>

        <div className="turn-created-up flex flex-col-reverse sm:flex-row gap-3" style={{ animationDelay: '0.45s' }}>
            <button type="button" onClick={onCreateAnother} className="flex-1 py-3.5 bg-white text-gray-700 font-bold border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-blue-300 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" /> Cargar otro turno
            </button>
            <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-500/30">
                Listo, volver a la agenda
            </button>
        </div>
    </div>
  );
};

// El formulario vive en el modal; el padre lo monta con `initialData` y recibe el turno en `onSubmit`.
// `doctorSchedule`: horario del profesional en la clínica (días y franja horaria).
// `doctor`: profesional dueño de la agenda; se muestra en el encabezado y en la salida.
// Al registrar se muestra la pantalla de salida; `onCreateAnother` abre un formulario nuevo.
const NewTurnModal = ({ doctor, doctorAppointments, doctorSchedule, initialData, onSubmit, onCreateAnother, onClose }) => {
  const fieldId = useId();
  const [createdTurn, setCreatedTurn] = useState(null);
  const [newTurnData, setNewTurnData] = useState(() => ({ ...EMPTY_TURN, ...initialData }));
  const [showDobCalendar, setShowDobCalendar] = useState(false);
  const [showNewTurnDateCalendar, setShowNewTurnDateCalendar] = useState(false);
  // Datos de la credencial de la obra social (misma validación que el turno sin registro).
  const [affiliation, setAffiliation] = useState(() => pickAffiliation(initialData?.affiliation));
  const [affiliationErrors, setAffiliationErrors] = useState({});
  // El CUIT/CUIL es opcional; si se carga, sus 8 dígitos del medio deben ser el DNI.
  const [triedSubmit, setTriedSubmit] = useState(false);

  const hasCoverage = requiresAffiliation(newTurnData.obraSocial);
  const getAffiliationErrors = () =>
    validateAffiliation(
      { insurance: newTurnData.obraSocial, ...affiliation, patientDni: newTurnData.dni },
      { audience: 'staff' }
    );

  // Al cambiar de obra social se descartan los datos de la credencial anterior.
  const updateInsurance = (nextInsurance) => {
    if (nextInsurance === newTurnData.obraSocial) return;
    setAffiliation(emptyAffiliation());
    setAffiliationErrors({});
  };

  const handleDniChange = (e) => {
    const dni = e.target.value;
    const patientData = findPatientByDni(dni);
    const nextFields = patientData || PATIENT_FIELDS_RESET;
    updateInsurance(nextFields.obraSocial);
    setNewTurnData(prev => ({ ...prev, ...nextFields, dni }));
  };

  const handleInsuranceChange = (e) => {
    const obraSocial = e.target.value;
    updateInsurance(obraSocial);
    setNewTurnData(prev => ({ ...prev, obraSocial }));
  };

  const handleAffiliationChange = (name, value) => {
    setAffiliation(prev => ({ ...prev, [name]: value }));
    setAffiliationErrors(prev => ({ ...prev, [name]: null }));
  };

  // Solo se ofrecen horarios si el profesional atiende el día elegido.
  const worksThatDay = Boolean(newTurnData.date) && isWorkingDay(parseISODate(newTurnData.date), doctorSchedule);

  const cuitError = validateOptionalCuil(newTurnData.cuit, newTurnData.dni, { requireComplete: triedSubmit });

  const handleSubmit = (e) => {
    e.preventDefault();
    setTriedSubmit(true);
    const errors = getAffiliationErrors();
    const cuitSubmitError = validateOptionalCuil(newTurnData.cuit, newTurnData.dni);
    if (Object.keys(errors).length > 0 || cuitSubmitError) {
      setAffiliationErrors(errors);
      return;
    }
    setAffiliationErrors({});
    const turn = { ...newTurnData, affiliation: hasCoverage ? affiliation : null };
    onSubmit(turn);
    setCreatedTurn(turn);
  };

  const hasFormErrors = Object.values(affiliationErrors).some(Boolean) || (triedSubmit && Boolean(cuitError));

  return (
    <SecretaryModalOverlay onClose={onClose} labelledBy={`${fieldId}-title`}>
        <SecretaryModalCard>
            {createdTurn ? (
                <TurnCreatedView
                    turn={createdTurn}
                    doctor={doctor}
                    titleId={`${fieldId}-title`}
                    onCreateAnother={onCreateAnother}
                    onClose={onClose}
                />
            ) : (
            <>
            <SecretaryModalHeader
                icon={newTurnData.isReschedule ? Calendar : Plus}
                tone={newTurnData.isReschedule ? 'amber' : 'blue'}
                title={newTurnData.isReschedule ? 'Gestionar Reasignación de Turno' : 'Registrar Turno Manual'}
                subtitle="Cargá los datos del paciente y elegí el horario."
                badge={<DoctorTag doctor={doctor} />}
                onClose={onClose}
                titleId={`${fieldId}-title`}
            />
            <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6 sm:space-y-8">

                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" /> Datos del Paciente
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="col-span-1 md:col-span-2">
                            <label htmlFor={`${fieldId}-nombre-completo`} className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Nombre Completo *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                                <input id={`${fieldId}-nombre-completo`} type="text" required value={newTurnData.patient} onChange={e => setNewTurnData({...newTurnData, patient: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium text-gray-700 transition-all shadow-sm" placeholder="Ej. Juan Pérez" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor={`${fieldId}-dni`} className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">DNI *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Hash className="h-5 w-5 text-gray-400" /></div>
                                <input id={`${fieldId}-dni`} type="text" required value={newTurnData.dni} onChange={handleDniChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium text-gray-700 transition-all shadow-sm" placeholder="Nro de Documento" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor={`${fieldId}-fecha-de-nacimiento`} className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Fecha de Nacimiento *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Calendar className="h-5 w-5 text-gray-400" /></div>
                                <button id={`${fieldId}-fecha-de-nacimiento`} 
                                    type="button"
                                    onClick={() => setShowDobCalendar(!showDobCalendar)}
                                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl outline-none font-semibold transition-all shadow-sm text-left ${newTurnData.dob ? 'text-gray-700 border-gray-200' : 'text-gray-400 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'}`}
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
                            <label htmlFor={`${fieldId}-telefono`} className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Teléfono *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-gray-400" /></div>
                                <input id={`${fieldId}-telefono`} type="tel" required value={newTurnData.phone} onChange={e => setNewTurnData({...newTurnData, phone: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium text-gray-700 transition-all shadow-sm" placeholder="Ej. 381 444 5555" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor={`${fieldId}-email`} className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email (Opcional)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                                <input id={`${fieldId}-email`} type="email" value={newTurnData.email} onChange={e => setNewTurnData({...newTurnData, email: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium text-gray-700 transition-all shadow-sm" placeholder="correo@ejemplo.com" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Cobertura y Facturación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor={`${fieldId}-obra-social`} className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Obra Social</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><ShieldCheck className="h-5 w-5 text-gray-400" /></div>
                                <select id={`${fieldId}-obra-social`} value={newTurnData.obraSocial} onChange={handleInsuranceChange} className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium text-gray-700 appearance-none shadow-sm transition-all">
                                    {INSURANCE_OPTIONS.map(ins => (
                                        <option key={ins} value={ins}>{ins === 'Ninguna' ? 'Ninguna (particular)' : ins}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor={`${fieldId}-cuit-cuil`} className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">CUIT / CUIL (Opcional)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Hash className="h-5 w-5 text-gray-400" /></div>
                                <input
                                    id={`${fieldId}-cuit-cuil`}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    value={newTurnData.cuit}
                                    onChange={e => setNewTurnData({...newTurnData, cuit: formatCuil(e.target.value)})}
                                    aria-invalid={Boolean(cuitError)}
                                    aria-describedby={`${fieldId}-cuit-cuil-error`}
                                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:bg-white outline-none font-medium text-gray-700 transition-all shadow-sm ${cuitError ? 'bg-red-50/40 border-red-300 ring-1 ring-red-100 focus:ring-4 focus:ring-red-500/10 focus:border-red-400' : 'bg-gray-50 border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'}`}
                                    placeholder="XX-XXXXXXXX-X"
                                />
                            </div>
                            {cuitError && (
                                <p id={`${fieldId}-cuit-cuil-error`} className="text-red-500 text-xs mt-1 ml-1 flex items-start gap-1">
                                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /> {cuitError}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="mt-5">
                        <AffiliationFields
                            insurance={newTurnData.obraSocial}
                            value={affiliation}
                            onChange={handleAffiliationChange}
                            errors={affiliationErrors}
                            patientDni={newTurnData.dni}
                            audience="staff"
                        />
                    </div>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Asignación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor={`${fieldId}-fecha-del-turno`} className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Fecha del Turno *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Calendar className="h-5 w-5 text-gray-400" /></div>
                                <input id={`${fieldId}-fecha-del-turno`} 
                                    type="text" 
                                    readOnly
                                    required 
                                    value={newTurnData.date ? formatDateToLocale(newTurnData.date) : 'Seleccionar fecha...'} 
                                    onClick={() => setShowNewTurnDateCalendar(!showNewTurnDateCalendar)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium text-gray-700 transition-all shadow-sm cursor-pointer hover:bg-gray-100" 
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
                            <label htmlFor={`${fieldId}-canal-de-origen`} className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Canal de Origen</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Activity className="h-5 w-5 text-gray-400" /></div>
                                <select id={`${fieldId}-canal-de-origen`} value={newTurnData.type} onChange={e => setNewTurnData({...newTurnData, type: e.target.value})} className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium text-gray-700 appearance-none shadow-sm transition-all">
                                    <option>Presencial</option>
                                    <option>Telefónico</option>
                                </select>
                                <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 mt-2">
                            <p className="block text-sm font-bold text-gray-700 mb-3 ml-1">Horarios Disponibles *</p>
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
                                                className={`p-2.5 text-sm font-bold rounded-xl transition-all border ${isOccupied ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : newTurnData.time === t ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}
                                            >
                                                {t}
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-sm font-medium text-gray-500">
                                    {newTurnData.date
                                        ? 'El profesional no atiende ese día. Elegí otra fecha.'
                                        : 'Selecciona una fecha para ver los horarios disponibles.'}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {hasFormErrors && (
                    <p role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm font-semibold text-red-600">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> Revisá los datos marcados en rojo (CUIT/CUIL o afiliación a la obra social) antes de registrar el turno.
                    </p>
                )}

                <button type="submit" disabled={!newTurnData.time || !newTurnData.date} className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl transition-all shadow-lg mt-4 ${(!newTurnData.time || !newTurnData.date) ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5 shadow-blue-500/30'}`}>
                    <Check className="w-5 h-5" /> Registrar Turno {newTurnData.date && `(${formatDateToLocale(newTurnData.date)})`}
                </button>
            </form>
            </>
            )}
        </SecretaryModalCard>
    </SecretaryModalOverlay>
  );
};

export default NewTurnModal;
