import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { 
  Users, Search, Plus, FileText, Activity, 
  Upload, X, Paperclip, Save, ChevronRight, 
  Calendar, Phone, Mail, MapPin, Clock, File, Printer, HeartPulse,
  User, CheckCircle, AlertCircle, ClipboardList
} from 'lucide-react';
const initialPatients = [
  { 
    id: 1, 
    name: 'Lucas Gabriel Lazarte', 
    dni: '45.275.212', 
    age: 24, 
    lastVisit: '2025-10-20',
    historyId: 'HC-45275',
    phone: '3863-409588',
    email: 'lglucasgabriel@gmail.com',
    img: '/img/patients/masc4.jpg',
    status: 'active',
    history: [
        { id: 101, date: '2025-10-20', type: 'Consulta', diagnosis: 'Control rutinario. Presión arterial normal (12/8). Se solicita ergometría.', doctor: 'Dr. Juan Pérez', files: [] },
        { id: 102, date: '2025-08-15', type: 'Urgencia', diagnosis: 'Dolor torácico leve. Electrocardiograma sin particularidades. Se indica reposo.', doctor: 'Dra. Guardia', files: [{name: 'ECG-15-08.pdf', size: '1.2 MB'}] }
    ]
  },
  { 
    id: 2, 
    name: 'Priscila Frias', 
    dni: '32.123.456', 
    age: 32, 
    lastVisit: '2025-11-01',
    historyId: 'HC-98212',
    phone: '381-5551234',
    email: 'priscila@email.com',
    img: '/img/patients/fem1.jpg',
    status: 'active',
    history: [
        { id: 201, date: '2025-11-01', type: 'Control', diagnosis: 'Evolución favorable. Se suspende medicación antibiótica.', doctor: 'Dr. Juan Pérez', files: [] }
    ]
  },
  { 
    id: 3, 
    name: 'Garcia Matar', 
    dni: '20.987.654', 
    age: 58, 
    lastVisit: '2025-09-15',
    historyId: 'HC-12399',
    phone: '381-4449876',
    email: 'fran.gamer.conquistador.de.nenas@email.com',
    img: '/img/patients/masc5.jpg',
    status: 'active',
    history: []
  },
];
const HistoryModal = ({ isOpen, onClose, patient }) => {
    if (!isOpen || !patient) return null;
    return (
        <>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn print:hidden">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/10">
                <div className="bg-gradient-to-r from-blue-900 to-indigo-800 p-8 flex justify-between items-start shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="text-white relative z-10">
                        <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                            <FileText className="w-7 h-7 text-blue-300"/> Historia Clínica Digital
                        </h2>
                        <div className="mt-3 flex items-center gap-4 text-blue-100 text-sm font-medium">
                            <span className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm"><User className="w-4 h-4"/> {patient.name}</span>
                            <span className="bg-blue-500/30 border border-blue-400/30 px-3 py-1.5 rounded-full font-mono">{patient.historyId}</span>
                            <span className="bg-white/5 px-3 py-1.5 rounded-full">{patient.age} años</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 text-blue-200 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                    {patient.history && patient.history.length > 0 ? (
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-blue-200 before:to-transparent">
                            {patient.history.map((entry) => (
                                <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 bg-blue-500 shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110 duration-300">
                                        <Activity className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-black text-slate-800 text-lg uppercase tracking-tight">{entry.type}</span>
                                            <time className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">{new Date(entry.date).toLocaleDateString()}</time>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                            {entry.diagnosis}
                                        </p>
                                        {entry.files && entry.files.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-100/60">
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Adjuntos</p>
                                                <div className="flex gap-2 flex-wrap">
                                                    {entry.files.map((f, i) => (
                                                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer">
                                                            <Paperclip className="w-3.5 h-3.5 text-blue-500"/> {f.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
                                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                <Users className="w-3 h-3 text-slate-500"/>
                                            </div>
                                            {entry.doctor}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 opacity-50 flex flex-col items-center">
                            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                                <FileText className="w-10 h-10 text-slate-400"/>
                            </div>
                            <p className="text-slate-500 font-bold text-lg">Aún no hay registros en la historia clínica.</p>
                        </div>
                    )}
                </div>
                <div className="bg-white p-6 border-t border-slate-100 flex justify-end gap-4 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] relative z-20">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors">
                        Cerrar
                    </button>
                    <button onClick={() => window.print()} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 hover:-translate-y-0.5">
                        <Printer className="w-5 h-5"/> Imprimir Historia Clínica
                    </button>
                </div>
            </div>
        </div>
        <div className="hidden print:block absolute top-0 left-0 w-full bg-white z-[9999] text-black px-8 py-10">
            <div className="flex items-center justify-between border-b-2 border-blue-800 pb-6 mb-8 mt-4">
                <div className="flex items-center gap-3">
                    <HeartPulse className="w-12 h-12 text-blue-700" />
                    <div>
                        <h1 className="text-3xl font-black text-blue-900 tracking-tighter">S.A.M.S.A</h1>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Sistema de Administración Médica</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fecha de Emisión</p>
                    <p className="text-xl font-bold text-slate-800">{new Date().toLocaleDateString('es-AR')}</p>
                </div>
            </div>
            <h2 className="text-center text-2xl font-black text-slate-800 uppercase tracking-widest mb-10">Historia Clínica Digital</h2>
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 mb-10">
                <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-slate-200 pb-2">Información del Paciente</h3>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Nombre Completo</p>
                        <p className="font-bold text-lg text-slate-800">{patient.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Nº Historia Clínica</p>
                        <p className="font-bold text-lg text-slate-800">{patient.historyId}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Documento (DNI)</p>
                        <p className="font-medium text-slate-700 text-base">{patient.dni}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Edad Registrada</p>
                        <p className="font-medium text-slate-700 text-base">{patient.age} años</p>
                    </div>
                </div>
            </div>
            <div className="mb-12">
                <h3 className="text-xl font-bold text-blue-900 mb-6 border-b-2 border-blue-100 pb-2">Registro de Evoluciones Clínicas</h3>
                {patient.history && patient.history.length > 0 ? (
                    <div className="space-y-6">
                        {patient.history.map((entry) => (
                            <div key={entry.id} className="border border-slate-300 rounded-xl p-5 break-inside-avoid">
                                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                                    <h4 className="font-bold text-lg text-slate-800 uppercase tracking-wide">{entry.type}</h4>
                                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
                                        {new Date(entry.date).toLocaleDateString('es-AR')}
                                    </span>
                                </div>
                                <p className="text-base text-slate-700 leading-relaxed mb-4">{entry.diagnosis}</p>
                                <p className="text-sm font-bold text-slate-500 italic">Profesional a cargo: {entry.doctor}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 italic text-center py-10 bg-slate-50 rounded-xl">No hay registros clínicos en el sistema para este paciente.</p>
                )}
            </div>
            <div className="border-t-4 border-slate-200 pt-6 mt-16 text-center break-inside-avoid">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Documento Oficial S.A.M.S.A</p>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-3xl mx-auto">
                    Este documento es copia fiel e inalterada de la Historia Clínica Digital administrada por el Sistema S.A.M.S.A.
                    Se emite a petición de las autoridades médicas correspondientes. Cualquier alteración de los datos aquí 
                    impresos invalida de forma inmediata su legitimidad. Protegido bajo las leyes de confidencialidad médico-paciente vigentes.
                </p>
            </div>
        </div>
        </>
    );
};
const MedicalReportModal = ({ isOpen, onClose, patient, onSave }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  if (!isOpen || !patient) return null;
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
        onSave(patient.id, { diagnosis, prescription, files, date: new Date().toISOString() });
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
              <Activity className="w-7 h-7 text-blue-300"/> Nueva Evolución Clínica
            </h2>
            <div className="mt-3 flex items-center gap-4 text-blue-100 text-sm font-medium">
              <span className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm"><User className="w-4 h-4"/> {patient.name}</span>
              <span className="bg-blue-500/30 border border-blue-400/30 px-3 py-1.5 rounded-full font-mono">{patient.historyId}</span>
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
                <h3 className="text-3xl font-black text-slate-800 mb-2">¡Evolución Guardada!</h3>
                <p className="text-slate-500 text-lg">La historia clínica ha sido actualizada correctamente.</p>
            </div>
        ) : showConfirm ? (
            <div className="p-16 flex flex-col items-center justify-center text-center animate-fadeIn bg-slate-50 flex-1">
                <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-2">¿Estás seguro?</h3>
                <p className="text-slate-500 text-lg max-w-md mx-auto mb-8">Estás por asentar una nueva evolución médica. Una vez guardada, no podrás borrarla o modificarla por seguridad médica.</p>
                <div className="flex gap-4">
                    <button type="button" onClick={cancelConfirm} className="px-8 py-3 rounded-xl text-slate-600 font-bold bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                        Volver a Editar
                    </button>
                    <button type="button" onClick={confirmSave} className="px-8 py-3 rounded-xl bg-yellow-500 text-white font-bold hover:bg-yellow-600 shadow-lg shadow-yellow-500/30 transition-all flex items-center gap-2 hover:-translate-y-0.5">
                        Sí, Guardar Evolución
                    </button>
                </div>
            </div>
        ) : (
            <>
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                <form id="evolution-form" onSubmit={handleSubmit} className="space-y-8">
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
                <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors">
                    Cancelar
                </button>
                <button type="submit" form="evolution-form" className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 hover:-translate-y-0.5">
                    <Save className="w-5 h-5" /> Guardar Evolución
                </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};
const AddPatientModal = ({ isOpen, onClose, onAdd }) => {
    const [newPatient, setNewPatient] = useState({ name: '', dni: '', email: '', phone: '' });
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    if (!isOpen) return null;
    const handleSubmit = (e) => {
        e.preventDefault();
        setShowConfirm(true);
    };
    const confirmSave = () => {
        setShowConfirm(false);
        setShowSuccess(true);
        setTimeout(() => {
            onAdd({ ...newPatient, id: Date.now(), age: 'N/A', historyId: `HC-${Math.floor(Math.random()*10000)}`, lastVisit: '-', img: 'https://i.pravatar.cc/150?u=new', history: [] });
            setNewPatient({ name: '', dni: '', email: '', phone: '' });
            setShowSuccess(false);
        }, 1500);
    };
    const cancelConfirm = () => setShowConfirm(false);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-white/10">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center gap-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                        <User className="w-6 h-6 text-white"/>
                    </div>
                    <h2 className="text-xl font-black text-white tracking-tight relative z-10">Registrar Paciente</h2>
                </div>
                {showSuccess ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center animate-fadeIn bg-slate-50">
                        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">¡Paciente Registrado!</h3>
                        <p className="text-slate-500 text-sm">El paciente fue añadido al sistema.</p>
                    </div>
                ) : showConfirm ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center animate-fadeIn bg-slate-50">
                        <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">¿Estás seguro?</h3>
                        <p className="text-slate-500 text-sm mb-8">Vas a registrar un nuevo paciente en la base de datos de SAMSA.</p>
                        <div className="flex gap-3 w-full">
                            <button type="button" onClick={cancelConfirm} className="flex-1 py-3 rounded-xl text-slate-600 font-bold bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                                Volver
                            </button>
                            <button type="button" onClick={confirmSave} className="flex-1 py-3 rounded-xl bg-yellow-500 text-white font-bold hover:bg-yellow-600 shadow-lg shadow-yellow-500/30 transition-all hover:-translate-y-0.5">
                                Confirmar
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-slate-50/50">
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Nombre Completo</label>
                            <input required placeholder="Ej: Juan Pérez" className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Documento (DNI)</label>
                            <input required placeholder="Ej: 30.123.456" className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm" value={newPatient.dni} onChange={e => setNewPatient({...newPatient, dni: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Email</label>
                                <input type="email" placeholder="Opcional" className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm" value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Teléfono</label>
                                <input placeholder="Opcional" className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm" value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-6 border-t border-slate-100">
                            <button type="button" onClick={onClose} className="flex-1 py-3 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Cancelar</button>
                            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5">Guardar Paciente</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
export default function DoctorPatients() {
  const [patients, setPatients] = useState(initialPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const filteredPatients = patients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.dni.includes(searchTerm)
  );
  const handleOpenReport = (patient) => {
      setSelectedPatient(patient);
      setIsReportModalOpen(true);
  };
  const handleOpenHistory = (patient) => {
      setSelectedPatient(patient);
      setIsHistoryModalOpen(true);
  }
  const handleSaveReport = (patientId, reportData) => {
      const newEntry = {
          id: Date.now(),
          date: new Date().toISOString(),
          type: 'Evolución',
          diagnosis: reportData.diagnosis,
          doctor: 'Dr. Usuario Actual', 
          files: reportData.files
      };
      setPatients(prev => prev.map(p => 
          p.id === patientId 
          ? { ...p, lastVisit: new Date().toISOString().split('T')[0], history: [newEntry, ...(p.history || [])] } 
          : p
      ));
      setIsReportModalOpen(false);
  };
  const handleAddPatient = (newPatient) => {
      setPatients(prev => [newPatient, ...prev]);
      setIsAddModalOpen(false);
  };
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="print:hidden">
        <Navbar />
      </div>
      <MedicalReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        patient={selectedPatient} 
        onSave={handleSaveReport} 
      />
      <HistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        patient={selectedPatient}
      />
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPatient}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            <div className="relative z-10 w-full md:w-auto text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-3 tracking-tight">
                    <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200">
                        <Users className="w-7 h-7 text-white"/>
                    </div>
                    Mis Pacientes
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Gestión integral de historias clínicas y evoluciones.</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto relative z-10">
                <div className="relative flex-1 md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o DNI..." 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 shrink-0 hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Nuevo Paciente</span>
                </button>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPatients.map((patient) => (
                <div key={patient.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="flex items-start gap-5 relative z-10">
                        <div className="relative shrink-0">
                            <img src={patient.img} alt={patient.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-slate-50 shadow-sm group-hover:border-blue-50 transition-colors" />
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm" title="Activo"></div>
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 truncate group-hover:text-blue-600 transition-colors">{patient.name}</h3>
                                    <p className="text-sm text-slate-400 font-mono font-medium mt-0.5 tracking-wide">DNI: {patient.dni}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-4 text-sm font-medium">
                                <div className="flex items-center gap-2 truncate text-slate-600" title="Última visita">
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                        <Calendar className="w-3.5 h-3.5 text-blue-500"/>
                                    </div>
                                    <span className="text-xs text-slate-400 uppercase font-black mr-1">Última:</span> 
                                    <span className="font-bold text-slate-700">{patient.lastVisit}</span>
                                </div>
                                <div className="flex items-center gap-2 truncate text-slate-600" title="Historia Clínica">
                                    <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                                        <FileText className="w-3.5 h-3.5 text-purple-500"/>
                                    </div>
                                    <span className="text-xs text-slate-400 uppercase font-black mr-1">HC:</span>
                                    <span className="font-mono text-slate-700">{patient.historyId}</span>
                                </div>
                                <div className="flex items-center gap-2 truncate text-slate-600" title="Teléfono">
                                    <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                        <Phone className="w-3.5 h-3.5 text-green-500"/>
                                    </div>
                                    {patient.phone}
                                </div>
                                <div className="flex items-center gap-2 truncate text-slate-600" title="Email">
                                    <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                        <Mail className="w-3.5 h-3.5 text-orange-500"/>
                                    </div>
                                    {patient.email || "-"}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-5 border-t border-slate-100 flex gap-4 relative z-10">
                        <button 
                            onClick={() => handleOpenReport(patient)}
                            className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <Activity className="w-4 h-4"/> Nueva Evolución
                        </button>
                        <button 
                            onClick={() => handleOpenHistory(patient)}
                            className="flex-1 bg-slate-50 text-slate-700 hover:bg-slate-800 hover:text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn"
                        >
                            Ver Historia <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"/>
                        </button>
                    </div>
                </div>
            ))}
        </div>
        {filteredPatients.length === 0 && (
            <div className="text-center py-20">
                <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No se encontraron pacientes.</p>
                <p className="text-slate-400 text-sm">Probá buscando por otro nombre o DNI.</p>
            </div>
        )}
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}