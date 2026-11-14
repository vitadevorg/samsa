import React, { useId, useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import { EditConfirmModal, SuccessModal } from '../clinic/ClinicModals';
import { useClinicData } from '../clinic/clinicDataContext';
import {
  validateName, validateEmail, validatePhone, validateAddress, validateRequired, errorBorder,
} from '../clinic/clinicValidation';
import { resetPassword, updateAccount, getRegisteredEmails } from '../../services/authService';
import { SPECIALTIES } from '../../constants/catalog';
import { ROLES } from '../../constants/roles';
import AccountStatusBadge from './AccountStatusBadge';
import { buildUserDirectory, PARTICULAR_LABEL } from './userDirectory';
import { stripTitle, getTitleFromName } from '../../utils/doctorName';
import { useSuccessModal, PASSWORD_SUCCESS_DURATION_MS } from './useSuccessModal';
import { Trash2, Edit2, UserPlus, Stethoscope, Save, X, MapPin } from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  address: '',
  specialty: '',
};

// Convierte un médico en los valores del formulario de edición.
const toForm = (doctor) => ({
  name: doctor.name,
  email: doctor.email,
  phone: doctor.phone,
  address: doctor.address ?? '',
  specialty: doctor.specialty,
});

// Datos listos para guardar: sin espacios de más y el email en minúsculas.
const cleanForm = (values) => ({
  ...values,
  name: values.name.trim().replace(/\s+/g, ' '),
  email: values.email.trim().toLowerCase(),
  phone: values.phone.trim(),
  address: values.address.trim().replace(/\s+/g, ' '),
});

