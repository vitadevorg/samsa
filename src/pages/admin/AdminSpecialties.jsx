import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import { Trash2, Tag, Plus, Edit2, Save, X } from 'lucide-react';

const AdminSpecialties = () => {
  // Datos iniciales
  const [specialties, setSpecs] = useState([
    { id: 1, name: "Cardiología", desc: "Corazón y sistema circulatorio" },
    { id: 2, name: "Pediatría", desc: "Atención de niños y adolescentes" },
    { id: 3, name: "Neurología", desc: "Sistema nervioso central" },
  ]);
  
  // Estado del formulario
  const initialFormState = { name: '', desc: '' };
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
        // Modificar existente
        setSpecs(prev => prev.map(item => 
            item.id === editId ? { ...item, ...form } : item
        ));
        cancelEdit();
    } else {
        // Crear nueva
        setSpecs([...specialties, { 
            ...form, 
            id: Date.now(), 
            desc: form.desc || "Sin descripción" 
        }]);
        setForm(initialFormState);
    }
  };

  const handleEdit = (item) => {
      setIsEditing(true);
      setEditId(item.id);
      setForm({ name: item.name, desc: item.desc });
      // Scroll hacia arriba para ver el formulario si la lista es larga
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
  }

  const confirmDelete = () => {
      // Si se elimina el item que se está editando, cancelar la edición
      if (deleteId === editId) cancelEdit();
      
      setSpecs(prev => prev.filter(x => x.id !== deleteId));
      setIsModalOpen(false);
      setDeleteId(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <ConfirmModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Especialidad"
        message="¿Seguro que desea eliminar esta especialidad? Los médicos asociados deberán ser reasignados."
      />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 p-2 rounded-lg shadow-sm">
                <Tag className="text-blue-600 w-8 h-8"/>
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Especialidades Médicas</h1>
                <p className="text-gray-500 text-sm">Gestión del catálogo de servicios.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* FORMULARIO (Sticky) */}
             <div className="lg:col-span-1">
                <div className={`bg-white p-6 rounded-2xl shadow-sm border sticky top-24 transition-all duration-300 ${isEditing ? 'border-orange-300 ring-4 ring-orange-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className={`font-bold text-lg ${isEditing ? 'text-orange-600' : 'text-gray-800'}`}>
                            {isEditing ? 'Editar Especialidad' : 'Nueva Especialidad'}
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
                            <input 
                                required 
                                placeholder="Ej: Cardiología" 
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" 
                                value={form.name} 
                                onChange={e=>setForm({...form, name: e.target.value})} 
                            />
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Descripción</label>
                            <textarea 
                                placeholder="Breve descripción..." 
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white resize-none h-24" 
                                value={form.desc} 
                                onChange={e=>setForm({...form, desc: e.target.value})} 
                            />
                        </div>

                        <button type="submit" className={`w-full py-3 rounded-xl font-bold text-white transition shadow-md flex justify-center gap-2 items-center mt-2 ${isEditing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {isEditing ? <Save className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                            {isEditing ? 'Guardar Cambios' : 'Agregar'}
                        </button>
                    </form>
                </div>
            </div>

            {/* LISTA */}
            <div className="lg:col-span-2 space-y-4">
                {specialties.map(s => (
                    <div key={s.id} className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition flex justify-between items-center group ${editId === s.id ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border border-blue-100">
                                {s.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{s.name}</h3>
                                <p className="text-gray-500 text-sm">{s.desc}</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleEdit(s)} 
                                className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"
                                title="Editar"
                            >
                                <Edit2 className="w-5 h-5"/>
                            </button>
                            <button 
                                onClick={() => openDeleteModal(s.id)} 
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Eliminar"
                            >
                                <Trash2 className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ))}
                
                {specialties.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                        No hay especialidades cargadas.
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default AdminSpecialties;