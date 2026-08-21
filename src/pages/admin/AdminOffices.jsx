import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import { MapPin, Trash2, Save, Building, Edit2, X, Plus } from 'lucide-react';

const AdminOffices = () => {
  // Datos iniciales simulados
  const [offices, setOffices] = useState([
    { id: 1, name: "Consultorio 1", location: "Planta Baja - Ala Norte" },
    { id: 2, name: "Consultorio 2", location: "Planta Baja - Ala Sur" },
  ]);
  
  // Estado del formulario
  const initialFormState = { name: '', location: '' };
  const [form, setForm] = useState(initialFormState);
  
  // Estados de control de UI
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // --- LÓGICA CRUD ---

  const handleSubmit = (e) => {
      e.preventDefault();
      if (!form.name || !form.location) return;

      if (isEditing) {
          // Actualizar existente
          setOffices(prev => prev.map(item => 
              item.id === editId ? { ...item, ...form } : item
          ));
          cancelEdit();
      } else {
          // Crear nuevo
          setOffices([...offices, { ...form, id: Date.now() }]);
          setForm(initialFormState);
      }
  }

  const handleEdit = (item) => {
      setIsEditing(true);
      setEditId(item.id);
      setForm({ name: item.name, location: item.location });
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
      setOffices(offices.filter(o => o.id !== deleteId));
      // Si eliminamos el item que estamos editando, limpiamos el form
      if (deleteId === editId) cancelEdit();
      
      setIsModalOpen(false);
      setDeleteId(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Modal de Confirmación */}
      <ConfirmModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Consultorio"
        message="¿Está seguro que desea eliminar este consultorio? Esto podría afectar los turnos asignados a esta ubicación."
      />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Building className="text-blue-600 w-8 h-8"/> Gestión de Consultorios
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* COLUMNA IZQUIERDA: FORMULARIO */}
            <div className="w-full lg:w-1/3">
                <div className={`bg-white p-6 rounded-2xl shadow-sm border h-fit sticky top-24 transition-all duration-300 ${isEditing ? 'border-orange-300 ring-4 ring-orange-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className={`font-bold text-lg ${isEditing ? 'text-orange-600' : 'text-gray-800'}`}>
                            {isEditing ? 'Editar Consultorio' : 'Nuevo Consultorio'}
                        </h3>
                        {isEditing && (
                            <button onClick={cancelEdit} className="text-gray-400 hover:text-red-500 transition" title="Cancelar edición">
                                <X className="w-5 h-5"/>
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre</label>
                            <input 
                                required 
                                placeholder="Ej: Consultorio 10" 
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" 
                                value={form.name} 
                                onChange={e=>setForm({...form, name: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Ubicación</label>
                            <input 
                                required 
                                placeholder="Ej: Piso 1, Ala Oeste" 
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white" 
                                value={form.location} 
                                onChange={e=>setForm({...form, location: e.target.value})} 
                            />
                        </div>
                        <button className={`w-full py-3 rounded-xl font-bold text-white transition shadow-md flex justify-center gap-2 items-center mt-2 ${isEditing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {isEditing ? <Save className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                            {isEditing ? 'Guardar Cambios' : 'Agregar'}
                        </button>
                    </form>
                </div>
            </div>

            {/* COLUMNA DERECHA: LISTADO */}
            <div className="w-full lg:w-2/3 grid grid-cols-1 gap-4">
                {offices.map(off => (
                    <div key={off.id} className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition flex justify-between items-center group ${editId === off.id ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'}`}>
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                                <MapPin className="w-6 h-6"/>
                            </div>
                            <div>
                                <div className="font-bold text-xl text-gray-800 group-hover:text-blue-700 transition">{off.name}</div>
                                <div className="text-gray-500 text-sm mt-1">{off.location}</div>
                            </div>
                        </div>
                        
                        {/* Botones de Acción (Editar / Eliminar) */}
                        <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleEdit(off)} 
                                className="p-2 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"
                                title="Editar"
                            >
                                <Edit2 className="w-5 h-5"/>
                            </button>
                            <button 
                                onClick={() => openDeleteModal(off.id)} 
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Eliminar"
                            >
                                <Trash2 className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ))}
                
                {offices.length === 0 && (
                    <div className="col-span-1 text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                        No hay consultorios registrados.
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOffices;