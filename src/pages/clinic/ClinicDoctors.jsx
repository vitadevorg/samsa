import React, { useId, useState } from 'react';
import Navbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import PageHeader from '../../components/PageHeader';
import FadeIn from '../../components/FadeIn';
import CheckboxDropdown from '../../components/CheckboxDropdown';
import IconAction from '../vitadev/IconAction';
import AccountStatusBadge from '../vitadev/AccountStatusBadge';
import TemporaryPasswordModal from '../vitadev/TemporaryPasswordModal';
import { useAccountActions } from '../vitadev/useAccountActions';
import { useSuccessModal } from '../vitadev/useSuccessModal';
import { buildUserDirectory } from '../vitadev/userDirectory';
import { EditConfirmModal, SuccessModal } from './ClinicModals';
import ClinicDocumentsModal from './ClinicDocumentsModal';
import DocumentsChecklist from './DocumentsChecklist';
import { EMPTY_DOCS, toDocuments, validateDocs } from './documentsForm';
import { todayISO } from './clinicDates';
import { useClinicData } from './clinicDataContext';
import { countDocumentIssues, countDocumentsExpiringSoon } from './documentStatus';
import {
  validateName, validateEmail, validatePhone, validateOffice, validateRequired, validateSchedule,
  findOfficeConflict, errorBorder,
} from './clinicValidation';
import { doctorsData } from '../../data/doctors';
import { schedulesOverlap, formatSchedule } from '../../data/institutions';
import { WEEK_DAYS } from '../../constants/catalog';
import { ROLES } from '../../constants/roles';
import { useCatalog } from '../../context/catalog-context';
import { resetPassword, updateAccount, getRegisteredEmails } from '../../services/authService';
import { stripTitle, getTitleFromName } from '../../utils/doctorName';
import {
  Trash2, Pencil, KeyRound, Ban, UserCheck, UserPlus, Link2, Stethoscope, Save, X, Clock, AlertTriangle,
  FileText, Wallet, DoorOpen, Search,
} from 'lucide-react';

const emptyForm = (units) => ({
  // Datos del médico (solo en el alta de uno nuevo, o al editar uno que dio de alta la institución).
  name: '',
  email: '',
  phone: '',
  specialty: '',
  insurances: [],
  // Médico existente que se vincula (solo al vincular).
  doctorId: '',
  // Dónde y cuándo atiende en ESTA institución. Con una sola área o sector, queda elegida.
  area: units.length === 1 ? units[0] : '',
  office: '',
  days: [],
  startTime: '08:00',
  endTime: '12:00',
});

// Datos listos para guardar: sin espacios de más y el email en minúsculas.
const clean = (text) => text.trim().replace(/\s+/g, ' ');

// Texto para buscar sin importar mayúsculas ni tildes ("gonzalez" encuentra a "González").
const normalizeText = (text = '') => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

// Obras sociales de un médico: las de su alta (`insurances`) o las de doctors.js (`insurance`).
const doctorInsurances = (doctor) => doctor?.insurances ?? doctor?.insurance ?? [];

// Pantalla del administrador de institución (clínica u hospital): sus médicos.
// Igual que VitaDev con los médicos particulares: alta (con su cuenta y su documentación), edición,
// documentación, contraseña, inhabilitar o habilitar y eliminar. Además puede vincular a un médico que
// ya atiende en otra institución. La dirección no se pide: es la de la institución.
const ClinicDoctors = () => {
  const fieldId = useId();
  const data = useClinicData();
  const {
    clinic, units, terms, assignments, allAssignments, secretaries, institutionDoctors, findDoctor,
    addAssignment, updateAssignment, removeAssignment, updateDocument,
    addInstitutionDoctor, updateInstitutionDoctor, disableAssignment, enableAssignment,
  } = data;
  const { specialties: SPECIALTIES } = useCatalog();
  const isHospital = Boolean(clinic?.sectors);
  // Obras sociales que puede aceptar un médico: las que recibe la clínica. El hospital no trabaja con obras sociales.
  const insuranceOptions = isHospital ? [] : clinic?.insurances ?? [];
  const today = todayISO();

  const toEditForm = (assignment) => {
    const doctor = findDoctor(assignment.doctorId);
    return {
      ...emptyForm(units),
      name: doctor?.name ?? '',
      email: doctor?.email ?? '',
      phone: doctor?.phone ?? '',
      specialty: doctor?.specialty ?? '',
      insurances: assignment.insurances ?? doctorInsurances(doctor),
      doctorId: assignment.doctorId,
      area: assignment.area,
      office: assignment.office,
      days: assignment.days,
      startTime: assignment.startTime,
      endTime: assignment.endTime,
    };
  };

  // mode: null (formulario cerrado) | 'create' (médico nuevo) | 'link' (vincular existente) | 'edit'
  const [mode, setMode] = useState(null);
  const [editId, setEditId] = useState(null); // vinculación que se edita
  const [form, setForm] = useState(() => emptyForm(units));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(''); // consultorio ocupado u horario inválido
  const [docs, setDocs] = useState(EMPTY_DOCS);
  const [docErrors, setDocErrors] = useState({});
  const [linkSearch, setLinkSearch] = useState(''); // búsqueda del médico a vincular
  const [isConfirming, setIsConfirming] = useState(false);
  const [toDisable, setToDisable] = useState(null); // vinculación a inhabilitar
  const [toEnable, setToEnable] = useState(null);   // vinculación a habilitar
  const [deleteId, setDeleteId] = useState(null);   // vinculación a eliminar
  const [documentsId, setDocumentsId] = useState(null); // vinculación cuya documentación se ve
  const [credentials, setCredentials] = useState(null); // contraseña temporal del médico recién creado
  const { success, showSuccess } = useSuccessModal();
  const { requestReset, modals: accountModals } = useAccountActions();

  // El médico de la vinculación que se edita y si lo dio de alta esta institución (entonces también
  // puede corregir sus datos; si atiende acá por vinculación, sus datos los administra quien lo dio de alta).
  const editingAssignment = assignments.find((a) => a.id === editId);
  const isOwnDoctor = (doctorId) => institutionDoctors.some((d) => d.id === doctorId && d.institutionId === clinic?.id);
  const editingOwn = mode === 'edit' && editingAssignment && isOwnDoctor(editingAssignment.doctorId);
  const showDoctorFields = mode === 'create' || editingOwn;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setFormError('');
  };

  const toggleDay = (day) => {
    setForm((prev) => {
      const selected = prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day];
      return { ...prev, days: WEEK_DAYS.filter((d) => selected.includes(d)) };
    });
    setFormError('');
  };

  const updateDoc = (type, changes) => {
    setDocs((prev) => ({ ...prev, [type]: { ...prev[type], ...changes } }));
    setDocErrors((prev) => ({ ...prev, [type]: '' }));
  };

  const openForm = (nextMode) => {
    setMode(nextMode);
    setEditId(null);
    setForm(emptyForm(units));
    setErrors({});
    setFormError('');
    setDocs(EMPTY_DOCS);
    setDocErrors({});
    setLinkSearch('');
  };

  const closeForm = () => openForm(null);

  const startEdit = (assignment) => {
    openForm('edit');
    setEditId(assignment.id);
    setForm(toEditForm(assignment));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Al elegir el médico a vincular: se sugiere el área o sector de su especialidad (si la institución la
  // tiene) y las obras sociales que ya acepta y que también recibe la clínica.
  const selectLinkDoctor = (doctor) => {
    setForm((prev) => ({
      ...prev,
      doctorId: doctor.id,
      area: units.includes(doctor.specialty) ? doctor.specialty : prev.area,
      insurances: doctorInsurances(doctor).filter((name) => insuranceOptions.includes(name)),
    }));
    setErrors((prev) => ({ ...prev, doctorId: '', area: '' }));
    setFormError('');
  };
  const clearLinkDoctor = () => setForm((prev) => ({ ...prev, doctorId: '', insurances: [] }));

  // Dónde más atiende el médico (otras instituciones habilitadas), para mostrarlo y evitar choques de horario.
  const elsewhereOf = (doctorId) => allAssignments.filter(
    (a) => a.doctorId === doctorId && a.institutionId !== clinic?.id && a.status !== 'disabled'
  );
  const institutionName = (id) => data.institutions.find((i) => i.id === id)?.name ?? '';

  // Para qué se pide la documentación (texto de la lista y de sus errores).
  const docsPurpose = mode === 'link' ? `para que atienda en ${clinic?.name}` : 'para crear la cuenta';

  const unitError = `Elegí ${isHospital ? 'el sector' : 'el área'}.`;

  // Revisa los campos. Devuelve solo los que tienen error: { campo: mensaje }.
  const validateFields = () => {
    // El email es el usuario: no puede repetirse con ninguna otra cuenta del sistema.
    const takenEmails = [...buildUserDirectory(data).map((u) => u.email), ...getRegisteredEmails()]
      .map((email) => email.toLowerCase());
    const found = {
      area: validateRequired(form.area, unitError),
      office: validateOffice(form.office),
    };
    if (mode === 'link') found.doctorId = validateRequired(form.doctorId, 'Elegí el médico que querés vincular.');
    if (showDoctorFields) {
      // El título ("Dr.", "Dra.", "Lic.") es opcional y no cuenta como parte del nombre.
      found.name = validateName(stripTitle(form.name.trim()));
      found.phone = validatePhone(form.phone, { required: true });
      found.specialty = validateRequired(form.specialty, 'Elegí la especialidad.');
    }
    if (mode === 'create') found.email = validateEmail(form.email, takenEmails);
    return Object.fromEntries(Object.entries(found).filter(([, message]) => message));
  };

  // Horario válido, sin choques con lo que el médico ya atiende en otra institución (no puede estar en dos
  // lugares a la vez) y consultorio libre: dos médicos no pueden usar el mismo consultorio al mismo tiempo.
  const validateAssignment = () => {
    const scheduleError = validateSchedule(form);
    if (scheduleError) return scheduleError;
    const clash = mode === 'create' ? null : elsewhereOf(form.doctorId).find((a) => schedulesOverlap(a, form));
    if (clash) {
      return `Ese horario se superpone con su atención en ${institutionName(clash.institutionId)} (${formatSchedule(clash)}). Elegí otros días u horario.`;
    }
    const officeTaken = findOfficeConflict(
      { doctorId: mode === 'create' ? null : form.doctorId, institutionId: clinic.id, office: form.office, schedule: form },
      // Un médico inhabilitado no atiende: su consultorio queda libre.
      assignments.filter((a) => a.status !== 'disabled'),
      schedulesOverlap
    );
    return officeTaken
      ? `${officeTaken.office} ya lo usa ${findDoctor(officeTaken.doctorId)?.name} (${formatSchedule(officeTaken)}). Elegí otro consultorio u horario.`
      : '';
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // evita que el navegador recargue la página al enviar el form
    const found = validateFields();
    // Al cargar o vincular, la documentación es obligatoria: cada institución lleva la suya (su contrato, etc.).
    const foundDocs = mode === 'create' || mode === 'link' ? validateDocs(docs, today, docsPurpose) : {};
    setErrors(found);
    setDocErrors(foundDocs);
    if (Object.keys(found).length > 0 || Object.keys(foundDocs).length > 0) return;
    const error = validateAssignment();
    setFormError(error);
    if (!error) setIsConfirming(true);
  };

  const handleConfirm = () => {
    setIsConfirming(false);
    const where = { area: form.area, office: clean(form.office), days: form.days, startTime: form.startTime, endTime: form.endTime };
    const doctorData = {
      name: clean(form.name),
      phone: form.phone.trim(),
      specialty: form.specialty,
      insurances: isHospital ? [] : form.insurances,
    };

    if (mode === 'create') {
      const email = form.email.trim().toLowerCase();
      addInstitutionDoctor({ ...doctorData, email }, where, toDocuments(docs));
      // También se le crea el acceso, con una contraseña temporal que tiene que cambiar al entrar.
      const temporaryPassword = resetPassword(email, { name: stripTitle(doctorData.name), title: getTitleFromName(doctorData.name), role: ROLES.DOCTOR });
      closeForm();
      setCredentials({
        title: '¡Médico cargado!',
        message: `${doctorData.name} ya forma parte de ${clinic.name} y puede iniciar sesión con ${email}.`,
        password: temporaryPassword,
      });
      return;
    }

    if (mode === 'link') {
      addAssignment({ doctorId: form.doctorId, ...where, insurances: isHospital ? [] : form.insurances, documents: toDocuments(docs) });
      showSuccess('¡Médico vinculado!', `${findDoctor(form.doctorId)?.name} ahora también atiende en ${clinic.name}.`);
      closeForm();
      return;
    }

    // De un médico vinculado, las obras sociales que atiende acá se guardan en la vinculación.
    updateAssignment(editId, editingOwn || isHospital ? where : { ...where, insurances: form.insurances });
    if (editingOwn) {
      updateInstitutionDoctor(editingAssignment.doctorId, doctorData);
      // El nombre y el título también cambian en su cuenta (así se lo saluda bien al iniciar sesión).
      updateAccount(form.email, { name: stripTitle(doctorData.name), title: getTitleFromName(doctorData.name) });
    }
    closeForm();
    showSuccess('¡Cambios guardados!', 'Los datos del médico fueron actualizados.');
  };

  // ¿Atiende (habilitado) en otra institución? Entonces inhabilitarlo acá no bloquea su cuenta.
  const activeElsewhere = (assignment) => allAssignments.some(
    (a) => a.doctorId === assignment.doctorId && a.id !== assignment.id && a.status !== 'disabled'
  );

  const handleConfirmDisable = () => {
    disableAssignment(toDisable.id);
    if (toDisable.id === editId) closeForm();
    showSuccess('¡Médico inhabilitado!', `${findDoctor(toDisable.doctorId)?.name} ya no recibe turnos en ${clinic.name}.`);
    setToDisable(null);
  };

  const handleConfirmEnable = () => {
    enableAssignment(toEnable.id);
    showSuccess('¡Médico habilitado!', `${findDoctor(toEnable.doctorId)?.name} vuelve a recibir turnos en ${clinic.name}.`);
    setToEnable(null);
  };

  const handleConfirmDelete = () => {
    const removed = assignments.find((a) => a.id === deleteId);
    const name = findDoctor(removed?.doctorId)?.name;
    const keepsAccount = removed && allAssignments.some((a) => a.doctorId === removed.doctorId && a.id !== removed.id);
    removeAssignment(deleteId);
    if (deleteId === editId) closeForm();
    setDeleteId(null);
    showSuccess('¡Médico eliminado!', keepsAccount
      ? `${name} ya no forma parte de ${clinic.name}. Sigue atendiendo en su otra institución.`
      : `${name} ya no forma parte de ${clinic.name} y su cuenta fue dada de baja.`);
  };

  if (!clinic) {
    return (
      <div className="min-h-screen bg-slate-50 overflow-x-hidden">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-10 text-center text-gray-500">
          Tu usuario no tiene una institución asignada.
        </div>
      </div>
    );
  }

  // Médicos que se pueden vincular: los de SAMSA y los que dieron de alta otras instituciones, que todavía no estén acá.
  const linkedIds = assignments.map((a) => a.doctorId);
  const linkableDoctors = [
    ...doctorsData.map((d) => findDoctor(d.id)),
    ...institutionDoctors.filter((d) => d.institutionId !== clinic.id),
  ].filter((d) => d && !linkedIds.includes(d.id));
  // Búsqueda por nombre, especialidad o email.
  const linkQuery = normalizeText(linkSearch.trim());
  const linkResults = linkableDoctors.filter((d) => !linkQuery || normalizeText(`${d.name} ${d.specialty} ${d.email}`).includes(linkQuery));
  const linkDoctor = mode === 'link' ? findDoctor(form.doctorId) : null;
  // Atención particular (si es médico particular de SAMSA) y en otras instituciones, para la ficha del médico.
  const isParticular = (doctorId) => data.particularDoctors.some((d) => d.id === doctorId);
  const workSummary = (doctorId) => [
    ...(isParticular(doctorId) ? ['Atiende de forma particular'] : []),
    ...elsewhereOf(doctorId).map((a) => `${institutionName(a.institutionId)} · ${a.area} · ${formatSchedule(a)}`),
  ];

  const doctorToDelete = assignments.find((a) => a.id === deleteId);
  const affectedSecretaries = doctorToDelete
    ? secretaries.filter((s) => s.doctorIds.includes(doctorToDelete.doctorId)).length
    : 0;
  const documentsAssignment = assignments.find((a) => a.id === documentsId);

  const inputClass = 'w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white';
  const labelClass = 'text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block';
  const fieldError = (name, id) => errors[name] && (
    <p id={`${fieldId}-${id}-error`} role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors[name]}</p>
  );
  const formTitle = { create: 'Cargar médico', link: 'Vincular médico existente', edit: 'Editando médico' }[mode];
  const confirmCopy = {
    create: { title: '¿Cargar médico?', message: `Vas a dar de alta a ${clean(form.name)} en ${clinic.name} y crear su acceso. ¿Confirmar?`, label: 'Sí, Cargar' },
    link: { title: '¿Vincular médico?', message: `${findDoctor(form.doctorId)?.name} va a atender en ${clinic.name} con este horario. ¿Confirmar?`, label: 'Sí, Vincular' },
    edit: { title: '¿Modificar médico?', message: `Vas a actualizar los datos de ${clean(form.name) || findDoctor(form.doctorId)?.name}. ¿Guardar los cambios?`, label: 'Sí, Modificar' },
  }[mode ?? 'edit'];

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Navbar />
      <EditConfirmModal isOpen={isConfirming} title={confirmCopy.title} message={confirmCopy.message} confirmLabel={confirmCopy.label} onCancel={() => setIsConfirming(false)} onConfirm={handleConfirm} />
      <EditConfirmModal
        isOpen={toDisable !== null}
        title="¿Inhabilitar médico?"
        message={toDisable
          ? `${findDoctor(toDisable.doctorId)?.name} dejará de recibir turnos en ${clinic.name}. ${activeElsewhere(toDisable) ? 'Como también atiende en otra institución, su cuenta sigue activa.' : 'Tampoco podrá iniciar sesión hasta que lo vuelvas a habilitar.'} Podés revertirlo cuando quieras.`
          : ''}
        confirmLabel="Sí, Inhabilitar"
        onCancel={() => setToDisable(null)}
        onConfirm={handleConfirmDisable}
      />
      <EditConfirmModal
        isOpen={toEnable !== null}
        title="¿Habilitar médico?"
        message={toEnable ? `${findDoctor(toEnable.doctorId)?.name} volverá a recibir turnos en ${clinic.name}.` : ''}
        confirmLabel="Sí, Habilitar"
        onCancel={() => setToEnable(null)}
        onConfirm={handleConfirmEnable}
      />
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar médico"
        message={`¿Confirma que desea quitar a ${findDoctor(doctorToDelete?.doctorId)?.name} de ${clinic.name}?${affectedSecretaries > 0 ? ` También se quitará de la agenda de ${affectedSecretaries} secretaria(s).` : ''} Si no trabaja en otra institución, se dará de baja su cuenta.`}
      />
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />
      <TemporaryPasswordModal credentials={credentials} onClose={() => setCredentials(null)} />
      {accountModals}
      {documentsAssignment && (
        <ClinicDocumentsModal
          doctorName={findDoctor(documentsAssignment.doctorId)?.name}
          assignment={documentsAssignment}
          onUpdate={(type, expiresAt) => updateDocument(documentsAssignment.id, type, expiresAt)}
          onClose={() => setDocumentsId(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <PageHeader
          icon={Stethoscope}
          eyebrow={`Administración ${terms.fromPlace}`}
          title="Médicos"
          description={`${clinic.name} · ${clinic.address}`}
          actions={mode === null && (
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button type="button" onClick={() => openForm('create')} className="min-h-[44px] py-2.5 px-5 whitespace-nowrap rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/30 transition flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5"/> Cargar médico
              </button>
              <button type="button" onClick={() => openForm('link')} className="min-h-[44px] py-2.5 px-5 whitespace-nowrap rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition flex items-center justify-center gap-2">
                <Link2 className="w-5 h-5"/> Vincular existente
              </button>
            </div>
          )}
        />

        {/* Formulario: azul para cargar o vincular (oculto hasta pedirlo), naranja mientras se edita */}
        {mode !== null && (
          <div className={`bg-white p-5 sm:p-8 rounded-3xl shadow-sm mb-6 sm:mb-8 border transition-all duration-300 animate-fadeIn ${mode === 'edit' ? 'border-orange-200 ring-4 ring-orange-50' : 'border-gray-100'}`}>
            <div className="flex justify-between items-center gap-4 mb-6">
              <h2 className={`font-bold text-lg sm:text-xl ${mode === 'edit' ? 'text-orange-600' : 'text-gray-900'}`}>{formTitle}</h2>
              <button type="button" onClick={closeForm} aria-label="Cerrar formulario" className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-300 outline-none flex items-center justify-center transition-colors shrink-0"><X className="w-5 h-5"/></button>
            </div>
            {/* noValidate: usamos nuestros propios mensajes en lugar de los del navegador */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Datos del médico */}
              {showDoctorFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div>
                    <label htmlFor={`${fieldId}-nombre`} className={labelClass}>Nombre completo</label>
                    <input id={`${fieldId}-nombre`} maxLength={60} autoComplete="off" aria-invalid={Boolean(errors.name)} aria-describedby={`${fieldId}-nombre-error`} placeholder="Ej: Dra. Laura Gómez" className={`${inputClass} ${errorBorder(errors.name)}`} value={form.name} onChange={(e) => updateField('name', e.target.value)} />
                    {fieldError('name', 'nombre')}
                  </div>
                  <div>
                    <label htmlFor={`${fieldId}-email`} className={labelClass}>Email (usuario)</label>
                    {/* Al editar no se cambia: es el usuario con el que inicia sesión */}
                    <input id={`${fieldId}-email`} type="email" maxLength={80} autoComplete="off" disabled={mode === 'edit'} aria-invalid={Boolean(errors.email)} aria-describedby={`${fieldId}-email-error`} placeholder="medico@samsa.med" className={`${inputClass} disabled:text-gray-500 disabled:cursor-not-allowed ${errorBorder(errors.email)}`} value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                    {fieldError('email', 'email')}
                  </div>
                  <div>
                    <label htmlFor={`${fieldId}-telefono`} className={labelClass}>Teléfono</label>
                    <input id={`${fieldId}-telefono`} type="tel" inputMode="tel" maxLength={20} autoComplete="off" aria-invalid={Boolean(errors.phone)} aria-describedby={`${fieldId}-telefono-error`} placeholder="381 400-0000" className={`${inputClass} ${errorBorder(errors.phone)}`} value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                    {fieldError('phone', 'telefono')}
                  </div>
                  <div>
                    <label htmlFor={`${fieldId}-especialidad`} className={labelClass}>Especialidad</label>
                    <select id={`${fieldId}-especialidad`} aria-invalid={Boolean(errors.specialty)} aria-describedby={`${fieldId}-especialidad-error`} className={`${inputClass} appearance-none ${errorBorder(errors.specialty)}`} value={form.specialty} onChange={(e) => updateField('specialty', e.target.value)}>
                      <option value="">Seleccionar...</option>
                      {SPECIALTIES.map((specialty) => <option key={specialty} value={specialty}>{specialty}</option>)}
                    </select>
                    {fieldError('specialty', 'especialidad')}
                  </div>
                </div>
              )}

              {/* Médico vinculado por otra institución: sus datos se muestran pero no se editan acá */}
              {mode === 'edit' && !editingOwn && editingAssignment && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <Stethoscope className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 break-words">{findDoctor(editingAssignment.doctorId)?.name}</p>
                    <p className="text-sm text-gray-500">Atiende acá por vinculación: podés cambiar {isHospital ? 'el sector, el consultorio y el horario' : 'el área, el consultorio, el horario y las obras sociales que atiende acá'}. Sus datos personales los administra quien lo dio de alta.</p>
                  </div>
                </div>
              )}

              {/* Vincular: buscar al médico y ver su ficha (contacto y dónde atiende hoy) antes de vincularlo */}
              {mode === 'link' && (
                <div>
                  <p id={`${fieldId}-medico`} className={labelClass}>Médico</p>
                  {linkDoctor ? (
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 animate-fadeIn">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {linkDoctor.img
                          ? <img src={linkDoctor.img} alt="" className="w-12 h-12 rounded-full object-cover bg-gray-100 shrink-0" />
                          : <div aria-hidden="true" className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">{stripTitle(linkDoctor.name).charAt(0)}</div>}
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 break-words">{linkDoctor.name}</p>
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 inline-block mt-1">{linkDoctor.specialty}</span>
                          <p className="text-sm text-gray-500 mt-2 break-all">{linkDoctor.email}{linkDoctor.phone && ` · ${linkDoctor.phone}`}</p>
                          <ul className="mt-2 space-y-1 text-sm text-gray-600">
                            {workSummary(linkDoctor.id).length > 0
                              ? workSummary(linkDoctor.id).map((line) => <li key={line} className="flex items-start gap-1.5"><Clock className="w-4 h-4 shrink-0 mt-0.5 text-gray-400"/> <span className="break-words">{line}</span></li>)
                              : <li className="text-gray-400">Todavía no atiende en otra institución.</li>}
                          </ul>
                        </div>
                      </div>
                      <button type="button" onClick={clearLinkDoctor} className="self-start min-h-[44px] px-4 rounded-xl text-sm font-bold text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 transition">Cambiar médico</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input type="search" aria-labelledby={`${fieldId}-medico`} aria-describedby={`${fieldId}-medico-error`} maxLength={60} placeholder="Buscar por nombre, especialidad o email..." className={`${inputClass} pl-12 ${errorBorder(errors.doctorId)}`} value={linkSearch} onChange={(e) => setLinkSearch(e.target.value)} />
                      </div>
                      <ul role="listbox" aria-labelledby={`${fieldId}-medico`} className="max-h-72 overflow-y-auto custom-scrollbar rounded-2xl border border-gray-100 divide-y divide-gray-100 bg-white">
                        {linkResults.length === 0 && <li className="p-4 text-sm text-gray-400 text-center">No hay médicos para vincular con esa búsqueda.</li>}
                        {linkResults.map((doctor) => (
                          <li key={doctor.id} role="option" aria-selected={false}>
                            <button type="button" onClick={() => selectLinkDoctor(doctor)} className="w-full min-h-[56px] px-4 py-3 flex items-center gap-3 text-left hover:bg-blue-50/60 focus-visible:bg-blue-50 outline-none transition">
                              {doctor.img
                                ? <img src={doctor.img} alt="" className="w-9 h-9 rounded-full object-cover bg-gray-100 shrink-0" />
                                : <div aria-hidden="true" className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center shrink-0">{stripTitle(doctor.name).charAt(0)}</div>}
                              <span className="min-w-0 flex-1">
                                <span className="block font-bold text-gray-900 truncate">{doctor.name}</span>
                                <span className="block text-xs text-gray-500 truncate">{doctor.specialty}{workSummary(doctor.id)[0] ? ` · ${workSummary(doctor.id)[0]}` : ''}</span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {fieldError('doctorId', 'medico')}
                </div>
              )}

              {/* Dónde atiende en esta institución: área o sector y consultorio */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${showDoctorFields || mode === 'link' ? 'border-t border-gray-100 pt-5' : ''}`}>
                <div>
                  <label htmlFor={`${fieldId}-area`} className={labelClass}>{terms.unit}</label>
                  <select id={`${fieldId}-area`} aria-invalid={Boolean(errors.area)} aria-describedby={`${fieldId}-area-error`} className={`${inputClass} appearance-none ${errorBorder(errors.area)}`} value={form.area} onChange={(e) => updateField('area', e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                  {fieldError('area', 'area')}
                </div>
                <div>
                  <label htmlFor={`${fieldId}-consultorio`} className={labelClass}>Consultorio</label>
                  <input id={`${fieldId}-consultorio`} maxLength={40} aria-invalid={Boolean(errors.office)} aria-describedby={`${fieldId}-consultorio-error`} placeholder="Ej: Consultorio 3" className={`${inputClass} ${errorBorder(errors.office)}`} value={form.office} onChange={(e) => updateField('office', e.target.value)} />
                  {fieldError('office', 'consultorio')}
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
                      {WEEK_DAYS.map((day) => (
                        <button
                          key={day}
                          type="button"
                          aria-pressed={form.days.includes(day)}
                          onClick={() => toggleDay(day)}
                          className={`w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition ${form.days.includes(day) ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor={`${fieldId}-desde`} className={labelClass}>Desde</label>
                    <input id={`${fieldId}-desde`} type="time" className={inputClass} value={form.startTime} onChange={(e) => updateField('startTime', e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor={`${fieldId}-hasta`} className={labelClass}>Hasta</label>
                    <input id={`${fieldId}-hasta`} type="time" className={inputClass} value={form.endTime} onChange={(e) => updateField('endTime', e.target.value)} />
                  </div>
                </div>
                {!isHospital && (mode !== 'link' || linkDoctor) && (
                  insuranceOptions.length > 0 ? (
                    <CheckboxDropdown
                      labelClass={labelClass}
                      label={mode === 'create' || editingOwn ? 'Obras sociales que acepta (opcional)' : `Obras sociales que atiende en ${clinic.name} (opcional)`}
                      options={insuranceOptions}
                      selected={form.insurances.filter((name) => insuranceOptions.includes(name))}
                      onChange={(value) => updateField('insurances', value)}
                      placeholder="Solo particular (sin obras sociales)"
                    />
                  ) : (
                    <p className="text-sm text-gray-500 flex items-start gap-2"><Wallet className="w-4 h-4 shrink-0 mt-0.5"/> {clinic.name} no tiene obras sociales cargadas: el médico atiende solo de forma particular. Podés cargarlas en Datos de la clínica.</p>
                  )
                )}
              </fieldset>

              {/* Documentación: al cargar o vincular (cada institución lleva la suya). Después se actualiza con el ícono Documentación de la tabla. */}
              {(mode === 'create' || mode === 'link') && (
                <DocumentsChecklist docs={docs} errors={docErrors} today={today} onChange={updateDoc} labelClass={labelClass} inputClass={inputClass} purpose={docsPurpose} />
              )}

              {formError && (
                <div role="alert" className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"/>
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button type="submit" className={`w-full sm:w-auto py-3 px-8 rounded-xl font-bold text-white transition shadow-md flex justify-center gap-2 items-center ${mode === 'edit' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                  {mode === 'edit' ? <Save className="w-5 h-5"/> : mode === 'link' ? <Link2 className="w-5 h-5"/> : <UserPlus className="w-5 h-5"/>}
                  {mode === 'edit' ? 'Actualizar' : mode === 'link' ? 'Vincular' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla de médicos de la institución */}
        <FadeIn delay={200}><div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
          {/* Hasta lg cada fila es una tarjeta apilada (sin scroll lateral); desde lg, tabla. */}
          <table className="w-full text-left border-collapse block lg:table">
            <thead className="hidden lg:table-header-group bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Profesional</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Contacto</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">{terms.unit} y consultorio</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Atención</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="block lg:table-row-group divide-y divide-gray-100 lg:divide-gray-50">
              {assignments.map((assignment) => {
                const doctor = findDoctor(assignment.doctorId);
                const disabled = assignment.status === 'disabled';
                const own = isOwnDoctor(assignment.doctorId);
                const issues = countDocumentIssues(assignment.documents, today);
                const expiring = countDocumentsExpiringSoon(assignment.documents, today);
                return (
                  <tr key={assignment.id} className={`block lg:table-row px-5 py-4 lg:p-0 hover:bg-blue-50/50 transition ${editId === assignment.id ? 'bg-orange-50' : disabled ? 'bg-gray-50/70' : ''}`}>
                    <td className="block lg:table-cell py-1 lg:p-5">
                      <div className="flex items-center gap-3">
                        {doctor?.img ? (
                          <img src={doctor.img} alt="" className={`w-10 h-10 rounded-full object-cover bg-gray-100 shrink-0 ${disabled ? 'grayscale opacity-60' : ''}`} />
                        ) : (
                          <div aria-hidden="true" className={`w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 ${disabled ? 'opacity-60' : ''}`}>{stripTitle(doctor?.name ?? '?').charAt(0)}</div>
                        )}
                        <div className="min-w-0">
                          <div className={`font-bold flex flex-wrap items-center gap-2 ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
                            {doctor?.name}
                            {disabled
                              ? <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200">Inhabilitado</span>
                              : doctor && <AccountStatusBadge email={doctor.email} />}
                          </div>
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 inline-block mt-1">{doctor?.specialty}</span>
                        </div>
                      </div>
                    </td>
                    <td className="block lg:table-cell py-1 lg:p-5 text-sm text-gray-500 break-all lg:break-normal">
                      <div>{doctor?.email}</div>
                      {doctor?.phone && <div>{doctor.phone}</div>}
                    </td>
                    <td className="block lg:table-cell py-1 lg:p-5 text-sm text-gray-500">
                      <div className="font-bold text-gray-700">{assignment.area}</div>
                      <div className="flex items-center gap-1"><DoorOpen className="w-4 h-4 shrink-0"/> {assignment.office}</div>
                    </td>
                    <td className="block lg:table-cell py-1 lg:p-5 text-sm text-gray-500">
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4 shrink-0"/> {formatSchedule(assignment)}</div>
                      {!isHospital && (
                        <div className="flex items-start gap-1 mt-1 text-xs">
                          <Wallet className="w-3.5 h-3.5 shrink-0 mt-0.5"/>
                          {/* Las que atiende en esta institución (vinculados) o las de su alta. */}
                          {(assignment.insurances ?? doctorInsurances(doctor)).join(', ') || 'Solo particular'}
                        </div>
                      )}
                    </td>
                    <td className="block lg:table-cell py-1 lg:p-5">
                      <div className="flex justify-start lg:justify-center gap-1 pt-2 lg:pt-0">
                        <IconAction
                          icon={FileText}
                          tone="blue"
                          onClick={() => setDocumentsId(assignment.id)}
                          badge={issues}
                          warning={expiring > 0}
                          label={issues > 0
                            ? `Documentación de ${doctor?.name}: ${issues} vencido(s) o pendiente(s)`
                            : expiring > 0 ? `Documentación de ${doctor?.name}: ${expiring} por vencer` : `Documentación de ${doctor?.name}: al día`}
                        />
                        {!disabled && (
                          <>
                            <IconAction icon={Pencil} tone="blue" onClick={() => startEdit(assignment)} label={`Editar datos de ${doctor?.name}`} />
                            {/* La contraseña la resetea quien lo dio de alta (de un médico vinculado se encarga su institución o VitaDev). */}
                            {own && (
                              <IconAction icon={KeyRound} tone="orange" onClick={() => requestReset({ name: doctor.name, email: doctor.email, profile: { name: stripTitle(doctor.name), title: getTitleFromName(doctor.name), role: ROLES.DOCTOR } })} label={`Resetear contraseña de ${doctor?.name}`} />
                            )}
                            <IconAction icon={Ban} tone="amber" onClick={() => setToDisable(assignment)} label={`Inhabilitar a ${doctor?.name} en ${terms.thisPlace}`} />
                          </>
                        )}
                        {/* Primero se inhabilita; recién inhabilitado se puede eliminar. */}
                        {disabled && (
                          <>
                            <IconAction icon={UserCheck} tone="green" onClick={() => setToEnable(assignment)} label={`Habilitar a ${doctor?.name}`} />
                            <IconAction icon={Trash2} tone="red" onClick={() => setDeleteId(assignment.id)} label={`Eliminar a ${doctor?.name} ${terms.fromPlace}`} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {assignments.length === 0 && (
            <div className="p-10 text-center text-gray-400">Todavía no hay médicos en {terms.thisPlace}.</div>
          )}
        </div></FadeIn>
      </div>
    </div>
  );
};

export default ClinicDoctors;
