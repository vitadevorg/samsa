import React, { useEffect, useId, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Activity, Check, Eye, EyeOff, KeyRound, ShieldAlert } from 'lucide-react';
import { isPasswordResetTokenValid, completePasswordReset } from '../services/authService';
import { validateNewPassword, validatePasswordConfirmation, errorBorder } from './clinic/clinicValidation';

// Pantalla a la que lleva el enlace de "Olvidé mi contraseña": elegir la contraseña nueva.
// El enlace trae un `token` en la dirección (?token=...); sirve una sola vez y vence a los 30 minutos.
const ResetPassword = () => {
  const fieldId = useId();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  // Se revisa al abrir la pantalla; después de usarlo el enlace deja de valer.
  const [isLinkValid] = useState(() => isPasswordResetTokenValid(token));

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {
      password: validateNewPassword(password),
      confirmation: validatePasswordConfirmation(confirmation, password),
    };
    const withErrors = Object.fromEntries(Object.entries(found).filter(([, message]) => message));
    setErrors(withErrors);
    if (Object.keys(withErrors).length > 0) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await completePasswordReset(token, password);
      if (isMountedRef.current) setIsDone(true);
    } catch {
      if (!isMountedRef.current) return;
      setSubmitError('No pudimos cambiar la contraseña. El enlace pudo haber vencido.');
      setIsSubmitting(false);
    }
  };

  const inputClass = 'block w-full pl-12 pr-12 py-4 bg-slate-50 border rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <Link to="/login" className="absolute top-8 left-8 text-white/70 hover:text-white flex items-center gap-2 font-medium transition-colors z-50">
        <ArrowLeft className="w-5 h-5" /> Volver al inicio de sesión
      </Link>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative z-10 animate-slideUp">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>
        <div className="p-8">
          {isDone ? (
            <div className="text-center animate-fadeIn">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 mb-2">¡Contraseña actualizada!</h1>
              <p className="text-slate-500 font-medium mb-6">Ya podés iniciar sesión con tu nueva contraseña.</p>
              <Link to="/login" className="inline-flex w-full justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">
                Ir a iniciar sesión
              </Link>
            </div>
          ) : !isLinkValid ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-3 bg-red-50 rounded-2xl mb-4">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 mb-2">El enlace no es válido</h1>
              <p className="text-slate-500 font-medium mb-6">Venció o ya se usó. Pedí uno nuevo para recuperar tu acceso.</p>
              <Link to="/forgot-password" className="inline-flex w-full justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">
                Pedir un enlace nuevo
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-4">
                  <KeyRound className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-800 mb-2">Elegí tu nueva contraseña</h1>
                <p className="text-slate-500 font-medium text-sm">Mínimo 8 caracteres, combinando letras y números.</p>
              </div>
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label htmlFor={`${fieldId}-nueva`} className="block text-xs font-bold uppercase tracking-wider mb-1 ml-1 text-slate-400">Nueva contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-slate-400" /></div>
                    <input
                      id={`${fieldId}-nueva`}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      maxLength={64}
                      aria-invalid={Boolean(errors.password)}
                      className={`${inputClass} ${errors.password ? errorBorder(true) : 'border-slate-200'}`}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: '' })); }}
                    />
                    <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors" aria-label={showPassword ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}>
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.password}</p>}
                </div>
                <div>
                  <label htmlFor={`${fieldId}-repetir`} className="block text-xs font-bold uppercase tracking-wider mb-1 ml-1 text-slate-400">Repetir contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-slate-400" /></div>
                    <input
                      id={`${fieldId}-repetir`}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      maxLength={64}
                      aria-invalid={Boolean(errors.confirmation)}
                      className={`${inputClass} ${errors.confirmation ? errorBorder(true) : 'border-slate-200'}`}
                      value={confirmation}
                      onChange={(e) => { setConfirmation(e.target.value); setErrors((prev) => ({ ...prev, confirmation: '' })); }}
                    />
                  </div>
                  {errors.confirmation && <p role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.confirmation}</p>}
                </div>
                {submitError && <p role="alert" className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-xl border border-red-100">{submitError}</p>}
                <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? <><Activity className="w-5 h-5 animate-spin" /> Guardando...</> : 'Cambiar contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
