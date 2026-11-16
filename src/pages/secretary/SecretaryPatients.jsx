import React, { useState, useId } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  Users, Search, Plus, Calendar, Phone, Mail, FileText, CheckCircle, AlertCircle, Edit, Save, UserPlus
} from 'lucide-react';
import { useTimeouts } from '../../hooks/useTimeouts';
import { SecretaryModalOverlay, SecretaryModalCard, SecretaryModalHeader } from './dashboard/SecretaryModal';

const initialPatients = [
  {
    id: 1,
    name: 'Lucas Gabriel Lazarte',
    dni: '40.111.222',
    age: 24,
    lastVisit: '2025-10-20',
    historyId: 'HC-40111',
    phone: '381-0000001',
    email: 'lucas.lazarte@example.com',
    img: '/img/patients/masc4.jpg',
    status: 'active'
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
    status: 'active'
  },
  {
    id: 3,
    name: 'Garcia Matar',
    dni: '20.987.654',
    age: 58,
    lastVisit: '2025-09-15',
    historyId: 'HC-12399',
    phone: '381-4449876',
    email: 'fran@email.com',
    img: '/img/patients/masc5.jpg',
    status: 'active'
  },
];

// Estilos compartidos de los formularios (mismos que la reserva de turno).
const labelClass = 'text-sm font-bold text-gray-700 mb-1.5 ml-1 block';
const inputClass = 'w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-700';

const AddPatientModal = ({ isOpen, onClose, onAdd }) => {
    const fieldId = useId();
    const { schedule } = useTimeouts();
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
        schedule(() => {
            onAdd({ ...newPatient, id: Date.now(), age: 'N/A', historyId: `HC-${Math.floor(Math.random()*10000)}`, lastVisit: '-', img: 'https://i.pravatar.cc/150?u=new' });
            setNewPatient({ name: '', dni: '', email: '', phone: '' });
            setShowSuccess(false);
        }, 1500);
    };

    const cancelConfirm = () => setShowConfirm(false);

    return (
        <SecretaryModalOverlay onClose={onClose} labelledBy={`${fieldId}-title`}>
            <SecretaryModalCard maxWidth="max-w-md">
                <SecretaryModalHeader icon={UserPlus} title="Registrar Paciente" onClose={onClose} titleId={`${fieldId}-title`} />

                {showSuccess ? (
                    <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center animate-fadeIn">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">¡Paciente Registrado!</h3>
                        <p className="text-gray-500 text-sm">El paciente fue añadido al sistema.</p>
                    </div>
                ) : showConfirm ? (
                    <div className="p-6 sm:p-12 flex flex-col items-center justify-center text-center animate-fadeIn">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">¿Estás seguro?</h3>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">Vas a registrar un nuevo paciente en la base de datos operativa.</p>

                        <div className="flex flex-col-reverse sm:flex-row gap-3 w-full">
                            <button type="button" onClick={cancelConfirm} className="flex-1 py-3 rounded-xl text-gray-700 font-bold bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                                Volver
                            </button>
                            <button type="button" onClick={confirmSave} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                                Confirmar
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-5">
                        <div>
                            <label htmlFor={`${fieldId}-nombre-completo`} className={labelClass}>Nombre Completo *</label>
                            <input id={`${fieldId}-nombre-completo`} required placeholder="Ej: Juan Pérez" className={inputClass} value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} />
                        </div>
                        <div>
                            <label htmlFor={`${fieldId}-documento`} className={labelClass}>Documento (DNI) *</label>
                            <input id={`${fieldId}-documento`} required placeholder="Ej: 30.123.456" className={inputClass} value={newPatient.dni} onChange={e => setNewPatient({...newPatient, dni: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor={`${fieldId}-email`} className={labelClass}>Email</label>
                                <input id={`${fieldId}-email`} type="email" placeholder="Opcional" className={inputClass} value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} />
                            </div>
                            <div>
                                <label htmlFor={`${fieldId}-telefono`} className={labelClass}>Teléfono</label>
                                <input id={`${fieldId}-telefono`} placeholder="Opcional" className={inputClass} value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} />
                            </div>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-100">
                            <button type="button" onClick={onClose} className="flex-1 py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">Cancelar</button>
                            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">Guardar Paciente</button>
                        </div>
                    </form>
                )}
            </SecretaryModalCard>
        </SecretaryModalOverlay>
    );
};

