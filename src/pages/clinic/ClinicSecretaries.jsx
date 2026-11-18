import React, { useId, useState } from 'react';
import Navbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import PageHeader from '../../components/PageHeader';
import FadeIn from '../../components/FadeIn';
import IconAction from '../vitadev/IconAction';
import AccountStatusBadge from '../vitadev/AccountStatusBadge';
import TemporaryPasswordModal from '../vitadev/TemporaryPasswordModal';
import { useAccountActions } from '../vitadev/useAccountActions';
import { useSuccessModal } from '../vitadev/useSuccessModal';
import { buildUserDirectory } from '../vitadev/userDirectory';
import { EditConfirmModal, SuccessModal } from './ClinicModals';
import { useClinicData } from './clinicDataContext';
import { validateName, validateEmail, validatePhone, validateRequired, errorBorder } from './clinicValidation';
import { resetPassword, getRegisteredEmails } from '../../services/authService';
import { ROLES } from '../../constants/roles';
import { Trash2, Pencil, KeyRound, Ban, UserCheck, UserPlus, Users, Save, X } from 'lucide-react';

// Convierte una secretaria en los valores del formulario de edición.
const toForm = (secretary) => ({
  name: secretary.name,
  email: secretary.email,
  phone: secretary.phone,
  area: secretary.area,
  doctorIds: secretary.doctorIds,
});

