import React, { useId, useState } from 'react';
import { Activity, Eye, EyeOff, KeyRound } from 'lucide-react';
import { validateNewPassword, validatePasswordConfirmation, errorBorder } from '../pages/clinic/clinicValidation';

// Ventana del login para quien entra con una contraseña temporal (la asignó el administrador
// de VitaDev): tiene que elegir una nueva antes de poder usar la cuenta.
// `temporaryPassword` es la que acaba de escribir (la nueva no puede ser igual).
// `onSubmit(newPassword)` es asíncrona; si falla, muestra un aviso y deja reintentar.
const ChangePasswordModal = ({ temporaryPassword, onSubmit, onCancel }) => {
  const fieldId = useId();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {
      password: validateNewPassword(password, temporaryPassword),
      confirmation: validatePasswordConfirmation(confirmation, password),
    };
    const withErrors = Object.fromEntries(Object.entries(found).filter(([, message]) => message));
    setErrors(withErrors);
    if (Object.keys(withErrors).length > 0) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit(password);
    } catch {
      setSubmitError('No pudimos guardar la contraseña. Intentalo de nuevo.');
      setIsSubmitting(false);
    }
  };

  const inputClass = 'w-full p-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white';
  const labelClass = 'text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div role="dialog" aria-modal="true" aria-labelledby={`${fieldId}-title`} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-slideUp p-8">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <KeyRound className="w-10 h-10 text-amber-600" />
        </div>
        <h3 id={`${fieldId}-title`} className="text-2xl font-black text-slate-800 mb-3 text-center">Elegí una nueva contraseña</h3>
        <p className="text-slate-500 font-medium mb-6 text-center">
          Ingresaste con una contraseña temporal. Por seguridad, tenés que cambiarla antes de continuar.
        </p>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor={`${fieldId}-nueva`} className={labelClass}>Nueva contraseña</label>
            <div className="relative">
              <input
                id={`${fieldId}-nueva`}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                maxLength={64}
                aria-invalid={Boolean(errors.password)}
                className={`${inputClass} ${errorBorder(errors.password)}`}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: '' })); }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                aria-label={showPassword ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor={`${fieldId}-repetir`} className={labelClass}>Repetir contraseña</label>
            <input
              id={`${fieldId}-repetir`}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              maxLength={64}
              aria-invalid={Boolean(errors.confirmation)}
              className={`${inputClass} ${errorBorder(errors.confirmation)}`}
              value={confirmation}
              onChange={(e) => { setConfirmation(e.target.value); setErrors((prev) => ({ ...prev, confirmation: '' })); }}
            />
            {errors.confirmation && <p role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.confirmation}</p>}
          </div>
          <p className="text-xs text-slate-400 ml-1">Mínimo 8 caracteres, combinando letras y números.</p>
          {submitError && <p role="alert" className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-xl border border-red-100">{submitError}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} disabled={isSubmitting} className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-xl transition-colors disabled:opacity-60">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 px-4 bg-amber-500 text-white hover:bg-amber-600 font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/30 disabled:opacity-70 flex items-center justify-center gap-2">
              {isSubmitting ? <><Activity className="w-5 h-5 animate-spin" /> Guardando...</> : 'Guardar y entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