const EditPatientModal = ({ isOpen, onClose, patient, onSave }) => {
    const fieldId = useId();
    const [editData, setEditData] = useState(patient || { email: '', phone: '' });

    React.useEffect(() => {
        if (patient) setEditData(patient);
    }, [patient]);

    if (!isOpen || !patient) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(editData);
    };

    return (
        <SecretaryModalOverlay onClose={onClose} labelledBy={`${fieldId}-title`}>
            <SecretaryModalCard maxWidth="max-w-md">
                <SecretaryModalHeader icon={Edit} title="Editar Contacto" onClose={onClose} titleId={`${fieldId}-title`} />

                <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-5">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-blue-800 text-sm font-medium">
                        <AlertCircle className="w-5 h-5 shrink-0 text-blue-500" />
                        <p>Por seguridad, los perfiles administrativos solo pueden modificar datos de contacto. Nombre y DNI requieren autorización superior.</p>
                    </div>

                    <div>
                        <label htmlFor={`${fieldId}-nombre-completo`} className={labelClass}>Nombre Completo</label>
                        <input id={`${fieldId}-nombre-completo`} disabled value={editData.name} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 outline-none cursor-not-allowed" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor={`${fieldId}-email`} className={labelClass}>Email *</label>
                            <input id={`${fieldId}-email`} type="email" required className={inputClass} value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} />
                        </div>
                        <div>
                            <label htmlFor={`${fieldId}-telefono`} className={labelClass}>Teléfono *</label>
                            <input id={`${fieldId}-telefono`} required className={inputClass} value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
                        </div>
                    </div>
                    <div className="pt-6 border-t border-gray-100">
                        <button type="submit" className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                            <Save className="w-5 h-5" /> Guardar Cambios
                        </button>
                    </div>
                </form>
            </SecretaryModalCard>
        </SecretaryModalOverlay>
    );
};

const InfoItem = ({ icon: Icon, title, children }) => (
    <div className="flex items-center gap-2 min-w-0 text-gray-600" title={title}>
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Icon className="w-3.5 h-3.5 text-blue-500"/>
        </div>
        <span className="truncate">{children}</span>
    </div>
);

export default function SecretaryPatients() {
  const [patients, setPatients] = useState(initialPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const filteredPatients = patients.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.dni.includes(searchTerm)
  );

  const handleAddPatient = (newPatient) => {
      setPatients(prev => [newPatient, ...prev]);
      setIsAddModalOpen(false);
  };

  const handleEditPatient = (updatedPatient) => {
      setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
      setIsEditModalOpen(false);
  };

  const openEditModal = (patient) => {
      setSelectedPatient(patient);
      setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden flex flex-col">
      <Navbar />

      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPatient}
      />

      <EditPatientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        patient={selectedPatient}
        onSave={handleEditPatient}
      />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-12">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 md:gap-6 mb-8 sm:mb-10">
            <div className="w-full md:w-auto">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-50 p-2.5 rounded-2xl text-blue-600">
                        <Users className="w-5 h-5" />
                    </div>
                    <span className="font-bold tracking-wider uppercase text-xs text-blue-600">Gestión de Pacientes</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                    Directorio <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Pacientes</span>
                </h1>
                <p className="text-gray-500 text-sm sm:text-base mt-1">Gestión administrativa de pacientes de S.A.M.S.A.</p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        aria-label="Buscar por nombre o DNI"
                        placeholder="Buscar por nombre o DNI..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    aria-label="Nuevo Paciente"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 shrink-0 hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Nuevo Paciente</span>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPatients.map((patient) => (
                <div key={patient.id} className="bg-white p-5 sm:p-6 rounded-[1.5rem] border border-gray-100 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 group relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>

                    <div className="flex items-start gap-4 sm:gap-5">
                        <div className="relative shrink-0">
                            <img src={patient.img} alt={patient.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-gray-50 shadow-sm" />
                            <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-sm" title="Activo"></div>
                        </div>

                        <div className="flex-1 min-w-0 pt-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{patient.name}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold mt-1 font-mono">DNI {patient.dni}</span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mt-4 text-sm font-medium">
                                <InfoItem icon={Phone} title="Teléfono">{patient.phone}</InfoItem>
                                <InfoItem icon={Mail} title="Email">{patient.email || '-'}</InfoItem>
                                <InfoItem icon={Calendar} title="Última visita"><span className="font-bold text-gray-800">{patient.lastVisit}</span></InfoItem>
                                <InfoItem icon={FileText} title="Historia Clínica"><span className="font-mono text-gray-800">{patient.historyId}</span></InfoItem>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-gray-100">
                        <button
                            onClick={() => openEditModal(patient)}
                            className="w-full py-3 bg-gray-50 text-gray-900 font-bold rounded-xl hover:bg-gray-900 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg text-sm"
                        >
                            <Edit className="w-4 h-4"/> Editar Contacto
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {filteredPatients.length === 0 && (
            <div className="text-center py-20">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-blue-400" />
                </div>
                <p className="text-gray-900 font-bold">No se encontraron pacientes.</p>
                <p className="text-gray-500 text-sm">Probá buscando por otro nombre o DNI.</p>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
