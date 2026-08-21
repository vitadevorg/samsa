import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import { Trash2, Edit2, UserPlus, Stethoscope, Save, X } from 'lucide-react';
const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([
    { id: 1, name: "Francisco Matar", specialty: "Clínica Médica", email: "fran@samsa.com" },
    { id: 2, name: "Agustina Vega", specialty: "Nutrición", email: "agus@samsa.com" },
  ]);
  const initialFormState = { name: '', specialty: '', email: '', password: '' };
  const [form, setForm] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const openDeleteModal = (id) => {
      setDeleteId(id);
      setIsModalOpen(true);
  };
  const confirmDelete = () => {
      setDoctors(doctors.filter(d => d.id !== deleteId));
      if (deleteId === editId) cancelEdit();
      setIsModalOpen(false);
      setDeleteId(null);
  };
  const handleEdit = (doc) => {
      setIsEditing(true);
      setEditId(doc.id);
      setForm({
          name: doc.name,
          specialty: doc.specialty,
          email: doc.email,
          password: '' 
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEdit = () => {
      setIsEditing(false);
      setEditId(null);
      setForm(initialFormState);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
        setDoctors(prev => prev.map(doc => 
            doc.id === editId 
            ? { ...doc, name: form.name, specialty: form.specialty, email: form.email } 
            : doc
        ));
        cancelEdit();
    } else {
        setDoctors([...doctors, { ...form, id: Date.now() }]);
        setForm(initialFormState);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ConfirmModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Profesional"
        message="¿Confirma que desea eliminar a este médico del sistema? Se perderá su historial de acceso."
      />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex justify-between items-end mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg"><Stethoscope className="text-blue-600 w-8 h-8"/></div>
            Gestión de Médicos
            </h1>
        </div>
        <div className={`bg-white p-8 rounded-2xl shadow-sm mb-10 border transition-all duration-300 ${isEditing ? 'border-orange-200 ring-4 ring-orange-50' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center mb-6">
              <h3 className={`font-bold text-xl ${isEditing ? 'text-orange-600' : 'text-gray-800'}`}>
                  {isEditing ? '✏️ Editando Profesional' : '✨ Registrar Nuevo Profesional'}
              </h3>
              {isEditing && (
                  <button onClick={cancelEdit} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full transition">
                      <X className="w-3 h-3"/> Cancelar Edición
                  </button>
              )}
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
            <div className="lg:col-span-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Nombre Completo</label>
                <input required placeholder="Ej: Dr. Juan Pérez" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
            </div>
            <div className="lg:col-span-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Especialidad</label>
                <select required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white appearance-none" value={form.specialty} onChange={e=>setForm({...form, specialty: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    <option value="Cardiología">Cardiología</option>
                    <option value="Nutrición">Nutrición</option>
                    <option value="Clínica Médica">Clínica Médica</option>
                    <option value="Pediatría">Pediatría</option>
                </select>
            </div>
            <div className="lg:col-span-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Usuario / Email</label>
                <input required type="email" placeholder="medico@samsa.com" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
            </div>
            <div className="lg:col-span-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">{isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}</label>
                <input type="password" required={!isEditing} placeholder="******" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
            </div>
            <div className="lg:col-span-1">
                <button type="submit" className={`w-full py-3 rounded-xl font-bold text-white transition shadow-md flex justify-center gap-2 items-center ${isEditing ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                    {isEditing ? <Save className="w-5 h-5"/> : <UserPlus className="w-5 h-5"/>}
                    {isEditing ? 'Actualizar' : 'Guardar'}
                </button>
            </div>
          </form>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Profesional</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Especialidad</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Usuario</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {doctors.map(doc => (
                <tr key={doc.id} className={`hover:bg-blue-50/50 transition ${editId === doc.id ? 'bg-orange-50' : ''}`}>
                  <td className="p-5">
                      <div className="font-bold text-gray-900">{doc.name}</div>
                  </td>
                  <td className="p-5">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                          {doc.specialty}
                      </span>
                  </td>
                  <td className="p-5 text-gray-500 font-medium">{doc.email}</td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => handleEdit(doc)} 
                            className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"
                            title="Editar"
                        >
                            <Edit2 className="w-5 h-5"/>
                        </button>
                        <button 
                            onClick={() => openDeleteModal(doc.id)} 
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar"
                        >
                            <Trash2 className="w-5 h-5"/>
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {doctors.length === 0 && (
              <div className="p-10 text-center text-gray-400">No hay profesionales registrados.</div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminDoctors;