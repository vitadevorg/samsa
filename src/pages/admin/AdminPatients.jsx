import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import { Users, Trash2, ShieldAlert } from 'lucide-react';
const AdminPatients = () => {
  const [patients, setPatients] = useState([
    { id: 1, name: "Lucas Gabriel Lazarte", dni: "45.275.212", email: "lglucas@gmail.com" },
    { id: 2, name: "Juan Pérez", dni: "30.123.456", email: "juan@test.com" },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const openDeleteModal = (id) => {
      setSelectedId(id);
      setIsModalOpen(true);
  };
  const confirmDelete = () => {
      setPatients(patients.filter(p => p.id !== selectedId));
      setIsModalOpen(false);
      setSelectedId(null);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ConfirmModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Paciente"
        message="¿Está completamente seguro? Eliminar un paciente borrará también su historial de turnos y estudios asociados."
      />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200"><Users className="text-white w-6 h-6"/></div>
            Base de Pacientes
        </h1>
        <p className="text-gray-500 mb-8 ml-14">Visualización y control de usuarios registrados.</p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-4 shadow-sm">
            <ShieldAlert className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
                <h4 className="font-bold text-amber-800">Zona de Cuidado</h4>
                <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                    La eliminación de pacientes es irreversible. Solo realice esta acción en casos de cuentas duplicadas, solicitud explícita de baja o errores administrativos graves.
                </p>
            </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="text-left p-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Paciente</th>
                        <th className="text-left p-5 font-bold text-gray-500 text-xs uppercase tracking-widest">DNI</th>
                        <th className="text-left p-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Email</th>
                        <th className="text-right p-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {patients.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition group">
                            <td className="p-5 font-bold text-gray-800 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                    {p.name.charAt(0)}
                                </div>
                                {p.name}
                            </td>
                            <td className="p-5 text-gray-600 font-mono text-sm">{p.dni}</td>
                            <td className="p-5 text-gray-600 text-sm">{p.email}</td>
                            <td className="p-5 text-right">
                                <button 
                                    onClick={() => openDeleteModal(p.id)} 
                                    className="bg-white border border-red-100 text-red-500 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white hover:border-red-600 transition shadow-sm flex items-center gap-2 ml-auto group-hover:shadow-md"
                                >
                                    <Trash2 className="w-4 h-4"/> Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {patients.length === 0 && (
                <div className="p-10 text-center text-gray-400 italic">No hay pacientes registrados.</div>
            )}
        </div>
      </div>
    </div>
  );
};
export default AdminPatients;   