import React, { useId, useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import { EditConfirmModal, SuccessModal } from '../clinic/ClinicModals';
import { useClinicData } from '../clinic/clinicDataContext';
import {
  validateName, validateEmail, validatePhone, validateAddress, validateRequired, errorBorder,
  validateExpiry, addYearsISO, MAX_EXPIRY_YEARS, validateSchedule,
} from '../clinic/clinicValidation';
import { resetPassword, updateAccount, getRegisteredEmails } from '../../services/authService';
import { SPECIALTIES, WEEK_DAYS, INSURANCES } from '../../constants/catalog';
import { ROLES } from '../../constants/roles';
import AccountStatusBadge from './AccountStatusBadge';
import { buildUserDirectory } from './userDirectory';
import { stripTitle, getTitleFromName } from '../../utils/doctorName';
import { useSuccessModal } from './useSuccessModal';
import TemporaryPasswordModal from './TemporaryPasswordModal';
import { useAccountActions } from './useAccountActions';
import IconAction from './IconAction';
import FadeIn from '../../components/FadeIn';
import ClinicDocumentsModal from '../clinic/ClinicDocumentsModal';
import { countDocumentIssues, countDocumentsExpiringSoon } from '../clinic/documentStatus';
import { todayISO } from '../clinic/clinicDates';
import { DOCUMENT_TYPES, NON_EXPIRING_DOCUMENTS, formatSchedule } from '../../data/institutions';
import { Trash2, Pencil, KeyRound, Ban, UserCheck, UserPlus, Stethoscope, Save, X, MapPin, FileText, Clock, Wallet, ChevronDown, Check } from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  address: '',
  specialty: '',
  // Atención: días y franja horaria (como el horario que fija una clínica al vincular a un médico)
  // y obras sociales que acepta. Sin obras sociales marcadas, atiende solo de forma particular.
  days: [],
  startTime: '08:00',
  endTime: '12:00',
  insurances: [],
};

// Documentación cargada en el alta: por documento, si se recibió y hasta cuándo vale.
// Los mismos documentos que pide una clínica; los que no se marquen quedan pendientes.
const EMPTY_DOCS = Object.fromEntries(DOCUMENT_TYPES.map((type) => [type, { received: false, expiresAt: '' }]));
const needsExpiry = (type) => !NON_EXPIRING_DOCUMENTS.includes(type);

// Lista `documents` lista para guardar a partir de lo marcado en el alta.
const toDocuments = (docs) => DOCUMENT_TYPES.map((type) => (docs[type].received
  ? { type, status: 'vigente', expiresAt: needsExpiry(type) ? docs[type].expiresAt : null }
  : { type, status: 'pendiente', expiresAt: null }));