// Pantalla del administrador de institución (clínica u hospital): secretarias de SU institución y las
// agendas de qué médicos maneja cada una.
// Mismas acciones que VitaDev con las secretarias de médicos particulares: alta (con su cuenta y una
// contraseña temporal), edición, resetear contraseña, inhabilitar o habilitar y eliminar.
const ClinicSecretaries = () => {
  // useId genera un prefijo único para los id de los inputs (para los <label htmlFor>).
  const fieldId = useId();

  // Datos compartidos con la pantalla de Médicos (ver ClinicDataProvider.jsx).
  // `assignments` son los médicos vinculados a la clínica: solo esos se pueden asignar.
  const data = useClinicData();
  const { clinic, units, terms, assignments, secretaries, addSecretary, updateSecretary, removeSecretary, findDoctor } = data;

  // Formulario vacío. Si la institución tiene una sola área o sector, la dejamos elegida.
  const emptyForm = {
    name: '',
    email: '',
    phone: '',
    area: units.length === 1 ? units[0] : '',
    doctorIds: [],
  };

  // Estado propio de esta pantalla (la lista de secretarias vive en el contexto).
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null); // id de la secretaria que se edita (null = alta)
  const [deleteId, setDeleteId] = useState(null); // id de la secretaria a eliminar (null = ventana cerrada)
  const [isConfirming, setIsConfirming] = useState(false); // ventana naranja de confirmación (alta o edición)
  const [showForm, setShowForm] = useState(false); // el formulario está oculto hasta que se pide
  // Errores de validación por campo, por ejemplo { phone: 'Ingresá un teléfono...' }.
  const [errors, setErrors] = useState({});
  const [credentials, setCredentials] = useState(null); // contraseña temporal recién generada
  const { success, showSuccess } = useSuccessModal();
  // Resetear contraseña, inhabilitar y habilitar (las mismas acciones que usa VitaDev).
  const { statusOf: accountStatus, requestReset, requestDisable, requestEnable, modals: accountModals } = useAccountActions();

  const isEditing = editId !== null;

  // `setForm(prev => ...)`: React nos pasa el valor más reciente del formulario,
  // así dos cambios seguidos no se pisan entre sí.
  // Al corregir un campo se borra su mensaje de error.
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Revisa todos los campos. Devuelve solo los que tienen error: { campo: mensaje }.
  const validateForm = () => {
    // El email es su usuario: no puede repetirse con ninguna otra cuenta del sistema.
    const takenEmails = [...buildUserDirectory(data).map((u) => u.email), ...getRegisteredEmails()]
      .map((email) => email.toLowerCase());
    const found = {
      name: validateName(form.name),
      // Al editar el email no cambia (es el usuario de la cuenta), así que no se revisa.
      email: isEditing ? '' : validateEmail(form.email, takenEmails),
      phone: validatePhone(form.phone),
      area: validateRequired(form.area, `Elegí ${terms.unit === 'Sector' ? 'el sector' : 'el área'}.`),
    };
    // Object.entries convierte el objeto en pares [campo, mensaje]; nos quedamos con los que tienen mensaje.
    return Object.fromEntries(Object.entries(found).filter(([, message]) => message));
  };

  // Datos listos para guardar: sin espacios de más y el email en minúsculas.
  const cleanForm = (values) => ({
    ...values,
    name: values.name.trim().replace(/\s+/g, ' '),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim(),
  });

  // Agrega un médico a las agendas de la secretaria (si todavía no estaba).
  const addDoctor = (doctorId) => {
    if (!doctorId) return;
    setForm((prev) => (prev.doctorIds.includes(doctorId)
      ? prev
      : { ...prev, doctorIds: [...prev.doctorIds, doctorId] }));
  };

  // Quita un médico de sus agendas.
  const removeDoctor = (doctorId) => {
    setForm((prev) => ({ ...prev, doctorIds: prev.doctorIds.filter((id) => id !== doctorId) }));
  };

  // Agrega de una vez a todos los médicos de un área o sector.
  // `new Set(...)` descarta repetidos (los que ya estaban asignados).
  const addAllFromUnit = (unit) => {
    const idsInUnit = assignments.filter((a) => a.area === unit).map((a) => a.doctorId);
    setForm((prev) => ({ ...prev, doctorIds: [...new Set([...prev.doctorIds, ...idsInUnit])] }));
  };

  const startEdit = (secretary) => {
    setShowForm(true);
    setEditId(secretary.id);
    setForm(toForm(secretary));
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
  };

  // Validamos y pedimos confirmación (naranja) tanto para agregar como para editar.
  const handleSubmit = (e) => {
    e.preventDefault(); // evita que el navegador recargue la página al enviar el form
    const found = validateForm();
    setErrors(found);
    if (Object.keys(found).length > 0) return; // hay errores: no se guarda
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
    addSecretary(secretary);
    // También se le crea el acceso, con una contraseña temporal que tiene que cambiar al entrar.
    const temporaryPassword = resetPassword(secretary.email, { name: secretary.name, role: ROLES.SECRETARY });
    cancelEdit();
    setCredentials({
      title: '¡Secretaria agregada!',
      message: `${secretary.name} ya forma parte de ${clinic.name} y puede iniciar sesión con ${secretary.email}.`,
      password: temporaryPassword,
    });
  };

  const handleConfirmDelete = () => {
    const name = secretaries.find((s) => s.id === deleteId)?.name;
    removeSecretary(deleteId);
    if (deleteId === editId) cancelEdit();
    setDeleteId(null);
    showSuccess('¡Secretaria eliminada!', `${name} ya no forma parte de ${clinic.name} y su cuenta fue dada de baja.`);
  };

  // Protección: si el usuario no tiene una clínica válida, no hay nada que mostrar.
  if (!clinic) {
    return (
      <div className="min-h-screen bg-slate-50 overflow-x-clip">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-10 text-center text-gray-500">
          Tu usuario no tiene una institución asignada.
        </div>
      </div>
    );
  }

  // Médicos ya asignados (para los chips) y los que todavía se pueden agregar.
  const selectedAssignments = form.doctorIds
    .map((id) => assignments.find((a) => a.doctorId === id))
    .filter(Boolean);
  // Médicos que todavía se pueden agregar (los inhabilitados en la institución no reciben turnos).
  const availableAssignments = assignments.filter((a) => !form.doctorIds.includes(a.doctorId) && a.status !== 'disabled');
  const availableInFormUnit = availableAssignments.filter((a) => a.area === form.area);

  const inputClass = 'w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white';
  const labelClass = 'text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block';

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-clip">
      <Navbar />
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar secretaria"
        message={`¿Confirma que desea eliminar a ${secretaries.find((s) => s.id === deleteId)?.name ?? 'esta secretaria'} de ${clinic.name}? Se dará de baja su cuenta y no podrá volver a iniciar sesión.`}
      />
      <EditConfirmModal
        isOpen={isConfirming}
        title={isEditing ? '¿Modificar secretaria?' : '¿Agregar secretaria?'}
        message={isEditing
          ? `Vas a actualizar los datos y las agendas de ${form.name}. ¿Guardar los cambios?`
          : `Vas a dar de alta a ${form.name.trim()} en ${clinic.name} y crear su acceso. ¿Confirmar?`}
        confirmLabel={isEditing ? 'Sí, Modificar' : 'Sí, Agregar'}
        onCancel={() => setIsConfirming(false)}
        onConfirm={handleConfirm}
      />
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />
      <TemporaryPasswordModal credentials={credentials} onClose={() => setCredentials(null)} />
      {accountModals}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <PageHeader
          icon={Users}
          eyebrow={`Administración ${terms.fromPlace}`}
          title="Secretarias"
          description={`${clinic.name} · ${clinic.address}`}
          actions={!showForm && (
            <button type="button" onClick={() => setShowForm(true)} className="w-full lg:w-auto min-h-[44px] py-2.5 px-5 whitespace-nowrap rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/30 transition flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5"/> Agregar secretaria
            </button>
          )}
        />

        {/* Formulario: azul para agregar (oculto hasta pedirlo), naranja mientras se edita */}
        {showForm && (
        <div className={`bg-white p-5 sm:p-8 rounded-3xl shadow-sm mb-6 sm:mb-8 border transition-all duration-300 animate-fadeIn ${isEditing ? 'border-orange-200 ring-4 ring-orange-50' : 'border-gray-100'}`}>
          <div className="flex justify-between items-center gap-4 mb-6">
            <h2 className={`font-bold text-lg sm:text-xl ${isEditing ? 'text-orange-600' : 'text-gray-900'}`}>
              {isEditing ? 'Editando secretaria' : 'Agregar secretaria'}
            </h2>
            <button type="button" onClick={cancelEdit} aria-label="Cerrar formulario" className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-300 outline-none flex items-center justify-center transition-colors shrink-0"><X className="w-5 h-5"/></button>
          </div>
          {/* noValidate: usamos nuestros propios mensajes en lugar de los del navegador */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Fila 1: datos de la secretaria */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label htmlFor={`${fieldId}-nombre`} className={labelClass}>Nombre Completo</label>
                <input id={`${fieldId}-nombre`} maxLength={60} autoComplete="off" aria-invalid={Boolean(errors.name)} aria-describedby={`${fieldId}-nombre-error`} placeholder="Ej: Laura Gómez" className={`${inputClass} ${errorBorder(errors.name)}`} value={form.name} onChange={e => updateField('name', e.target.value)} />
                {errors.name && <p id={`${fieldId}-nombre-error`} role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor={`${fieldId}-email`} className={labelClass}>Email (usuario)</label>
                {/* Al editar no se cambia: es el usuario con el que inicia sesión */}
                <input id={`${fieldId}-email`} type="email" maxLength={80} autoComplete="off" disabled={isEditing} aria-invalid={Boolean(errors.email)} aria-describedby={`${fieldId}-email-error`} placeholder="secretaria@samsa.med" className={`${inputClass} disabled:text-gray-500 disabled:cursor-not-allowed ${errorBorder(errors.email)}`} value={form.email} onChange={e => updateField('email', e.target.value)} />
                {errors.email && <p id={`${fieldId}-email-error`} role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor={`${fieldId}-telefono`} className={labelClass}>Teléfono</label>
                <input id={`${fieldId}-telefono`} type="tel" inputMode="tel" maxLength={20} autoComplete="off" aria-invalid={Boolean(errors.phone)} aria-describedby={`${fieldId}-telefono-error`} placeholder="381 400-0000" className={`${inputClass} ${errorBorder(errors.phone)}`} value={form.phone} onChange={e => updateField('phone', e.target.value)} />
                {errors.phone && <p id={`${fieldId}-telefono-error`} role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor={`${fieldId}-area`} className={labelClass}>{terms.unit}</label>
                <select id={`${fieldId}-area`} aria-invalid={Boolean(errors.area)} aria-describedby={`${fieldId}-area-error`} className={`${inputClass} appearance-none ${errorBorder(errors.area)}`} value={form.area} onChange={e => updateField('area', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {units.map(area => <option key={area} value={area}>{area}</option>)}
                </select>
                {errors.area && <p id={`${fieldId}-area-error`} role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.area}</p>}
              </div>
            </div>

            {/* Fila 2: médicos cuyas agendas maneja. Los elegidos se ven como "chips" y se
                agregan con un desplegable agrupado por área o sector: así el formulario no
                crece aunque la institución tenga muchos médicos. */}
            <div>
              <label htmlFor={`${fieldId}-medicos`} className={labelClass}>Agendas que maneja</label>
              {selectedAssignments.length > 0 ? (
                <ul className="flex flex-wrap gap-2 mb-3">
                  {selectedAssignments.map(assignment => {
                    const doctorName = findDoctor(assignment.doctorId)?.name;
                    return (
                      <li key={assignment.doctorId} className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-sm">
                        <span className="font-bold text-gray-800">{doctorName}</span>
                        <span className="text-xs text-gray-500">{assignment.area}</span>
                        <button
                          type="button"
                          onClick={() => removeDoctor(assignment.doctorId)}
                          className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                          title={`Quitar a ${doctorName}`}
                          aria-label={`Quitar a ${doctorName}`}
                        >
                          <X className="w-3.5 h-3.5"/>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                assignments.length > 0 && <p className="text-sm text-gray-400 mb-3">Todavía no le asignaste médicos.</p>
              )}
              {availableAssignments.length > 0 && (
                <div className="flex flex-wrap gap-3 items-center">
                  {/* value="" fijo: después de elegir, el desplegable vuelve a "Agregar médico..." */}
                  <select id={`${fieldId}-medicos`} value="" onChange={e => addDoctor(e.target.value)} className={`${inputClass} appearance-none md:max-w-sm`}>
                    <option value="">Agregar médico...</option>
                    {units.map(unit => {
                      const inUnit = availableAssignments.filter(a => a.area === unit);
                      if (inUnit.length === 0) return null;
                      return (
                        <optgroup key={unit} label={unit}>
                          {inUnit.map(a => <option key={a.doctorId} value={a.doctorId}>{findDoctor(a.doctorId)?.name}</option>)}
                        </optgroup>
                      );
                    })}
                  </select>
                  {availableInFormUnit.length > 0 && (
                    <button
                      type="button"
                      onClick={() => addAllFromUnit(form.area)}
                      className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition flex items-center gap-1"
                    >
                      <UserPlus className="w-4 h-4"/> Agregar todos los de {form.area} ({availableInFormUnit.length})
                    </button>
                  )}
                </div>
              )}
              {assignments.length === 0 && (
                <p className="text-sm text-gray-400">Primero vinculá médicos a {terms.place} desde la pantalla Médicos.</p>
              )}
            </div>

            <div className="flex justify-end">
              <button type="submit" className={`w-full sm:w-auto py-3 px-8 rounded-xl font-bold text-white transition shadow-md flex justify-center gap-2 items-center ${isEditing ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                {isEditing ? <Save className="w-5 h-5"/> : <UserPlus className="w-5 h-5"/>}
                {isEditing ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
        )}

        {/* Tabla de secretarias de la clínica */}
        <FadeIn delay={200}><div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left border-collapse block lg:table">
            <thead className="hidden lg:table-header-group bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Secretaria</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">{terms.unit}</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Agendas</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="block lg:table-row-group divide-y divide-gray-100 lg:divide-gray-50">
              {secretaries.map(secretary => (
                <tr key={secretary.id} className={`block lg:table-row px-5 py-4 lg:p-0 hover:bg-blue-50/50 transition ${editId === secretary.id ? 'bg-orange-50' : ''}`}>
                  <td className="block lg:table-cell py-1 lg:p-5">
                    <div className="font-bold text-gray-900 flex flex-wrap items-center gap-2">
                      {secretary.name}
                      <AccountStatusBadge email={secretary.email} />
                    </div>
                    <div className="text-xs text-gray-500">{secretary.email}{secretary.phone && ` · ${secretary.phone}`}</div>
                  </td>
                  <td className="block lg:table-cell py-1 lg:p-5">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                      {secretary.area}
                    </span>
                  </td>
                  <td className="block lg:table-cell py-1 lg:p-5 text-sm">
                    {secretary.doctorIds.length > 0 ? (
                      // Hasta 3 nombres; el resto se resume como "y N más" (la lista completa, al pasar el mouse).
                      <span className="text-gray-600" title={secretary.doctorIds.map(id => findDoctor(id)?.name).join(', ')}>
                        {secretary.doctorIds.slice(0, 3).map(id => findDoctor(id)?.name).join(', ')}
                        {secretary.doctorIds.length > 3 && (
                          <span className="text-gray-400"> y {secretary.doctorIds.length - 3} más</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium">Sin agendas asignadas</span>
                    )}
                  </td>
                  <td className="block lg:table-cell py-1 lg:p-5">
                    <div className="flex justify-start lg:justify-center gap-1 pt-2 lg:pt-0">
                      {accountStatus(secretary.email) === 'active' && (
                        <>
                          <IconAction icon={Pencil} tone="blue" onClick={() => startEdit(secretary)} label={`Editar datos de ${secretary.name}`} />
                          <IconAction icon={KeyRound} tone="orange" onClick={() => requestReset({ name: secretary.name, email: secretary.email, profile: { name: secretary.name, role: ROLES.SECRETARY } })} label={`Resetear contraseña de ${secretary.name}`} />
                          <IconAction icon={Ban} tone="amber" onClick={() => requestDisable(secretary)} label={`Inhabilitar a ${secretary.name}`} />
                        </>
                      )}
                      {/* Primero se inhabilita; recién con la cuenta inhabilitada se puede eliminar. */}
                      {accountStatus(secretary.email) === 'disabled' && (
                        <IconAction icon={UserCheck} tone="green" onClick={() => requestEnable(secretary)} label={`Habilitar a ${secretary.name}`} />
                      )}
                      {accountStatus(secretary.email) !== 'active' && (
                        <IconAction icon={Trash2} tone="red" onClick={() => setDeleteId(secretary.id)} label={`Eliminar a ${secretary.name} ${terms.fromPlace}`} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {secretaries.length === 0 && (
            <div className="p-10 text-center text-gray-400">Todavía no hay secretarias en {terms.thisPlace}.</div>
          )}
        </div></FadeIn>
      </div>
    </div>
  );
};

export default ClinicSecretaries;
