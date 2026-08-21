import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, Clock, User, CheckCircle, XCircle, X,
  AlertCircle, ChevronDown, MessageSquare, Plus, Check, MapPin, Send,
  Search, Phone, ChevronLeft, ChevronRight, List, ShieldCheck, Activity, Hash, CreditCard, Mail, FileText, LayoutGrid
} from 'lucide-react';

const INSURANCES = [
  "Ninguna", "Prensa", "Subsidio de Salud", "OSDE", "Swiss Medical", 
  "Galeno", "PAMI", "IOS", "OSECAC"
];

const getToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const getFutureDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const CustomCalendar = ({ selectedDate, onSelect, onClose, inline = false, appointments = null, selectedDoctor = null }) => {
    const initialDate = selectedDate ? new Date(selectedDate + 'T12:00:00Z') : new Date();
    const [viewDate, setViewDate] = useState(initialDate);
    const [showYearSelector, setShowYearSelector] = useState(false);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const renderDays = () => {
        let days = [];
        for (let i = 0; i < firstDayIndex; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === getToday();
            const dayOfWeek = new Date(year, month, i).getDay();

            const docAppointmentsCount = appointments && selectedDoctor ? (appointments[selectedDoctor] || []).filter(app => app.date === dateStr && app.status !== 'cancelled').length : 0;
            const hasAppointments = docAppointmentsCount > 0;
            const isFullyBooked = docAppointmentsCount >= 12;

            const isDisabled = dayOfWeek === 0 || isFullyBooked || i === 15; 

            days.push(
                <button 
                    key={i} 
                    type="button"
                    disabled={isDisabled}
                    onClick={() => { onSelect(dateStr); if(!inline) onClose(); }}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        isDisabled 
                            ? 'bg-red-50/50 text-red-300 cursor-not-allowed line-through' 
                            : isSelected 
                                ? 'bg-slate-800 text-white shadow-md' 
                                : isToday 
                                    ? 'bg-slate-200 text-slate-800 font-bold' 
                                    : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                    <span className="relative z-10">{i}</span>
                    {hasAppointments && !isDisabled && !isSelected && (
                        <div className="absolute bottom-1 w-1 h-1 bg-blue-400 rounded-full"></div>
                    )}
                </button>
            );
        }
        return days;
    };

    return (
        <div className={`${inline ? 'w-full' : 'absolute top-full mt-2 left-0 z-50 bg-white shadow-2xl border border-slate-100 p-4 w-72'} rounded-2xl animate-fadeIn`}>
            <div className="flex justify-between items-center mb-4">
                <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronLeft className="w-5 h-5"/></button>
                <div 
                    className="font-bold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-1"
                    onClick={() => setShowYearSelector(!showYearSelector)}
                >
                    {monthNames[month]} {year} <ChevronDown className="w-3 h-3"/>
                </div>
                <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronRight className="w-5 h-5"/></button>
            </div>

            {showYearSelector ? (
                <div className="h-48 overflow-y-auto custom-scrollbar grid grid-cols-3 gap-2 p-1">
                    {Array.from({length: 100}, (_, i) => new Date().getFullYear() - 80 + i).map(y => (
                        <button 
                            key={y}
                            type="button"
                            onClick={() => { setViewDate(new Date(y, month, 1)); setShowYearSelector(false); }}
                            className={`py-2 rounded-lg text-sm font-bold ${y === year ? 'bg-slate-800 text-white' : 'hover:bg-slate-100 text-slate-700'}`}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => <div key={d} className="text-[10px] font-black text-slate-400 uppercase">{d}</div>)}
                    </div>
            <div className="grid grid-cols-7 gap-1 place-items-center mb-3">
                {renderDays()}
            </div>
            <button 
                type="button"
                onClick={() => { onSelect(getToday()); onClose(); }}
                className="w-full py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
            >
                Volver a Hoy
            </button>
            </>
            )}
        </div>
    );
};

const formatDateToLocale = (dateStr) => {
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    const date = new Date(dateStr + 'T12:00:00Z');
    return date.toLocaleDateString('es-AR', options).replace(',', '');
};

const generateDateArray = () => {
    const dates = [];
    for (let i = -2; i <= 7; i++) {
        dates.push(getFutureDate(i));
    }
    return dates;
};

const DATES_CAROUSEL = generateDateArray();

const assignedDoctors = [
  { id: 'd1', name: 'Dr. Jesús Zelarayan', specialty: 'Cardiología', location: 'Sede Centro - Consultorio 4' },
  { id: 'd2', name: 'Dra. Sofía López', specialty: 'Pediatría', location: 'Sede Norte - Consultorio 12' },
  { id: 'd3', name: 'Dr. Martín Gómez', specialty: 'Cardiología', location: 'Sede Centro - Consultorio 5' },
  { id: 'd4', name: 'Dra. Ana Torres', specialty: 'Dermatología', location: 'Sede Sur - Consultorio 2' },
];

const REGISTERED_PATIENTS = {
    '45275212': { patient: 'Lucas Gabriel Lazarte', phone: '3863409588', email: 'lucas@gmail.com', obraSocial: 'OSDE', dob: '1995-04-12' },
    '32111222': { patient: 'Luis Coronel', phone: '3814445555', email: 'luis.coronel@hotmail.com', obraSocial: 'Prensa', dob: '1988-08-20' },
    '40123456': { patient: 'Ana Gomez', phone: '3811234567', email: 'ana.gomez@yahoo.com', obraSocial: 'Swiss Medical', dob: '1998-11-05' },
    '38634095': { patient: 'Juan Pérez', phone: '3815551234', email: 'jperez@gmail.com', obraSocial: 'Subsidio de Salud', dob: '2000-01-01' },
};

const initialAppointments = {
  'd1': [
    { id: 1, date: getToday(), time: '09:00', patient: 'Lucas Gabriel Lazarte', status: 'attending', type: 'Presencial', phone: '3863409588' },
    { id: 2, date: getToday(), time: '09:30', patient: 'Luis Coronel', status: 'waiting', type: 'Telefónico', phone: '3814445555' },
    { id: 3, date: getToday(), time: '10:00', patient: 'Carlos Rodriguez', status: 'pending', type: 'Presencial', phone: '3815556666' },
    { id: 6, date: getFutureDate(1), time: '09:00', patient: 'Ana Gomez', status: 'pending', type: 'Presencial', phone: '3811234567' },
  ],
  'd2': [
    { id: 4, date: getToday(), time: '08:30', patient: 'Ramiro Vides', status: 'finished', type: 'Presencial', phone: '3812223333' },
    { id: 5, date: getToday(), time: '11:00', patient: 'María Sánchez', status: 'pending', type: 'Presencial', phone: '3813334444' },
  ],
  'd3': [],
  'd4': []
};

const isLate = (timeStr) => {

    const [h, m] = timeStr.split(':');
    const now = new Date();
    const appt = new Date();
    appt.setHours(parseInt(h), parseInt(m), 0);
    return now.getTime() > (appt.getTime() + 15 * 60000); 
};

const SecretaryDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {

      if (!user || user.role !== 'secretary') {
          navigate('/');
      }
  }, [user, navigate]);

  const [selectedDoctor, setSelectedDoctor] = useState(assignedDoctors[0].id);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [appointments, setAppointments] = useState(initialAppointments);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('single'); 

  const [suspendedPatients, setSuspendedPatients] = useState([]);
  const [suspendToDelete, setSuspendToDelete] = useState(null);

  const [showNewTurnModal, setShowNewTurnModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const [showMainCalendar, setShowMainCalendar] = useState(false);
  const [showModalCalendar, setShowModalCalendar] = useState(false);
  const [showNewTurnDateCalendar, setShowNewTurnDateCalendar] = useState(false);
  const [showDoctorMenu, setShowDoctorMenu] = useState(false);

  const [confirmAction, setConfirmAction] = useState({ show: false, action: '', id: null });

  const [rescheduleData, setRescheduleData] = useState({ show: false, id: null, hasDate: 'yes', reason: '', notify: true, deriveTo: '', customDate: '', customTime: '' });
  const [isSelectingCustomTime, setIsSelectingCustomTime] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState('');

  const [newTurnData, setNewTurnData] = useState({ patient: '', dni: '', cuit: '', dob: '', obraSocial: '', email: '', phone: '', date: '', time: '', type: 'Presencial', motivoConsulta: '', isReschedule: false });
  const [showDobCalendar, setShowDobCalendar] = useState(false);

  const handleDniChange = (e) => {
      const val = e.target.value;
      const patientData = REGISTERED_PATIENTS[val];
      if (patientData) {
          setNewTurnData(prev => ({
              ...prev,
              dni: val,
              ...patientData
          }));
      } else {
          setNewTurnData(prev => ({ 
              ...prev, 
              dni: val,
              patient: '',
              phone: '',
              email: '',
              obraSocial: '',
              dob: ''
          }));
      }
  };

  const handleOpenNewTurnModal = (docId = null) => {
      if (docId) setSelectedDoctor(docId);
      setNewTurnData({ patient: '', dni: '', cuit: '', dob: '', obraSocial: '', email: '', phone: '', date: selectedDate, time: '', type: 'Presencial', motivoConsulta: '', isReschedule: false });
      setShowNewTurnModal(true);
  };

  const [selectedPatientProfile, setSelectedPatientProfile] = useState(null);

  const handlePatientClick = (app) => {
      const patientEntry = Object.entries(REGISTERED_PATIENTS).find(([dni, data]) => data.patient === app.patient);
      if (patientEntry) {
          setSelectedPatientProfile({ dni: patientEntry[0], ...patientEntry[1], nextTurn: app });
      } else {
          setSelectedPatientProfile({ patient: app.patient, phone: app.phone, nextTurn: app });
      }
  };

  const currentDoctor = assignedDoctors.find(d => d.id === selectedDoctor);

  const currentAppointments = (appointments[selectedDoctor] || [])
      .filter(app => app.date === selectedDate)
      .filter(app => app.patient.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCreateTurn = (e) => {
    e.preventDefault();
    const newTurn = {
      id: Date.now(),
      date: selectedDate,
      time: newTurnData.time,
      patient: newTurnData.patient,
      phone: newTurnData.phone,
      status: 'pending',
      type: newTurnData.type
    };

    setAppointments(prev => ({
      ...prev,
      [selectedDoctor]: [...prev[selectedDoctor], newTurn].sort((a, b) => a.time.localeCompare(b.time))
    }));

    setShowNewTurnModal(false);
    setNewTurnData({ patient: '', dni: '', cuit: '', dob: '', obraSocial: '', email: '', phone: '', time: '', type: 'Presencial' });
  };

  const handleActionClick = (id, action) => {
    if (action === 'reschedule') {
        setRescheduleData({ ...rescheduleData, show: true, id, customDate: '', customTime: '', hasDate: 'yes', reason: '', notify: true });
        setIsSelectingCustomTime(false);
    } else {
        setConfirmAction({ show: true, action, id, reason: '', sendToSuspend: false });
    }
  };

  const executeAction = (e) => {
    if(e) e.preventDefault();
    if (confirmAction.action === 'cancel') {
        setAppointments(prev => ({
            ...prev,
            [selectedDoctor]: prev[selectedDoctor].filter(app => app.id !== confirmAction.id)
        }));

        if (confirmAction.sendToSuspend) {
            const patientToSuspend = currentAppointments.find(a => a.id === confirmAction.id);
            if (patientToSuspend) {
                setSuspendedPatients(prev => [...prev, patientToSuspend]);
            }
        }

        if (suspendedPatients.length > 0) {
            setNotificationMsg(`Horario liberado. Hay ${suspendedPatients.length + (confirmAction.sendToSuspend ? 1 : 0)} pacientes en lista de espera. ¿Desea asignar este turno ahora?`);
            setShowNotificationModal(true);
        }

    } else if (confirmAction.action === 'arrive') {
        setAppointments(prev => ({
            ...prev,
            [selectedDoctor]: prev[selectedDoctor].map(app => 
                app.id === confirmAction.id ? { ...app, status: 'waiting' } : app
            )
        }));
    }
    setConfirmAction({ show: false, action: '', id: null, reason: '', sendToSuspend: false });
  };

  const executeReschedule = (e) => {
    e.preventDefault();
    const { id, hasDate, notify } = rescheduleData;

    if (hasDate === 'no') {
      const appToSuspend = appointments[selectedDoctor].find(a => a.id === id);
      if (appToSuspend) {
         setSuspendedPatients(prev => [...prev, { ...appToSuspend, suspendDate: getToday() }]);
         setAppointments(prev => ({
            ...prev,
            [selectedDoctor]: prev[selectedDoctor].filter(app => app.id !== id)
         }));
      }
      setNotificationMsg(`Se ha reprogramado el turno de ${appToSuspend?.patient || 'paciente'} a la bolsa de suspenso.`);
      setShowNotificationModal(true);
    } else {
       if (rescheduleData.customDate) {
           const appToMove = appointments[selectedDoctor].find(a => a.id === id);
           if (appToMove) {
               setAppointments(prev => ({
                   ...prev,
                   [selectedDoctor]: [
                       ...prev[selectedDoctor].filter(app => app.id !== id),
                       { ...appToMove, date: rescheduleData.customDate, time: rescheduleData.customTime || '12:00' }
                   ]
               }));
           }
       }
       setNotificationMsg(`Turno reprogramado para el ${formatDateToLocale(rescheduleData.customDate)} a las ${rescheduleData.customTime}hs.`);
       setShowNotificationModal(true);
    }

    setRescheduleData({ ...rescheduleData, show: false });
  };

  const groupedDoctors = assignedDoctors.reduce((acc, doc) => {
    if (!acc[doc.specialty]) acc[doc.specialty] = [];
    acc[doc.specialty].push(doc);
    return acc;
  }, {});

  const getStatusBadge = (status) => {
    switch(status) {
      case 'waiting': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">En Sala</span>;
      case 'attending': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">Atendiendo</span>;
      case 'finished': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Finalizado</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Cancelado</span>;
      default: return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Pendiente</span>;
    }
  };

  if (!user || user.role !== 'secretary') {
      return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        <div className="relative rounded-3xl bg-slate-900 p-8 text-white shadow-xl mb-8 border border-slate-800">
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <Calendar className="w-64 h-64 text-slate-100" />
                </div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="w-full md:w-1/2">
                    <div className="flex items-center gap-3 text-slate-300 mb-2">
                        <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black tracking-widest uppercase text-xs">Gestión de Agendas</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white">Agenda Diaria</h1>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <button 
                            onClick={() => setShowDoctorMenu(!showDoctorMenu)}
                            className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold py-3 px-5 rounded-xl shadow-inner hover:bg-white/20 transition-colors outline-none w-full sm:w-72"
                        >
                            <User className="w-5 h-5 text-blue-400" />
                            <span className="flex-1 text-left truncate">{assignedDoctors.find(d => d.id === selectedDoctor)?.name || 'Seleccionar Profesional'}</span>
                            <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${showDoctorMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showDoctorMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowDoctorMenu(false)}></div>
                                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fadeIn">
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
                                        {Object.entries(groupedDoctors).map(([specialty, docs]) => (
                                            <div key={specialty} className="mb-2 last:mb-0">
                                                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{specialty}</div>
                                                {docs.map(doc => (
                                                    <button 
                                                        key={doc.id}
                                                        onClick={() => { setSelectedDoctor(doc.id); setShowDoctorMenu(false); }}
                                                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${selectedDoctor === doc.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                                    >
                                                        <div className={`w-2 h-2 rounded-full ${selectedDoctor === doc.id ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                                        {doc.name}
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex bg-white/5 rounded-xl p-1 backdrop-blur-md border border-white/10 hidden md:flex items-center">
                        <button onClick={() => setViewMode('single')} title="Lista Diaria" className={`p-2.5 rounded-lg transition-all ${viewMode === 'single' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/50 hover:text-white'}`}>
                            <List className="w-5 h-5"/>
                        </button>
                        <button onClick={() => setViewMode('columns')} title="Vista en Columnas" className={`p-2.5 rounded-lg transition-all ${viewMode === 'columns' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/50 hover:text-white'}`}>
                            <LayoutGrid className="w-5 h-5"/>
                        </button>
                    </div>

                    <button 
                        onClick={() => setShowChatModal(true)}
                        title="Chat Profesional"
                        className="flex items-center justify-center p-3 bg-white/10 text-white rounded-xl hover:bg-white hover:text-slate-900 transition-all shadow-sm border border-white/10"
                    >
                        <MessageSquare className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>

        <div className="mb-8 flex items-center gap-2">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center shrink-0 relative">
                <button 
                    onClick={() => setShowMainCalendar(!showMainCalendar)} 
                    className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${showMainCalendar ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200'}`} 
                    title="Seleccionar fecha"
                >
                    <Calendar className="w-5 h-5" />
                </button>
                {showMainCalendar && (
                    <CustomCalendar 
                        selectedDate={selectedDate} 
                        onSelect={setSelectedDate} 
                        onClose={() => setShowMainCalendar(false)} 
                    />
                )}
            </div>

            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 overflow-x-auto custom-scrollbar flex-grow">
                {DATES_CAROUSEL.map(date => {
                const isSelected = date === selectedDate;
                const isToday = date === getToday();
                return (
                    <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`shrink-0 px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex flex-col items-center min-w-[100px] ${isSelected ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        <span className="uppercase text-[10px] tracking-widest opacity-80 mb-0.5">{isToday ? 'Hoy' : formatDateToLocale(date).split(' ')[0]}</span>
                        <span>{formatDateToLocale(date).split(' ').slice(1).join(' ')}</span>
                    </button>
                )
            })}
            </div>
        </div>

        {viewMode === 'single' ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-12">

            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 flex flex-col lg:flex-row justify-between items-center gap-4">
                <div className="text-white flex items-center gap-4 w-full lg:w-auto">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                        <Calendar className="w-6 h-6 text-pink-300" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight">{currentDoctor.name}</h2>
                        <div className="text-slate-400 text-sm font-medium flex items-center gap-3">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {formatDateToLocale(selectedDate)}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-pink-400"/> {currentDoctor.location}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">

                    <div className="relative flex-grow sm:w-64">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar paciente..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-pink-500/50 outline-none text-sm placeholder-slate-400"
                        />
                    </div>

                    <button 
                        onClick={() => setShowSuspendModal(true)}
                        className="flex items-center justify-center gap-2 bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-600 transition-colors text-sm"
                    >
                        <List className="w-4 h-4" /> Suspenso ({suspendedPatients.length})
                    </button>

                    <button 
                        onClick={() => handleOpenNewTurnModal()}
                        className="flex items-center justify-center gap-2 bg-pink-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-pink-700 transition-colors shadow-lg shadow-pink-600/30 text-sm shrink-0"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Turno
                    </button>
                </div>
            </div>

            <div className="p-0 sm:p-6 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="pb-4 pt-4 sm:pt-0 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Horario</th>
                            <th className="pb-4 pt-4 sm:pt-0 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                            <th className="pb-4 pt-4 sm:pt-0 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Origen</th>
                            <th className="pb-4 pt-4 sm:pt-0 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Estado</th>
                            <th className="pb-4 pt-4 sm:pt-0 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentAppointments.map((app) => {
                            const pendingLate = app.status === 'pending' && isLate(app.time) && selectedDate === getToday();
                            return (
                            <tr key={app.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors group ${pendingLate ? 'bg-red-50/30 hover:bg-red-50/50' : ''}`}>
                                <td className="py-5 px-4">
                                    <div className="flex items-center gap-2 font-mono font-bold text-slate-700">
                                        <Clock className={`w-4 h-4 ${pendingLate ? 'text-red-400' : 'text-slate-400'}`} /> {app.time}
                                    </div>
                                    {pendingLate && <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Atrasado</span>}
                                </td>
                                <td className="py-5 px-4">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handlePatientClick(app)} className="font-bold text-slate-800 hover:text-blue-600 transition-colors text-left focus:outline-none">
                                            {app.patient}
                                        </button>
                                        {app.phone && (
                                            <a href={`https://wa.me/${app.phone}`} target="_blank" rel="noreferrer" title="Contactar por WhatsApp"
                                                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${pendingLate ? 'bg-red-100 text-red-600 animate-pulse hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200 opacity-0 group-hover:opacity-100'}`}
                                            >
                                                <Phone className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td className="py-5 px-4 text-sm font-medium text-slate-500">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3"/> {app.type || 'Web'}</span>
                                </td>
                                <td className="py-5 px-4">{getStatusBadge(app.status)}</td>
                                <td className="py-5 px-4 text-right space-x-2">
                                    {app.status === 'pending' && (
                                        <button onClick={() => handleActionClick(app.id, 'arrive')} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors">
                                            <MapPin className="w-4 h-4" /> Llegó
                                        </button>
                                    )}
                                    {(app.status === 'pending' || app.status === 'waiting') && (
                                        <>
                                            <button onClick={() => handleActionClick(app.id, 'reschedule')} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">
                                                Reprogramar
                                            </button>
                                            <button onClick={() => handleActionClick(app.id, 'cancel')} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
                                                <XCircle className="w-4 h-4" /> Cancelar
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )})}
                        {currentAppointments.length === 0 && (
                            <tr>
                                <td colSpan="5" className="py-16 text-center text-slate-500 font-medium">No hay turnos para esta fecha.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        ) : (

        <div className="flex overflow-x-auto custom-scrollbar pb-6 gap-6 items-start snap-x mb-12">
            {assignedDoctors.map(doctor => {
                const docAppointments = (appointments[doctor.id] || [])
                    .filter(app => app.date === selectedDate)
                    .filter(app => app.patient.toLowerCase().includes(searchTerm.toLowerCase()));

                return (
                    <div key={doctor.id} className="min-w-[320px] max-w-[350px] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden snap-start flex-1 shrink-0 flex flex-col h-[600px]">
                        <div className="bg-slate-900 p-5 text-white flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-blue-300" />
                            </div>
                            <div>
                                <h3 className="font-black text-sm">{doctor.name}</h3>
                                <p className="text-xs text-slate-400 font-medium mb-1">{doctor.specialty}</p>
                                <p className="text-[10px] bg-white/10 inline-block px-2 py-0.5 rounded-full text-white/80 border border-white/5">{doctor.location}</p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 custom-scrollbar">
                            {docAppointments.map(app => {
                                const pendingLate = app.status === 'pending' && isLate(app.time) && selectedDate === getToday();
                                return (
                                <div key={app.id} className={`bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group ${pendingLate ? 'border-red-200' : 'border-slate-100 hover:border-blue-200'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-mono font-black text-slate-700 flex items-center gap-1 text-sm">
                                            <Clock className={`w-3 h-3 ${pendingLate ? 'text-red-400' : 'text-slate-400'}`} /> {app.time}
                                        </div>
                                        {getStatusBadge(app.status)}
                                    </div>
                                    <button onClick={() => handlePatientClick(app)} className="font-bold text-slate-800 text-sm mb-1 hover:text-blue-600 transition-colors text-left w-full focus:outline-none">
                                        {app.patient}
                                    </button>
                                    <div className="flex justify-between items-end mt-3 pt-3 border-t border-slate-50">
                                        <span className="text-xs text-slate-400 font-medium">{app.type}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleActionClick(app.id, 'reschedule')} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Calendar className="w-3.5 h-3.5"/></button>
                                            <button onClick={() => handleActionClick(app.id, 'cancel')} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><XCircle className="w-3.5 h-3.5"/></button>
                                        </div>
                                    </div>
                                </div>
                            )})}
                            {docAppointments.length === 0 && (
                                <div className="text-center py-10 text-slate-400 text-sm font-medium bg-white rounded-2xl border border-slate-100 border-dashed">
                                    Agenda vacía
                                </div>
                            )}
                        </div>
                        <div className="p-3 bg-white border-t border-slate-100">
                            <button onClick={() => handleOpenNewTurnModal(doctor.id)} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1">
                                <Plus className="w-3.5 h-3.5"/> Asignar Turno
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
        )}
      </main>
      <Footer />

      {showNewTurnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 ring-1 ring-white/10 overflow-hidden">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center sticky top-0 z-10 border-b border-slate-800">
                    <h2 className="text-xl font-black flex items-center gap-3">
                        <div className="bg-slate-800 p-2 rounded-lg">
                            {newTurnData.isReschedule ? <Calendar className="w-5 h-5 text-amber-400"/> : <Plus className="w-5 h-5 text-blue-400"/>}
                        </div> 
                        {newTurnData.isReschedule ? 'Gestionar Reasignación de Turno' : 'Registrar Turno Manual'}
                    </h2>
                    <button onClick={() => {
                        setShowNewTurnModal(false);
                        setNewTurnData({ patient: '', dni: '', cuit: '', dob: '', obraSocial: '', email: '', phone: '', date: '', time: '', type: 'Presencial', motivoConsulta: '', isReschedule: false });
                    }} className="text-white/50 hover:text-white transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700"><XCircle className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleCreateTurn} className="p-8 space-y-8">

                    <div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" /> Datos del Paciente
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Nombre Completo *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400" /></div>
                                    <input type="text" required value={newTurnData.patient} onChange={e => setNewTurnData({...newTurnData, patient: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 transition-all shadow-sm" placeholder="Ej. Juan Pérez" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">DNI *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Hash className="h-5 w-5 text-slate-400" /></div>
                                    <input type="text" required value={newTurnData.dni} onChange={handleDniChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 transition-all shadow-sm" placeholder="Nro de Documento" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Fecha de Nacimiento *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Calendar className="h-5 w-5 text-slate-400" /></div>
                                    <button 
                                        type="button"
                                        onClick={() => setShowDobCalendar(!showDobCalendar)}
                                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl outline-none font-semibold transition-all shadow-sm text-left ${newTurnData.dob ? 'text-slate-700 border-slate-200' : 'text-slate-400 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'}`}
                                    >
                                        {newTurnData.dob ? formatDateToLocale(newTurnData.dob) : 'dd / mm / aaaa'}
                                    </button>
                                    {showDobCalendar && (
                                        <CustomCalendar 
                                            selectedDate={newTurnData.dob} 
                                            onSelect={(date) => setNewTurnData({...newTurnData, dob: date})} 
                                            onClose={() => setShowDobCalendar(false)} 
                                        />
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Teléfono *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-slate-400" /></div>
                                    <input type="tel" required value={newTurnData.phone} onChange={e => setNewTurnData({...newTurnData, phone: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 transition-all shadow-sm" placeholder="Ej. 381 444 5555" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Email (Opcional)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
                                    <input type="email" value={newTurnData.email} onChange={e => setNewTurnData({...newTurnData, email: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 transition-all shadow-sm" placeholder="correo@ejemplo.com" />
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
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Obra Social</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><ShieldCheck className="h-5 w-5 text-slate-400" /></div>
                                    <select value={newTurnData.obraSocial} onChange={e => setNewTurnData({...newTurnData, obraSocial: e.target.value})} className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 appearance-none shadow-sm transition-all">
                                        {INSURANCES.map(ins => (
                                            <option key={ins} value={ins}>{ins}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">CUIT / CUIL (Opcional)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Hash className="h-5 w-5 text-slate-400" /></div>
                                    <input type="text" value={newTurnData.cuit} onChange={e => setNewTurnData({...newTurnData, cuit: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 transition-all shadow-sm" placeholder="XX-XXXXXXXX-X" />
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
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Fecha del Turno *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Calendar className="h-5 w-5 text-slate-400" /></div>
                                    <input 
                                        type="text" 
                                        readOnly
                                        required 
                                        value={newTurnData.date ? formatDateToLocale(newTurnData.date) : 'Seleccionar fecha...'} 
                                        onClick={() => setShowNewTurnDateCalendar(!showNewTurnDateCalendar)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 transition-all shadow-sm cursor-pointer hover:bg-slate-100" 
                                    />
                                    {showNewTurnDateCalendar && (
                                        <CustomCalendar 
                                            selectedDate={newTurnData.date || getToday()} 
                                            onSelect={(date) => setNewTurnData({...newTurnData, date, time: ''})} 
                                            onClose={() => setShowNewTurnDateCalendar(false)} 
                                            appointments={appointments}
                                            selectedDoctor={selectedDoctor}
                                        />
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Canal de Origen</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Activity className="h-5 w-5 text-slate-400" /></div>
                                    <select value={newTurnData.type} onChange={e => setNewTurnData({...newTurnData, type: e.target.value})} className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 appearance-none shadow-sm transition-all">
                                        <option>Presencial</option>
                                        <option>Telefónico</option>
                                    </select>
                                    <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 mt-2">
                                <label className="block text-xs font-bold text-slate-500 mb-3">Horarios Disponibles *</label>
                                {newTurnData.date ? (
                                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                        {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'].map(t => {
                                            const isOccupied = (appointments[selectedDoctor] || []).some(app => app.date === newTurnData.date && app.time === t);
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
                                        Selecciona una fecha para ver los horarios disponibles.
                                    </div>
                                )}
                            </div>

                            <div className="col-span-1 md:col-span-2 mt-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Motivo de Consulta</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><CheckCircle className="h-5 w-5 text-slate-400" /></div>
                                    <select value={newTurnData.motivoConsulta} onChange={e => setNewTurnData({...newTurnData, motivoConsulta: e.target.value})} className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 appearance-none shadow-sm transition-all">
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
      )}

      {confirmAction.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-slate-100">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${confirmAction.action === 'cancel' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}>
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">¿Estás seguro?</h3>
                <p className="text-slate-500 text-sm mb-5 text-left text-center">
                    {confirmAction.action === 'cancel' 
                        ? 'Estás por cancelar este turno. Esta acción no se puede deshacer.' 
                        : 'Marcarás que el paciente ya se encuentra en sala de espera.'}
                </p>

                {confirmAction.action === 'cancel' && (
                    <div className="space-y-4 mb-6 text-left">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Motivo de Baja *</label>
                            <select 
                                required
                                value={confirmAction.reason || ''} 
                                onChange={(e) => setConfirmAction({...confirmAction, reason: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/50 outline-none font-semibold text-slate-700 appearance-none text-sm"
                            >
                                <option value="" disabled>Seleccione un motivo</option>
                                <option value="Paciente cancela">Paciente cancela</option>
                                <option value="Ausencia médica">Ausencia médica</option>
                                <option value="Error administrativo">Error administrativo</option>
                            </select>
                        </div>

                        <label className="flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                            <div className="pt-0.5">
                                <input 
                                    type="checkbox" 
                                    checked={confirmAction.sendToSuspend || false}
                                    onChange={(e) => setConfirmAction({...confirmAction, sendToSuspend: e.target.checked})}
                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-blue-900 leading-tight">Enviar a Bolsa de Suspenso</p>
                                <p className="text-xs text-blue-700/70 mt-0.5 leading-tight">Ideal para recuperar pacientes.</p>
                            </div>
                        </label>
                    </div>
                )}

                <div className="flex gap-3">
                    <button onClick={() => setConfirmAction({ show: false, action: '', id: null, reason: '', sendToSuspend: false })} className="flex-1 py-3 bg-white text-slate-600 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Volver</button>
                    <button 
                        onClick={executeAction} 
                        disabled={confirmAction.action === 'cancel' && !confirmAction.reason}
                        className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all ${confirmAction.action === 'cancel' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 shadow-green-500/30'}`}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
      )}

      {rescheduleData.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 ring-1 ring-white/10 overflow-hidden flex flex-col">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center sticky top-0 z-10 border-b border-slate-800 shrink-0">
                    <h2 className="text-xl font-black flex items-center gap-3"><div className="bg-slate-800 p-2 rounded-lg"><Calendar className="w-5 h-5 text-blue-400"/></div> Reprogramación de Turno</h2>
                    <button type="button" onClick={() => setRescheduleData({ ...rescheduleData, show: false })} className="text-white/50 hover:text-white transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700"><XCircle className="w-6 h-6"/></button>
                </div>

                {isSelectingCustomTime ? (
                    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-slate-50">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> 
                                Seleccionar Fecha
                            </h3>
                            <div className="max-w-sm mx-auto bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <CustomCalendar inline={true} selectedDate={tempSelectedDate} onSelect={(d) => setTempSelectedDate(d)} onClose={() => {}} />
                            </div>
                        </div>

                        {tempSelectedDate && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fadeIn">
                                <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> 
                                    Seleccionar Horario Libre
                                </h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '16:00', '16:30'].map(time => {
                                        const isTimeDisabled = time === '10:00' || time === '16:30';
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
                <form onSubmit={executeReschedule} className="p-8 space-y-8 flex-1 overflow-y-auto">

                    <div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Auditoría
                        </h3>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Motivo de Reprogramación *</label>
                            <div className="relative">
                                <select required value={rescheduleData.reason} onChange={e => setRescheduleData({...rescheduleData, reason: e.target.value})} className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-semibold text-slate-700 appearance-none shadow-sm transition-all">
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
                                <button type="button" onClick={() => setRescheduleData({...rescheduleData, customDate: '2026-08-19', customTime: '10:00'})} className={`p-3 text-sm font-bold rounded-xl transition-all shadow-sm focus:ring-2 focus:ring-blue-500 border-2 ${rescheduleData.customDate === '2026-08-19' && rescheduleData.customTime === '10:00' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-blue-200'}`}>Jue 19 - 10:00hs</button>
                                <button type="button" onClick={() => setRescheduleData({...rescheduleData, customDate: '2026-08-19', customTime: '10:30'})} className={`p-3 text-sm font-bold rounded-xl transition-all shadow-sm focus:ring-2 focus:ring-blue-500 border-2 ${rescheduleData.customDate === '2026-08-19' && rescheduleData.customTime === '10:30' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-blue-200'}`}>Jue 19 - 10:30hs</button>
                                <button type="button" onClick={() => setRescheduleData({...rescheduleData, customDate: '2026-08-20', customTime: '09:00'})} className={`p-3 text-sm font-bold rounded-xl transition-all shadow-sm focus:ring-2 focus:ring-blue-500 border-2 ${rescheduleData.customDate === '2026-08-20' && rescheduleData.customTime === '09:00' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-blue-200'}`}>Vie 20 - 09:00hs</button>
                                <div className="relative">
                                    <button type="button" onClick={() => setIsSelectingCustomTime(true)} className={`w-full h-full p-3 text-sm font-bold border-2 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 ${rescheduleData.customDate && rescheduleData.customTime && !['2026-08-19', '2026-08-20'].includes(rescheduleData.customDate) ? 'bg-blue-600 text-white border-blue-600' : 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100'}`}>
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

                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
                        Confirmar Acción {rescheduleData.hasDate === 'yes' && rescheduleData.customDate && rescheduleData.customTime ? `(${formatDateToLocale(rescheduleData.customDate)} ${rescheduleData.customTime}hs)` : ''}
                    </button>
                </form>
                )}
            </div>
          </div>
      )}

      {showSuspendModal && (
          <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white shadow-2xl w-full max-w-md h-full flex flex-col overflow-hidden animate-slideLeft">
                  <div className="bg-slate-900 p-8 text-white flex justify-between items-start shrink-0 relative overflow-hidden border-b border-slate-800">
                      <div className="absolute top-0 right-0 opacity-5 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
                          <Clock className="w-48 h-48 text-white" />
                      </div>
                      <div className="relative z-10">
                          <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md mb-4 border border-white/10 shadow-inner">
                              <Clock className="w-6 h-6 text-blue-400" />
                          </div>
                          <h2 className="text-2xl font-black tracking-tight mb-1">Turnos a Reprogramar</h2>
                          <p className="text-sm text-slate-400 font-medium">Gestión de citas pendientes de nueva fecha.</p>
                      </div>
                      <button onClick={() => setShowSuspendModal(false)} className="relative z-10 text-white/50 hover:text-white bg-white/5 p-2 rounded-full transition-colors hover:bg-white/10 border border-white/5"><X className="w-5 h-5"/></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
                      {suspendedPatients.length === 0 ? (
                          <div className="text-center py-10 opacity-50">
                              <CheckCircle className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                              <p className="font-bold">No hay pacientes en suspenso.</p>
                          </div>
                      ) : (
                          suspendedPatients.map((sp, idx) => (
                              <div key={idx} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-lg ring-1 ring-black/5 hover:shadow-xl transition-all relative overflow-hidden group">
                                  <div className="flex justify-between items-start mb-5 relative">
                                      <div className="flex items-center gap-3">
                                          <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-blue-600 rounded-full flex items-center justify-center font-black shadow-sm">
                                              {sp.patient.charAt(0)}
                                          </div>
                                          <div>
                                              <h3 className="font-black text-slate-800 text-lg">{sp.patient}</h3>
                                              <p className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3"/> {sp.phone || 'Sin número'}</p>
                                          </div>
                                      </div>
                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full shadow-sm shrink-0 flex items-center gap-1">
                                          <Clock className="w-3 h-3" /> Hace 0 días
                                      </span>
                                  </div>

                                  <div className="flex gap-3 relative">
                                      <button 
                                          onClick={() => setSuspendToDelete(idx)} 
                                          className="flex items-center justify-center w-12 h-12 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all shrink-0 border border-slate-200 hover:border-red-200 shadow-sm"
                                          title="Eliminar de la lista"
                                      >
                                          <X className="w-5 h-5" />
                                      </button>
                                      <button 
                                          onClick={() => {
                                              const dniMatch = Object.keys(REGISTERED_PATIENTS).find(dni => REGISTERED_PATIENTS[dni].patient === sp.patient);
                                              const patientData = dniMatch ? { dni: dniMatch, ...REGISTERED_PATIENTS[dniMatch] } : { patient: sp.patient, phone: sp.phone };
                                              setNewTurnData(prev => ({ ...prev, ...patientData, type: sp.type || prev.type, date: selectedDate, isReschedule: true }));
                                              setShowSuspendModal(false);
                                              setShowNewTurnModal(true);
                                          }}
                                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-black py-3 rounded-2xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
                                      >
                                          <Calendar className="w-4 h-4"/> Agendar Ahora
                                      </button>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}

      {suspendToDelete !== null && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-slate-100 animate-scaleIn">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-100 text-red-500">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">¿Eliminar paciente?</h3>
                <p className="text-slate-500 text-sm mb-6">
                    Estás por quitar a <strong className="text-slate-700">{suspendedPatients[suspendToDelete]?.patient}</strong> de la lista de reprogramación. Esta acción es irreversible.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setSuspendToDelete(null)}
                        className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => {
                            setSuspendedPatients(prev => prev.filter((_, i) => i !== suspendToDelete));
                            setSuspendToDelete(null);
                            setNotificationMsg('Paciente removido de la lista de reprogramación');
                            setShowNotificationModal(true);
                            setTimeout(() => setShowNotificationModal(false), 3000);
                        }}
                        className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
                    >
                        Sí, eliminar
                    </button>
                </div>
            </div>
        </div>
      )}

      {showNotificationModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3">Notificación Enviada</h3>
                <p className="text-slate-500 font-medium mb-8">{notificationMsg}</p>
                <button onClick={() => setShowNotificationModal(false)} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-colors">Entendido</button>
            </div>
        </div>
      )}

      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-[500px]">
                <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600"><User className="w-5 h-5"/></div>
                        <div>
                            <h2 className="font-bold">{currentDoctor.name}</h2>
                            <p className="text-xs text-green-400 font-bold flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span> En línea</p>
                        </div>
                    </div>
                    <button onClick={() => setShowChatModal(false)} className="text-white/70 hover:text-white"><XCircle className="w-6 h-6"/></button>
                </div>
                <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4">
                    <div className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest my-4">Hoy</div>
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]">
                        <p className="text-slate-700 text-sm font-medium">Hola, por favor bloqueame la agenda a partir de las 13hs, tuve una urgencia.</p>
                        <span className="text-[10px] text-slate-400 font-bold mt-1 block">08:45 AM</span>
                    </div>
                    <div className="bg-pink-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] ml-auto">
                        <p className="text-sm font-medium">¡Entendido Doc! Ya cancelo los turnos de la tarde y notifico a los pacientes.</p>
                        <span className="text-[10px] text-pink-200 font-bold mt-1 block text-right">08:47 AM</span>
                    </div>
                </div>
                <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
                    <input type="text" placeholder="Escribe un mensaje..." className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-pink-400" />
                    <button className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center shrink-0 hover:bg-slate-900 transition-colors">
                        <Send className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
      )}

      {selectedPatientProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-white/10 flex flex-col max-h-[90vh]">
                <div className="bg-gradient-to-b from-blue-900 to-slate-900 p-6 text-white text-center relative shrink-0">
                    <button onClick={() => setSelectedPatientProfile(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20"><X className="w-5 h-5"/></button>
                    <div className="w-20 h-20 bg-blue-500/20 rounded-full mx-auto flex items-center justify-center border-4 border-white/10 shadow-lg mb-4">
                        <User className="w-10 h-10 text-blue-300" />
                    </div>
                    <h2 className="text-2xl font-black">{selectedPatientProfile.patient}</h2>
                </div>
                <div className="flex-1 bg-slate-50 p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm shrink-0">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Información de Contacto</h3>
                        <div className="space-y-3">
                            {selectedPatientProfile.dni && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center shrink-0"><Hash className="w-4 h-4"/></div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold">DNI</p>
                                        <p className="text-sm font-bold text-slate-700 font-mono">{selectedPatientProfile.dni}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0"><Phone className="w-4 h-4"/></div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold">Teléfono</p>
                                    <p className="text-sm font-bold text-slate-700">{selectedPatientProfile.phone || 'No registrado'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0"><Mail className="w-4 h-4"/></div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold">Email</p>
                                    <p className="text-sm font-bold text-slate-700">{selectedPatientProfile.email || 'No registrado'}</p>
                                </div>
                            </div>
                            {selectedPatientProfile.dob && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center shrink-0"><Calendar className="w-4 h-4"/></div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold">Fecha de Nacimiento</p>
                                        <p className="text-sm font-bold text-slate-700">
                                            {selectedPatientProfile.dob ? selectedPatientProfile.dob.split('-').reverse().join('/') : ''}
                                            <span className="text-slate-400 font-medium ml-2">({Math.floor((new Date() - new Date(selectedPatientProfile.dob).getTime()) / 3.15576e+10)} años)</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {(selectedPatientProfile.obraSocial || selectedPatientProfile.cuit) && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Cobertura y Facturación</h3>
                        <div className="space-y-3">
                            {selectedPatientProfile.obraSocial && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0"><ShieldCheck className="w-4 h-4"/></div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold">Obra Social</p>
                                        <p className="text-sm font-bold text-slate-700">{selectedPatientProfile.obraSocial}</p>
                                    </div>
                                </div>
                            )}
                            {selectedPatientProfile.cuit && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0"><Hash className="w-4 h-4"/></div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold">CUIT / CUIL</p>
                                        <p className="text-sm font-bold text-slate-700 font-mono">{selectedPatientProfile.cuit}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    )}

                    {selectedPatientProfile.nextTurn && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm shrink-0">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Turno Relacionado</h3>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <div className="flex justify-between items-start mb-2">
                                <p className="font-bold text-slate-800 text-sm flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400"/> {selectedPatientProfile.nextTurn.time}hs</p>
                                {getStatusBadge(selectedPatientProfile.nextTurn.status)}
                            </div>
                            <p className="text-xs text-slate-500 font-medium mb-1"><Calendar className="w-3 h-3 inline mr-1"/> {formatDateToLocale(selectedPatientProfile.nextTurn.date)}</p>
                            <p className="text-xs text-slate-500 font-medium"><Activity className="w-3 h-3 inline mr-1"/> Canal: {selectedPatientProfile.nextTurn.type}</p>
                            {selectedPatientProfile.nextTurn.motivoConsulta && (
                                <p className="text-xs text-slate-500 font-medium mt-1 pt-1 border-t border-slate-200"><FileText className="w-3 h-3 inline mr-1"/> Motivo: {selectedPatientProfile.nextTurn.motivoConsulta}</p>
                            )}
                        </div>
                    </div>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default SecretaryDashboard;