// Médicos particulares (los que no pertenecen a ninguna clínica ni hospital): alta, edición y baja.
// Solo datos de contacto y de atención; VitaDev no ve nada clínico.
// `onOpen` avisa a la pantalla que se abrió un formulario acá, para que cierre el de la otra sección.
const ParticularDoctorsPanel = ({ onOpen }) => {
  const fieldId = useId();
  const data = useClinicData();
  const {
    particularDoctors, allSecretaries,
    addParticularDoctor, updateParticularDoctor, removeParticularDoctor,
  } = data;

  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);       // id del médico que se edita (null = alta)
  const [deleteId, setDeleteId] = useState(null);   // id del médico a eliminar (null = ventana cerrada)
  const [isConfirming, setIsConfirming] = useState(false); // ventana naranja de confirmación (alta o edición)
  const [showCreate, setShowCreate] = useState(false); // el formulario de alta está oculto hasta que se pide
  const [errors, setErrors] = useState({});
  const { success, showSuccess } = useSuccessModal();

  const isEditing = editId !== null;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Revisa todos los campos. Devuelve solo los que tienen error: { campo: mensaje }.
  const validateForm = () => {
    // El email es el usuario: no puede repetirse con ninguna otra cuenta del sistema.
    const takenEmails = [...buildUserDirectory(data).map((u) => u.email), ...getRegisteredEmails()]
      .map((email) => email.toLowerCase());
    const found = {
      // El título ("Dr.", "Dra.", "Lic.") es opcional y no cuenta como parte del nombre.
      name: validateName(stripTitle(form.name.trim())),
      // Al editar el email no cambia (es el usuario de la cuenta), así que no se revisa.
      email: isEditing ? '' : validateEmail(form.email, takenEmails),
      phone: validatePhone(form.phone, { required: true }),
      address: validateAddress(form.address),
      specialty: validateRequired(form.specialty, 'Elegí la especialidad.'),
    };
    return Object.fromEntries(Object.entries(found).filter(([, message]) => message));
  };

  const startEdit = (doctor) => {
    onOpen();
    setEditId(doctor.id);
    setForm(toForm(doctor));
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setShowCreate(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  // Validamos y pedimos confirmación (naranja) tanto para agregar como para editar.
  const handleSubmit = (e) => {
    e.preventDefault(); // evita que el navegador recargue la página al enviar el form
    const found = validateForm();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setIsConfirming(true);
  };

  const handleConfirm = () => {
    const doctor = cleanForm(form);
    setIsConfirming(false);
    if (isEditing) {
      updateParticularDoctor(editId, doctor);
      // El nombre y el título también cambian en su cuenta (así se lo saluda bien al iniciar sesión).
      updateAccount(doctor.email, { name: stripTitle(doctor.name), title: getTitleFromName(doctor.name) });
      cancelEdit();
      showSuccess('¡Cambios guardados!', 'Los datos del médico fueron actualizados.');
      return;
    }
    addParticularDoctor(doctor);
    // También se le crea el acceso, con una contraseña temporal que tiene que cambiar al entrar.
    const temporaryPassword = resetPassword(doctor.email, { name: stripTitle(doctor.name), title: getTitleFromName(doctor.name), role: ROLES.DOCTOR });
    setForm(EMPTY_FORM);
    setShowCreate(false);
    showSuccess(
      '¡Médico agregado!',
      `${doctor.name} ya puede iniciar sesión con ${doctor.email}. Contraseña temporal: ${temporaryPassword} (la tendrá que cambiar al entrar).`,
      PASSWORD_SUCCESS_DURATION_MS
    );
  };

  const handleConfirmDelete = () => {
    removeParticularDoctor(deleteId);
    if (deleteId === editId) cancelEdit();
    setDeleteId(null);
  };

  const doctorToDelete = particularDoctors.find((d) => d.id === deleteId);
  const affectedSecretaries = doctorToDelete
    ? allSecretaries.filter((s) => s.doctorIds.includes(doctorToDelete.id)).length
    : 0;

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
        title="Eliminar Médico"
        message={`¿Confirma que desea eliminar a ${doctorToDelete?.name}?${affectedSecretaries > 0 ? ` También se quitará de la agenda de ${affectedSecretaries} secretaria(s).` : ''} Se dará de baja su cuenta y no podrá volver a iniciar sesión.`}
      />
      <EditConfirmModal
        isOpen={isConfirming}
        title={isEditing ? '¿Modificar médico?' : '¿Agregar médico?'}
        message={isEditing
          ? `Vas a actualizar los datos de ${form.name}. ¿Guardar los cambios?`
          : `Vas a dar de alta a ${form.name} como médico particular y crear su acceso. ¿Confirmar?`}
        confirmLabel={isEditing ? 'Sí, Modificar' : 'Sí, Agregar'}
        onCancel={() => setIsConfirming(false)}
        onConfirm={handleConfirm}
      />
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 id={`${fieldId}-titulo`} className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg"><Stethoscope className="text-blue-600 w-6 h-6"/></div>
          Médicos particulares
        </h2>
        {!showCreate && !isEditing && (
          <button onClick={() => { onOpen(); setShowCreate(true); }} className="py-2.5 px-5 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition flex items-center gap-2">
            <UserPlus className="w-5 h-5"/> Agregar médico
          </button>
        )}
      </div>

      {/* Formulario: azul para agregar (oculto hasta pedirlo), naranja mientras se edita */}
      {(showCreate || isEditing) && (
      <div className={`bg-white p-8 rounded-2xl shadow-sm mb-8 border transition-all duration-300 ${isEditing ? 'border-orange-200 ring-4 ring-orange-50' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`font-bold text-xl ${isEditing ? 'text-orange-600' : 'text-gray-800'}`}>
            {isEditing ? '✏️ Editando Médico' : '✨ Agregar Médico'}
          </h3>
          <button onClick={cancelEdit} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full transition">
            <X className="w-3 h-3"/> {isEditing ? 'Cancelar Edición' : 'Cancelar'}
          </button>
        </div>
        {/* noValidate: usamos nuestros propios mensajes en lugar de los del navegador */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label htmlFor={`${fieldId}-nombre`} className={labelClass}>Nombre Completo</label>
              <input id={`${fieldId}-nombre`} maxLength={60} autoComplete="off" aria-invalid={Boolean(errors.name)} aria-describedby={`${fieldId}-nombre-error`} placeholder="Ej: Dra. Laura Gómez" className={`${inputClass} ${errorBorder(errors.name)}`} value={form.name} onChange={e => updateField('name', e.target.value)} />
              {fieldError('name', 'nombre')}
            </div>
            <div>
              <label htmlFor={`${fieldId}-email`} className={labelClass}>Email (usuario)</label>
              {/* Al editar no se cambia: es el usuario con el que inicia sesión */}
              <input id={`${fieldId}-email`} type="email" maxLength={80} autoComplete="off" disabled={isEditing} aria-invalid={Boolean(errors.email)} aria-describedby={`${fieldId}-email-error`} placeholder="medico@samsa.med" className={`${inputClass} disabled:text-gray-500 disabled:cursor-not-allowed ${errorBorder(errors.email)}`} value={form.email} onChange={e => updateField('email', e.target.value)} />
              {fieldError('email', 'email')}
            </div>
            <div>
              <label htmlFor={`${fieldId}-telefono`} className={labelClass}>Teléfono</label>
              <input id={`${fieldId}-telefono`} type="tel" inputMode="tel" maxLength={20} autoComplete="off" aria-invalid={Boolean(errors.phone)} aria-describedby={`${fieldId}-telefono-error`} placeholder="381 400-0000" className={`${inputClass} ${errorBorder(errors.phone)}`} value={form.phone} onChange={e => updateField('phone', e.target.value)} />
              {fieldError('phone', 'telefono')}
            </div>
            <div>
              <label htmlFor={`${fieldId}-direccion`} className={labelClass}>Dirección del consultorio</label>
              <input id={`${fieldId}-direccion`} maxLength={100} autoComplete="off" aria-invalid={Boolean(errors.address)} aria-describedby={`${fieldId}-direccion-error`} placeholder="Ej: Av. Sarmiento 450, San Miguel de Tucumán" className={`${inputClass} ${errorBorder(errors.address)}`} value={form.address} onChange={e => updateField('address', e.target.value)} />
              {fieldError('address', 'direccion')}
            </div>
            <div>
              <label htmlFor={`${fieldId}-especialidad`} className={labelClass}>Especialidad</label>
              <select id={`${fieldId}-especialidad`} aria-invalid={Boolean(errors.specialty)} aria-describedby={`${fieldId}-especialidad-error`} className={`${inputClass} appearance-none ${errorBorder(errors.specialty)}`} value={form.specialty} onChange={e => updateField('specialty', e.target.value)}>
                <option value="">Seleccionar...</option>
                {SPECIALTIES.map(specialty => <option key={specialty} value={specialty}>{specialty}</option>)}
              </select>
              {fieldError('specialty', 'especialidad')}
            </div>
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

      {/* Tabla de médicos particulares */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Profesional</th>
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Contacto</th>
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Trabaja en</th>
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {particularDoctors.map(doctor => (
              <tr key={doctor.id} className={`hover:bg-blue-50/50 transition ${editId === doctor.id ? 'bg-orange-50' : ''}`}>
                <td className="p-5">
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    {doctor.name}
                    <AccountStatusBadge email={doctor.email} />
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 inline-block mt-1">{doctor.specialty}</span>
                </td>
                <td className="p-5 text-sm text-gray-500">
                  <div>{doctor.email}</div>
                  <div>{doctor.phone}</div>
                </td>
                <td className="p-5 text-sm">
                  <div className="text-gray-500 font-medium">{PARTICULAR_LABEL}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3 shrink-0"/> {doctor.address}</div>
                </td>
                <td className="p-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => startEdit(doctor)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition" title="Editar" aria-label={`Editar a ${doctor.name}`}>
                      <Edit2 className="w-5 h-5"/>
                    </button>
                    <button onClick={() => setDeleteId(doctor.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar" aria-label={`Eliminar a ${doctor.name}`}>
                      <Trash2 className="w-5 h-5"/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {particularDoctors.length === 0 && (
          <div className="p-10 text-center text-gray-400">Todavía no hay médicos particulares.</div>
        )}
      </div>
    </section>
  );
};

export default ParticularDoctorsPanel;
