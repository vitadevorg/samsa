import React, { useId, useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import { EditConfirmModal, SuccessModal } from '../clinic/ClinicModals';
import { useClinicData } from '../clinic/clinicDataContext';
import { validateName, validateEmail, validatePhone, errorBorder } from '../clinic/clinicValidation';
import { resetPassword, getRegisteredEmails } from '../../services/authService';
import { ROLES } from '../../constants/roles';
import AccountStatusBadge from './AccountStatusBadge';
import { buildUserDirectory } from './userDirectory';
import { useSuccessModal, PASSWORD_SUCCESS_DURATION_MS } from './useSuccessModal';
import { Trash2, Edit2, UserPlus, Users, Save, X } from 'lucide-react';

const EMPTY_FORM = { name: '', email: '', phone: '', doctorIds: [] };

const toForm = (secretary) => ({
  name: secretary.name,
  email: secretary.email,
  phone: secretary.phone,
  doctorIds: secretary.doctorIds,
});

// Datos listos para guardar: sin espacios de más y el email en minúsculas.
const cleanForm = (values) => ({
  ...values,
  name: values.name.trim().replace(/\s+/g, ' '),
  email: values.email.trim().toLowerCase(),
  phone: values.phone.trim(),
});

// Secretarias de los médicos particulares (no pertenecen a una clínica ni a un hospital).
// Misma estructura que ParticularDoctorsPanel y que src/pages/clinic/ClinicSecretaries.jsx.
// `onOpen` avisa a la pantalla que se abrió un formulario acá, para que cierre el de la otra sección.
const ParticularSecretariesPanel = ({ onOpen }) => {
  const fieldId = useId();
  const data = useClinicData();
  const {
    particularDoctors, allSecretaries,
    addParticularSecretary, updateSecretary, removeSecretary,
  } = data;
  // Solo las secretarias sin institución: las de clínicas y hospitales las administra cada una.
  const secretaries = allSecretaries.filter((s) => s.institutionId === null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);       // id de la secretaria que se edita (null = alta)
  const [deleteId, setDeleteId] = useState(null);   // id de la secretaria a eliminar (null = ventana cerrada)
  const [isConfirming, setIsConfirming] = useState(false); // ventana naranja de confirmación (alta o edición)
  const [showCreate, setShowCreate] = useState(false); // el formulario de alta está oculto hasta que se pide
  const [errors, setErrors] = useState({});
  const { success, showSuccess } = useSuccessModal();

  const isEditing = editId !== null;
  const findDoctorLabel = (doctorId) => {
    const doctor = particularDoctors.find((d) => d.id === doctorId);
    return doctor && `${doctor.name} (${doctor.specialty})`;
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Agrega un médico a las agendas de la secretaria (si todavía no estaba).
  const addDoctor = (doctorId) => {
    if (!doctorId) return;
    setForm((prev) => (prev.doctorIds.includes(doctorId)
      ? prev
      : { ...prev, doctorIds: [...prev.doctorIds, doctorId] }));
    setErrors((prev) => ({ ...prev, doctorIds: '' }));
  };

  // Quita un médico de sus agendas.
  const removeDoctor = (doctorId) => {
    setForm((prev) => ({ ...prev, doctorIds: prev.doctorIds.filter((id) => id !== doctorId) }));
  };

  const validateForm = () => {
    // El email es el usuario: no puede repetirse con ninguna otra cuenta del sistema.
    const takenEmails = [...buildUserDirectory(data).map((u) => u.email), ...getRegisteredEmails()]
      .map((email) => email.toLowerCase());
    const found = {
      name: validateName(form.name),
      // Al editar el email no cambia (es el usuario de la cuenta), así que no se revisa.
      email: isEditing ? '' : validateEmail(form.email, takenEmails),
      phone: validatePhone(form.phone),
      doctorIds: form.doctorIds.length === 0 ? 'Elegí al menos un médico.' : '',
    };
    return Object.fromEntries(Object.entries(found).filter(([, message]) => message));
  };

  const startEdit = (secretary) => {
    onOpen();
    setEditId(secretary.id);
    setForm(toForm(secretary));
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setShowCreate(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // evita que el navegador recargue la página al enviar el form
    const found = validateForm();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setIsConfirming(true);
  };

  const handleConfirm = () => {
    const secretary = cleanForm(form);
    setIsConfirming(false);
    if (isEditing) {
      updateSecretary(editId, secretary);
      cancelEdit();
      showSuccess('¡Cambios guardados!', 'Los datos de la secretaria fueron actualizados.');
      return;
    }
    addParticularSecretary(secretary);
    // También se le crea el acceso, con una contraseña temporal que tiene que cambiar al entrar.
    const temporaryPassword = resetPassword(secretary.email, { name: secretary.name, role: ROLES.SECRETARY });
    setForm(EMPTY_FORM);
    setShowCreate(false);
    showSuccess(
      '¡Secretaria agregada!',
      `${secretary.name} ya puede iniciar sesión con ${secretary.email}. Contraseña temporal: ${temporaryPassword} (la tendrá que cambiar al entrar).`,
      PASSWORD_SUCCESS_DURATION_MS
    );
  };

  const handleConfirmDelete = () => {
    removeSecretary(deleteId);
    if (deleteId === editId) cancelEdit();
    setDeleteId(null);
  };

  // Médicos ya asignados (para los chips) y los que todavía se pueden agregar.
  const selectedDoctors = form.doctorIds
    .map((id) => particularDoctors.find((d) => d.id === id))
    .filter(Boolean);
  const availableDoctors = particularDoctors.filter((d) => !form.doctorIds.includes(d.id));

  const inputClass = 'w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white';
  const labelClass = 'text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block';
  const fieldError = (name, id) => errors[name] && (
    <p id={`${fieldId}-${id}-error`} role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors[name]}</p>
  );

  return (
    <section aria-labelledby={`${fieldId}-titulo`} className="mb-14">
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Secretaria"
        message="¿Confirma que desea eliminar a esta secretaria? Se dará de baja su cuenta y no podrá volver a iniciar sesión."
      />
      <EditConfirmModal
        isOpen={isConfirming}
        title={isEditing ? '¿Modificar secretaria?' : '¿Agregar secretaria?'}
        message={isEditing
          ? `Vas a actualizar los datos y las agendas de ${form.name}. ¿Guardar los cambios?`
          : `Vas a dar de alta a ${form.name} y crear su acceso. ¿Confirmar?`}
        confirmLabel={isEditing ? 'Sí, Modificar' : 'Sí, Agregar'}
        onCancel={() => setIsConfirming(false)}
        onConfirm={handleConfirm}
      />
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 id={`${fieldId}-titulo`} className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="bg-pink-100 p-2 rounded-lg"><Users className="text-pink-600 w-6 h-6"/></div>
          Secretarias de médicos particulares
        </h2>
        {!showCreate && !isEditing && (
          <button onClick={() => { onOpen(); setShowCreate(true); }} className="py-2.5 px-5 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition flex items-center gap-2">
            <UserPlus className="w-5 h-5"/> Agregar secretaria
          </button>
        )}
      </div>

      {(showCreate || isEditing) && (
      <div className={`bg-white p-8 rounded-2xl shadow-sm mb-8 border transition-all duration-300 ${isEditing ? 'border-orange-200 ring-4 ring-orange-50' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`font-bold text-xl ${isEditing ? 'text-orange-600' : 'text-gray-800'}`}>
            {isEditing ? '✏️ Editando Secretaria' : '✨ Agregar Secretaria'}
          </h3>
          <button onClick={cancelEdit} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full transition">
            <X className="w-3 h-3"/> {isEditing ? 'Cancelar Edición' : 'Cancelar'}
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label htmlFor={`${fieldId}-nombre`} className={labelClass}>Nombre Completo</label>
              <input id={`${fieldId}-nombre`} maxLength={60} autoComplete="off" aria-invalid={Boolean(errors.name)} aria-describedby={`${fieldId}-nombre-error`} placeholder="Ej: Laura Gómez" className={`${inputClass} ${errorBorder(errors.name)}`} value={form.name} onChange={e => updateField('name', e.target.value)} />
              {fieldError('name', 'nombre')}
            </div>
            <div>
              <label htmlFor={`${fieldId}-email`} className={labelClass}>Email (usuario)</label>
              <input id={`${fieldId}-email`} type="email" maxLength={80} autoComplete="off" disabled={isEditing} aria-invalid={Boolean(errors.email)} aria-describedby={`${fieldId}-email-error`} placeholder="secretaria@samsa.med" className={`${inputClass} disabled:text-gray-500 disabled:cursor-not-allowed ${errorBorder(errors.email)}`} value={form.email} onChange={e => updateField('email', e.target.value)} />
              {fieldError('email', 'email')}
            </div>
            <div>
              <label htmlFor={`${fieldId}-telefono`} className={labelClass}>Teléfono</label>
              <input id={`${fieldId}-telefono`} type="tel" inputMode="tel" maxLength={20} autoComplete="off" aria-invalid={Boolean(errors.phone)} aria-describedby={`${fieldId}-telefono-error`} placeholder="381 400-0000" className={`${inputClass} ${errorBorder(errors.phone)}`} value={form.phone} onChange={e => updateField('phone', e.target.value)} />
              {fieldError('phone', 'telefono')}
            </div>
          </div>

          {/* Agendas que maneja: los elegidos se ven como "chips" y se agregan con un desplegable
              con el listado de médicos (igual que en las secretarias de clínica y hospital) */}
          <div>
            <label htmlFor={`${fieldId}-medicos`} className={labelClass}>Agendas que maneja</label>
            {selectedDoctors.length > 0 ? (
              <ul className="flex flex-wrap gap-2 mb-3">
                {selectedDoctors.map(doctor => (
                  <li key={doctor.id} className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-sm">
                    <span className="font-bold text-gray-800">{doctor.name}</span>
                    <span className="text-xs text-gray-500">{doctor.specialty}</span>
                    <button
                      type="button"
                      onClick={() => removeDoctor(doctor.id)}
                      className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title={`Quitar a ${doctor.name}`}
                      aria-label={`Quitar a ${doctor.name}`}
                    >
                      <X className="w-3.5 h-3.5"/>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              particularDoctors.length > 0 && <p className="text-sm text-gray-400 mb-3">Todavía no le asignaste médicos.</p>
            )}
            {availableDoctors.length > 0 && (
              /* value="" fijo: después de elegir, el desplegable vuelve a "Agregar médico..." */
              <select id={`${fieldId}-medicos`} value="" onChange={e => addDoctor(e.target.value)} className={`${inputClass} appearance-none md:max-w-sm ${errorBorder(errors.doctorIds)}`}>
                <option value="">Agregar médico...</option>
                {availableDoctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name} — {doctor.specialty}</option>
                ))}
              </select>
            )}
            {particularDoctors.length === 0 && (
              <p className="text-sm text-gray-400">Primero agregá un médico particular.</p>
            )}
            {fieldError('doctorIds', 'medicos')}
          </div>

          <div className="flex justify-end">
            <button type="submit" className={`py-3 px-8 rounded-xl font-bold text-white transition shadow-md flex justify-center gap-2 items-center ${isEditing ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
              {isEditing ? <Save className="w-5 h-5"/> : <UserPlus className="w-5 h-5"/>}
              {isEditing ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Secretaria</th>
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Agendas</th>
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {secretaries.map(secretary => (
              <tr key={secretary.id} className={`hover:bg-blue-50/50 transition ${editId === secretary.id ? 'bg-orange-50' : ''}`}>
                <td className="p-5">
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    {secretary.name}
                    <AccountStatusBadge email={secretary.email} />
                  </div>
                  <div className="text-xs text-gray-500">{secretary.email}{secretary.phone && ` · ${secretary.phone}`}</div>
                </td>
                <td className="p-5 text-sm">
                  {secretary.doctorIds.length > 0 ? (
                    <span className="text-gray-600">{secretary.doctorIds.map(findDoctorLabel).filter(Boolean).join(', ')}</span>
                  ) : (
                    <span className="text-amber-600 font-medium">Sin agendas asignadas</span>
                  )}
                </td>
                <td className="p-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => startEdit(secretary)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition" title="Editar" aria-label={`Editar a ${secretary.name}`}>
                      <Edit2 className="w-5 h-5"/>
                    </button>
                    <button onClick={() => setDeleteId(secretary.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar" aria-label={`Eliminar a ${secretary.name}`}>
                      <Trash2 className="w-5 h-5"/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {secretaries.length === 0 && (
          <div className="p-10 text-center text-gray-400">Todavía no hay secretarias de médicos particulares.</div>
        )}
      </div>
    </section>
  );
};

export default ParticularSecretariesPanel;
