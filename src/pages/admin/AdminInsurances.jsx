import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import { Trash2, Edit2, Plus, Wallet, Save, X, ShieldCheck } from 'lucide-react';

const AdminInsurances = () => {
  // Datos iniciales simulados (Sin campo "type")
  const [insurances, setInsurances] = useState([
    { id: 1, name: "OSDE", contact: "0800-555-6733" },
    { id: 2, name: "Subsidio de Salud", contact: "0800-888-7827" },
    { id: 3, name: "Prensa", contact: "0810-222-3344" },
  ]);

  // Estado del formulario sin "type"
  const initialFormState = { name: '', contact: '' };
  const [form, setForm] = useState(initialFormState);
  
  // Estados de control
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // --- LÓGICA CRUD ---

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (isEditing) {
        setInsurances(prev => prev.map(item => 
            item.id === editId ? { ...item, ...form } : item
        ));
        cancelEdit();
    } else {
        setInsurances([...insurances, { ...form, id: Date.now() }]);
        setForm(initialFormState);
    }
  };

  const handleEdit = (item) => {
      setIsEditing(true);
      setEditId(item.id);
      // Solo cargamos nombre y contacto
      setForm({ name: item.name, contact: item.contact });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
      setIsEditing(false);
      setEditId(null);
      setForm(initialFormState);
  };

  const openDeleteModal = (id) => {
      setDeleteId(id);
      setIsModalOpen(true);
  };

  const confirmDelete = () => {
      setInsurances(insurances.filter(i => i.id !== deleteId));
      if (deleteId === editId) cancelEdit();
      setIsModalOpen(false);
      setDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <ConfirmModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Obra Social"
        message="¿Confirma que desea eliminar esta obra social? Los médicos y pacientes vinculados podrían perder esta referencia."
      />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
            <div className="bg-green-100 p-2 rounded-lg shadow-sm">
                <Wallet className="text-green-600 w-8 h-8"/>
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Obras Sociales</h1>
                <p className="text-gray-500 text-sm">Gestión de coberturas aceptadas.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* FORMULARIO (Sticky) */}
            <div className="lg:col-span-1">
                <div className={`bg-white p-6 rounded-2xl shadow-sm border sticky top-24 transition-all duration-300 ${isEditing ? 'border-orange-300 ring-4 ring-orange-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className={`font-bold text-lg ${isEditing ? 'text-orange-600' : 'text-gray-800'}`}>
                            {isEditing ? 'Editar Entidad' : 'Nueva Entidad'}
                        </h3>
                        {isEditing && (
                            <button onClick={cancelEdit} className="text-gray-400 hover:text-red-500 transition" title="Cancelar">
                                <X className="w-5 h-5"/>
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre</label>
                            <input required placeholder="Ej: OSDE" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
                        </div>
                        
                        {/* Eliminado el select de "Tipo" */}

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Contacto (Opcional)</label>
                            <input placeholder="Ej: 0800-..." className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white" value={form.contact} onChange={e=>setForm({...form, contact: e.target.value})} />
                        </div>

                        <button type="submit" className={`w-full py-3 rounded-xl font-bold text-white transition shadow-md flex justify-center gap-2 items-center mt-2 ${isEditing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}>
                            {isEditing ? <Save className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                            {isEditing ? 'Guardar Cambios' : 'Agregar'}
                        </button>
                    </form>
                </div>
            </div>

            {/* LISTA */}
            <div className="lg:col-span-2 space-y-4">
                {insurances.map(item => (
                    <div key={item.id} className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition flex justify-between items-center group ${editId === item.id ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-4">
                            {/* Icono unificado ya que no hay tipos distintos */}
                            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-green-100 text-green-600">
                                <ShieldCheck className="w-6 h-6"/>
                            </div>
                            <div>
                                <div className="font-bold text-lg text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                    {/* Eliminada la etiqueta de tipo */}
                                    {item.contact ? <span>Contacto: {item.contact}</span> : <span className="italic text-gray-400">Sin contacto</span>}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleEdit(item)} 
                                className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"
                                title="Editar"
                            >
                                <Edit2 className="w-5 h-5"/>
                            </button>
                            <button 
                                onClick={() => openDeleteModal(item.id)} 
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Eliminar"
                            >
                                <Trash2 className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ))}

                {insurances.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                        No hay obras sociales registradas.
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default AdminInsurances;