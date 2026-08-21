import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, User, CreditCard, Mail, FileText, ArrowLeft, Check, ChevronLeft, ChevronRight, AlertTriangle, Edit2, X, CheckCircle, Briefcase, HeartPulse, Calendar, ShieldCheck, MapPin, Printer, Building2, Smartphone } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext'; // Importamos el contexto
import { doctorsData } from '../data/doctors';
import html2pdf from 'html2pdf.js';

// --- COMPONENTE DE RECIBO (Renderizado oculto para PDF) ---
const PrintReceipt = ({ appointmentData }) => {
    const { doctorName, patientName, dni, insurance, date, time, email, bookingDate } = appointmentData;
    const transactionId = Math.random().toString(36).substring(2, 12).toUpperCase();

    return (
        <div id="print-area" className="hidden print:flex flex-col p-8 font-serif text-slate-900 bg-white w-full max-w-none box-border absolute top-0 left-0 right-0 z-[99999] min-h-[100vh]">
            {/* Header / Logo */}
            <div className="border-b-[3px] border-slate-900 pb-6 mb-10 flex justify-between items-end">
                <div className="flex items-center gap-4">
                    <HeartPulse className="w-14 h-14 text-slate-900" strokeWidth={1.2} />
                    <div>
                        <h1 className="text-4xl tracking-[0.3em] font-medium text-slate-900 ml-1">SAMSA</h1>
                        <p className="text-xs text-slate-500 tracking-[0.2em] uppercase mt-1">Sistema de Salud Integral</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-widest mb-1">Comprobante</h2>
                    <p className="text-sm text-slate-500 font-sans">TX: #{transactionId}</p>
                    <p className="text-sm text-slate-500 font-sans">Reservado: {bookingDate || new Date().toLocaleDateString('es-AR')}</p>
                    <p className="text-sm text-slate-500 font-sans">Impreso: {new Date().toLocaleDateString('es-AR')}</p>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1">
                <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl mb-8">
                    <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-widest border-b border-slate-200 pb-3 text-sm">Información de la Reserva</h3>
                    <div className="grid grid-cols-2 gap-y-6 text-lg font-sans">
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Profesional Asignado</span> <span className="font-medium text-slate-800">{doctorName}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Ubicación</span> <span className="font-medium text-slate-800">Sede Central - Cons. 12</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Fecha</span> <span className="font-medium text-slate-800">{date}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Horario</span> <span className="font-medium text-slate-800">{time} hs</span></p>
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl mb-8">
                    <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-widest border-b border-slate-200 pb-3 text-sm">Datos del Paciente</h3>
                    <div className="grid grid-cols-2 gap-y-6 text-lg font-sans">
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Nombre Completo</span> <span className="font-medium text-slate-800">{patientName}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Documento (DNI)</span> <span className="font-medium text-slate-800">{dni}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Cobertura Médica</span> <span className="font-medium text-slate-800 capitalize">{insurance || 'Atención Particular'}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Correo Electrónico</span> <span className="font-medium text-slate-800">{email}</span></p>
                    </div>
                </div>

                <div className="border-l-[3px] border-slate-900 pl-6 py-2 mt-12">
                    <p className="text-sm text-slate-700 italic font-sans leading-relaxed">
                        <strong>Aviso Importante:</strong> El paciente deberá anunciarse en recepción con al menos 15 minutos de antelación al horario pactado, 
                        presentando obligatoriamente su Documento Nacional de Identidad y la credencial física o virtual de su cobertura médica. 
                        Toda demora superior a 10 minutos podrá implicar la reasignación o cancelación del turno sin previo aviso.
                    </p>
                </div>
            </div>

            {/* Footer / Legal */}
            <div className="border-t border-slate-300 pt-6 text-justify text-[10px] text-slate-400 mt-auto font-sans">
                <p className="mb-3 leading-relaxed">
                    Este documento constituye un comprobante formal y válido de reserva de turno emitido por el Sistema de Atención Médica y Salud Argentina (SAMSA). 
                    Generado de manera electrónica y automatizada bajo el ID único mencionado. La institución se reserva el derecho de modificar o reprogramar el turno 
                    por razones de fuerza mayor, notificando previamente al paciente mediante los canales de contacto declarados. 
                </p>
                <p className="text-center font-bold tracking-[0.3em] uppercase mt-6 text-xs text-slate-800">
                    SAMSA - Excelencia en Salud Institucional
                </p>
            </div>
        </div>
    );
};

const BookAppointment = () => {
    const { id } = useParams();
    const { user } = useAuth(); // Obtenemos el usuario logueado
    const navigate = useNavigate();
    
    const doctor = doctorsData.find(d => d.id === id);
    const doctorName = doctor ? doctor.name : "Profesional Médico";
    
    const dayMap = { "Dom": 0, "Lun": 1, "Mar": 2, "Mié": 3, "Jue": 4, "Vie": 5, "Sáb": 6 };
    const availableDays = doctor ? doctor.days.map(d => dayMap[d]) : [1, 2, 3, 4, 5];
  
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [isAnimatingSuccess, setIsAnimatingSuccess] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false); 
    
    const today = new Date();
    const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1)); 
    const [calendarDays, setCalendarDays] = useState([]);
    const [dailyTimeSlots, setDailyTimeSlots] = useState([]);
  
    // Estado del formulario
    const [formData, setFormData] = useState({
      name: '', 
      dni: '', 
      dob: '', 
      insurance: '', 
      email: ''
    });
  
    // --- EFECTO DE AUTOCOMPLETADO ---
    // Si hay usuario logueado, llenamos los datos automáticamente
    useEffect(() => {
        if (user) {
            setFormData({
                name: `${user.name || ''} ${user.lastname || ''}`.trim(),
                dni: user.dni || '',
                dob: user.dob || '', // Asumiendo que user tiene fecha de nac.
                email: user.email || '',
                insurance: 'particular' // Default o traer del perfil si existiera
            });
        }
    }, [user]);

    // --- LÓGICA DE CALENDARIO (Igual que antes) ---
    useEffect(() => {
      const year = currentDisplayDate.getFullYear();
      const month = currentDisplayDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayIndex = new Date(year, month, 1).getDay(); 
      const daysArray = [];
  
      for (let i = 0; i < firstDayIndex; i++) daysArray.push({ type: 'empty', key: `empty-${i}` });
  
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dayOfWeek = date.getDay();
        const checkDate = new Date(year, month, d);
        const todayClean = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const isPast = checkDate < todayClean;
        
        const worksThisDay = availableDays.includes(dayOfWeek);
        const isFull = worksThisDay && !isPast && (d * (dayOfWeek+1) % 7 === 0); 
        
        let status = 'available';
        if (isPast || !worksThisDay) status = 'closed';
        else if (isFull) status = 'full';
  
        daysArray.push({ type: 'day', key: `day-${d}`, day: d, date: date, status: status, gridStart: dayOfWeek === 0 ? 1 : dayOfWeek + 1 });
      }
      setCalendarDays(daysArray);
    }, [currentDisplayDate]);
  
    const canGoPrev = () => currentDisplayDate > new Date(today.getFullYear(), today.getMonth(), 1);
    const canGoNext = () => {
      const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return currentDisplayDate < maxDate;
    };
  
    const changeMonth = (offset) => {
      const newDate = new Date(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth() + offset, 1);
      setCurrentDisplayDate(newDate);
      setSelectedDate(null); setSelectedTime(null);
    };
  
    useEffect(() => {
      if (selectedDate) {
          setSelectedTime(null);
          
          let baseSlots = [];
          if (doctor) {
              doctor.hours.forEach(interval => {
                  let [startH, startM] = interval.start.split(':').map(Number);
                  let [endH, endM] = interval.end.split(':').map(Number);
                  
                  let curH = startH;
                  let curM = startM;
                  
                  while (curH < endH || (curH === endH && curM < endM)) {
                      baseSlots.push(`${curH.toString().padStart(2, '0')}:${curM.toString().padStart(2, '0')}`);
                      curM += 30;
                      if (curM >= 60) {
                          curM = 0;
                          curH += 1;
                      }
                  }
              });
          } else {
              baseSlots = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "16:00", "16:30", "17:00"];
          }

          const simulatedSlots = baseSlots.map(time => {
              const rand = Math.random();
              let status = 'available';
              if (rand > 0.7) status = 'busy';
              return { time, status };
          });
          setDailyTimeSlots(simulatedSlots);
      }
    }, [selectedDate]);
  
    const handleDateClick = (dayObj) => { if (dayObj.status === 'available') setSelectedDate(dayObj); };
    const handleInputChange = (e) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleDniChange = (e) => { if (/^\d*$/.test(e.target.value)) setFormData(prev => ({ ...prev, dni: e.target.value })); };
  
    // --- NAVEGACIÓN INTELIGENTE ---
    const handleNextStep = () => {
        if (user) {
            // Si está logueado, saltamos el paso 2 (Datos) y vamos directo a Confirmar
            setStep(3);
        } else {
            // Si es invitado, debe llenar datos
            setStep(2);
        }
    };

    const handleConfirm = () => {
        setIsAnimatingSuccess(true); 
        setTimeout(() => {
            setStep(4);
            setIsAnimatingSuccess(false); 
        }, 700); 
    };
      
    const handleDownloadReceipt = () => {
        setIsPrinting(true); 
        
        setTimeout(() => {
            // Guardamos el título original
            const originalTitle = document.title;
            const dateStr = new Date().toISOString().split('T')[0];
            const patientFileName = formData.name ? formData.name.replace(/\s+/g, '_').toLowerCase() : 'paciente';
            
            // Cambiamos el título temporalmente (los navegadores lo usan como nombre de archivo al guardar como PDF)
            document.title = `samsa_turno_${patientFileName}_${dateStr}`;
            
            window.print();
            
            // Restauramos el título
            document.title = originalTitle;
            setIsPrinting(false);
        }, 100);
    };
  
    const appointmentData = {
        doctorName,
        patientName: formData.name,
        dni: formData.dni,
        insurance: formData.insurance,
        dob: formData.dob,
        email: formData.email,
        date: selectedDate ? `${selectedDate.day} de ${currentDisplayDate.toLocaleString('es-ES', { month: 'long' })}` : '',
        time: selectedTime,
    };
  
    return (
      <div className={`font-sans min-h-screen transition-colors duration-700 ${step === 4 ? 'bg-slate-900' : 'bg-gray-50 text-slate-800'} relative print:bg-white`}>
        
        {/* COMPONENTE DE IMPRESIÓN */}
        {isPrinting && <PrintReceipt appointmentData={appointmentData} />}
        
        {/* UI PRINCIPAL (Oculta al imprimir) */}
        <div className="print:hidden">
          
          {step !== 4 && <Navbar />}
  
          {/* CAPA DE ANIMACIÓN */}
          <div className={`fixed inset-0 flex items-center justify-center pointer-events-none transition-transform duration-700 ease-in-out ${isAnimatingSuccess ? 'scale-[200]' : 'scale-0'} z-[100]`}>
            <div className="w-10 h-10 bg-green-500 rounded-full"></div>
          </div>
  
          <div className="max-w-3xl mx-auto px-4 py-12 relative z-20 pt-10"> 
            
            {/* Header */}
            {step < 4 && (
                <div className="mb-8 animate-fadeIn">
                    <Link to={`/professionals/${id}`} className="text-gray-500 hover:text-blue-600 flex items-center mb-4 transition w-fit">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Volver al perfil
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Reserva de Turno</h1>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-gray-500">Especialista: <span className="text-blue-600 font-semibold">{doctorName}</span></p>
                        
                        {/* Indicador de Usuario Logueado */}
                        {user && (
                             <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <User className="w-3 h-3"/> Solicitando como {user.name}
                             </span>
                        )}
                    </div>
                </div>
            )}
  
            {/* PASO 1: CALENDARIO */}
            {step === 1 && (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-500">
                    <div className="p-6 md:p-8">
                        {/* ... (Lógica de calendario idéntica) ... */}
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-4 select-none">
                                <button onClick={() => changeMonth(-1)} disabled={!canGoPrev()} className={`p-2 rounded-full transition ${!canGoPrev() ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}><ChevronLeft className="w-5 h-5"/></button>
                                <h2 className="text-xl font-bold text-gray-800 capitalize min-w-[180px] text-center">{currentDisplayDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h2>
                                <button onClick={() => changeMonth(1)} disabled={!canGoNext()} className={`p-2 rounded-full transition ${!canGoNext() ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}><ChevronRight className="w-5 h-5"/></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-2 md:gap-4 place-items-center">
                            {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map((d,i) => (<div key={i} className="h-10 w-10 flex items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{d}</div>))}
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
                                    {dailyTimeSlots.map((slot, i) => (
                                        <button key={i} disabled={slot.status !== 'available'} onClick={() => setSelectedTime(slot.time)} className={`py-2 px-2 rounded-lg text-sm font-medium border text-center transition-all ${selectedTime === slot.time ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-100" : slot.status === 'busy' ? "bg-red-50 text-red-300 border-red-50 cursor-not-allowed line-through decoration-red-300 opacity-60" : "bg-white text-green-700 border-green-200 hover:bg-green-50 hover:border-green-400 cursor-pointer"}`}>{slot.time}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-gray-50 px-8 py-4 flex justify-end border-t border-gray-100 items-center gap-4">
                        <div className="text-sm text-gray-500 hidden sm:block">{selectedDate && selectedTime ? `Reserva: ${selectedDate.day}/${currentDisplayDate.getMonth()+1} @ ${selectedTime}` : 'Seleccioná fecha y hora'}</div>
                        {/* BOTÓN CONTINUAR INTELIGENTE */}
                        <button onClick={handleNextStep} disabled={!selectedDate || !selectedTime} className={`px-8 py-3 rounded-full font-bold text-white transition-all shadow-lg ${(!selectedDate || !selectedTime) ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5'}`}>
                            {user ? 'Confirmar Turno' : 'Siguiente Paso'} &rarr;
                        </button>
                    </div>
                </div>
            )}
  
            {/* PASO 2: FORMULARIO (Solo para invitados) */}
            {step === 2 && !user && (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fadeIn p-8">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                        <div><h2 className="text-2xl font-bold text-gray-900">Datos del Paciente</h2><p className="text-gray-500 text-sm mt-1">Completá el formulario para confirmar.</p></div>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1"><label className="text-sm font-bold text-gray-700 ml-1">Nombre Completo <span className="text-red-500">*</span></label><div className="relative group"><User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition" /><input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" placeholder="Ej: Jesús Zelarayan" /></div></div>
                            <div className="space-y-1"><label className="text-sm font-bold text-gray-700 ml-1">DNI (Sin puntos) <span className="text-red-500">*</span></label><div className="relative group"><FileText className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition" /><input required type="text" name="dni" value={formData.dni} onChange={handleDniChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" placeholder="Ej: 12345678" inputMode="numeric"/></div></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1"><label className="text-sm font-bold text-gray-700 ml-1">Fecha de Nacimiento <span className="text-red-500">*</span></label><div className="relative group"><input required type="date" name="dob" value={formData.dob || ''} max={new Date().toISOString().split('T')[0]} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white text-gray-600 cursor-pointer" /></div></div>
                            <div className="space-y-1"><label className="text-sm font-bold text-gray-700 ml-1">Obra Social <span className="text-red-500">*</span></label><div className="relative group"><Briefcase className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition" /><select required name="insurance" value={formData.insurance || ''} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white text-gray-600 appearance-none cursor-pointer"><option value="">Seleccionar opción...</option><option value="particular">Particular</option><option value="osde">OSDE</option><option value="swiss">Swiss Medical</option><option value="pami">PAMI</option><option value="prensa">Prensa</option><option value="subsidio">Subsidio de Salud</option></select></div></div>
                        </div>
                        <div className="space-y-1"><label className="text-sm font-bold text-gray-700 ml-1">Correo Electrónico <span className="text-red-500">*</span></label><div className="relative group"><Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition" /><input required type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" placeholder="jesuszelarayan@ejemplo.com" /></div></div>
                        <div className="pt-6 flex gap-4 border-t border-gray-100 mt-4">
                            <button type="button" onClick={() => setStep(1)} className="w-1/3 py-3 rounded-xl font-bold text-gray-600 bg-white border-2 border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition">Atrás</button>
                            <button type="submit" className="w-2/3 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5">Continuar</button>
                        </div>
                    </form>
                </div>
            )}
  
            {/* PASO 3: CONFIRMACIÓN */}
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
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button onClick={handleConfirm} className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg hover:shadow-green-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> Confirmar Turno</button>
                        <div className="flex gap-3">
                            {/* Si es usuario logueado, vuelve al 1, si es invitado al 2 */}
                            <button onClick={() => setStep(user ? 1 : 2)} className="w-1/2 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:border-blue-400 hover:text-blue-600 transition flex items-center justify-center gap-2"><Edit2 className="w-4 h-4" /> Modificar</button>
                            <Link to={`/professionals/${id}`} className="w-1/2"><button className="w-full py-3 border-2 border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 hover:border-red-200 transition flex items-center justify-center gap-2"><X className="w-4 h-4" /> Cancelar</button></Link>
                        </div>
                    </div>
                </div>
            )}
  
            {/* PASO 4: ÉXITO FINAL */}
            {step === 4 && (
                <>
                <style>{`
                    @keyframes elegantScale { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                    @keyframes elegantUp { 0% { transform: translateY(30px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
                `}</style>
                <div className="fixed inset-0 flex flex-col items-center justify-center text-center text-white z-[100] bg-slate-900 print:hidden overflow-hidden">
                    {/* Aura de fondo cinemática */}
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