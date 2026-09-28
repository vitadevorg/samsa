import React, { useId, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import { EditConfirmModal, SuccessModal } from './ClinicModals';
import { useClinicData } from './clinicDataContext';
import { useTimeouts } from '../../hooks/useTimeouts';
import { doctorsData } from '../../data/doctors';
import { Trash2, Edit2, UserPlus, Users, Save, X, MapPin, Check } from 'lucide-react';

// Cuánto tiempo (en milisegundos) queda visible la ventana verde de éxito.
const SUCCESS_DURATION_MS = 2500;

// Busca los datos completos de un médico (nombre, especialidad) por su id.
const findDoctor = (doctorId) => doctorsData.find((doctor) => doctor.id === doctorId);

// Convierte una secretaria en los valores del formulario de edición.
const toForm = (secretary) => ({
  name: secretary.name,
  email: secretary.email,
  phone: secretary.phone,
  area: secretary.area,
  doctorIds: secretary.doctorIds,
});

// Pantalla del administrador de clínica: secretarias de SU clínica y las
// agendas de qué médicos maneja cada una.
// Misma estructura que ClinicDoctors.jsx.
const ClinicSecretaries = () => {
  // useId genera un prefijo único para los id de los inputs (para los <label htmlFor>).
  const fieldId = useId();

  // Datos compartidos con la pantalla de Médicos (ver ClinicDataProvider.jsx).
  // `assignments` son los médicos vinculados a la clínica: solo esos se pueden asignar.
  const { clinic, assignments, secretaries, addSecretary, updateSecretary, removeSecretary } = useClinicData();

  // Si venimos de la pantalla Personal con "Editar", llega el id a editar en
  // location.state (ver ClinicStaff.jsx) y abrimos el formulario ya en modo edición.
  const location = useLocation();
  const secretaryToEdit = secretaries.find((s) => s.id === location.state?.editId);

  // Formulario vacío. Si la clínica tiene una sola área, la dejamos elegida.
  const emptyForm = {
    name: '',
    email: '',
    phone: '',
    area: clinic?.areas.length === 1 ? clinic.areas[0] : '',
    doctorIds: [],
  };

  // Estado propio de esta pantalla (la lista de secretarias vive en el contexto).
  const [form, setForm] = useState(() => (secretaryToEdit ? toForm(secretaryToEdit) : emptyForm));
  const [editId, setEditId] = useState(secretaryToEdit?.id ?? null); // id de la secretaria que se edita (null = alta)
  const [deleteId, setDeleteId] = useState(null); // id de la secretaria a eliminar (null = ventana cerrada)
  const [isConfirmingEdit, setIsConfirmingEdit] = useState(false);
  const [success, setSuccess] = useState(null);   // null = cerrada; { title, message } = abierta
  const { schedule } = useTimeouts();

  const isEditing = editId !== null;

  // Muestra la ventana verde y la cierra sola después de unos segundos.
  const showSuccess = (title, message) => {
    setSuccess({ title, message });
    schedule(() => setSuccess(null), SUCCESS_DURATION_MS);
  };

  // `setForm(prev => ...)`: React nos pasa el valor más reciente del formulario,
  // así dos cambios seguidos no se pisan entre sí.
  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // Marca o desmarca un médico en la lista de agendas de la secretaria.
  const toggleDoctor = (doctorId) => {
    setForm((prev) => ({
      ...prev,
      doctorIds: prev.doctorIds.includes(doctorId)
        ? prev.doctorIds.filter((id) => id !== doctorId)
        : [...prev.doctorIds, doctorId],
    }));
  };

  const startEdit = (secretary) => {
    setEditId(secretary.id);
    setForm(toForm(secretary));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  // Alta: guarda y muestra éxito. Edición: primero pide confirmación (naranja).
  const handleSubmit = (e) => {
    e.preventDefault(); // evita que el navegador recargue la página al enviar el form
    if (isEditing) {
      setIsConfirmingEdit(true);
      return;
    }
    addSecretary(form);
    showSuccess('¡Secretaria agregada!', `${form.name} ya forma parte de ${clinic.name}.`);
    setForm(emptyForm);
  };

  // El usuario confirmó la edición en la ventana naranja.
  const handleConfirmEdit = () => {
    updateSecretary(editId, form);
    setIsConfirmingEdit(false);
    cancelEdit();
    showSuccess('¡Cambios guardados!', 'Los datos de la secretaria fueron actualizados.');
  };

  const handleConfirmDelete = () => {
    removeSecretary(deleteId);
    if (deleteId === editId) cancelEdit();
    setDeleteId(null);
  };

  // Protección: si el usuario no tiene una clínica válida, no hay nada que mostrar.
  if (!clinic) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-10 text-center text-gray-500">
          Tu usuario no tiene una clínica asignada.
        </div>
      </div>
    );
  }

  const inputClass = 'w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white';
  const labelClass = 'text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Secretaria"
        message={`¿Confirma que desea eliminar a esta secretaria de ${clinic.name}? Se dará de baja su cuenta y no podrá volver a iniciar sesión.`}
      />
      <EditConfirmModal
        isOpen={isConfirmingEdit}
        title="¿Modificar secretaria?"
        message={`Vas a actualizar los datos y las agendas de ${form.name}. ¿Guardar los cambios?`}
        onCancel={() => setIsConfirmingEdit(false)}
        onConfirm={handleConfirmEdit}
      />
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg"><Users className="text-blue-600 w-8 h-8"/></div>
              Secretarias de {clinic.name}
            </h1>
            <p className="text-gray-500 mt-2 flex items-center gap-1 text-sm">
              <MapPin className="w-4 h-4"/> {clinic.address}
            </p>
          </div>
        </div>

        {/* Formulario: azul para agregar, naranja mientras se edita */}
        <div className={`bg-white p-8 rounded-2xl shadow-sm mb-10 border transition-all duration-300 ${isEditing ? 'border-orange-200 ring-4 ring-orange-50' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`font-bold text-xl ${isEditing ? 'text-orange-600' : 'text-gray-800'}`}>
              {isEditing ? '✏️ Editando Secretaria' : '✨ Agregar Secretaria'}
            </h3>
            {isEditing && (
              <button onClick={cancelEdit} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full transition">
                <X className="w-3 h-3"/> Cancelar Edición
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Fila 1: datos de la secretaria */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label htmlFor={`${fieldId}-nombre`} className={labelClass}>Nombre Completo</label>
                <input id={`${fieldId}-nombre`} required placeholder="Ej: Laura Gómez" className={inputClass} value={form.name} onChange={e => updateField('name', e.target.value)} />
              </div>
              <div>
                <label htmlFor={`${fieldId}-email`} className={labelClass}>Email</label>
                <input id={`${fieldId}-email`} required type="email" placeholder="secretaria@samsa.med" className={inputClass} value={form.email} onChange={e => updateField('email', e.target.value)} />
              </div>
              <div>
                <label htmlFor={`${fieldId}-telefono`} className={labelClass}>Teléfono</label>
                <input id={`${fieldId}-telefono`} type="tel" placeholder="381 400-0000" className={inputClass} value={form.phone} onChange={e => updateField('phone', e.target.value)} />
              </div>
              <div>
                <label htmlFor={`${fieldId}-area`} className={labelClass}>Área</label>
                <select id={`${fieldId}-area`} required className={`${inputClass} appearance-none`} value={form.area} onChange={e => updateField('area', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {clinic.areas.map(area => <option key={area} value={area}>{area}</option>)}
                </select>
              </div>
            </div>

            {/* Fila 2: médicos cuyas agendas maneja (solo los vinculados a la clínica) */}
            <div>
              <p id={`${fieldId}-medicos`} className={labelClass}>Agendas que maneja</p>
              <div role="group" aria-labelledby={`${fieldId}-medicos`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {assignments.map(assignment => {
                  const doctor = findDoctor(assignment.doctorId);
                  const checked = form.doctorIds.includes(assignment.doctorId);
                  return (
                    // El <label> envuelve al checkbox: hacer clic en cualquier parte lo marca.
                    <label key={assignment.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition focus-within:ring-2 focus-within:ring-blue-500 ${checked ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                      <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleDoctor(assignment.doctorId)} />
                      <span className={`w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                        {checked && <Check className="w-3 h-3 text-white"/>}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-gray-800 truncate">{doctor?.name}</span>
                        <span className="block text-xs text-gray-500">{assignment.area}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {assignments.length === 0 && (
                <p className="text-sm text-gray-400">Primero vinculá médicos a la clínica desde la pantalla Médicos.</p>
              )}
            </div>

            <div className="flex justify-end">
              <button type="submit" className={`py-3 px-8 rounded-xl font-bold text-white transition shadow-md flex justify-center gap-2 items-center ${isEditing ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                {isEditing ? <Save className="w-5 h-5"/> : <UserPlus className="w-5 h-5"/>}
                {isEditing ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabla de secretarias de la clínica */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Secretaria</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Área</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Agendas</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {secretaries.map(secretary => (
                <tr key={secretary.id} className={`hover:bg-blue-50/50 transition ${editId === secretary.id ? 'bg-orange-50' : ''}`}>
                  <td className="p-5">
                    <div className="font-bold text-gray-900">{secretary.name}</div>
                    <div className="text-xs text-gray-500">{secretary.email}{secretary.phone && ` · ${secretary.phone}`}</div>
                  </td>
                  <td className="p-5">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                      {secretary.area}
                    </span>
                  </td>
                  <td className="p-5 text-sm">
                    {secretary.doctorIds.length > 0 ? (
                      <ul className="space-y-0.5 text-gray-600">
                        {secretary.doctorIds.map(id => <li key={id}>{findDoctor(id)?.name}</li>)}
                      </ul>
                    ) : (
                      <span className="text-amber-600 font-medium">Sin agendas asignadas</span>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(secretary)}
                        className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5"/>
                      </button>
                      <button
                        onClick={() => setDeleteId(secretary.id)}
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
          {secretaries.length === 0 && (
            <div className="p-10 text-center text-gray-400">Todavía no hay secretarias en esta clínica.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicSecretaries;
