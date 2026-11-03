import React, { useId, useState } from 'react';
import Navbar from '../../components/Navbar';
import { EditConfirmModal, SuccessModal } from '../clinic/ClinicModals';
import { useClinicData } from '../clinic/clinicDataContext';
import {
  validateInstitutionName, validateAddress, validatePhone, validateEmail, validateName, validateNewPassword, validateUnitName, errorBorder,
} from '../clinic/clinicValidation';
import { getInstitutionTerms } from '../../data/institutions';
import { resetPassword, setPassword, updateAccount, getRegisteredEmails } from '../../services/authService';
import { ROLES } from '../../constants/roles';
import { createId } from '../../utils/ids';
import AccountStatusBadge from './AccountStatusBadge';
import { buildUserDirectory } from './userDirectory';
import { useSuccessModal, PASSWORD_SUCCESS_DURATION_MS } from './useSuccessModal';
import { Building2, Hospital, Edit2, Save, X, MapPin, Phone, Mail, Plus, Stethoscope, Users, Shield } from 'lucide-react';

// Textos y colores que cambian según se listen clínicas u hospitales.
const KINDS = {
  clinic: { title: 'Clínicas', single: 'clínica', article: 'la clínica', Icon: Building2, empty: 'No hay clínicas registradas.', adminRole: ROLES.CLINIC_ADMIN },
  hospital: { title: 'Hospitales', single: 'hospital', article: 'el hospital', Icon: Hospital, empty: 'No hay hospitales registrados.', adminRole: ROLES.HOSPITAL_ADMIN },
};

const EMPTY_FORM = { name: '', address: '', phone: '', email: '', adminName: '', adminEmail: '', adminPhone: '' };

const toForm = (institution) => ({
  ...EMPTY_FORM,
  name: institution.name,
  address: institution.address,
  phone: institution.phone ?? '',
  email: institution.email ?? '',
});

const clean = (text) => text.trim().replace(/\s+/g, ' ');

