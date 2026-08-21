import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { 
  Calendar, Clock, User, FileText, CheckCircle, XCircle, 
  AlertCircle, Upload, X, Paperclip, Stethoscope,
  Megaphone, ClipboardList, Save
} from 'lucide-react';
const getToday = () => new Date().toISOString().split('T')[0];
const getFutureDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};
const initialAppointments = [
  { 
    id: 1, 
    date: getToday(),
    time: '09:00', 
    patient: 'Lucas Gabriel Lazarte', 
    status: 'attending', 
    img: '/img/patients/masc4.jpg',
    age: 24,
    historyId: 'HC-45275'
  },
  { 
    id: 2, 
    date: getToday(),
    time: '09:30', 
    patient: 'Luis Coronel', 
    status: 'waiting', 
    img: '/img/patients/masc1.jpg',
    age: 32,
    historyId: 'HC-98212'
  },
  {
    id: 4, 
    date: getToday(),
    time: '08:30', 
    patient: 'Ramiro Vides', 
    status: 'finished', 
    img: '/img/patients/masc2.avif',
    age: 45,
    historyId: 'HC-33421'
  },
  { 
    id: 3, 
    date: getFutureDate(5), 
    time: '10:00', 
    patient: 'Carlos Rodriguez', 
    status: 'pending',
    img: '/img/patients/masc3.jpg',
    age: 58,
    historyId: 'HC-12399'
  },
  {
    id: 6, 
    date: getFutureDate(12), 
    time: '11:30', 
    patient: 'Sofia Bermudez', 
    status: 'pending',
    img: '/img/patients/fem1.jpg',
    age: 29,
    historyId: 'HC-99887'
  },
  {
    id: 5, 
    date: getFutureDate(35), 
    time: '11:00', 
    patient: 'Pedro Sanchez', 
    status: 'pending',
    img: '/img/patients/masc5.jpg',
    age: 60,
    historyId: 'HC-55112'
  }
];
const styles = `
  @keyframes gradient-xy {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient-xy 15s ease infinite;
  }
`;
const MedicalReportModal = ({ isOpen, onClose, appointment, onSave }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  if (!isOpen || !appointment) return null;
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type.split('/')[1]?.toUpperCase() || 'FILE'
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) {
        const newFiles = Array.from(e.dataTransfer.files).map(file => ({
            file, name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + ' MB', type: file.type.split('/')[1]?.toUpperCase() || 'FILE'
        }));
        setFiles(prev => [...prev, ...newFiles]);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };
  const confirmSave = () => {
    setShowConfirm(false);
    setShowSuccess(true);
    setTimeout(() => {
        onSave(appointment.id, { diagnosis, prescription, files });
        setDiagnosis(''); setPrescription(''); setFiles([]);
        setShowSuccess(false);
    }, 1500);
  };
  const cancelConfirm = () => {
    setShowConfirm(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/10">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-800 p-8 flex justify-between items-start shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          <div className="text-white relative z-10">
            <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight">
              <ClipboardList className="w-7 h-7 text-blue-300"/> Cierre de Consulta
            </h2>
            <div className="mt-3 flex items-center gap-4 text-blue-100 text-sm font-medium">
              <span className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm"><User className="w-4 h-4"/> {appointment.patient}</span>
              <span className="bg-blue-500/30 border border-blue-400/30 px-3 py-1.5 rounded-full font-mono">{appointment.historyId}</span>
            </div>
          </div>
          <button onClick={onClose} className="relative z-10 text-blue-200 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
        {showSuccess ? (
            <div className="p-16 flex flex-col items-center justify-center text-center animate-fadeIn bg-slate-50 flex-1">
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-2">¡Consulta Guardada!</h3>
                <p className="text-slate-500 text-lg">La historia clínica ha sido actualizada correctamente.</p>
            </div>
        ) : showConfirm ? (
            <div className="p-16 flex flex-col items-center justify-center text-center animate-fadeIn bg-slate-50 flex-1">
                <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-2">¿Estás seguro?</h3>
                <p className="text-slate-500 text-lg max-w-md mx-auto mb-8">Estás por cerrar esta consulta médica. Una vez guardada, no podrás borrarla, solo asentar nuevas evoluciones.</p>
                <div className="flex gap-4">
                    <button onClick={cancelConfirm} className="px-8 py-3 rounded-xl text-slate-600 font-bold bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                        Volver a Editar
                    </button>
                    <button onClick={confirmSave} className="px-8 py-3 rounded-xl bg-yellow-500 text-white font-bold hover:bg-yellow-600 shadow-lg shadow-yellow-500/30 transition-all flex items-center gap-2 hover:-translate-y-0.5">
                        Sí, Guardar Definitivamente
                    </button>
                </div>
            </div>
        ) : (
            <>
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                <form id="report-form" onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                    <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600"/> Diagnóstico / Evolución
                    </label>
                    <textarea 
                        required 
                        className="w-full bg-white border border-slate-200 rounded-2xl p-5 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none shadow-sm transition-all min-h-[140px] text-slate-700" 
                        placeholder="Detallá el cuadro clínico, síntomas y observaciones..." 
                        value={diagnosis} 
                        onChange={e => setDiagnosis(e.target.value)} 
                    />
                    </div>
                    <div className="space-y-3">
                    <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <Paperclip className="w-5 h-5 text-blue-600"/> Archivos Adjuntos
                    </label>
                    <div 
                        onDragOver={handleDragOver} 
                        onDragLeave={handleDragLeave} 
                        onDrop={handleDrop} 
                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group ${isDragging ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-blue-50/30'}`}
                    >
                        <input type="file" id="file-upload" multiple className="hidden" onChange={handleFileChange} />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                            <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                                <Upload className="w-8 h-8" />
                            </div>
                            <p className="text-base text-slate-600 font-medium">
                                <span className="text-blue-600 font-bold hover:underline">Seleccioná archivos</span> o arrastralos aquí
                            </p>
                            <p className="text-xs text-slate-400 mt-2 font-medium">Soporta PDF, JPG, PNG (Max 10MB)</p>
                        </label>
                    </div>
                    {files.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            {files.map((f, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center shrink-0 text-blue-600 font-black text-xs border border-blue-100/50 shadow-inner">
                                            {f.type}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{f.name}</p>
                                            <p className="text-xs text-slate-400 font-medium mt-0.5">{f.size}</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 p-2 rounded-full transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    </div>
                    <div className="space-y-3">
                    <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-500"/> Receta / Indicaciones
                    </label>
                    <textarea 
                        className="w-full bg-amber-50/30 border border-amber-200/60 rounded-2xl p-5 focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none shadow-sm transition-all min-h-[100px] text-slate-700" 
                        placeholder="Prescripciones, reposo, o estudios solicitados..." 
                        value={prescription} 
                        onChange={e => setPrescription(e.target.value)} 
                    />
                    </div>
                </form>
                </div>
                <div className="bg-white p-6 border-t border-slate-100 flex justify-end gap-4 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] relative z-20">
                <button onClick={onClose} className="px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors">
                    Cancelar
                </button>
                <button type="submit" form="report-form" className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 hover:-translate-y-0.5">
                    <Save className="w-5 h-5" /> Guardar Consulta
                </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};
export default function DoctorTurns() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCallPatient = (id) => {
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: 'attending' } : app));
  };
  const handleOpenReport = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };
  const handleFinishAppointment = (id, data) => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: 'finished' } : app));
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };
  const today = getToday();
  const groupedAppointments = {
      today: appointments.filter(a => a.date === today),
      upcoming: appointments.filter(a => a.date > today).sort((a, b) => new Date(a.date) - new Date(b.date))
  };
  const formatDate = (dateString) => {
      const date = new Date(dateString);
      const todayDate = new Date();
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      if (dateString === today) return 'Hoy';
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', weekday: 'long' });
  };
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Navbar />
      <MedicalReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} appointment={selectedAppointment} onSave={handleFinishAppointment} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <style>{styles}</style>
        <div className="relative rounded-3xl overflow-hidden mb-12 bg-blue-900 animate-gradient shadow-2xl">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none"></div>
            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="text-white">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
                        Bienvenido, Dr. Zelarayan
                    </h1>
                    <p className="text-blue-200 text-lg max-w-xl">
                        Acá tenés un resumen rápido de tu agenda médica de hoy.
                    </p>
                </div>
                <div className="flex gap-4 self-start md:self-auto">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center flex flex-col items-center justify-center min-w-[110px] hover:-translate-y-1 hover:shadow-lg hover:bg-white/20 transition-all duration-300 cursor-default">
                        <div className="bg-white/20 p-2 rounded-xl mb-3">
                            <AlertCircle className="w-6 h-6 text-orange-300" />
                        </div>
                        <span className="text-3xl font-black text-white leading-none mb-1">
                            {appointments.filter(a => a.status === 'waiting' && a.date === today).length}
                        </span>
                        <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">En Espera</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center flex flex-col items-center justify-center min-w-[110px] hover:-translate-y-1 hover:shadow-lg hover:bg-white/20 transition-all duration-300 cursor-default">
                        <div className="bg-white/20 p-2 rounded-xl mb-3">
                            <CheckCircle className="w-6 h-6 text-green-300" />
                        </div>
                        <span className="text-3xl font-black text-white leading-none mb-1">
                            {appointments.filter(a => a.status === 'finished' && a.date === today).length}
                        </span>
                        <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Atendidos</span>
                    </div>
                    <div className="hidden md:flex bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center flex-col items-center justify-center min-w-[110px] hover:-translate-y-1 hover:shadow-lg hover:bg-white/20 transition-all duration-300 cursor-default">
                        <div className="bg-white/20 p-2 rounded-xl mb-3">
                            <Stethoscope className="w-6 h-6 text-blue-200" />
                        </div>
                        <span className="text-3xl font-black text-white leading-none mb-1">
                            {appointments.filter(a => a.date === today).length}
                        </span>
                        <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Total Hoy</span>
                    </div>
                </div>
            </div>
        </div>
        {groupedAppointments.today.length > 0 && (
            <div className="mb-12 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                    <div className="w-2 h-8 rounded-full bg-blue-600"></div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Turnos de Hoy</h3>
                </div>
                <div className="space-y-4">
                    {groupedAppointments.today.map(app => (
                        <AppointmentCard 
                            key={app.id} 
                            app={app} 
                            onCall={handleCallPatient} 
                            onFinish={handleOpenReport} 
                        />
                    ))}
                </div>
            </div>
        )}
        {groupedAppointments.upcoming.length > 0 && (
            <div className="animate-fadeIn mt-12">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                    <div className="w-2 h-8 rounded-full bg-slate-400"></div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Agenda Futura</h3>
                </div>
                <div className="space-y-4">
                    {groupedAppointments.upcoming.map(app => (
                        <AppointmentCard 
                            key={app.id} 
                            app={app} 
                            isFuture={true}
                            dateLabel={formatDate(app.date)}
                            onCall={handleCallPatient} 
                            onFinish={handleOpenReport} 
                        />
                    ))}
                </div>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
const AppointmentCard = ({ app, onCall, onFinish, isFuture, dateLabel }) => {
    const statusConfig = {
        pending: { label: 'Pendiente', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock },
        waiting: { label: 'En Espera', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle, rowClass: 'border-l-4 border-l-orange-400 ring-1 ring-orange-100' },
        attending: { label: 'Atendiendo', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Stethoscope, rowClass: 'ring-2 ring-indigo-500 shadow-lg scale-[1.01] z-10 relative' },
        finished: { label: 'Finalizado', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, rowClass: 'opacity-60 bg-gray-50' },
        cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, rowClass: 'opacity-50 grayscale' },
    };
    const config = statusConfig[app.status] || statusConfig.pending;
    const StatusIcon = config.icon;
    return (
        <div className={`bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300 border border-gray-100 overflow-hidden transition-all flex flex-col md:flex-row ${config.rowClass || ''}`}>
            <div className={`p-6 flex flex-col items-center justify-center md:w-36 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 ${app.status === 'attending' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-500'}`}>
                {isFuture && <span className="text-xs font-bold uppercase mb-1 text-center leading-tight">{dateLabel}</span>}
                <span className="text-2xl font-bold">{app.time}</span>
                {!isFuture && <span className="text-xs font-bold uppercase tracking-wider">hs</span>}
            </div>
            <div className="p-6 flex-1 flex flex-col justify-center">
                    <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <img src={app.img} alt={app.patient} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{app.patient}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                                    {app.historyId}
                                </span>
                                <span className="text-xs text-gray-400">• {app.age} años</span>
                            </div>
                        </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1.5"/> {config.label}
                    </span>
                    </div>
            </div>
            <div className="p-4 md:p-6 flex items-center justify-end md:w-48 gap-2 border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50/30">
                {!isFuture && app.status === 'waiting' && (
                    <button onClick={() => onCall(app.id)} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition shadow-md animate-pulse">
                        <Megaphone className="w-4 h-4" /> Llamar
                    </button>
                )}
                {!isFuture && app.status === 'attending' && (
                    <button onClick={() => onFinish(app)} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition shadow-md">
                        <FileText className="w-4 h-4" /> Finalizar
                    </button>
                )}
                {(isFuture || app.status === 'pending') && <span className="text-xs text-gray-400 font-medium text-center w-full">Programado</span>}
                {app.status === 'finished' && <span className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Completado</span>}
            </div>
        </div>
    );
};