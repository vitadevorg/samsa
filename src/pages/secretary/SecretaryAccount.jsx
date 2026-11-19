import React, { useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Key, Camera, Trash2, Save, X, Shield, LogOut, CheckCircle, ClipboardList, AlertCircle,
  CreditCard, Lock, Stethoscope,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import FadeIn from '../../components/FadeIn';
import { useAuth } from '../../context/useAuth';
import { useTimeouts } from '../../hooks/useTimeouts';
import { verifyPassword, setOwnPassword, updateAccount, getRegisteredEmails } from '../../services/authService';
import { buildUserDirectory } from '../vitadev/userDirectory';
import {
  validateName, validateEmail, validatePhone, validateNewPassword, validatePasswordConfirmation, errorBorder,
} from '../clinic/clinicValidation';
import { useClinicData } from '../clinic/clinicDataContext';
import { buildSecretaryDoctors } from './dashboard/mockData';
import { SecretaryModalOverlay, SecretaryModalCard, SecretaryModalHeader } from './dashboard/SecretaryModal';

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
// Los correos de acceso del sistema son siempre del dominio institucional.
const SAMSA_EMAIL_DOMAIN = 'samsa.med';
const SAMSA_EMAIL_PATTERN = /^[^\s@]+@samsa\.med$/;
const EMPTY_PASSWORD_FORM = { currentPassword: '', password: '', confirmation: '' };

const compact = (errors) => Object.fromEntries(Object.entries(errors).filter(([, message]) => message));

// Mi cuenta de la secretaria: nombre, teléfono, foto y contraseña. Es una pantalla propia:
// solo toca la cuenta de la persona con sesión iniciada. El usuario (email) no se edita acá.
const SecretaryAccount = () => {
  const fieldId = useId();
  const navigate = useNavigate();
  const { schedule } = useTimeouts();
  const { user, updateUser, logout } = useAuth();
  const fileInputRef = useRef(null);
  // Médicos cuya agenda maneja: los mismos que ve en la Agenda Diaria (solo lectura).
  const clinicData = useClinicData();
  const { allSecretaries, allAssignments, updateSecretary, findDoctor } = clinicData;
  const secretary = allSecretaries.find((s) => s.email === user?.email);
  const doctors = buildSecretaryDoctors(secretary, allAssignments, findDoctor);

  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '', currentPassword: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [photoError, setPhotoError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [confirming, setConfirming] = useState(null); // 'profile' | 'password' | null
  const [toast, setToast] = useState(null);

  const showToast = (title, message) => {
    setToast({ title, message });
    schedule(() => setToast(null), 3000);
  };

  const updateProfileField = (name, value) => {
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileErrors((prev) => ({ ...prev, [name]: '' }));
  };
  const updatePasswordField = (name, value) => {
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileForm({ name: user.name || '', phone: user.phone || '', email: user.email, currentPassword: '' });
    setProfileErrors({});
  };

  const normalizedEmail = profileForm.email.trim().toLowerCase();
  const emailChanged = normalizedEmail !== (user?.email ?? '').toLowerCase();

  const validateSecretaryEmail = () => {
    // Otra persona ya registrada con ese correo (el propio no cuenta).
    const takenEmails = [...buildUserDirectory(clinicData).map((u) => u.email), ...getRegisteredEmails()]
      .map((email) => email.toLowerCase())
      .filter((email) => email !== user.email.toLowerCase());
    return validateEmail(profileForm.email, takenEmails)
      || (SAMSA_EMAIL_PATTERN.test(normalizedEmail) ? '' : `El correo tiene que terminar en @${SAMSA_EMAIL_DOMAIN}, por ejemplo nombre@${SAMSA_EMAIL_DOMAIN}.`);
  };

  const handleRequestSaveProfile = () => {
    const found = compact({
      name: validateName(profileForm.name),
      phone: validatePhone(profileForm.phone),
      email: validateSecretaryEmail(),
      // Cambiar el correo cambia el usuario con el que inicia sesión: se pide la contraseña actual.
      currentPassword: !emailChanged ? ''
        : !profileForm.currentPassword ? 'Ingresá tu contraseña actual para cambiar el correo.'
        : verifyPassword(user.email, profileForm.currentPassword) ? '' : 'La contraseña actual no es correcta.',
    });
    setProfileErrors(found);
    if (Object.keys(found).length === 0) setConfirming('profile');
  };

  const handleRequestSavePassword = (e) => {
    e.preventDefault();
    const found = compact({
      currentPassword: passwordForm.currentPassword && verifyPassword(user.email, passwordForm.currentPassword)
        ? '' : 'La contraseña actual no es correcta.',
      password: validateNewPassword(passwordForm.password)
        || (passwordForm.password === passwordForm.currentPassword ? 'Tiene que ser distinta de la actual.' : ''),
      confirmation: validatePasswordConfirmation(passwordForm.confirmation, passwordForm.password),
    });
    setPasswordErrors(found);
    if (Object.keys(found).length === 0) setConfirming('password');
  };

  const handleConfirm = () => {
    if (confirming === 'profile') {
      const changes = { name: profileForm.name.trim().replace(/\s+/g, ' '), phone: profileForm.phone.trim(), email: normalizedEmail };
      updateAccount(user.email, changes);
      // Mantiene al día su ficha en la institución (el panel la busca por correo).
      if (secretary) updateSecretary(secretary.id, changes);
      updateUser(changes);
      setProfileForm({ ...changes, currentPassword: '' });
      setIsEditing(false);
      showToast('¡Cambios guardados!', emailChanged ? `Desde ahora iniciás sesión con ${normalizedEmail}.` : 'Tus datos se actualizaron correctamente.');
    } else {
      setOwnPassword(user.email, passwordForm.password);
      setPasswordForm(EMPTY_PASSWORD_FORM);
      setIsChangingPassword(false);
      showToast('¡Contraseña actualizada!', 'Usá la nueva contraseña la próxima vez que inicies sesión.');
    }
    setConfirming(null);
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
      showToast('¡Foto actualizada!', 'Tu foto de perfil se guardó correctamente.');
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = () => {
    setPhotoError('');
    savePhoto(null);
    showToast('Foto eliminada', 'Tu cuenta quedó sin foto de perfil.');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return <div className="p-10 text-center">Cargando cuenta...</div>;

  const inputClass = 'w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all duration-200';
  const enabledClass = 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-100 text-gray-800 shadow-sm';
  const disabledClass = 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed';
  const labelClass = 'text-sm font-semibold text-gray-600 flex items-center gap-2';

  const field = ({ id, label, icon: Icon, value, onChange, error, disabled = false, ...props }) => (
    <div className="space-y-1">
      <label htmlFor={`${fieldId}-${id}`} className={labelClass}>
        <Icon className="w-4 h-4 text-blue-500" /> {label}
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

  const confirmCopy = {
    profile: { title: '¿Guardar cambios?', message: emailChanged ? `Tu usuario pasará a ser ${normalizedEmail} y el anterior dejará de funcionar. ¿Confirmar?` : '¿Estás seguro de que deseas actualizar tus datos personales?', yes: 'Sí, guardar cambios', icon: Save },
    password: { title: '¿Cambiar contraseña?', message: '¿Estás seguro de que deseas actualizar tu contraseña de seguridad?', yes: 'Sí, cambiar contraseña', icon: Key },
  }[confirming];

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-clip">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <FadeIn><div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-lg mb-6 sm:mb-8">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3 pointer-events-none">
            <ClipboardList className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-5 sm:gap-6">
            <div className="flex flex-col items-center gap-3 shrink-0">
              {/* Igual que el perfil del paciente: al pasar el mouse (o enfocar con teclado) sobre la foto aparecen cámara y papelera. */}
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-white/30 shadow-xl overflow-hidden bg-white flex items-center justify-center relative z-20">
                  {user.img ? (
                    <img src={user.img} alt="Foto de perfil" className="w-full h-full object-cover" />
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
                <ClipboardList className="w-3 h-3" /> Secretaría
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight break-words">{user.name}</h1>
              <p className="text-base sm:text-lg text-white/80 font-medium mt-1 break-all">{user.email}</p>
            </div>
          </div>
        </div></FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Columna izquierda en un solo contenedor: la separación entre tarjetas no depende de la altura de Seguridad. */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <FadeIn delay={100}><section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6 md:p-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" /> Información personal
                </h2>
                <p className="text-sm text-gray-500 mt-1">Gestioná tus datos de contacto.</p>
              </div>
              {!isEditing ? (
                <button type="button" onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 font-semibold transition-colors">
                  Editar datos
                </button>
              ) : (
                <div className="flex gap-2">
                  <button type="button" onClick={handleCancelEdit} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-semibold transition-colors">
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                  <button type="button" onClick={handleRequestSaveProfile} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-colors shadow-md hover:shadow-lg">
                    <Save className="w-4 h-4" /> Guardar
                  </button>
                </div>
              )}
            </div>
            <form noValidate onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {field({ id: 'nombre', label: 'Nombre y apellido', icon: User, value: profileForm.name, onChange: (e) => updateProfileField('name', e.target.value), error: profileErrors.name, disabled: !isEditing, maxLength: 60, autoComplete: 'name' })}
              {field({ id: 'telefono', label: 'Teléfono', icon: Phone, value: profileForm.phone, onChange: (e) => updateProfileField('phone', e.target.value), error: profileErrors.phone, disabled: !isEditing, type: 'tel', inputMode: 'tel', maxLength: 20, placeholder: '381 400-0000', autoComplete: 'tel' })}
              {field({ id: 'dni', label: 'DNI', icon: CreditCard, value: user.dni || 'No registrado', onChange: () => {}, disabled: true, readOnly: true })}
              {field({ id: 'correo', label: 'Correo (usuario)', icon: Mail, value: profileForm.email, onChange: (e) => updateProfileField('email', e.target.value), error: profileErrors.email, disabled: !isEditing, type: 'email', maxLength: 80, placeholder: `nombre@${SAMSA_EMAIL_DOMAIN}`, autoComplete: 'off' })}
              {isEditing && emailChanged && (
                <div className="md:col-span-2">
                  {field({ id: 'correo-clave', label: 'Contraseña actual (para cambiar el correo)', icon: Key, value: profileForm.currentPassword, onChange: (e) => updateProfileField('currentPassword', e.target.value), error: profileErrors.currentPassword, type: 'password', maxLength: 64, autoComplete: 'current-password' })}
                </div>
              )}
              {isEditing && (
                <p className="md:col-span-2 -mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                  <Lock className="w-3.5 h-3.5 shrink-0" /> El DNI es gestionado por administración. Contactá a soporte en caso de error.
                </p>
              )}
            </form>
            {isEditing && <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-400 animate-pulse"></div>}
          </section></FadeIn>

          <FadeIn delay={200}><section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" /> Médicos de tu agenda
            </h2>
            <p className="text-sm text-gray-500 mt-1 mb-5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 shrink-0" /> Los asigna el administrador de tu institución.
            </p>
            {doctors.length === 0 ? (
              <p className="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-2xl p-4">Todavía no tenés médicos asignados.</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {doctors.map((doctor) => (
                  <li key={doctor.id} className="flex items-start gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50/60 min-w-0">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 break-words">{doctor.name}</p>
                      {doctor.specialty && <p className="text-sm text-blue-700 font-semibold">{doctor.specialty}</p>}
                      <p className="text-xs text-gray-500 mt-0.5 break-words">{doctor.location}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section></FadeIn>
          </div>

          <FadeIn delay={150}><div className="space-y-6 sm:space-y-8">
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6 md:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
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
                    <button type="button" onClick={() => { setIsChangingPassword(false); setPasswordForm(EMPTY_PASSWORD_FORM); setPasswordErrors({}); }} className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Cancelar</button>
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

      {confirming && (
        <SecretaryModalOverlay onClose={() => setConfirming(null)} labelledBy={`${fieldId}-confirm`} zIndex="z-[60]">
          <SecretaryModalCard maxWidth="max-w-md">
            <SecretaryModalHeader icon={confirmCopy.icon} title={confirmCopy.title} titleId={`${fieldId}-confirm`} onClose={() => setConfirming(null)} />
            <div className="p-5 sm:p-8 text-center">
              <p className="text-gray-600 mb-6 leading-relaxed">{confirmCopy.message}</p>
              <div className="flex flex-col gap-3">
                <button type="button" onClick={handleConfirm} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                  {confirmCopy.yes}
                </button>
                <button type="button" onClick={() => setConfirming(null)} className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </SecretaryModalCard>
        </SecretaryModalOverlay>
      )}

      {toast && (
        <div role="status" className="fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4 pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 relative overflow-hidden flex items-center gap-4 max-w-sm w-full animate-fadeIn pointer-events-auto">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
            <div className="bg-green-100 rounded-full p-2 ml-2 shrink-0">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-bold">{toast.title}</p>
              <p className="text-gray-500 text-sm mt-0.5">{toast.message}</p>
            </div>
            <button type="button" onClick={() => setToast(null)} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600 shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretaryAccount;
