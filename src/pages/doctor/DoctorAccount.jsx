import React, { useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Key, Camera, Trash2, Save, X, Shield, LogOut, AlertCircle, Lock, Stethoscope,
  Award, BadgeCheck, Star, Building2, MapPin, Clock, Send, Info, FileText, Eye, ShieldCheck, Pencil,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import FadeIn from '../../components/FadeIn';
import { useAuth } from '../../context/useAuth';
import { useCatalog } from '../../context/catalog-context';
import { verifyPassword, setOwnPassword, updateAccount, getRegisteredEmails } from '../../services/authService';
import { doctorsData } from '../../data/doctors';
import { WEEK_DAYS } from '../../constants/catalog';
import { getInstitutionById, getInstitutionType, formatSchedule, getDocumentStatus, NON_EXPIRING_DOCUMENTS } from '../../data/institutions';
import { stripTitle } from '../../utils/doctorName';
import { buildUserDirectory } from '../vitadev/userDirectory';
import { useSuccessModal } from '../vitadev/useSuccessModal';
import { EditConfirmModal, SuccessModal } from '../clinic/ClinicModals';
import { useClinicData } from '../clinic/clinicDataContext';
import { STATUS_BADGES, countDocumentIssues } from '../clinic/documentStatus';
import { formatDate, todayISO } from '../clinic/clinicDates';
import {
  validateName, validateEmail, validatePhone, validateNewPassword, validatePasswordConfirmation,
  validateAddress, validateSchedule, errorBorder,
} from '../clinic/clinicValidation';
import ScheduleRequestModal from './ScheduleRequestModal';
import DoctorReviews from './DoctorReviews';

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const BIO_MAX_LENGTH = 400;
// Los correos de acceso del sistema son siempre del dominio institucional (igual que en la secretaría).
const SAMSA_EMAIL_DOMAIN = 'samsa.med';
const SAMSA_EMAIL_PATTERN = /^[^\s@]+@samsa\.med$/;
const EMPTY_PASSWORD_FORM = { currentPassword: '', password: '', confirmation: '' };

const compact = (errors) => Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
const sameEmail = (a = '', b = '') => a.trim().toLowerCase() === b.trim().toLowerCase();

// Perfil Profesional del médico con sesión iniciada (/doctor/profile). Sigue el patrón de
// "Mi cuenta" de la secretaría: edita su nombre, teléfono, correo (usuario), foto y contraseña.
// La especialidad y la matrícula son de solo lectura: las gestiona su institución o VitaDev.
// El perfil público que ven los pacientes es otra pantalla (src/pages/DoctorProfile.jsx).
const DoctorAccount = () => {
  const fieldId = useId();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user, updateUser, logout } = useAuth();
  const { insurances: INSURANCES } = useCatalog();
  const clinicData = useClinicData();
  const { bookableAssignments, allRequests, addRequest, particularDoctors, updateParticularDoctor, updateDoctorContact } = clinicData;
  const { success, showSuccess } = useSuccessModal();

  // Ficha del médico en el sistema: la de VitaDev si es particular, o la de doctors.js (o el alta de
  // una institución) si atiende en una clínica u hospital. Se busca por el correo de la cuenta.
  const directory = buildUserDirectory(clinicData);
  const record = directory.find((p) => p.group === 'doctor' && sameEmail(p.email, user?.email));
  const particularDoctor = record?.particular ? particularDoctors.find((d) => d.id === record.sourceId) : null;
  const doctorId = record?.sourceId;
  const baseDoctor = (doctorId && (doctorsData.find((d) => d.id === doctorId) ?? clinicData.findDoctor(doctorId))) || particularDoctor || {};
  const specialty = particularDoctor?.specialty ?? baseDoctor.specialty ?? user?.specialty;
  const licenseNumber = user?.licenseNumber ?? baseDoctor.licenseNumber ?? particularDoctor?.licenseNumber;
  const doctorAssignments = doctorId ? bookableAssignments.filter((a) => a.doctorId === doctorId) : [];
  const isManagedByInstitution = doctorAssignments.length > 0;
  // Perfil público (doctors.js): de ahí salen las reseñas de los pacientes y el puntaje.
  const publicProfile = doctorId ? doctorsData.find((d) => d.id === doctorId) : undefined;
  const hasPublicProfile = Boolean(publicProfile);
  const today = todayISO();
  const title = user?.title ?? 'Dr.';

  // --- Información personal ---
  const initialProfile = () => ({
    name: stripTitle(user?.name ?? ''),
    phone: user?.phone ?? record?.phone ?? '',
    email: user?.email ?? '',
    currentPassword: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState(initialProfile);
  const [profileErrors, setProfileErrors] = useState({});
  const [photoError, setPhotoError] = useState('');

  // --- Datos profesionales (biografía; y si es particular, consultorio, horario y obras sociales) ---
  const initialProfessional = () => ({
    bio: user?.bio ?? baseDoctor.bio ?? '',
    address: particularDoctor?.address ?? '',
    days: particularDoctor?.days ?? [],
    startTime: particularDoctor?.startTime ?? '',
    endTime: particularDoctor?.endTime ?? '',
    insurances: particularDoctor?.insurances ?? [],
  });
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [professionalForm, setProfessionalForm] = useState(initialProfessional);
  const [professionalErrors, setProfessionalErrors] = useState({});

  // --- Seguridad ---
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordErrors, setPasswordErrors] = useState({});

  // --- Solicitud de cambio de horario a una institución ---
  const [requestingFor, setRequestingFor] = useState(null); // vinculación para la que se pide el cambio
  const [requestDraft, setRequestDraft] = useState(null); // pedido validado, esperando confirmación
  const requestInstitutionName = getInstitutionById(requestingFor?.institutionId)?.name;

  const [confirming, setConfirming] = useState(null); // 'profile' | 'professional' | 'password' | 'request' | null

  if (!user) return <div className="p-10 text-center">Cargando perfil...</div>;

  const updateProfileField = (name, value) => {
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileErrors((prev) => ({ ...prev, [name]: '' }));
  };
  const updateProfessionalField = (name, value) => {
    setProfessionalForm((prev) => ({ ...prev, [name]: value }));
    setProfessionalErrors((prev) => ({ ...prev, [name]: '', ...(['days', 'startTime', 'endTime'].includes(name) ? { schedule: '' } : {}) }));
  };
  const updatePasswordField = (name, value) => {
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const toggleDay = (day) => {
    const next = professionalForm.days.includes(day)
      ? professionalForm.days.filter((d) => d !== day)
      : [...professionalForm.days, day];
    updateProfessionalField('days', WEEK_DAYS.filter((d) => next.includes(d)));
  };
  const toggleInsurance = (insurance) => {
    const current = professionalForm.insurances;
    updateProfessionalField('insurances', current.includes(insurance) ? current.filter((i) => i !== insurance) : [...current, insurance]);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileForm(initialProfile());
    setProfileErrors({});
  };
  const handleCancelProfessional = () => {
    setIsEditingProfessional(false);
    setProfessionalForm(initialProfessional());
    setProfessionalErrors({});
  };
  const handleCancelPassword = () => {
    setIsChangingPassword(false);
    setPasswordForm(EMPTY_PASSWORD_FORM);
    setPasswordErrors({});
  };

  const normalizedEmail = profileForm.email.trim().toLowerCase();
  const emailChanged = !sameEmail(normalizedEmail, user.email);
  const cleanName = profileForm.name.trim().replace(/\s+/g, ' ');

  const validateDoctorEmail = () => {
    // Otra persona ya registrada con ese correo (el propio no cuenta).
    const takenEmails = [...directory.map((p) => p.email), ...getRegisteredEmails()]
      .map((email) => email.toLowerCase())
      .filter((email) => email !== user.email.toLowerCase());
    return validateEmail(profileForm.email, takenEmails)
      || (SAMSA_EMAIL_PATTERN.test(normalizedEmail) ? '' : `El correo tiene que terminar en @${SAMSA_EMAIL_DOMAIN}, por ejemplo nombre@${SAMSA_EMAIL_DOMAIN}.`);
  };

  const handleRequestSaveProfile = () => {
    const found = compact({
      name: validateName(profileForm.name),
      phone: validatePhone(profileForm.phone),
      email: validateDoctorEmail(),
      // Cambiar el correo cambia el usuario con el que inicia sesión: se pide la contraseña actual.
      currentPassword: !emailChanged ? ''
        : !profileForm.currentPassword ? 'Ingresá tu contraseña actual para cambiar el correo.'
        : verifyPassword(user.email, profileForm.currentPassword) ? '' : 'La contraseña actual no es correcta.',
    });
    setProfileErrors(found);
    if (Object.keys(found).length === 0) setConfirming('profile');
  };

  const handleRequestSaveProfessional = () => {
    const found = compact({
      bio: professionalForm.bio.trim().length > BIO_MAX_LENGTH ? `La biografía no puede superar los ${BIO_MAX_LENGTH} caracteres.` : '',
      ...(particularDoctor ? {
        address: validateAddress(professionalForm.address),
        schedule: validateSchedule(professionalForm),
      } : {}),
    });
    setProfessionalErrors(found);
    if (Object.keys(found).length === 0) setConfirming('professional');
  };

  const handleRequestSavePassword = (e) => {
    e.preventDefault();
    const found = compact({
      currentPassword: passwordForm.currentPassword && verifyPassword(user.email, passwordForm.currentPassword)
        ? '' : 'La contraseña actual no es correcta.',
      password: validateNewPassword(passwordForm.password, passwordForm.currentPassword),
      confirmation: validatePasswordConfirmation(passwordForm.confirmation, passwordForm.password),
    });
    setPasswordErrors(found);
    if (Object.keys(found).length === 0) setConfirming('password');
  };

  const handleSubmitRequest = (draft) => {
    setRequestDraft(draft);
    setConfirming('request');
  };

  const handleConfirm = () => {
    if (confirming === 'profile') {
      const phone = profileForm.phone.trim();
      updateAccount(user.email, { email: normalizedEmail, name: cleanName, phone });
      // Mantiene al día su ficha (la buscan por correo VitaDev, su institución y esta pantalla).
      // La ficha guarda el nombre con el título adelante, como "Dr. Jesús Zelarayan".
      const recordChanges = { name: `${title} ${cleanName}`, email: normalizedEmail, phone };
      if (particularDoctor) updateParticularDoctor(particularDoctor.id, recordChanges);
      else if (doctorId) updateDoctorContact(doctorId, recordChanges);
      updateUser({ name: cleanName, email: normalizedEmail, phone });
      setProfileForm({ name: cleanName, phone, email: normalizedEmail, currentPassword: '' });
      setIsEditing(false);
      showSuccess('¡Cambios guardados!', emailChanged ? `Desde ahora iniciás sesión con ${normalizedEmail}.` : 'Tus datos se actualizaron correctamente.');
    } else if (confirming === 'professional') {
      const bio = professionalForm.bio.trim();
      updateAccount(user.email, { bio });
      updateUser({ bio });
      if (particularDoctor) {
        const { address, days, startTime, endTime, insurances } = professionalForm;
        updateParticularDoctor(particularDoctor.id, { address: address.trim(), days, startTime, endTime, insurances });
      }
      setProfessionalForm((prev) => ({ ...prev, bio, address: prev.address.trim() }));
      setIsEditingProfessional(false);
      showSuccess('¡Datos profesionales guardados!', 'Tu información profesional se actualizó correctamente.');
    } else if (confirming === 'password') {
      setOwnPassword(user.email, passwordForm.password);
      setPasswordForm(EMPTY_PASSWORD_FORM);
      setIsChangingPassword(false);
      showSuccess('¡Contraseña actualizada!', 'Usá la nueva contraseña la próxima vez que inicies sesión.');
    } else if (confirming === 'request') {
      addRequest({ doctorId, institutionId: requestingFor.institutionId, ...requestDraft });
      showSuccess('¡Solicitud enviada!', `${requestInstitutionName} va a revisar tu pedido. Vas a ver la respuesta en "Dónde atendés".`);
      setRequestDraft(null);
      setRequestingFor(null);
    }
    setConfirming(null);
  };

  const handleCancelConfirm = () => {
    // Si cancela el envío de la solicitud, vuelve al formulario con lo que había cargado.
    if (confirming === 'request') setRequestDraft(null);
    setConfirming(null);
  };

  // Solicitudes del médico en una institución: la pendiente (si hay) y la última resuelta.
  const getRequestStatus = (institutionId) => {
    const mine = allRequests.filter((r) => r.doctorId === doctorId && r.institutionId === institutionId);
    const pending = mine.find((r) => r.status === 'pendiente');
    const lastResolved = mine
      .filter((r) => r.status !== 'pendiente')
      .reduce((latest, r) => (!latest || r.date >= latest.date ? r : latest), undefined);
    return { pending, lastResolved };
  };

  const savePhoto = (img) => {
    updateAccount(user.email, { img });
    updateUser({ img });
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('El archivo tiene que ser una imagen (JPG, PNG o WebP).');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('La foto no puede pesar más de 2 MB.');
      return;
    }
    setPhotoError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      savePhoto(reader.result);
      showSuccess('¡Foto actualizada!', 'Tu foto de perfil se guardó correctamente.');
    };
    reader.readAsDataURL(file);
  };
  const handleDeleteImage = () => {
    setPhotoError('');
    savePhoto(null);
    showSuccess('Foto eliminada', 'Tu cuenta quedó sin foto de perfil.');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all duration-200';
  const enabledClass = 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-100 text-gray-800 shadow-sm';
  const disabledClass = 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed';
  const labelClass = 'text-sm font-semibold text-gray-600 flex items-center gap-2';
  const cardClass = 'bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6 md:p-8';
  const editButtonClass = 'flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 font-semibold transition-colors';
  const cancelButtonClass = 'flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-semibold transition-colors';
  const saveButtonClass = 'flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-colors shadow-md hover:shadow-lg';

  const field = ({ id, label, icon: Icon, value, onChange, error, disabled = false, ...props }) => (
    <div className="space-y-1 min-w-0">
      <label htmlFor={`${fieldId}-${id}`} className={labelClass}>
        <Icon className="w-4 h-4 text-blue-500 shrink-0" /> {label}
      </label>
      <input
        id={`${fieldId}-${id}`}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={`${fieldId}-${id}-error`}
        className={`${inputClass} ${disabled ? disabledClass : `${enabledClass} ${errorBorder(error)}`}`}
        {...props}
      />
      {error && <p id={`${fieldId}-${id}-error`} role="alert" className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );

  // Dato que el médico no puede cambiar (lo gestiona su institución o VitaDev).
  const readOnlyItem = (Icon, label, value) => (
    <div className="flex items-start gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50/60 min-w-0">
      <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0"><Icon className="w-5 h-5" /></div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">{label} <Lock className="w-3 h-3" /></p>
        <p className="font-bold text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );

  const confirmCopy = {
    profile: {
      title: '¿Guardar cambios?',
      message: emailChanged ? `Tu usuario pasará a ser ${normalizedEmail} y el anterior dejará de funcionar. ¿Confirmar?` : '¿Estás seguro de que deseas actualizar tus datos personales?',
      yes: 'Sí, Guardar',
    },
    professional: { title: '¿Guardar datos profesionales?', message: '¿Estás seguro de que deseas actualizar tu información profesional?', yes: 'Sí, Guardar' },
    password: { title: '¿Cambiar contraseña?', message: 'Vas a reemplazar tu contraseña actual por la nueva. ¿Confirmar?', yes: 'Sí, Cambiar' },
    request: {
      title: '¿Enviar solicitud?',
      message: requestDraft ? `Vas a pedirle a ${requestInstitutionName} atender ${formatSchedule(requestDraft.requestedSchedule)}. Tu horario no cambia hasta que la acepten.` : '',
      yes: 'Sí, Enviar',
    },
  }[confirming];

  const insurancesLabel = (list) => (list?.length ? list.join(', ') : 'Solo particular');

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-clip">
      <Navbar />
      {requestingFor && (
        <ScheduleRequestModal
          institutionName={requestInstitutionName}
          assignment={requestingFor}
          otherAssignments={doctorAssignments.filter((a) => a.institutionId !== requestingFor.institutionId)}
          onCancel={() => setRequestingFor(null)}
          onSubmit={handleSubmitRequest}
        />
      )}
      <EditConfirmModal
        isOpen={confirming !== null}
        title={confirmCopy?.title}
        message={confirmCopy?.message}
        confirmLabel={confirmCopy?.yes}
        onCancel={handleCancelConfirm}
        onConfirm={handleConfirm}
      />
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <FadeIn><div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-lg mb-6 sm:mb-8">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3 pointer-events-none">
            <Stethoscope className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-5 sm:gap-6">
            <div className="flex flex-col items-center gap-3 shrink-0">
              {/* Igual que el perfil del paciente: al pasar el mouse (o enfocar con teclado) sobre la foto aparecen cámara y papelera. */}
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-white/30 shadow-xl overflow-hidden bg-white flex items-center justify-center relative z-20">
                  {user.img ? (
                    <img src={user.img} alt="Foto de perfil" className="w-full h-full object-cover object-top" />
                  ) : (
                    <User className="w-16 h-16 sm:w-20 sm:h-20 text-blue-300" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-30">
                  <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 hover:scale-110 transition" title="Subir foto" aria-label="Subir foto">
                    <Camera className="w-5 h-5" />
                  </button>
                  {user.img && (
                    <button type="button" onClick={handleDeleteImage} className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 hover:scale-110 transition" title="Eliminar foto" aria-label="Eliminar foto">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </div>
              </div>
              {photoError && (
                <p role="alert" className="flex items-center gap-1.5 text-xs font-semibold bg-white text-red-600 rounded-lg px-3 py-1.5 max-w-[16rem] text-center">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {photoError}
                </p>
              )}
            </div>
            <div className="text-center md:text-left flex-1 min-w-0">
              <span className="inline-flex items-center gap-1 px-3 py-1 mb-2 text-xs font-bold uppercase tracking-wider bg-white/20 rounded-full">
                <Stethoscope className="w-3 h-3" /> Perfil profesional
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight break-words">{title} {stripTitle(user.name)}</h1>
              {specialty && <p className="text-base sm:text-lg text-white/90 font-semibold mt-1">{specialty}</p>}
              {publicProfile?.rating != null && (
                <a href={`#${fieldId}-resenas`} className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-sm font-bold transition-colors">
                  <Star className="w-4 h-4 text-amber-300 fill-amber-300" /> {publicProfile.rating.toFixed(1)}
                  <span className="font-medium text-white/80">· {(publicProfile.reviewsCount ?? publicProfile.reviews?.length ?? 0).toLocaleString('es-AR')} reseñas</span>
                </a>
              )}
              <p className="text-sm sm:text-base text-white/75 font-medium mt-1 break-all">{user.email}</p>
              {hasPublicProfile && (
                <Link to={`/professionals/${doctorId}`} className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-bold transition-colors">
                  <Eye className="w-4 h-4" /> Ver mi perfil público
                </Link>
              )}
            </div>
          </div>
        </div></FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 min-w-0">
            {/* Información personal */}
            <FadeIn delay={100}><section className={`${cardClass} relative overflow-hidden`} aria-labelledby={`${fieldId}-personal`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h2 id={`${fieldId}-personal`} className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" /> Información personal
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Gestioná tu nombre y tus datos de contacto.</p>
                </div>
                {!isEditing ? (
                  <button type="button" onClick={() => setIsEditing(true)} className={editButtonClass}>
                    <Pencil className="w-4 h-4" /> Editar datos
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button type="button" onClick={handleCancelEdit} className={cancelButtonClass}><X className="w-4 h-4" /> Cancelar</button>
                    <button type="button" onClick={handleRequestSaveProfile} className={saveButtonClass}><Save className="w-4 h-4" /> Guardar</button>
                  </div>
                )}
              </div>
              <form noValidate onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {field({ id: 'nombre', label: `Nombre y apellido (sin "${title}")`, icon: User, value: profileForm.name, onChange: (e) => updateProfileField('name', e.target.value), error: profileErrors.name, disabled: !isEditing, maxLength: 60, autoComplete: 'name' })}
                {field({ id: 'telefono', label: 'Teléfono', icon: Phone, value: profileForm.phone, onChange: (e) => updateProfileField('phone', e.target.value), error: profileErrors.phone, disabled: !isEditing, type: 'tel', inputMode: 'tel', maxLength: 20, placeholder: '381 400-0000', autoComplete: 'tel' })}
                <div className="md:col-span-2">
                  {field({ id: 'correo', label: 'Correo (usuario)', icon: Mail, value: profileForm.email, onChange: (e) => updateProfileField('email', e.target.value), error: profileErrors.email, disabled: !isEditing, type: 'email', maxLength: 80, placeholder: `nombre@${SAMSA_EMAIL_DOMAIN}`, autoComplete: 'off' })}
                </div>
                {isEditing && emailChanged && (
                  <div className="md:col-span-2">
                    {field({ id: 'correo-clave', label: 'Contraseña actual (para cambiar el correo)', icon: Key, value: profileForm.currentPassword, onChange: (e) => updateProfileField('currentPassword', e.target.value), error: profileErrors.currentPassword, type: 'password', maxLength: 64, autoComplete: 'current-password' })}
                  </div>
                )}
              </form>
              {isEditing && <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-400 animate-pulse"></div>}
            </section></FadeIn>

            {/* Datos profesionales */}
            <FadeIn delay={200}><section className={`${cardClass} relative overflow-hidden`} aria-labelledby={`${fieldId}-profesional`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h2 id={`${fieldId}-profesional`} className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" /> Datos profesionales
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Tu presentación para los pacientes.</p>
                </div>
                {!isEditingProfessional ? (
                  <button type="button" onClick={() => setIsEditingProfessional(true)} className={editButtonClass}>
                    <Pencil className="w-4 h-4" /> Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button type="button" onClick={handleCancelProfessional} className={cancelButtonClass}><X className="w-4 h-4" /> Cancelar</button>
                    <button type="button" onClick={handleRequestSaveProfessional} className={saveButtonClass}><Save className="w-4 h-4" /> Guardar</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3">
                {readOnlyItem(Stethoscope, 'Especialidad', specialty || 'No registrada')}
                {readOnlyItem(BadgeCheck, 'Matrícula', licenseNumber || 'No registrada')}
              </div>
              <p className="mb-6 flex items-start gap-1.5 text-xs text-gray-400">
                <Lock className="w-3.5 h-3.5 shrink-0 mt-px" />
                {particularDoctor ? 'La especialidad y la matrícula las registra VitaDev.' : 'La especialidad y la matrícula las gestiona tu institución.'} Contactá a soporte en caso de error.
              </p>
              <form noValidate onSubmit={(e) => e.preventDefault()} className="space-y-5 sm:space-y-6">
                <div className="space-y-1">
                  <label htmlFor={`${fieldId}-biografia`} className={labelClass}><FileText className="w-4 h-4 text-blue-500" /> Biografía</label>
                  <textarea
                    id={`${fieldId}-biografia`}
                    rows={4}
                    value={professionalForm.bio}
                    onChange={(e) => updateProfessionalField('bio', e.target.value)}
                    disabled={!isEditingProfessional}
                    maxLength={BIO_MAX_LENGTH}
                    placeholder="Contá tu formación y en qué te especializás."
                    aria-invalid={Boolean(professionalErrors.bio)}
                    className={`${inputClass} resize-none ${!isEditingProfessional ? disabledClass : `${enabledClass} ${errorBorder(professionalErrors.bio)}`}`}
                  />
                  <div className="flex justify-between gap-2">
                    {professionalErrors.bio ? <p role="alert" className="text-xs text-red-600 font-medium">{professionalErrors.bio}</p> : <span />}
                    {isEditingProfessional && <p className="text-xs text-gray-400 shrink-0">{professionalForm.bio.length}/{BIO_MAX_LENGTH}</p>}
                  </div>
                </div>

                {particularDoctor && (<>
                  {field({ id: 'consultorio', label: 'Dirección del consultorio', icon: MapPin, value: professionalForm.address, onChange: (e) => updateProfessionalField('address', e.target.value), error: professionalErrors.address, disabled: !isEditingProfessional, maxLength: 100 })}
                  <div className="space-y-2">
                    <p id={`${fieldId}-dias`} className={labelClass}><Clock className="w-4 h-4 text-blue-500" /> Días y horario de atención</p>
                    <div role="group" aria-labelledby={`${fieldId}-dias`} className="flex flex-wrap gap-2">
                      {WEEK_DAYS.map((day) => (
                        <button
                          key={day}
                          type="button"
                          aria-pressed={professionalForm.days.includes(day)}
                          disabled={!isEditingProfessional}
                          onClick={() => toggleDay(day)}
                          className={`w-11 h-11 rounded-full text-xs font-bold flex items-center justify-center transition disabled:cursor-not-allowed ${
                            professionalForm.days.includes(day) ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          } ${!isEditingProfessional ? 'opacity-70' : ''}`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
                      <div>
                        <label htmlFor={`${fieldId}-desde`} className="text-xs font-bold text-gray-500 uppercase">Desde</label>
                        <input id={`${fieldId}-desde`} type="time" value={professionalForm.startTime} onChange={(e) => updateProfessionalField('startTime', e.target.value)} disabled={!isEditingProfessional} className={`${inputClass} ${!isEditingProfessional ? disabledClass : `${enabledClass} ${errorBorder(professionalErrors.schedule)}`}`} />
                      </div>
                      <div>
                        <label htmlFor={`${fieldId}-hasta`} className="text-xs font-bold text-gray-500 uppercase">Hasta</label>
                        <input id={`${fieldId}-hasta`} type="time" value={professionalForm.endTime} onChange={(e) => updateProfessionalField('endTime', e.target.value)} disabled={!isEditingProfessional} className={`${inputClass} ${!isEditingProfessional ? disabledClass : `${enabledClass} ${errorBorder(professionalErrors.schedule)}`}`} />
                      </div>
                    </div>
                    {professionalErrors.schedule && <p role="alert" className="text-xs text-red-600 font-medium">{professionalErrors.schedule}</p>}
                  </div>
                  <div className="space-y-2">
                    <p id={`${fieldId}-obras`} className={labelClass}><ShieldCheck className="w-4 h-4 text-blue-500" /> Obras sociales que aceptás</p>
                    {isEditingProfessional ? (
                      <div role="group" aria-labelledby={`${fieldId}-obras`} className="flex flex-wrap gap-2">
                        {INSURANCES.map((insurance) => (
                          <button
                            key={insurance}
                            type="button"
                            aria-pressed={professionalForm.insurances.includes(insurance)}
                            onClick={() => toggleInsurance(insurance)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                              professionalForm.insurances.includes(insurance)
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            {insurance}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">{insurancesLabel(professionalForm.insurances)}</p>
                    )}
                    {isEditingProfessional && <p className="text-xs text-gray-400">Si no marcás ninguna, figurás como "Solo particular".</p>}
                  </div>
                </>)}
              </form>
              {isEditingProfessional && <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-400 animate-pulse"></div>}
            </section></FadeIn>

            {/* Dónde atendés */}
            <FadeIn delay={250}><section className={cardClass} aria-labelledby={`${fieldId}-donde`}>
              <h2 id={`${fieldId}-donde`} className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" /> Dónde atendés
              </h2>
              {isManagedByInstitution ? (<>
                <p className="text-sm text-gray-500 mt-1 mb-5 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" /> Tus horarios los administra cada institución. Para cambiarlos, enviá una solicitud.
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {doctorAssignments.map((assignment) => {
                    const institution = getInstitutionById(assignment.institutionId);
                    const institutionType = getInstitutionType(assignment.institutionId);
                    const { pending, lastResolved } = getRequestStatus(assignment.institutionId);
                    return (
                      <li key={assignment.id} className="p-4 sm:p-5 rounded-2xl border border-blue-100 bg-blue-50/40 space-y-3 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-bold text-gray-900 break-words">{institution?.name}</p>
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 shrink-0">{institutionType}</span>
                        </div>
                        <p className="text-sm text-gray-600 flex items-start gap-2"><MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /> {institution?.address}</p>
                        <p className="text-sm text-gray-600 flex items-start gap-2">
                          <Stethoscope className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          {institutionType === 'Hospital' ? 'Sector' : 'Área'}: {assignment.area} · {assignment.office}
                        </p>
                        <p className="text-sm font-medium text-gray-800 flex items-start gap-2"><Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /> {formatSchedule(assignment)}</p>
                        {pending ? (
                          <div className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3">
                            <p className="font-bold">Solicitud pendiente</p>
                            <p>Pediste {formatSchedule(pending.requestedSchedule)} el {formatDate(pending.date)}. La institución todavía no respondió.</p>
                          </div>
                        ) : (
                          <div className="pt-1 space-y-2">
                            {lastResolved && (
                              <p className="text-xs text-gray-500">
                                Última solicitud ({formatDate(lastResolved.resolvedAt ?? lastResolved.date)}):{' '}
                                <span className={`font-bold ${lastResolved.status === 'aceptada' ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {lastResolved.status === 'aceptada' ? 'Aceptada' : 'Rechazada'}
                                </span>
                              </p>
                            )}
                            <button type="button" onClick={() => setRequestingFor(assignment)} className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition flex items-center gap-1.5">
                              <Send className="w-4 h-4" /> Solicitar cambio de horario
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>) : (
                <div className="mt-5 p-4 sm:p-5 rounded-2xl border border-gray-200 bg-gray-50 space-y-3 md:max-w-md">
                  <p className="font-bold text-gray-900">Atención particular</p>
                  <p className="text-sm text-gray-600 flex items-start gap-2"><MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /> {particularDoctor?.address || 'Sin dirección cargada'}</p>
                  <p className="text-sm font-medium text-gray-800 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /> {particularDoctor?.days?.length ? formatSchedule(particularDoctor) : 'Sin horario cargado'}
                  </p>
                  <p className="text-sm text-gray-600 flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /> {insurancesLabel(particularDoctor?.insurances)}</p>
                </div>
              )}
            </section></FadeIn>

            {/* Reseñas de pacientes (solo lectura) */}
            {publicProfile && (
              <FadeIn delay={280}><div id={`${fieldId}-resenas`} className="scroll-mt-28">
                <DoctorReviews className={cardClass} rating={publicProfile.rating} reviewsCount={publicProfile.reviewsCount} reviews={publicProfile.reviews} />
              </div></FadeIn>
            )}

            {/* Documentación (solo particulares: la registra VitaDev) */}
            {particularDoctor && (
              <FadeIn delay={300}><section className={cardClass} aria-labelledby={`${fieldId}-documentacion`}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <h2 id={`${fieldId}-documentacion`} className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" /> Mi documentación
                  </h2>
                  {countDocumentIssues(particularDoctor.documents, today) > 0 ? (
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                      {countDocumentIssues(particularDoctor.documents, today)} por regularizar
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">Al día</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-5">
                  Como médico particular, VitaDev registra tu documentación. Enviá los documentos pendientes o vencidos a VitaDev para que los marque como recibidos.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {particularDoctor.documents.map((doc) => {
                    const status = getDocumentStatus(doc, today);
                    const { label, className, Icon } = STATUS_BADGES[status];
                    const expires = NON_EXPIRING_DOCUMENTS.includes(doc.type)
                      ? 'No vence'
                      : doc.expiresAt
                        ? `${status === 'vencido' ? 'Venció' : 'Vence'} el ${formatDate(doc.expiresAt)}`
                        : 'Sin fecha de vencimiento';
                    return (
                      <li key={doc.type} className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50 min-w-0">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 break-words">{doc.type}</p>
                          <p className="text-xs text-gray-500">{expires}</p>
                        </div>
                        <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${className}`}>
                          <Icon className="w-3.5 h-3.5" /> {label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section></FadeIn>
            )}
          </div>

          {/* Seguridad */}
          <FadeIn delay={150}><div className="space-y-6 sm:space-y-8">
            <section className={cardClass} aria-labelledby={`${fieldId}-seguridad`}>
              <h2 id={`${fieldId}-seguridad`} className="text-lg sm:text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" /> Seguridad
              </h2>
              {!isChangingPassword ? (
                <div className="text-center py-2">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4 font-medium">La contraseña se ocultó por seguridad.</p>
                  <button type="button" onClick={() => setIsChangingPassword(true)} className="w-full py-3 border-2 border-blue-600 text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors">
                    Cambiar contraseña
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestSavePassword} noValidate className="space-y-4">
                  {field({ id: 'clave-actual', label: 'Actual', icon: Key, value: passwordForm.currentPassword, onChange: (e) => updatePasswordField('currentPassword', e.target.value), error: passwordErrors.currentPassword, type: 'password', maxLength: 64, autoComplete: 'current-password' })}
                  <div className="border-t border-gray-100 pt-4 space-y-4">
                    {field({ id: 'clave-nueva', label: 'Nueva', icon: Key, value: passwordForm.password, onChange: (e) => updatePasswordField('password', e.target.value), error: passwordErrors.password, type: 'password', maxLength: 64, autoComplete: 'new-password' })}
                    {field({ id: 'clave-repetir', label: 'Confirmar', icon: Key, value: passwordForm.confirmation, onChange: (e) => updatePasswordField('confirmation', e.target.value), error: passwordErrors.confirmation, type: 'password', maxLength: 64, autoComplete: 'new-password' })}
                    <p className="text-xs text-gray-400">Mínimo 8 caracteres, combinando letras y números.</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={handleCancelPassword} className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Cancelar</button>
                    <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md">Actualizar</button>
                  </div>
                </form>
              )}
            </section>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" /> Cerrar sesión
            </button>
          </div></FadeIn>
        </div>
      </main>
    </div>
  );
};

export default DoctorAccount;
