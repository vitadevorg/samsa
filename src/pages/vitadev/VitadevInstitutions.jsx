import React, { useId, useState } from 'react';
import Navbar from '../../components/Navbar';
import { EditConfirmModal, SuccessModal } from '../clinic/ClinicModals';
import { useClinicData } from '../clinic/clinicDataContext';
import {
  validateInstitutionName, validateAddress, validatePhone, validateEmail, validateName, validateNewPassword, errorBorder,
} from '../clinic/clinicValidation';
import { getInstitutionUnits } from '../../data/institutions';
import { resetPassword, setPassword, updateAccount, getRegisteredEmails } from '../../services/authService';
import { ROLES } from '../../constants/roles';
import { createId } from '../../utils/ids';
import { SPECIALTIES, INSURANCES, STUDY_GROUPS } from '../../constants/catalog';
import CheckboxDropdown from '../../components/CheckboxDropdown';
import { cuilDigits, formatCuil, isValidCuil } from '../../utils/cuil';
import AccountStatusBadge from './AccountStatusBadge';
import { buildUserDirectory } from './userDirectory';
import { useSuccessModal } from './useSuccessModal';
import TemporaryPasswordModal from './TemporaryPasswordModal';
import { useAccountActions } from './useAccountActions';
import IconAction from './IconAction';
import TypeToConfirmModal from './TypeToConfirmModal';
import PageHeader from '../../components/PageHeader';
import FadeIn from '../../components/FadeIn';
import { Building2, Hospital, Save, X, MapPin, Phone, Mail, Plus, Stethoscope, Users, Shield, Pencil, KeyRound, Ban, UserCheck, UserX, UserPlus, Trash2, Hash, CheckCircle2, Check, ChevronDown } from 'lucide-react';

// Textos y colores que cambian según se listen clínicas u hospitales.
const KINDS = {
  clinic: { title: 'Clínicas', single: 'clínica', article: 'la clínica', Icon: Building2, empty: 'No hay clínicas registradas.', adminRole: ROLES.CLINIC_ADMIN },
  hospital: { title: 'Hospitales', single: 'hospital', article: 'el hospital', Icon: Hospital, empty: 'No hay hospitales registrados.', adminRole: ROLES.HOSPITAL_ADMIN },
};

const EMPTY_FORM = { name: '', legalName: '', refes: '', cuit: '', arcaVerified: false, insurances: [], studies: [], newUnits: [], address: '', phone: '', email: '', adminName: '', adminEmail: '', adminPhone: '' };

const toForm = (institution) => ({
  ...EMPTY_FORM,
  name: institution.name,
  legalName: institution.legalName ?? '',
  refes: institution.refes ?? '',
  cuit: institution.cuit ?? '',
  arcaVerified: Boolean(institution.arcaVerified),
  insurances: institution.insurances ?? [],
  studies: institution.studies ?? [],
  newUnits: [],
  address: institution.address,
  phone: institution.phone ?? '',
  email: institution.email ?? '',
});

const clean = (text) => text.trim().replace(/\s+/g, ' ');

// Razón social: obligatoria, entre 3 y 120 caracteres.
const validateLegalName = (value) => {
  const text = value.trim();
  if (!text) return 'Ingresá la razón social.';
  if (text.length < 3) return 'La razón social es demasiado corta.';
  if (text.length > 120) return 'La razón social no puede superar los 120 caracteres.';
  return '';
};

// Código REFES (Registro Federal de Establecimientos de Salud): 14 dígitos.
const refesDigits = (value) => value.replace(/\D/g, '');
const validateRefes = (value, taken) => {
  const digits = refesDigits(value);
  if (!digits) return 'Ingresá el código REFES.';
  if (digits.length !== 14) return 'El código REFES tiene que tener 14 dígitos.';
  if (taken.includes(digits)) return 'Ya hay una institución con ese código REFES.';
  return '';
};

// CUIT de la institución: XX-XXXXXXXX-X, de persona jurídica (30, 33 o 34) y con dígito verificador válido.
const validateInstitutionCuit = (value, taken) => {
  const digits = cuilDigits(value);
  if (!digits) return 'Ingresá el CUIT.';
  if (digits.length !== 11) return 'El CUIT tiene que tener 11 dígitos (XX-XXXXXXXX-X).';
  if (!['30', '33', '34'].includes(digits.slice(0, 2))) return 'El CUIT de una institución empieza con 30, 33 o 34.';
  if (!isValidCuil(digits)) return 'CUIT inválido: revisá el último dígito.';
  if (taken.includes(digits)) return 'Ya hay una institución con ese CUIT.';
  return '';
};