// Pantalla del administrador de VitaDev: clínicas (`kind="clinic"`) u hospitales (`kind="hospital"`).
// Puede asociar una institución nueva (con su administrador), corregir sus datos, crearle áreas o
// sectores y ver a sus administradores (las bajas y reseteos de contraseña están en Usuarios).
// Sin datos clínicos.
const VitadevInstitutions = ({ kind }) => {
  const fieldId = useId();
  const data = useClinicData();
  const { institutions, institutionAdmins, allAssignments, allSecretaries, deactivatedEmails, disabledEmails, addInstitution, updateInstitution, updateInstitutionAdmin, addUnit } = data;
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
  const [drafts, setDrafts] = useState({});
  const [unitToCreate, setUnitToCreate] = useState(null); // { institution, name } esperando confirmación
  const { success, showSuccess } = useSuccessModal();

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
      address: clean(form.address),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
    };
    setIsConfirming(false);
    if (isEditing) {
      updateInstitution(editId, institution);
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
    showSuccess(
      single === 'clínica' ? '¡Clínica asociada!' : '¡Hospital asociado!',
      `${institution.name} ya forma parte de S.A.M.S.A. Su administrador ${admin.name} entra con ${admin.email}. Contraseña temporal: ${temporaryPassword} (la tendrá que cambiar al entrar).`,
      PASSWORD_SUCCESS_DURATION_MS
    );
  };

  // --- Áreas / sectores ---
  const setDraft = (institutionId, draft) => setDrafts((prev) => ({ ...prev, [institutionId]: draft }));

  const handleRequestUnit = (e, institution) => {
    e.preventDefault();
    const terms = getInstitutionTerms(institution);
    const units = institution.areas ?? institution.sectors;
    const value = drafts[institution.id]?.value ?? '';
    const error = validateUnitName(value, units, terms.unitLower);
    if (error) {
      setDraft(institution.id, { value, error });
      return;
    }
    setUnitToCreate({ institution, name: clean(value) });
  };

  const handleConfirmUnit = () => {
    const { institution, name } = unitToCreate;
    addUnit(institution.id, name);
    setDraft(institution.id, { value: '', error: '' });
    setUnitToCreate(null);
    const terms = getInstitutionTerms(institution);
    showSuccess(terms.unit === 'Sector' ? '¡Sector creado!' : '¡Área creada!', `${name} ya se puede elegir en ${institution.name}.`);
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
  const unitTerms = unitToCreate ? getInstitutionTerms(unitToCreate.institution) : null;

  return (
    <div className="min-h-screen bg-gray-50">
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
      <EditConfirmModal
        isOpen={unitToCreate !== null}
        title={`¿Crear ${unitTerms?.unitLower}?`}
        message={`Vas a crear ${unitTerms?.unitLower === 'sector' ? 'el sector' : 'el área'} “${unitToCreate?.name}” en ${unitToCreate?.institution.name}. ¿Confirmar?`}
        confirmLabel="Sí, Crear"
        onCancel={() => setUnitToCreate(null)}
        onConfirm={handleConfirmUnit}
      />
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg"><Icon className="text-blue-600 w-8 h-8"/></div>
              {title}
            </h1>
          </div>
          {!showCreate && !isEditing && (
            <button onClick={openCreate} className="py-2.5 px-5 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition flex items-center gap-2">
              <Plus className="w-5 h-5"/> Asociar {single}
            </button>
          )}
        </div>

        {/* Edición de un administrador (naranja): nombre y teléfono; el email es su usuario */}
        {editingAdmin && (
          <div className="bg-white p-8 rounded-2xl shadow-sm mb-10 border border-orange-200 ring-4 ring-orange-50 transition-all duration-300">
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
        <div className={`bg-white p-8 rounded-2xl shadow-sm mb-10 border transition-all duration-300 ${isEditing ? 'border-orange-200 ring-4 ring-orange-50' : 'border-gray-200'}`}>
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
              {textField('address', 'direccion', 'Dirección', { maxLength: 100 })}
              {textField('phone', 'telefono', 'Teléfono', { type: 'tel', inputMode: 'tel', maxLength: 20 })}
              {textField('email', 'email', 'Email de contacto', { type: 'email', maxLength: 80 })}
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
          {list.map((institution) => {
            const terms = getInstitutionTerms(institution);
            const units = institution.areas ?? institution.sectors;
            const draft = drafts[institution.id] ?? { value: '', error: '' };
            const doctorCount = new Set(allAssignments.filter((a) => a.institutionId === institution.id).map((a) => a.doctorId)).size;
            const secretaryCount = allSecretaries.filter((s) => s.institutionId === institution.id).length;
            const admins = institutionAdmins.filter((a) => a.institutionId === institution.id);
            return (
              <article key={institution.id} aria-label={institution.name} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${editId === institution.id ? 'border-orange-200 bg-orange-50/40' : 'border-gray-200'}`}>
                <div className="p-6 flex flex-wrap justify-between gap-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{institution.name}</h2>
                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      <p className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {institution.address}</p>
                      <p className="flex items-center gap-2"><Phone className="w-4 h-4"/> {institution.phone}</p>
                      <p className="flex items-center gap-2"><Mail className="w-4 h-4"/> {institution.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <button onClick={() => startEdit(institution)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition" aria-label={`Editar datos de ${institution.name}`}>
                      <Edit2 className="w-5 h-5"/> Editar datos
                    </button>
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
                    <ul className="flex flex-wrap gap-2 mb-4">
                      {units.map((unit) => (
                        <li key={unit} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">{unit}</li>
                      ))}
                    </ul>
                    <form onSubmit={(e) => handleRequestUnit(e, institution)} noValidate className="flex flex-wrap gap-3 items-start">
                      <div className="flex-1 min-w-48">
                        <label htmlFor={`${fieldId}-${institution.id}-unidad`} className="sr-only">Nueva {terms.unitLower}</label>
                        <input
                          id={`${fieldId}-${institution.id}-unidad`}
                          maxLength={40}
                          autoComplete="off"
                          aria-invalid={Boolean(draft.error)}
                          placeholder={kind === 'hospital' ? 'Nuevo sector, ej: Traumatología' : 'Nueva área, ej: Traumatología'}
                          className={`${inputClass} ${errorBorder(draft.error)}`}
                          value={draft.value}
                          onChange={(e) => setDraft(institution.id, { value: e.target.value, error: '' })}
                        />
                        {draft.error && <p role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{draft.error}</p>}
                      </div>
                      <button type="submit" className="py-3 px-5 rounded-xl font-bold text-white transition shadow-md flex gap-2 items-center bg-blue-600 hover:bg-blue-700 shadow-blue-200">
                        <Plus className="w-5 h-5"/> Crear {terms.unitLower}
                      </button>
                    </form>
                  </div>

                  {/* Administradores de la institución (la baja y el reseteo están en Usuarios) */}
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
                            <button onClick={() => startEditAdmin(admin)} className="ml-auto p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition" title="Editar administrador" aria-label={`Editar a ${admin.name}`}>
                              <Edit2 className="w-5 h-5"/>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
          {list.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">{empty}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VitadevInstitutions;
