import React, { useState, useMemo, useId } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, User, CreditCard, Mail, FileText, ArrowLeft, Check, ChevronLeft, ChevronRight, AlertTriangle, Edit2, X, CheckCircle, Briefcase, HeartPulse, Calendar, ShieldCheck, MapPin, Printer, Building2, Smartphone } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/useAuth'; 
import { doctorsData } from '../data/doctors';
import { useClinicData } from './clinic/clinicDataContext';
import { getDoctorLocations } from '../data/institutions';
import PrintReceipt from '../components/PrintReceipt';
import { generateTransactionId } from '../utils/ids';
import {
    startOfDay, startOfMonth, addMonths, getWorkingDayIndexes,
    buildCalendarMonth, buildTimeSlots, getSlotAvailability,
} from '../utils/schedule';
import { useTimeouts } from '../hooks/useTimeouts';
import { INSURANCE_OPTIONS } from '../constants/catalog';
import AffiliationFields from '../components/AffiliationFields';
import { HOLDER_TYPES, emptyAffiliation, pickAffiliation, requiresAffiliation, validateAffiliation } from '../utils/insuranceValidation';
const buildInitialForm = (user) => ({
    name: user ? `${user.name || ''} ${user.lastname || ''}`.trim() : '',
    dni: user?.dni || '',
    dob: user?.dob || '',
    email: user?.email || '',
    insurance: user ? (user.insurance || 'Ninguna') : '',
});
const BookAppointment = () => {
    const fieldId = useId();
    const { schedule } = useTimeouts();
    const { id } = useParams();
    const { user } = useAuth(); 
    const doctor = doctorsData.find(d => d.id === id);
    const doctorName = doctor ? doctor.name : "Profesional Médico";
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [isAnimatingSuccess, setIsAnimatingSuccess] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false); 
    const [transactionId] = useState(generateTransactionId);
    const [today] = useState(startOfDay);
    const [currentDisplayDate, setCurrentDisplayDate] = useState(() => startOfMonth(today));
    const [formData, setFormData] = useState(() => buildInitialForm(user));
    // Datos de afiliación: el usuario logueado los trae de su perfil; el invitado los carga en el paso 2.
    const [affiliation, setAffiliation] = useState(() => pickAffiliation(user));
    const [affiliationErrors, setAffiliationErrors] = useState({});
    const [acceptedDeclaration, setAcceptedDeclaration] = useState(false);
    const hasCoverage = requiresAffiliation(formData.insurance);
    const currentAffiliationErrors = validateAffiliation({ insurance: formData.insurance, ...affiliation, patientDni: formData.dni });
    const isAffiliationValid = Object.keys(currentAffiliationErrors).length === 0;
    const canConfirm = !hasCoverage || (isAffiliationValid && acceptedDeclaration);
    // Sedes donde atiende el médico: una por institución (con el horario que le fijó
    // cada una) o, si no tiene ninguna, su atención particular. Salen del estado
    // compartido, así un cambio de horario aceptado por la clínica se refleja acá.
    const { allAssignments } = useClinicData();
    const locations = useMemo(
        () => (doctor ? getDoctorLocations(doctor, allAssignments) : []),
        [doctor, allAssignments]
    );
    const [selectedLocationKey, setSelectedLocationKey] = useState(null);
    // Sede elegida: la que marcó el paciente o, por defecto, la primera.
    const selectedLocation = locations.find(place => place.key === selectedLocationKey) ?? locations[0];
    // Texto de la sede para el resumen y el comprobante, por ejemplo "Clínica del Norte · Consultorio 4".
    const locationLabel = selectedLocation?.institutionId
        ? `${selectedLocation.name} · ${selectedLocation.office}`
        : selectedLocation?.office;
    // El calendario y los horarios usan los días y el horario de la sede elegida.
    const calendarDays = useMemo(
        () => buildCalendarMonth(currentDisplayDate, getWorkingDayIndexes(selectedLocation?.days), today),
        [currentDisplayDate, selectedLocation, today]
    );
    const dailyTimeSlots = useMemo(
        () => (selectedDate
            ? getSlotAvailability(`${doctor?.id}@${selectedLocation?.key}`, selectedDate.date, buildTimeSlots(selectedLocation?.hours))
            : []),
        [selectedDate, doctor, selectedLocation]
    );
    // Cambiar de sede cambia los días disponibles: se borra el día y la hora elegidos.
    const handleLocationChange = (key) => {
        setSelectedLocationKey(key);
        setSelectedDate(null);
        setSelectedTime(null);
    };
    const canGoPrev = () => currentDisplayDate > startOfMonth(today);
    const canGoNext = () => currentDisplayDate < addMonths(today, 1);
    const changeMonth = (offset) => {
      setCurrentDisplayDate(addMonths(currentDisplayDate, offset));
      setSelectedDate(null); setSelectedTime(null);
    };
    const handleDateClick = (dayObj) => {
        if (dayObj.status !== 'available') return;
        setSelectedDate(dayObj);
        setSelectedTime(null);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Otra obra social implica otra credencial: se descartan los datos de la anterior.
        if (name === 'insurance' && value !== formData.insurance) {
            setAffiliation(emptyAffiliation());
            setAffiliationErrors({});
            setAcceptedDeclaration(false);
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleDniChange = (e) => { if (/^\d*$/.test(e.target.value)) setFormData(prev => ({ ...prev, dni: e.target.value })); };
    const handleAffiliationChange = (name, value) => {
        setAffiliation(prev => ({ ...prev, [name]: value }));
        setAffiliationErrors(prev => ({ ...prev, [name]: null }));
    };
    const handlePatientDataSubmit = (e) => {
        e.preventDefault();
        if (!isAffiliationValid) {
            setAffiliationErrors(currentAffiliationErrors);
            return;
        }
        setAffiliationErrors({});
        setStep(3);
    };
    const handleNextStep = () => {
        if (user) {
            setStep(3);
        } else {
            setStep(2);
        }
    };
    const handleConfirm = () => {
        if (!canConfirm) return;
        setIsAnimatingSuccess(true);
        schedule(() => {
            setStep(4);
            setIsAnimatingSuccess(false); 
        }, 700); 
    };
    const handleDownloadReceipt = () => {
        setIsPrinting(true); 
        schedule(() => {
            const originalTitle = document.title;
            const dateStr = new Date().toISOString().split('T')[0];
            const patientFileName = formData.name ? formData.name.replace(/\s+/g, '_').toLowerCase() : 'paciente';
            document.title = `samsa_turno_${patientFileName}_${dateStr}`;
            window.print();
            document.title = originalTitle;
            setIsPrinting(false);
        }, 100);
    };
    const appointmentData = {
        doctorName,
        patientName: formData.name,
        dni: formData.dni,
        insurance: hasCoverage ? formData.insurance : '',
        affiliation: hasCoverage ? affiliation : null,
        dob: formData.dob,
        email: formData.email,
        date: selectedDate ? `${selectedDate.day} de ${currentDisplayDate.toLocaleString('es-ES', { month: 'long' })}` : '',
        time: selectedTime,
        location: locationLabel,
        transactionId,
    };
    return (
      <div className={`font-sans min-h-screen transition-colors duration-700 ${step === 4 ? 'bg-slate-900' : 'bg-gray-50 text-slate-800'} relative print:bg-white`}>
        {isPrinting && <PrintReceipt appointmentData={appointmentData} />}
        <div className="print:hidden">
          {step !== 4 && <Navbar />}
          <div className={`fixed inset-0 flex items-center justify-center pointer-events-none transition-transform duration-700 ease-in-out ${isAnimatingSuccess ? 'scale-[200]' : 'scale-0'} z-[100]`}>
            <div className="w-10 h-10 bg-green-500 rounded-full"></div>
          </div>
          <div className="max-w-3xl mx-auto px-4 py-12 relative z-20 pt-10"> 
            {step < 4 && (
                <div className="mb-8 animate-fadeIn">
                    <Link to={`/professionals/${id}`} className="text-gray-500 hover:text-blue-600 flex items-center mb-4 transition w-fit">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Volver al perfil
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Reserva de Turno</h1>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-gray-500">Especialista: <span className="text-blue-600 font-semibold">{doctorName}</span></p>
                        {user && (
                             <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <User className="w-3 h-3"/> Solicitando como {user.name}
                             </span>
                        )}
                    </div>
                </div>
            )}
            {step === 1 && (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-500">
                    <div className="p-6 md:p-8">
                        {/* Sede: si atiende en varias, el paciente elige; si es una sola, se informa */}
                        {locations.length > 0 && (
                            <div className="mb-8">
                                <p className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-600"/> {locations.length > 1 ? '¿Dónde querés atenderte?' : 'Lugar de atención'}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {locations.map(place => {
                                        const isSelected = place.key === selectedLocation.key;
                                        return (
                                            <button
                                                key={place.key}
                                                type="button"
                                                aria-pressed={isSelected}
                                                disabled={locations.length === 1}
                                                onClick={() => handleLocationChange(place.key)}
                                                className={`text-left p-4 rounded-2xl border transition ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                                            >
                                                <p className="font-bold text-gray-900">{place.name}</p>
                                                <p className="text-sm text-gray-500">{place.office}</p>
                                                <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
                                                    <Clock className="w-4 h-4 text-blue-500 shrink-0"/>
                                                    {place.days.join(', ')} · {place.hours.map(h => `${h.start} a ${h.end}`).join(' / ')}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-4 select-none">
                                <button onClick={() => changeMonth(-1)} disabled={!canGoPrev()} className={`p-2 rounded-full transition ${!canGoPrev() ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}><ChevronLeft className="w-5 h-5"/></button>
                                <h2 className="text-xl font-bold text-gray-800 capitalize min-w-[180px] text-center">{currentDisplayDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h2>
                                <button onClick={() => changeMonth(1)} disabled={!canGoNext()} className={`p-2 rounded-full transition ${!canGoNext() ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}><ChevronRight className="w-5 h-5"/></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-2 md:gap-4 place-items-center">
                            {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map((d) => (<div key={d} className="h-10 w-10 flex items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{d}</div>))}
                            {calendarDays.map((slot) => {
                                if (slot.type === 'empty') return <div key={slot.key} className="h-10 w-10"></div>;
                                let btnClass = "h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 ";
                                if (slot.status === 'past') btnClass += "text-gray-300 cursor-not-allowed"; 
                                else if (slot.status === 'closed') btnClass += "bg-gray-50 text-gray-300 cursor-not-allowed"; 
                                else if (slot.status === 'full') btnClass += "bg-red-50 text-red-400 border border-red-100 cursor-not-allowed"; 
                                else if (selectedDate?.day === slot.day) btnClass += "bg-blue-600 text-white shadow-lg transform scale-110"; 
                                else btnClass += "bg-white text-gray-700 border border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"; 
                                return <button key={slot.key} onClick={() => handleDateClick(slot)} disabled={slot.status !== 'available'} className={btnClass}>{slot.day}</button>;
                            })}
                        </div>
                        {selectedDate && (
                            <div className="animate-fadeIn mt-10 pt-8 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-600" /> Horarios para el {selectedDate.day}/{currentDisplayDate.getMonth()+1}</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                    {dailyTimeSlots.map((slot) => (
                                        <button key={slot.time} disabled={slot.status !== 'available'} onClick={() => setSelectedTime(slot.time)} className={`py-2 px-2 rounded-lg text-sm font-medium border text-center transition-all ${selectedTime === slot.time ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-100" : slot.status === 'busy' ? "bg-red-50 text-red-300 border-red-50 cursor-not-allowed line-through decoration-red-300 opacity-60" : "bg-white text-green-700 border-green-200 hover:bg-green-50 hover:border-green-400 cursor-pointer"}`}>{slot.time}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-gray-50 px-8 py-4 flex justify-end border-t border-gray-100 items-center gap-4">
                        <div className="text-sm text-gray-500 hidden sm:block">{selectedDate && selectedTime ? `Reserva: ${selectedDate.day}/${currentDisplayDate.getMonth()+1} @ ${selectedTime}` : 'Seleccioná fecha y hora'}</div>
                        <button onClick={handleNextStep} disabled={!selectedDate || !selectedTime} className={`px-8 py-3 rounded-full font-bold text-white transition-all shadow-lg ${(!selectedDate || !selectedTime) ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5'}`}>
                            {user ? 'Confirmar Turno' : 'Siguiente Paso'} &rarr;
                        </button>
                    </div>
                </div>
            )}
            {step === 2 && !user && (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fadeIn p-8">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                        <div><h2 className="text-2xl font-bold text-gray-900">Datos del Paciente</h2><p className="text-gray-500 text-sm mt-1">Completá el formulario para confirmar.</p></div>
                    </div>
                    <form onSubmit={handlePatientDataSubmit} className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1"><label htmlFor={`${fieldId}-nombre-completo`} className="text-sm font-bold text-gray-700 ml-1">Nombre Completo <span className="text-red-500">*</span></label><div className="relative group"><User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition" /><input id={`${fieldId}-nombre-completo`} required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" placeholder="Ej: Jesús Zelarayan" /></div></div>
                            <div className="space-y-1"><label htmlFor={`${fieldId}-dni`} className="text-sm font-bold text-gray-700 ml-1">DNI (Sin puntos) <span className="text-red-500">*</span></label><div className="relative group"><FileText className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition" /><input id={`${fieldId}-dni`} required type="text" name="dni" value={formData.dni} onChange={handleDniChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" placeholder="Ej: 12345678" inputMode="numeric"/></div></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1"><label htmlFor={`${fieldId}-fecha-de-nacimiento`} className="text-sm font-bold text-gray-700 ml-1">Fecha de Nacimiento <span className="text-red-500">*</span></label><div className="relative group"><input id={`${fieldId}-fecha-de-nacimiento`} required type="date" name="dob" value={formData.dob || ''} max={new Date().toISOString().split('T')[0]} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white text-gray-600 cursor-pointer" /></div></div>
                            <div className="space-y-1"><label htmlFor={`${fieldId}-obra-social`} className="text-sm font-bold text-gray-700 ml-1">Obra Social <span className="text-red-500">*</span></label><div className="relative group"><Briefcase className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition" /><select id={`${fieldId}-obra-social`} required name="insurance" value={formData.insurance || ''} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white text-gray-600 appearance-none cursor-pointer"><option value="">Seleccionar opción...</option>{INSURANCE_OPTIONS.map(ins => <option key={ins} value={ins}>{ins === 'Ninguna' ? 'Ninguna (particular)' : ins}</option>)}</select></div></div>
                        </div>
                        <AffiliationFields
                            insurance={formData.insurance}
                            value={affiliation}
                            onChange={handleAffiliationChange}
                            errors={affiliationErrors}
                            patientDni={formData.dni}
                        />
                        <div className="space-y-1"><label htmlFor={`${fieldId}-correo-electronico`} className="text-sm font-bold text-gray-700 ml-1">Correo Electrónico <span className="text-red-500">*</span></label><div className="relative group"><Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition" /><input id={`${fieldId}-correo-electronico`} required type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" placeholder="jesuszelarayan@ejemplo.com" /></div></div>
                        <div className="pt-6 flex gap-4 border-t border-gray-100 mt-4">
                            <button type="button" onClick={() => setStep(1)} className="w-1/3 py-3 rounded-xl font-bold text-gray-600 bg-white border-2 border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition">Atrás</button>
                            <button type="submit" className="w-2/3 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5">Continuar</button>
                        </div>
                    </form>
                </div>
            )}
            {step === 3 && (
                <div className="bg-white rounded-3xl shadow-2xl p-10 text-center animate-fadeIn max-w-lg mx-auto border border-gray-100 relative overflow-hidden">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-10 h-10 text-yellow-600" /></div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">¡Estás a un solo paso!</h2>
                        <p className="text-gray-500">Revisá los datos del turno.</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-200 shadow-inner">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="bg-blue-100 p-3 rounded-full"><User className="w-6 h-6 text-blue-600"/></div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Paciente</p>
                                <p className="font-bold text-gray-800 text-lg">{formData.name}</p>
                                <p className="text-sm text-gray-500">DNI: {formData.dni}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-green-100 p-3 rounded-full"><Clock className="w-6 h-6 text-green-600"/></div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Turno</p>
                                <p className="font-bold text-gray-800">{selectedDate?.day} de {currentDisplayDate.toLocaleString('es-ES', { month: 'long' })} - {selectedTime} hs</p>
                                <p className="text-sm text-gray-500">Con: {doctorName}</p>
                                {locationLabel && <p className="text-sm text-gray-500">En: {locationLabel}</p>}
                            </div>
                        </div>
                        <div className="flex items-start gap-4 mt-4">
                            <div className="bg-indigo-100 p-3 rounded-full"><ShieldCheck className="w-6 h-6 text-indigo-600"/></div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-400 uppercase">Cobertura</p>
                                {hasCoverage ? (
                                    <>
                                        <p className="font-bold text-gray-800">{formData.insurance}{affiliation.plan ? ` · Plan ${affiliation.plan}` : ''}</p>
                                        <p className="text-sm text-gray-500 break-words">Afiliado Nº {affiliation.affiliateNumber || '—'}</p>
                                        <p className="text-sm text-gray-500 break-words">
                                            {affiliation.holderType === HOLDER_TYPES.ADHERENTE
                                                ? `Adherente · Titular: ${affiliation.holderName || '—'} (DNI ${affiliation.holderDni || '—'})`
                                                : 'Titular'}
                                        </p>
                                    </>
                                ) : (
                                    <p className="font-bold text-gray-800">Atención particular</p>
                                )}
                            </div>
                        </div>
                    </div>
                    {hasCoverage && !isAffiliationValid && (
                        <div className="mb-6 text-left bg-amber-50 border border-amber-200 text-amber-800 text-sm p-4 rounded-2xl flex gap-3 items-start">
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500"/>
                            <div>
                                <p className="font-bold">Faltan datos de afiliación o son inválidos</p>
                                <p className="mt-1">{Object.values(currentAffiliationErrors)[0]}.</p>
                                {user ? (
                                    <Link to="/user-profile" className="inline-block mt-2 font-bold text-blue-700 hover:underline">Completarlos en Mi Perfil &rarr;</Link>
                                ) : (
                                    <button type="button" onClick={() => setStep(2)} className="mt-2 font-bold text-blue-700 hover:underline">Corregir datos &rarr;</button>
                                )}
                            </div>
                        </div>
                    )}
                    {hasCoverage && isAffiliationValid && (
                        <label className="mb-6 text-left flex items-start gap-3 p-4 rounded-2xl border border-blue-100 bg-blue-50/50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={acceptedDeclaration}
                                onChange={(e) => setAcceptedDeclaration(e.target.checked)}
                                className="mt-0.5 w-5 h-5 shrink-0 accent-blue-600 cursor-pointer"
                            />
                            <span className="text-sm text-slate-700 leading-relaxed">
                                Declaro que los datos de cobertura son verídicos y presentaré mi credencial y DNI en la consulta.
                            </span>
                        </label>
                    )}
                    <div className="flex flex-col gap-3">
                        <button onClick={handleConfirm} disabled={!canConfirm} className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg hover:shadow-green-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"><CheckCircle className="w-5 h-5" /> Confirmar Turno</button>
                        <div className="flex gap-3">
                            <button onClick={() => setStep(user ? 1 : 2)} className="w-1/2 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:border-blue-400 hover:text-blue-600 transition flex items-center justify-center gap-2"><Edit2 className="w-4 h-4" /> Modificar</button>
                            <Link to={`/professionals/${id}`} className="w-1/2"><button className="w-full py-3 border-2 border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 hover:border-red-200 transition flex items-center justify-center gap-2"><X className="w-4 h-4" /> Cancelar</button></Link>
                        </div>
                    </div>
                </div>
            )}
            {step === 4 && (
                <>
                <style>{`
                    @keyframes elegantScale { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                    @keyframes elegantUp { 0% { transform: translateY(30px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
                `}</style>
                <div className="fixed inset-0 flex flex-col items-center justify-center text-center text-white z-[100] bg-slate-900 print:hidden overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
                         <div className="w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(16,185,129,0.3)]" style={{ animation: 'elegantScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                            <Check className="w-12 h-12 text-white stroke-[3]" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-medium mb-6 tracking-wide text-slate-50 opacity-0" style={{ animation: 'elegantUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards' }}>
                            Reserva Confirmada
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-lg leading-relaxed font-light opacity-0" style={{ animation: 'elegantUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards' }}>
                            Todo listo, <span className="font-medium text-white">{formData.name.split(' ')[0]}</span>. <br/> 
                            Te esperamos el <span className="font-medium text-emerald-400">{appointmentData.date}</span> a las <span className="font-medium text-emerald-400">{appointmentData.time} hs</span>.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md px-4 opacity-0" style={{ animation: 'elegantUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards' }}>
                            <button onClick={handleDownloadReceipt} className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2">
                                <Printer className="w-5 h-5"/> Imprimir Comprobante
                            </button>
                            <Link to="/" className="flex-1">
                                <button className="w-full py-4 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 hover:text-white transition shadow-lg border border-slate-700">
                                    Volver al Inicio
                                </button>
                            </Link>
                        </div>
                        <div className="absolute -bottom-24 text-slate-500 text-sm opacity-0" style={{ animation: 'elegantUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1s forwards' }}>
                            Se ha enviado una copia a {formData.email}
                        </div>
                    </div>
                </div>
                </>
            )}
          </div>
          {step !== 4 && <Footer />}
        </div>
      </div>
    );
};
export default BookAppointment;