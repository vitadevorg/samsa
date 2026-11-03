import React, { useId, useState } from 'react';
import Navbar from '../../components/Navbar';
import { EditConfirmModal, SuccessModal } from '../clinic/ClinicModals';
import { useClinicData } from '../clinic/clinicDataContext';
import { useAuth } from '../../context/useAuth';
import { validateEmail, validatePhone, validateNewPassword, validatePasswordConfirmation, errorBorder } from '../clinic/clinicValidation';
import { verifyPassword, setOwnPassword, updateAccount, getRegisteredEmails } from '../../services/authService';
import { buildUserDirectory } from './userDirectory';
import { useSuccessModal } from './useSuccessModal';
import { UserCog, Mail, KeyRound, LifeBuoy, Save } from 'lucide-react';

const EMPTY_EMAIL_FORM = { email: '', currentPassword: '' };
const EMPTY_PASSWORD_FORM = { currentPassword: '', password: '', confirmation: '' };

// Mi cuenta del administrador de VitaDev: cambiar su usuario (email) y su contraseña.
// Para cualquiera de los dos cambios pide la contraseña actual, que nunca se muestra.
const VitadevAccount = () => {
  const fieldId = useId();
  const data = useClinicData();
  const { user, updateUser } = useAuth();
  const { success, showSuccess } = useSuccessModal();

  const [emailForm, setEmailForm] = useState(EMPTY_EMAIL_FORM);
  const [emailErrors, setEmailErrors] = useState({});
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordErrors, setPasswordErrors] = useState({});
  // Contacto de recuperación: arranca con el que ya tiene guardado.
  const [recoveryForm, setRecoveryForm] = useState({ email: user.recoveryEmail ?? '', phone: user.recoveryPhone ?? '', currentPassword: '' });
  const [recoveryErrors, setRecoveryErrors] = useState({});
  const [confirming, setConfirming] = useState(null); // 'email' | 'password' | 'recovery' | null

  const updateEmailField = (field, value) => {
    setEmailForm((prev) => ({ ...prev, [field]: value }));
    setEmailErrors((prev) => ({ ...prev, [field]: '' }));
  };
  const updatePasswordField = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const updateRecoveryField = (field, value) => {
    setRecoveryForm((prev) => ({ ...prev, [field]: value }));
    setRecoveryErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const compact = (errors) => Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
  const wrongPassword = (password) => (password && verifyPassword(user.email, password) ? '' : 'La contraseña actual no es correcta.');

  const handleSubmitEmail = (e) => {
    e.preventDefault();
    // El email nuevo no puede repetirse con otra cuenta (el propio actual sí vale, pero no es un cambio).
    const takenEmails = [...buildUserDirectory(data).map((u) => u.email), ...getRegisteredEmails()]
      .map((email) => email.toLowerCase())
      .filter((email) => email !== user.email.toLowerCase());
    const found = compact({
      email: validateEmail(emailForm.email, takenEmails)
        || (emailForm.email.trim().toLowerCase() === user.email.toLowerCase() ? 'Es el mismo usuario que ya tenés.' : ''),
      currentPassword: wrongPassword(emailForm.currentPassword),
    });
    setEmailErrors(found);
    if (Object.keys(found).length === 0) setConfirming('email');
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();
    const found = compact({
      currentPassword: wrongPassword(passwordForm.currentPassword),
      password: validateNewPassword(passwordForm.password, passwordForm.currentPassword),
      confirmation: validatePasswordConfirmation(passwordForm.confirmation, passwordForm.password),
    });
    setPasswordErrors(found);
    if (Object.keys(found).length === 0) setConfirming('password');
  };

  const handleSubmitRecovery = (e) => {
    e.preventDefault();
    const found = compact({
      email: validateEmail(recoveryForm.email)
        || (recoveryForm.email.trim().toLowerCase() === user.email.toLowerCase() ? 'Tiene que ser distinto de tu usuario.' : ''),
      phone: validatePhone(recoveryForm.phone, { required: true }),
      currentPassword: wrongPassword(recoveryForm.currentPassword),
    });
    setRecoveryErrors(found);
    if (Object.keys(found).length === 0) setConfirming('recovery');
  };

  const handleConfirm = () => {
    if (confirming === 'recovery') {
      const recoveryEmail = recoveryForm.email.trim().toLowerCase();
      const recoveryPhone = recoveryForm.phone.trim();
      updateAccount(user.email, { recoveryEmail, recoveryPhone });
      updateUser({ recoveryEmail, recoveryPhone });
      setRecoveryForm({ email: recoveryEmail, phone: recoveryPhone, currentPassword: '' });
      showSuccess('¡Datos de recuperación actualizados!', 'Vamos a usarlos si necesitás recuperar el acceso a tu cuenta.');
    } else if (confirming === 'email') {
      const newEmail = emailForm.email.trim().toLowerCase();
      updateAccount(user.email, { email: newEmail });
      updateUser({ email: newEmail });
      setEmailForm(EMPTY_EMAIL_FORM);
      showSuccess('¡Usuario actualizado!', `Desde ahora iniciás sesión con ${newEmail}.`);
    } else {
      setOwnPassword(user.email, passwordForm.password);
      setPasswordForm(EMPTY_PASSWORD_FORM);
      showSuccess('¡Contraseña actualizada!', 'Usá la nueva contraseña la próxima vez que inicies sesión.');
    }
    setConfirming(null);
  };

  const inputClass = 'w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white';
  const labelClass = 'text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block';
  const field = (form, errors, update, name, id, label, props = {}) => (
    <div>
      <label htmlFor={`${fieldId}-${id}`} className={labelClass}>{label}</label>
      <input id={`${fieldId}-${id}`} autoComplete="off" aria-invalid={Boolean(errors[name])} aria-describedby={`${fieldId}-${id}-error`} className={`${inputClass} ${errorBorder(errors[name])}`} value={form[name]} onChange={e => update(name, e.target.value)} {...props} />
      {errors[name] && <p id={`${fieldId}-${id}-error`} role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors[name]}</p>}
    </div>
  );
  const submitClass = 'py-3 px-8 rounded-xl font-bold text-white transition shadow-md flex justify-center gap-2 items-center bg-blue-600 hover:bg-blue-700 shadow-blue-200';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <EditConfirmModal
        isOpen={confirming !== null}
        title={{ email: '¿Cambiar usuario?', password: '¿Cambiar contraseña?', recovery: '¿Cambiar datos de recuperación?' }[confirming]}
        message={{
          email: `Tu usuario pasará a ser ${emailForm.email.trim().toLowerCase()}. El anterior dejará de funcionar. ¿Confirmar?`,
          password: 'Vas a reemplazar tu contraseña actual por la nueva. ¿Confirmar?',
          recovery: `Tu correo de recuperación será ${recoveryForm.email.trim().toLowerCase()} y tu teléfono ${recoveryForm.phone.trim()}. ¿Confirmar?`,
        }[confirming]}
        confirmLabel="Sí, Cambiar"
        onCancel={() => setConfirming(null)}
        onConfirm={handleConfirm}
      />
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg"><UserCog className="text-blue-600 w-8 h-8"/></div>
            Mi cuenta
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Usuario actual: <span className="font-bold text-gray-700">{user.email}</span></p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm mb-8 border border-gray-200">
          <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2"><Mail className="w-5 h-5 text-blue-600"/> Cambiar usuario</h3>
          <form onSubmit={handleSubmitEmail} noValidate className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {field(emailForm, emailErrors, updateEmailField, 'email', 'usuario', 'Nuevo usuario (email)', { type: 'email', maxLength: 80, placeholder: 'nuevo@samsa.med' })}
              {field(emailForm, emailErrors, updateEmailField, 'currentPassword', 'usuario-clave', 'Contraseña actual', { type: 'password', maxLength: 64, autoComplete: 'current-password' })}
            </div>
            <div className="flex justify-end">
              <button type="submit" className={submitClass}><Save className="w-5 h-5"/> Cambiar usuario</button>
            </div>
          </form>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm mb-8 border border-gray-200">
          <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2"><KeyRound className="w-5 h-5 text-blue-600"/> Cambiar contraseña</h3>
          <form onSubmit={handleSubmitPassword} noValidate className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {field(passwordForm, passwordErrors, updatePasswordField, 'currentPassword', 'clave-actual', 'Contraseña actual', { type: 'password', maxLength: 64, autoComplete: 'current-password' })}
              {field(passwordForm, passwordErrors, updatePasswordField, 'password', 'clave-nueva', 'Nueva contraseña', { type: 'password', maxLength: 64, autoComplete: 'new-password' })}
              {field(passwordForm, passwordErrors, updatePasswordField, 'confirmation', 'clave-repetir', 'Repetir nueva contraseña', { type: 'password', maxLength: 64, autoComplete: 'new-password' })}
            </div>
            <p className="text-xs text-gray-400 ml-1">Mínimo 8 caracteres, combinando letras y números.</p>
            <div className="flex justify-end">
              <button type="submit" className={submitClass}><Save className="w-5 h-5"/> Cambiar contraseña</button>
            </div>
          </form>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2"><LifeBuoy className="w-5 h-5 text-blue-600"/> Datos de recuperación</h3>
          <form onSubmit={handleSubmitRecovery} noValidate className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {field(recoveryForm, recoveryErrors, updateRecoveryField, 'email', 'recuperacion-correo', 'Correo de recuperación', { type: 'email', maxLength: 80, placeholder: 'tu.correo@ejemplo.com' })}
              {field(recoveryForm, recoveryErrors, updateRecoveryField, 'phone', 'recuperacion-telefono', 'Teléfono de recuperación', { type: 'tel', inputMode: 'tel', maxLength: 20, placeholder: '381 400-0000' })}
              {field(recoveryForm, recoveryErrors, updateRecoveryField, 'currentPassword', 'recuperacion-clave', 'Contraseña actual', { type: 'password', maxLength: 64, autoComplete: 'current-password' })}
            </div>
            <div className="flex justify-end">
              <button type="submit" className={submitClass}><Save className="w-5 h-5"/> Guardar datos</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VitadevAccount;