// Pantalla del administrador de VitaDev: clínicas (`kind="clinic"`) u hospitales (`kind="hospital"`).
// Puede asociar una institución nueva (con su administrador), corregir sus datos, crearle áreas o
// sectores, gestionar a sus administradores (y sumar nuevos) e inhabilitar o dar de baja la institución.
// Sin datos clínicos.
const VitadevInstitutions = ({ kind }) => {
  const fieldId = useId();
  const data = useClinicData();
  const { institutions, institutionAdmins, allAssignments, allSecretaries, deactivatedEmails, disabledEmails, addInstitution, updateInstitution, updateInstitutionAdmin, addUnit, addInstitutionAdmin, institutionStatus, setInstitutionStatus } = data;
  const { title, single, article, Icon, empty, adminRole } = KINDS[kind];
  const list = institutions.filter((i) => Boolean(i.sectors) === (kind === 'hospital'));

  const [editId, setEditId] = useState(null); // institución que se edita (null = alta de una nueva)
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isConfirming, setIsConfirming] = useState(false); // ventana naranja (alta o edición)
  const [showCreate, setShowCreate] = useState(false); // el formulario de alta está oculto hasta que se pide
  // Edición de un administrador: null = cerrada.
  const [adminEditId, setAdminEditId] = useState(null);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [adminErrors, setAdminErrors] = useState({});
  const [isConfirmingAdmin, setIsConfirmingAdmin] = useState(false);
  // Texto escrito en el campo "nueva área" de cada institución: { [id]: { value, error } }.
  const { success, showSuccess } = useSuccessModal();
  // Cuentas de los administradores: resetear, inhabilitar, habilitar y dar de baja (primero se inhabilita).
  const { statusOf: accountStatus, requestReset, requestDisable, requestEnable, requestDeactivate, modals: accountModals } = useAccountActions();
  const [credentials, setCredentials] = useState(null); // contraseña temporal recién generada (null = ventana cerrada)
  // Estado de la institución: { institution, action: 'disable' | 'enable' | 'deactivate' } esperando confirmación.
  const [statusChange, setStatusChange] = useState(null);
  // Alta de un administrador nuevo en una institución.
  const [newAdminFor, setNewAdminFor] = useState(null); // id de la institución (null = formulario cerrado)
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', phone: '' });
  const [newAdminErrors, setNewAdminErrors] = useState({});
  const [confirmNewAdmin, setConfirmNewAdmin] = useState(false);

  const openNewAdmin = (institutionId) => {
    setNewAdminFor(institutionId);
    setNewAdmin({ name: '', email: '', phone: '' });
    setNewAdminErrors({});
  };

  const handleSubmitNewAdmin = (e) => {
    e.preventDefault();
    const takenEmails = [...buildUserDirectory(data).map((u) => u.email), ...getRegisteredEmails()].map((email) => email.toLowerCase());
    const found = Object.fromEntries(Object.entries({
      name: validateName(clean(newAdmin.name)),
      email: validateEmail(newAdmin.email, takenEmails),
      phone: validatePhone(newAdmin.phone, { required: true }),
    }).filter(([, message]) => message));
    setNewAdminErrors(found);
    if (Object.keys(found).length === 0) setConfirmNewAdmin(true);
  };

  const handleConfirmNewAdmin = () => {
    const institution = institutions.find((i) => i.id === newAdminFor);
    const admin = { name: clean(newAdmin.name), email: newAdmin.email.trim().toLowerCase(), phone: newAdmin.phone.trim() };
    addInstitutionAdmin(newAdminFor, admin);
    // Se le crea el acceso con una contraseña temporal que tiene que cambiar al entrar.
    const temporaryPassword = resetPassword(admin.email, { name: admin.name, role: adminRole, institutionId: newAdminFor });
    setConfirmNewAdmin(false);
    setNewAdminFor(null);
    setCredentials({
      title: '¡Administrador agregado!',
      message: `${admin.name} ya puede administrar ${institution?.name} con ${admin.email}.`,
      password: temporaryPassword,
    });
  };

  const STATUS_COPY = {
    disable: {
      title: `¿Inhabilitar ${single}?`,
      message: (name) => `${name} queda inhabilitada: sus administradores, secretarias y los médicos que solo trabajan ahí no podrán iniciar sesión, y no se podrán reservar turnos en ella. Los médicos que atienden en otras instituciones conservan su acceso. Podés volver a habilitarla cuando quieras.`,
      label: 'Sí, Inhabilitar', success: (name) => [`¡${name} inhabilitada!`, 'Su personal no puede acceder y no recibe turnos.'], status: 'disabled',
    },
    enable: {
      title: `¿Habilitar ${single}?`,
      message: (name) => `${name} vuelve a estar activa: su personal recupera el acceso y se pueden reservar turnos otra vez.`,
      label: 'Sí, Habilitar', success: (name) => [`¡${name} habilitada!`, 'Su personal ya puede volver a acceder.'], status: 'active',
    },
    deactivate: {
      title: 'Dar de baja definitivamente',
      message: (name) => `¿Confirma que desea dar de baja definitivamente ${article.split(' ')[0] === 'el' ? 'el' : 'la'} ${single} ${name}? Su personal (salvo los médicos que atienden en otras instituciones) queda dado de baja y no se podrá volver a habilitar.`,
      label: 'Sí, Dar de baja', success: (name) => [`¡${name} dada de baja!`, 'La baja es definitiva.'], status: 'deactivated',
    },
  };

  const handleConfirmStatus = () => {
    const { institution, action } = statusChange;
    const copy = STATUS_COPY[action];
    setInstitutionStatus(institution.id, copy.status);
    showSuccess(...copy.success(institution.name));
    setStatusChange(null);
  };

  const isEditing = editId !== null;
  const editingInstitution = institutions.find((i) => i.id === editId);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const startEdit = (institution) => {
    setShowCreate(false);
    setAdminEditId(null);
    setEditId(institution.id);
    setForm(toForm(institution));
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setShowCreate(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const openCreate = () => {
    setAdminEditId(null);
    setShowCreate(true);
  };

  // --- Administradores ---
  const editingAdmin = institutionAdmins.find((a) => a.id === adminEditId);

  const startEditAdmin = (admin) => {
    setShowCreate(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setAdminEditId(admin.id);
    setAdminForm({ name: admin.name, email: admin.email, phone: admin.phone ?? '', password: '' });
    setAdminErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditAdmin = () => {
    setAdminEditId(null);
    setAdminErrors({});
  };

  const updateAdminField = (field, value) => {
    setAdminForm((prev) => ({ ...prev, [field]: value }));
    setAdminErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmitAdmin = (e) => {
    e.preventDefault();
    // El email nuevo no puede repetirse con otra cuenta (la propia, sin cambios, sí vale).
    const takenEmails = [...buildUserDirectory(data).map((u) => u.email), ...getRegisteredEmails()]
      .map((email) => email.toLowerCase())
      .filter((email) => email !== editingAdmin.email.toLowerCase());
    const found = {
      name: validateName(adminForm.name),
      email: validateEmail(adminForm.email, takenEmails),
      phone: validatePhone(adminForm.phone),
      // La contraseña es opcional: solo se cambia si se completa.
      password: adminForm.password ? validateNewPassword(adminForm.password) : '',
    };
    const withErrors = Object.fromEntries(Object.entries(found).filter(([, message]) => message));
    setAdminErrors(withErrors);
    if (Object.keys(withErrors).length > 0) return;
    setIsConfirmingAdmin(true);
  };

  const handleConfirmAdmin = () => {
    const changes = { name: clean(adminForm.name), email: adminForm.email.trim().toLowerCase(), phone: adminForm.phone.trim() };
    updateAccount(editingAdmin.email, { email: changes.email, name: changes.name });
    if (adminForm.password) setPassword(changes.email, adminForm.password);
    updateInstitutionAdmin(adminEditId, changes);
    setIsConfirmingAdmin(false);
    cancelEditAdmin();
    showSuccess('¡Cambios guardados!', 'Los datos del administrador fueron actualizados.');
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // evita que el navegador recargue la página al enviar el form
    const others = institutions.filter((i) => i.id !== editId);
    const nameTaken = others.some((i) => i.name.toLowerCase() === clean(form.name).toLowerCase());
    const found = {
      name: validateInstitutionName(form.name) || (nameTaken ? 'Ya hay una institución con ese nombre.' : ''),
      legalName: validateLegalName(form.legalName),
      refes: validateRefes(form.refes, others.map((i) => refesDigits(i.refes ?? ''))),
      cuit: validateInstitutionCuit(form.cuit, others.map((i) => cuilDigits(i.cuit ?? ''))),
      arcaVerified: form.arcaVerified ? '' : 'Confirmá que verificaste la inscripción en ARCA.',
      address: validateAddress(form.address),
      phone: validatePhone(form.phone, { required: true }),
      email: validateEmail(form.email, others.map((i) => (i.email ?? '').toLowerCase())),
    };
    if (!isEditing) {
      // El email del administrador es su usuario: no puede repetirse con ninguna otra cuenta.
      const takenEmails = [...buildUserDirectory(data).map((u) => u.email), ...getRegisteredEmails()]
        .map((email) => email.toLowerCase());
      found.adminName = validateName(form.adminName);
      found.adminEmail = validateEmail(form.adminEmail, takenEmails);
      found.adminPhone = validatePhone(form.adminPhone);
    }
    const withErrors = Object.fromEntries(Object.entries(found).filter(([, message]) => message));
    setErrors(withErrors);
    if (Object.keys(withErrors).length > 0) return;
    setIsConfirming(true);
  };

  const handleConfirm = () => {
    const institution = {
      name: clean(form.name),
      legalName: clean(form.legalName),
      refes: refesDigits(form.refes),
      cuit: formatCuil(form.cuit),
      arcaVerified: true,
      insurances: form.insurances,
      studies: form.studies,
      address: clean(form.address),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
    };
    setIsConfirming(false);
    if (isEditing) {
      updateInstitution(editId, institution);
      form.newUnits.forEach((unit) => addUnit(editId, unit));
      cancelEdit();
      showSuccess('¡Cambios guardados!', `Los datos de ${article} fueron actualizados.`);
      return;
    }
    const id = createId();
    const admin = { name: clean(form.adminName), email: form.adminEmail.trim().toLowerCase(), phone: form.adminPhone.trim() };
    addInstitution(kind, { ...institution, id }, admin);
    // Se le crea el acceso al administrador, con una contraseña temporal que tiene que cambiar al entrar.
    const temporaryPassword = resetPassword(admin.email, { name: admin.name, role: adminRole, institutionId: id });
    cancelEdit();
    setCredentials({
      title: single === 'clínica' ? '¡Clínica asociada!' : '¡Hospital asociado!',
      message: `${institution.name} ya forma parte de S.A.M.S.A. Su administrador ${admin.name} entra con ${admin.email}.`,
      password: temporaryPassword,
    });
  };


  const inputClass = 'w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white';
  const labelClass = 'text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block';
  const fieldError = (name, id) => errors[name] && (
    <p id={`${fieldId}-${id}-error`} role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors[name]}</p>
  );
  const textField = (name, id, label, props = {}) => (
    <div>
      <label htmlFor={`${fieldId}-${id}`} className={labelClass}>{label}</label>
      <input id={`${fieldId}-${id}`} autoComplete="off" aria-invalid={Boolean(errors[name])} aria-describedby={`${fieldId}-${id}-error`} className={`${inputClass} ${errorBorder(errors[name])}`} value={form[name]} onChange={e => updateField(name, e.target.value)} {...props} />
      {fieldError(name, id)}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Navbar />
      <EditConfirmModal
        isOpen={isConfirming}
        title={isEditing ? `¿Modificar ${single}?` : `¿Asociar ${single}?`}
        message={isEditing
          ? `Vas a actualizar los datos de ${editingInstitution?.name}. ¿Guardar los cambios?`
          : `Vas a asociar ${article} “${clean(form.name)}” a S.A.M.S.A. y crear el acceso de su administrador. ¿Confirmar?`}
        confirmLabel={isEditing ? 'Sí, Modificar' : 'Sí, Asociar'}
        onCancel={() => setIsConfirming(false)}
        onConfirm={handleConfirm}
      />
      <EditConfirmModal
        isOpen={isConfirmingAdmin}
        title="¿Modificar administrador?"
        message={`Vas a actualizar los datos de ${editingAdmin?.name}${adminForm.email.trim().toLowerCase() !== editingAdmin?.email ? ' y su usuario (el anterior dejará de funcionar)' : ''}${adminForm.password ? ' y su contraseña (la tendrá que cambiar al iniciar sesión)' : ''}. ¿Guardar los cambios?`}
        onCancel={() => setIsConfirmingAdmin(false)}
        onConfirm={handleConfirmAdmin}
      />
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />
      <TemporaryPasswordModal credentials={credentials} onClose={() => setCredentials(null)} />
      {accountModals}
      {/* Inhabilitar y dar de baja piden escribir el nombre de la institución (doble verificación). */}
      {statusChange && statusChange.action !== 'enable' && (
        <TypeToConfirmModal
          key={`${statusChange.institution.id}-${statusChange.action}`}
          tone={statusChange.action === 'deactivate' ? 'red' : 'amber'}
          title={STATUS_COPY[statusChange.action].title}
          note={statusChange.action === 'deactivate' ? 'Esta acción no se puede deshacer' : 'Se puede revertir habilitándola de nuevo'}
          message={STATUS_COPY[statusChange.action].message(statusChange.institution.name)}
          confirmText={statusChange.institution.name}
          confirmLabel={STATUS_COPY[statusChange.action].label}
          onCancel={() => setStatusChange(null)}
          onConfirm={handleConfirmStatus}
        />
      )}
      <EditConfirmModal
        isOpen={statusChange?.action === 'enable'}
        title={statusChange ? STATUS_COPY[statusChange.action].title : ''}
        message={statusChange ? STATUS_COPY[statusChange.action].message(statusChange.institution.name) : ''}
        confirmLabel={statusChange ? STATUS_COPY[statusChange.action].label : ''}
        onCancel={() => setStatusChange(null)}
        onConfirm={handleConfirmStatus}
      />
      <EditConfirmModal
        isOpen={confirmNewAdmin}
        title="¿Agregar administrador?"
        message={`Vas a sumar a ${clean(newAdmin.name)} como administrador y crear su acceso. ¿Confirmar?`}
        confirmLabel="Sí, Agregar"
        onCancel={() => setConfirmNewAdmin(false)}
        onConfirm={handleConfirmNewAdmin}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <PageHeader
          icon={Icon}
          eyebrow="Administración SAMSA"
          title={title}
          actions={!showCreate && !isEditing && (
            <button onClick={openCreate} className="w-full sm:w-auto shrink-0 py-2.5 px-5 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition flex items-center justify-center gap-2">
              <Plus className="w-5 h-5"/> Asociar {single}
            </button>
          )}
        />

        {/* Edición de un administrador (naranja): nombre y teléfono; el email es su usuario */}
        {editingAdmin && (
          <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm mb-10 border border-orange-200 ring-4 ring-orange-50 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-orange-600">✏️ Editando administrador</h3>
              <button onClick={cancelEditAdmin} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full transition">
                <X className="w-3 h-3"/> Cancelar Edición
              </button>
            </div>
            <form onSubmit={handleSubmitAdmin} noValidate className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label htmlFor={`${fieldId}-edit-admin-nombre`} className={labelClass}>Nombre completo</label>
                  <input id={`${fieldId}-edit-admin-nombre`} maxLength={60} autoComplete="off" aria-invalid={Boolean(adminErrors.name)} className={`${inputClass} ${errorBorder(adminErrors.name)}`} value={adminForm.name} onChange={e => updateAdminField('name', e.target.value)} />
                  {adminErrors.name && <p role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{adminErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor={`${fieldId}-edit-admin-email`} className={labelClass}>Email (usuario)</label>
                  {/* Un administrador inhabilitado o dado de baja conserva su usuario */}
                  <input id={`${fieldId}-edit-admin-email`} type="email" maxLength={80} autoComplete="off" disabled={deactivatedEmails.has(editingAdmin.email) || disabledEmails.has(editingAdmin.email)} aria-invalid={Boolean(adminErrors.email)} className={`${inputClass} disabled:text-gray-500 disabled:cursor-not-allowed ${errorBorder(adminErrors.email)}`} value={adminForm.email} onChange={e => updateAdminField('email', e.target.value)} />
                  {adminErrors.email && <p role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{adminErrors.email}</p>}
                </div>
                <div>
                  <label htmlFor={`${fieldId}-edit-admin-telefono`} className={labelClass}>Teléfono</label>
                  <input id={`${fieldId}-edit-admin-telefono`} type="tel" inputMode="tel" maxLength={20} autoComplete="off" aria-invalid={Boolean(adminErrors.phone)} className={`${inputClass} ${errorBorder(adminErrors.phone)}`} value={adminForm.phone} onChange={e => updateAdminField('phone', e.target.value)} />
                  {adminErrors.phone && <p role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{adminErrors.phone}</p>}
                </div>
                <div className="md:col-span-3">
                  <label htmlFor={`${fieldId}-edit-admin-clave`} className={labelClass}>Nueva contraseña (opcional)</label>
                  {/* Nunca se muestra la contraseña actual: este campo solo sirve para fijar una nueva */}
                  <input id={`${fieldId}-edit-admin-clave`} type="password" maxLength={64} autoComplete="new-password" aria-invalid={Boolean(adminErrors.password)} placeholder="Dejalo vacío para no cambiarla" className={`${inputClass} md:max-w-sm ${errorBorder(adminErrors.password)}`} value={adminForm.password} onChange={e => updateAdminField('password', e.target.value)} />
                  {adminErrors.password
                    ? <p role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{adminErrors.password}</p>
                    : <p className="text-xs text-gray-400 mt-1 ml-1">Mínimo 8 caracteres, con letras y números. El administrador tendrá que cambiarla al iniciar sesión.</p>}
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="py-3 px-8 rounded-xl font-bold text-white transition shadow-md flex justify-center gap-2 items-center bg-orange-500 hover:bg-orange-600 shadow-orange-200">
                  <Save className="w-5 h-5"/> Actualizar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Formulario: azul para asociar una nueva (oculto hasta pedirlo), naranja mientras se edita */}
        {(showCreate || isEditing) && (
        <div className={`bg-white p-5 sm:p-8 rounded-3xl shadow-sm mb-10 border transition-all duration-300 ${isEditing ? 'border-orange-200 ring-4 ring-orange-50' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`font-bold text-xl ${isEditing ? 'text-orange-600' : 'text-gray-800'}`}>
              {isEditing ? `✏️ Editando ${editingInstitution?.name}` : `✨ Asociar ${single === 'clínica' ? 'Clínica' : 'Hospital'}`}
            </h3>
            <button onClick={cancelEdit} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full transition">
              <X className="w-3 h-3"/> {isEditing ? 'Cancelar Edición' : 'Cancelar'}
            </button>
          </div>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {textField('name', 'nombre', 'Nombre', { maxLength: 80 })}
              {textField('legalName', 'razon-social', 'Razón social', { maxLength: 120, placeholder: 'Ej: Clínica del Norte S.A.' })}
              {textField('refes', 'refes', 'Código REFES (14 dígitos)', { inputMode: 'numeric', maxLength: 14, placeholder: '10900012345678', onChange: (e) => updateField('refes', refesDigits(e.target.value).slice(0, 14)) })}
              {textField('cuit', 'cuit', 'CUIT', { inputMode: 'numeric', maxLength: 13, placeholder: '30-12345678-9', onChange: (e) => updateField('cuit', formatCuil(e.target.value)) })}
              <div className="md:col-span-2">
                <label htmlFor={`${fieldId}-arca`} className={`flex items-start gap-3 min-h-[44px] p-3 rounded-xl border cursor-pointer transition ${form.arcaVerified ? 'bg-emerald-50 border-emerald-200' : errors.arcaVerified ? 'border-red-300 bg-red-50/40' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input id={`${fieldId}-arca`} type="checkbox" checked={form.arcaVerified} onChange={(e) => updateField('arcaVerified', e.target.checked)} aria-invalid={Boolean(errors.arcaVerified)} aria-describedby={`${fieldId}-arca-error`} className="mt-0.5 w-5 h-5 accent-blue-600 shrink-0" />
                  <span className="text-sm text-gray-700">Verifiqué en <span className="font-bold">ARCA</span> que el CUIT está inscripto y corresponde a la razón social.</span>
                </label>
                {errors.arcaVerified && <p id={`${fieldId}-arca-error`} role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.arcaVerified}</p>}
              </div>
              {textField('address', 'direccion', 'Dirección', { maxLength: 100 })}
              {textField('phone', 'telefono', 'Teléfono', { type: 'tel', inputMode: 'tel', maxLength: 20 })}
              {textField('email', 'email', 'Email de contacto', { type: 'email', maxLength: 80 })}
              <div className="md:col-span-2">
                <CheckboxDropdown labelClass={labelClass} label="Obras sociales que acepta" options={INSURANCES} selected={form.insurances} onChange={(value) => updateField('insurances', value)} placeholder="Solo atención particular" />
              </div>
              {isEditing && editingInstitution && (
                <div className="md:col-span-2">
                  <CheckboxDropdown
                    labelClass={labelClass}
                    label={`Agregar ${kind === 'hospital' ? 'sectores' : 'áreas'} (ya tiene: ${getInstitutionUnits(editingInstitution).join(', ') || 'ninguno'})`}
                    options={SPECIALTIES.filter((unit) => !getInstitutionUnits(editingInstitution).includes(unit))}
                    selected={form.newUnits}
                    onChange={(value) => updateField('newUnits', value)}
                    placeholder={`Elegí ${kind === 'hospital' ? 'sectores' : 'áreas'} nuevos de la lista`}
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <CheckboxDropdown labelClass={labelClass} label="Estudios que se realizan" groups={STUDY_GROUPS} selected={form.studies} onChange={(value) => updateField('studies', value)} placeholder="Elegí los estudios de la lista" />
              </div>
            </div>
            {!isEditing && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3">Administrador {kind === 'hospital' ? 'del hospital' : 'de la clínica'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {textField('adminName', 'admin-nombre', 'Nombre completo', { maxLength: 60 })}
                  {textField('adminEmail', 'admin-email', 'Email (usuario)', { type: 'email', maxLength: 80 })}
                  {textField('adminPhone', 'admin-telefono', 'Teléfono (opcional)', { type: 'tel', inputMode: 'tel', maxLength: 20 })}
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <button type="submit" className={`py-3 px-8 rounded-xl font-bold text-white transition shadow-md flex justify-center gap-2 items-center ${isEditing ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                {isEditing ? <Save className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
                {isEditing ? 'Actualizar' : 'Asociar'}
              </button>
            </div>
          </form>
        </div>
        )}

        <div className="space-y-8">
          {list.map((institution, index) => {
            const units = institution.areas ?? institution.sectors;
            const doctorCount = new Set(allAssignments.filter((a) => a.institutionId === institution.id).map((a) => a.doctorId)).size;
            const secretaryCount = allSecretaries.filter((s) => s.institutionId === institution.id).length;
            const admins = institutionAdmins.filter((a) => a.institutionId === institution.id);
            const status = institutionStatus(institution.id);
            return (
              <FadeIn delay={Math.min(index, 4) * 100} key={institution.id}><article key={institution.id} aria-label={institution.name} className={`bg-white rounded-3xl shadow-sm border overflow-hidden transition-all duration-300 ${editId === institution.id ? 'border-orange-200 bg-orange-50/40' : 'border-gray-200'}`}>
                <div className="p-6 flex flex-wrap justify-between gap-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
                      {institution.name}
                      {status === 'disabled' && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">Inhabilitada</span>}
                      {status === 'deactivated' && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">Dada de baja</span>}
                    </h2>
                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      <p className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {institution.address}</p>
                      <p className="flex items-center gap-2"><Building2 className="w-4 h-4"/> {institution.legalName || 'Sin razón social cargada'}</p>
                      <p className="flex flex-wrap items-center gap-x-4 gap-y-1"><span className="flex items-center gap-2"><Hash className="w-4 h-4"/> REFES {institution.refes || '—'}</span><span>CUIT {institution.cuit || '—'}</span>{institution.arcaVerified && <span className="inline-flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 className="w-4 h-4"/> Verificado en ARCA</span>}</p>
                      <p className="flex items-center gap-2"><Phone className="w-4 h-4"/> {institution.phone}</p>
                      <p className="flex items-center gap-2"><Mail className="w-4 h-4"/> {institution.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    {/* Primero se inhabilita; recién inhabilitada se puede dar de baja. */}
                    <div className="flex gap-1">
                      {status === 'active' && (
                        <>
                          <IconAction icon={Pencil} tone="blue" onClick={() => startEdit(institution)} label={`Editar datos de ${institution.name}`} />
                          <IconAction icon={Ban} tone="amber" onClick={() => setStatusChange({ institution, action: 'disable' })} label={`Inhabilitar ${institution.name}`} />
                        </>
                      )}
                      {status === 'disabled' && (
                        <>
                          <IconAction icon={UserCheck} tone="green" onClick={() => setStatusChange({ institution, action: 'enable' })} label={`Habilitar ${institution.name}`} />
                          <IconAction icon={Trash2} tone="red" onClick={() => setStatusChange({ institution, action: 'deactivate' })} label={`Dar de baja ${institution.name}`} />
                        </>
                      )}
                      {status === 'deactivated' && <span className="text-sm text-gray-400 py-2">Sin acciones</span>}
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Stethoscope className="w-4 h-4 text-blue-500"/> {doctorCount} médico(s)</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4 text-pink-500"/> {secretaryCount} secretaria(s)</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Áreas (clínica) o sectores (hospital) */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">{kind === 'hospital' ? 'Sectores' : 'Áreas'} ({units.length})</h3>
                    <ul className="flex flex-wrap gap-2">
                      {units.map((unit) => (
                        <li key={unit} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">{unit}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Obras sociales que acepta y estudios que realiza */}
                  {[['Obras sociales que acepta', institution.insurances, 'Solo atención particular'], ['Estudios que se realizan', institution.studies, 'Sin estudios cargados']].map(([title, items = [], empty]) => (
                    <div key={title}>
                      <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">{title} ({items.length})</h3>
                      {items.length === 0 ? <p className="text-sm text-gray-400">{empty}</p> : (
                        <ul className="flex flex-wrap gap-2">
                          {items.map((item) => <li key={item} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">{item}</li>)}
                        </ul>
                      )}
                    </div>
                  ))}

                  {/* Administradores de la institución: editar, resetear e inhabilitar; con la cuenta inhabilitada, habilitar o dar de baja. */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Administradores</h3>
                    {admins.length === 0 ? (
                      <p className="text-sm text-gray-400">Sin administradores registrados.</p>
                    ) : (
                      <ul className="space-y-2">
                        {admins.map((admin) => (
                          <li key={admin.id} className={`flex items-center gap-3 p-3 rounded-xl border ${adminEditId === admin.id ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="bg-indigo-100 p-2 rounded-lg"><Shield className="w-4 h-4 text-indigo-600"/></div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                {admin.name}
                                <AccountStatusBadge email={admin.email} />
                              </p>
                              <p className="text-xs text-gray-500 truncate">{admin.email}{admin.phone && ` · ${admin.phone}`}</p>
                            </div>
                            <div className="ml-auto flex gap-1 shrink-0">
                              {accountStatus(admin.email) === 'active' && (
                                <>
                                  <IconAction icon={Pencil} tone="blue" onClick={() => startEditAdmin(admin)} label={`Editar datos de ${admin.name}`} />
                                  <IconAction icon={KeyRound} tone="orange" onClick={() => requestReset({ name: admin.name, email: admin.email, profile: { name: admin.name, role: adminRole, institutionId: institution.id } })} label={`Resetear contraseña de ${admin.name}`} />
                                  <IconAction icon={Ban} tone="amber" onClick={() => requestDisable(admin)} label={`Inhabilitar a ${admin.name}`} />
                                </>
                              )}
                              {accountStatus(admin.email) === 'disabled' && (
                                <>
                                  <IconAction icon={UserCheck} tone="green" onClick={() => requestEnable(admin)} label={`Habilitar a ${admin.name}`} />
                                  <IconAction icon={UserX} tone="red" onClick={() => requestDeactivate(admin)} label={`Dar de baja definitivamente a ${admin.name}`} />
                                </>
                              )}
                              {accountStatus(admin.email) === 'deactivated' && <span className="text-xs text-gray-400 py-2 whitespace-nowrap">Sin acciones</span>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    {status === 'active' && (newAdminFor === institution.id ? (
                      <form onSubmit={handleSubmitNewAdmin} noValidate className="mt-3 p-4 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3">
                        <p className="font-bold text-gray-800 text-sm flex items-center gap-2"><UserPlus className="w-4 h-4 text-blue-600"/> Nuevo administrador</p>
                        {[
                          { name: 'name', label: 'Nombre y apellido', props: { maxLength: 60 } },
                          { name: 'email', label: 'Email (usuario)', props: { type: 'email', maxLength: 80, placeholder: 'admin@samsa.med' } },
                          { name: 'phone', label: 'Teléfono', props: { type: 'tel', inputMode: 'tel', maxLength: 20, placeholder: '381 400-0000' } },
                        ].map(({ name, label, props }) => (
                          <div key={name}>
                            <label htmlFor={`${fieldId}-${institution.id}-nuevo-${name}`} className={labelClass}>{label}</label>
                            <input
                              id={`${fieldId}-${institution.id}-nuevo-${name}`}
                              autoComplete="off"
                              aria-invalid={Boolean(newAdminErrors[name])}
                              className={`${inputClass} ${errorBorder(newAdminErrors[name])}`}
                              value={newAdmin[name]}
                              onChange={(e) => { setNewAdmin((prev) => ({ ...prev, [name]: e.target.value })); setNewAdminErrors((prev) => ({ ...prev, [name]: '' })); }}
                              {...props}
                            />
                            {newAdminErrors[name] && <p role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{newAdminErrors[name]}</p>}
                          </div>
                        ))}
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
                          <button type="button" onClick={() => setNewAdminFor(null)} className="py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition">Cancelar</button>
                          <button type="submit" className="py-2.5 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition inline-flex items-center justify-center gap-2"><UserPlus className="w-4 h-4"/> Agregar</button>
                        </div>
                      </form>
                    ) : (
                      <button type="button" onClick={() => openNewAdmin(institution.id)} className="mt-3 w-full min-h-[44px] py-2.5 px-4 rounded-xl border-2 border-dashed border-gray-300 text-sm font-bold text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition inline-flex items-center justify-center gap-2">
                        <UserPlus className="w-4 h-4"/> Agregar administrador
                      </button>
                    ))}
                  </div>
                </div>
              </article></FadeIn>
            );
          })}
          {list.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center text-gray-400">{empty}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VitadevInstitutions;
