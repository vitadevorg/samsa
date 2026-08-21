import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { 
  Users, Search, Plus, Calendar, Phone, Mail, FileText, CheckCircle, AlertCircle, Edit, Save, X
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
            onAdd({ ...newPatient, id: Date.now(), age: 'N/A', historyId: `HC-${Math.floor(Math.random()*10000)}`, lastVisit: '-', img: 'https://i.pravatar.cc/150?u=new' });
            setNewPatient({ name: '', dni: '', email: '', phone: '' });
            setShowSuccess(false);
        }, 1500);
    };

    const cancelConfirm = () => setShowConfirm(false);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-white/10">
                <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-6 flex items-center gap-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                        <Users className="w-6 h-6 text-white"/>
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
                        <p className="text-slate-500 text-sm mb-8">Vas a registrar un nuevo paciente en la base de datos operativa.</p>

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
                            <input required placeholder="Ej: Juan Pérez" className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all shadow-sm" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Documento (DNI)</label>
                            <input required placeholder="Ej: 30.123.456" className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all shadow-sm" value={newPatient.dni} onChange={e => setNewPatient({...newPatient, dni: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Email</label>
                                <input type="email" placeholder="Opcional" className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all shadow-sm" value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Teléfono</label>
                                <input placeholder="Opcional" className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all shadow-sm" value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-6 border-t border-slate-100">
                            <button type="button" onClick={onClose} className="flex-1 py-3 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Cancelar</button>
                            <button type="submit" className="flex-1 py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 shadow-lg shadow-pink-600/30 transition-all hover:-translate-y-0.5">Guardar Paciente</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const EditPatientModal = ({ isOpen, onClose, patient, onSave }) => {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-white/10">
                <div className="bg-slate-800 p-6 flex justify-between items-center relative overflow-hidden text-white">
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2"><Edit className="w-6 h-6 text-pink-400"/> Editar Contacto</h2>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors"><X className="w-6 h-6"/></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-slate-50/50">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-blue-800 text-sm font-medium mb-4">
                        <AlertCircle className="w-5 h-5 shrink-0 text-blue-500" />
                        <p>Por seguridad, los perfiles administrativos solo pueden modificar datos de contacto. Nombre y DNI requieren autorización superior.</p>
                    </div>

                    <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Nombre Completo</label>
                        <input disabled value={editData.name} className="w-full p-4 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 outline-none cursor-not-allowed" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Email</label>
                            <input type="email" required className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all shadow-sm font-bold text-slate-700" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Teléfono</label>
                            <input required className="w-full p-4 border border-slate-200 rounded-xl bg-white focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all shadow-sm font-bold text-slate-700" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-6 border-t border-slate-100">
                        <button type="submit" className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 shadow-lg shadow-slate-800/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                            <Save className="w-5 h-5" /> Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            <div className="relative z-10 w-full md:w-auto text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-3 tracking-tight">
                    <div className="bg-pink-600 p-2.5 rounded-2xl shadow-lg shadow-pink-200">
                        <Users className="w-7 h-7 text-white"/>
                    </div>
                    Directorio Pacientes
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Gestión administrativa de pacientes de S.A.M.S.A.</p>
            </div>

            <div className="flex gap-4 w-full md:w-auto relative z-10">
                <div className="relative flex-1 md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o DNI..." 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all font-medium text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-3.5 rounded-2xl font-bold shadow-lg shadow-pink-600/30 transition-all flex items-center gap-2 shrink-0 hover:-translate-y-0.5"
                >
                    <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Nuevo Paciente</span>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPatients.map((patient) => (
                <div key={patient.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">

                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-50 to-rose-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>

                    <div className="flex items-start gap-5 relative z-10">
                        <div className="relative shrink-0">
                            <img src={patient.img} alt={patient.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-slate-50 shadow-sm group-hover:border-pink-50 transition-colors" />
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm" title="Activo"></div>
                        </div>

                        <div className="flex-1 min-w-0 pt-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 truncate group-hover:text-pink-600 transition-colors">{patient.name}</h3>
                                    <p className="text-sm text-slate-400 font-mono font-medium mt-0.5 tracking-wide">DNI: {patient.dni}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-4 text-sm font-medium">
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
                                <div className="flex items-center gap-2 truncate text-slate-600" title="Última visita">
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                        <Calendar className="w-3.5 h-3.5 text-blue-500"/>
                                    </div>
                                    <span className="font-bold text-slate-700">{patient.lastVisit}</span>
                                </div>
                                <div className="flex items-center gap-2 truncate text-slate-600" title="Historia Clínica">
                                    <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                                        <FileText className="w-3.5 h-3.5 text-purple-500"/>
                                    </div>
                                    <span className="font-mono text-slate-700">{patient.historyId}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100 flex gap-4 relative z-10">
                        <button 
                            onClick={() => openEditModal(patient)}
                            className="flex-1 bg-slate-50 text-slate-700 hover:bg-slate-800 hover:text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <Edit className="w-4 h-4"/> Editar Contacto
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
      <Footer />
    </div>
  );
}