// Convierte un médico en los valores del formulario de edición.
const toForm = (doctor) => ({
  name: doctor.name,
  email: doctor.email,
  phone: doctor.phone,
  address: doctor.address ?? '',
  specialty: doctor.specialty,
  days: doctor.days ?? [],
  startTime: doctor.startTime ?? '08:00',
  endTime: doctor.endTime ?? '12:00',
  insurances: doctor.insurances ?? [],
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
// Cuando cambia `closeToken`, este panel cierra su formulario (sin volver a montarse ni repetir la animación).
const ParticularDoctorsPanel = ({ onOpen, closeToken = 0 }) => {
  const fieldId = useId();
  const data = useClinicData();
  const {
    particularDoctors, allSecretaries,
    addParticularDoctor, updateParticularDoctor, removeParticularDoctor, updateParticularDocument,
  } = data;
  const today = todayISO();
  const [documentsId, setDocumentsId] = useState(null); // médico cuya documentación se está viendo

  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);       // id del médico que se edita (null = alta)
  const [deleteId, setDeleteId] = useState(null);   // id del médico a eliminar (null = ventana cerrada)
  const [isConfirming, setIsConfirming] = useState(false); // ventana naranja de confirmación (alta o edición)
  const [showCreate, setShowCreate] = useState(false); // el formulario de alta está oculto hasta que se pide
  const [errors, setErrors] = useState({});
  const [docs, setDocs] = useState(EMPTY_DOCS);       // documentación marcada en el alta
  const [docErrors, setDocErrors] = useState({});     // { tipo: mensaje } de los vencimientos inválidos
  const [showInsurances, setShowInsurances] = useState(false); // panel desplegable de obras sociales
  const { success, showSuccess } = useSuccessModal();
  const [credentials, setCredentials] = useState(null); // contraseña temporal recién generada (null = ventana cerrada)
  // Resetear contraseña, inhabilitar y habilitar (mismas acciones que Gestión de Usuarios).
  const { statusOf: accountStatus, requestReset, requestDisable, requestEnable, modals: accountModals } = useAccountActions();

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
      schedule: validateSchedule(form),
    };
    return Object.fromEntries(Object.entries(found).filter(([, message]) => message));
  };

  const startEdit = (doctor) => {
    onOpen();
    setEditId(doctor.id);
    setForm(toForm(doctor));
    setErrors({});
    setShowInsurances(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setShowCreate(false);
    setForm(EMPTY_FORM);
    setErrors({});
    setDocs(EMPTY_DOCS);
    setDocErrors({});
    setShowInsurances(false);
  };
  const [seenCloseToken, setSeenCloseToken] = useState(closeToken);
  if (closeToken !== seenCloseToken) {
    setSeenCloseToken(closeToken);
    cancelEdit();
  }

  // Días en el orden de la semana; obras sociales en el orden del catálogo.
  const toggleInList = (field, value, order) => {
    setForm((prev) => {
      const selected = prev[field].includes(value) ? prev[field].filter((v) => v !== value) : [...prev[field], value];
      return { ...prev, [field]: order.filter((v) => selected.includes(v)) };
    });
    if (field === 'days') setErrors((prev) => ({ ...prev, schedule: '' }));
  };

  const updateDoc = (type, changes) => {
    setDocs((prev) => ({ ...prev, [type]: { ...prev[type], ...changes } }));
    setDocErrors((prev) => ({ ...prev, [type]: '' }));
  };

  // Solo en el alta: la documentación es obligatoria para crear la cuenta. Los cuatro documentos
  // tienen que estar recibidos y los que vencen, con una fecha válida.
  const validateDocs = () => (isEditing ? {} : Object.fromEntries(DOCUMENT_TYPES
    .map((type) => [type, !docs[type].received
      ? 'Marcalo como recibido: es obligatorio para crear la cuenta.'
      : needsExpiry(type) ? validateExpiry(docs[type].expiresAt, today) : ''])
    .filter(([, message]) => message)));

  // Validamos y pedimos confirmación (naranja) tanto para agregar como para editar.
  const handleSubmit = (e) => {
    e.preventDefault(); // evita que el navegador recargue la página al enviar el form
    const found = validateForm();
    const foundDocs = validateDocs();
    setErrors(found);
    setDocErrors(foundDocs);
    if (Object.keys(found).length > 0 || Object.keys(foundDocs).length > 0) return;
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
    addParticularDoctor({ ...doctor, documents: toDocuments(docs) });
    setDocs(EMPTY_DOCS);
    // También se le crea el acceso, con una contraseña temporal que tiene que cambiar al entrar.
    const temporaryPassword = resetPassword(doctor.email, { name: stripTitle(doctor.name), title: getTitleFromName(doctor.name), role: ROLES.DOCTOR });
    setForm(EMPTY_FORM);
    setShowCreate(false);
    setCredentials({
      title: '¡Médico asociado!',
      message: `${doctor.name} ya puede iniciar sesión con ${doctor.email}.`,
      password: temporaryPassword,
    });
  };

  const handleConfirmDelete = () => {
    removeParticularDoctor(deleteId);
    if (deleteId === editId) cancelEdit();
    setDeleteId(null);
  };

  const doctorToDelete = particularDoctors.find((d) => d.id === deleteId);
  const documentsDoctor = particularDoctors.find((d) => d.id === documentsId);
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
        title={isEditing ? '¿Modificar médico?' : '¿Asociar médico?'}
        message={isEditing
          ? `Vas a actualizar los datos de ${form.name}. ¿Guardar los cambios?`
          : `Vas a dar de alta a ${form.name} como médico particular y crear su acceso. ¿Confirmar?`}
        confirmLabel={isEditing ? 'Sí, Modificar' : 'Sí, Asociar'}
        onCancel={() => setIsConfirming(false)}
        onConfirm={handleConfirm}
      />
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />
      <TemporaryPasswordModal credentials={credentials} onClose={() => setCredentials(null)} />
      {accountModals}
      {documentsDoctor && (
        <ClinicDocumentsModal
          doctorName={documentsDoctor.name}
          assignment={documentsDoctor}
          onUpdate={(type, expiresAt) => updateParticularDocument(documentsDoctor.id, type, expiresAt)}
          onClose={() => setDocumentsId(null)}
        />
      )}

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 id={`${fieldId}-titulo`} className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg"><Stethoscope className="text-blue-600 w-6 h-6"/></div>
          Médicos particulares
        </h2>
        {!showCreate && !isEditing && (
          <button onClick={() => { onOpen(); setShowCreate(true); }} className="py-2.5 px-5 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition flex items-center gap-2">
            <UserPlus className="w-5 h-5"/> Asociar médico
          </button>
        )}
      </div>

      {/* Formulario: azul para agregar (oculto hasta pedirlo), naranja mientras se edita */}
      {(showCreate || isEditing) && (
      <div className={`bg-white p-5 sm:p-8 rounded-3xl shadow-sm mb-8 border transition-all duration-300 ${isEditing ? 'border-orange-200 ring-4 ring-orange-50' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`font-bold text-xl ${isEditing ? 'text-orange-600' : 'text-gray-800'}`}>
            {isEditing ? 'Editando Médico' : 'Asociar Médico'}
          </h3>
          <button type="button" onClick={cancelEdit} aria-label="Cerrar formulario" className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-300 outline-none flex items-center justify-center transition-colors shrink-0"><X className="w-5 h-5"/></button>
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

          {/* Atención: días, horario y obras sociales que acepta */}
          <fieldset className="border-t border-gray-100 pt-5 space-y-5">
            <legend className="font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600"/> Atención
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-5 items-end">
              <div>
                <p id={`${fieldId}-dias`} className={labelClass}>Días de atención</p>
                <div role="group" aria-labelledby={`${fieldId}-dias`} className="flex gap-2 flex-wrap">
                  {WEEK_DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      aria-pressed={form.days.includes(day)}
                      onClick={() => toggleInList('days', day, WEEK_DAYS)}
                      className={`w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition ${form.days.includes(day) ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor={`${fieldId}-desde`} className={labelClass}>Desde</label>
                <input id={`${fieldId}-desde`} type="time" className={`${inputClass} ${errorBorder(errors.schedule)}`} value={form.startTime} onChange={e => { updateField('startTime', e.target.value); setErrors((prev) => ({ ...prev, schedule: '' })); }} />
              </div>
              <div>
                <label htmlFor={`${fieldId}-hasta`} className={labelClass}>Hasta</label>
                <input id={`${fieldId}-hasta`} type="time" className={`${inputClass} ${errorBorder(errors.schedule)}`} value={form.endTime} onChange={e => { updateField('endTime', e.target.value); setErrors((prev) => ({ ...prev, schedule: '' })); }} />
              </div>
            </div>
            {errors.schedule && <p role="alert" className="text-xs text-red-600 font-medium -mt-3 ml-1">{errors.schedule}</p>}
            {/* Obras sociales: panel desplegable con el resumen de lo elegido en el botón. */}
            <div>
              <p id={`${fieldId}-obras`} className={labelClass}>Obras sociales que acepta <span className="normal-case font-normal text-gray-400">(opcional)</span></p>
              <button
                type="button"
                onClick={() => setShowInsurances((open) => !open)}
                aria-expanded={showInsurances}
                aria-controls={`${fieldId}-obras-panel`}
                aria-labelledby={`${fieldId}-obras`}
                className={`w-full p-3 border rounded-xl flex items-center justify-between gap-3 text-left transition ${showInsurances ? 'bg-white ring-2 ring-blue-500 border-transparent' : 'bg-gray-50 hover:bg-white'}`}
              >
                <span className={`truncate ${form.insurances.length ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                  {form.insurances.length ? form.insurances.join(', ') : 'Solo particular (sin obras sociales)'}
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  {form.insurances.length > 0 && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{form.insurances.length}</span>
                  )}
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showInsurances ? 'rotate-180' : ''}`} />
                </span>
              </button>
              {showInsurances && (
                <div id={`${fieldId}-obras-panel`} className="mt-2 p-3 border border-gray-200 rounded-xl bg-white shadow-sm animate-fadeIn">
                  <ul role="group" aria-labelledby={`${fieldId}-obras`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
                    {INSURANCES.map(insurance => {
                      const checked = form.insurances.includes(insurance);
                      return (
                        <li key={insurance}>
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={checked}
                            onClick={() => toggleInList('insurances', insurance, INSURANCES)}
                            className={`w-full min-h-[40px] px-3 py-2 rounded-lg flex items-center gap-2.5 text-sm font-medium text-left transition ${checked ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                          >
                            <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'}`}>
                              {checked && <Check className="w-3.5 h-3.5" />}
                            </span>
                            {insurance}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400 ml-1">
                      {form.insurances.length === 0 ? 'Sin obras sociales marcadas: atiende solo de forma particular.' : `${form.insurances.length} seleccionada(s), además de la atención particular.`}
                    </p>
                    <div className="flex gap-2">
                      {form.insurances.length > 0 && (
                        <button type="button" onClick={() => setForm((prev) => ({ ...prev, insurances: [] }))} className="text-sm font-bold text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                          Quitar todas
                        </button>
                      )}
                      <button type="button" onClick={() => setShowInsurances(false)} className="text-sm font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
                        Listo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </fieldset>

          {/* Documentación: solo en el alta. Después se actualiza con el ícono Documentación de la tabla. */}
          {!isEditing && (
            <fieldset className="border-t border-gray-100 pt-5">
              <legend className="font-bold text-gray-800 flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-blue-600"/> Documentación
              </legend>
              <p className="text-sm text-gray-500 mb-4">Obligatoria para crear la cuenta: marcá los cuatro documentos como recibidos y cargá el vencimiento de los que vencen.</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                {DOCUMENT_TYPES.map((type) => {
                  const doc = docs[type];
                  const checkId = `${fieldId}-doc-${type.replace(/\s+/g, '-')}`;
                  return (
                    <li key={type} className={`p-2 rounded-xl border transition ${doc.received ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 bg-white'}`}>
                      {/* Mismo casillero que el panel de obras sociales */}
                      <button
                        id={checkId}
                        type="button"
                        role="checkbox"
                        aria-checked={doc.received}
                        onClick={() => updateDoc(type, { received: !doc.received, expiresAt: doc.received ? '' : doc.expiresAt })}
                        className={`w-full min-h-[40px] px-3 py-2 rounded-lg flex items-center gap-2.5 text-sm font-medium text-left transition ${doc.received ? 'text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${doc.received ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'}`}>
                          {doc.received && <Check className="w-3.5 h-3.5" />}
                        </span>
                        <span className="font-bold">{type}</span>
                        <span className={`ml-auto text-xs font-bold ${doc.received ? 'text-green-700' : 'text-amber-600'}`}>
                          {doc.received ? 'Recibido' : 'Pendiente'}
                        </span>
                      </button>
                      {doc.received && needsExpiry(type) && (
                        <div className="mt-2 px-3 pb-2">
                          <label htmlFor={`${checkId}-vence`} className={labelClass}>Vencimiento</label>
                          <input
                            id={`${checkId}-vence`}
                            type="date"
                            min={today}
                            max={addYearsISO(today, MAX_EXPIRY_YEARS)}
                            value={doc.expiresAt}
                            onChange={(e) => updateDoc(type, { expiresAt: e.target.value })}
                            aria-invalid={Boolean(docErrors[type])}
                            className={`${inputClass} ${errorBorder(docErrors[type])}`}
                          />
                          {docErrors[type] && <p role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{docErrors[type]}</p>}
                        </div>
                      )}
                      {doc.received && !needsExpiry(type) && <p className="text-xs text-gray-500 ml-[2.625rem] pb-2">No vence.</p>}
                      {!doc.received && docErrors[type] && <p role="alert" className="text-xs text-red-600 font-medium ml-[2.625rem] pr-3 pb-2">{docErrors[type]}</p>}
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          )}

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
      <FadeIn delay={150}><div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
        {/* Hasta lg cada fila es una tarjeta apilada (sin scroll lateral); desde lg, tabla. */}
        <table className="w-full text-left border-collapse block lg:table">
          <thead className="hidden lg:table-header-group bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Profesional</th>
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Contacto</th>
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Dirección de consultorio</th>
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Atención</th>
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="block lg:table-row-group divide-y divide-gray-100 lg:divide-gray-50">
            {particularDoctors.map(doctor => (
              <tr key={doctor.id} className={`block lg:table-row px-5 py-4 lg:p-0 hover:bg-blue-50/50 transition ${editId === doctor.id ? 'bg-orange-50' : ''}`}>
                <td className="block lg:table-cell py-1 lg:p-5">
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    {doctor.name}
                    <AccountStatusBadge email={doctor.email} />
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 inline-block mt-1">{doctor.specialty}</span>
                </td>
                <td className="block lg:table-cell py-1 lg:p-5 text-sm text-gray-500">
                  <div>{doctor.email}</div>
                  <div>{doctor.phone}</div>
                </td>
                <td className="block lg:table-cell py-1 lg:p-5 text-sm text-gray-500">
                  <div className="flex items-center gap-1"><MapPin className="w-4 h-4 shrink-0"/> {doctor.address || '—'}</div>
                </td>
                <td className="block lg:table-cell py-1 lg:p-5 text-sm text-gray-500">
                  {doctor.days?.length ? (
                    <div className="flex items-center gap-1 whitespace-nowrap"><Clock className="w-4 h-4 shrink-0"/> {formatSchedule(doctor)}</div>
                  ) : (
                    <div className="text-amber-600 font-medium">Sin horario cargado</div>
                  )}
                  <div className="flex items-start gap-1 mt-1 text-xs">
                    <Wallet className="w-3.5 h-3.5 shrink-0 mt-0.5"/>
                    {doctor.insurances?.length ? doctor.insurances.join(', ') : 'Solo particular'}
                  </div>
                </td>
                <td className="block lg:table-cell py-1 lg:p-5">
                  <div className="flex justify-start lg:justify-center gap-1 pt-2 lg:pt-0">
                    {accountStatus(doctor.email) !== 'deactivated' && (
                      <IconAction
                        icon={FileText}
                        tone="blue"
                        onClick={() => setDocumentsId(doctor.id)}
                        badge={countDocumentIssues(doctor.documents, today)}
                        warning={countDocumentsExpiringSoon(doctor.documents, today) > 0}
                        label={countDocumentIssues(doctor.documents, today) > 0
                          ? `Documentación de ${doctor.name}: ${countDocumentIssues(doctor.documents, today)} vencido(s) o pendiente(s)`
                          : countDocumentsExpiringSoon(doctor.documents, today) > 0
                            ? `Documentación de ${doctor.name}: ${countDocumentsExpiringSoon(doctor.documents, today)} por vencer`
                            : `Documentación de ${doctor.name}: al día`}
                      />
                    )}
                    {accountStatus(doctor.email) === 'active' && (
                      <>
                        <IconAction icon={Pencil} tone="blue" onClick={() => startEdit(doctor)} label={`Editar datos de ${doctor.name}`} />
                        <IconAction icon={KeyRound} tone="orange" onClick={() => requestReset({ name: doctor.name, email: doctor.email, profile: { name: stripTitle(doctor.name), title: getTitleFromName(doctor.name), role: ROLES.DOCTOR } })} label={`Resetear contraseña de ${doctor.name}`} />
                        <IconAction icon={Ban} tone="amber" onClick={() => requestDisable(doctor)} label={`Inhabilitar a ${doctor.name}`} />
                      </>
                    )}
                    {/* Primero se inhabilita; recién con la cuenta inhabilitada se puede eliminar. */}
                    {accountStatus(doctor.email) === 'disabled' && (
                      <IconAction icon={UserCheck} tone="green" onClick={() => requestEnable(doctor)} label={`Habilitar a ${doctor.name}`} />
                    )}
                    {accountStatus(doctor.email) !== 'active' && (
                      <IconAction icon={Trash2} tone="red" onClick={() => setDeleteId(doctor.id)} label={`Eliminar a ${doctor.name} de la lista`} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {particularDoctors.length === 0 && (
          <div className="p-10 text-center text-gray-400">Todavía no hay médicos particulares.</div>
        )}
      </div></FadeIn>
    </section>
  );
};

export default ParticularDoctorsPanel;
