import React, { useId, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

// Confirmación doble para acciones graves: hay que escribir el nombre exacto (`confirmText`)
// para habilitar el botón. Mayúsculas y espacios de más no cuentan; las tildes sí.
// `tone`: 'amber' (inhabilitar, reversible) o 'red' (dar de baja, definitivo).
const normalize = (text) => text.trim().replace(/\s+/g, ' ').toLowerCase();

const TONES = {
  amber: { header: 'bg-amber-50 border-amber-100', icon: 'bg-amber-100 text-amber-600', note: 'text-amber-700', button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' },
  red: { header: 'bg-red-50 border-red-100', icon: 'bg-red-100 text-red-600', note: 'text-red-600', button: 'bg-red-600 hover:bg-red-700 shadow-red-600/30' },
};

const TypeToConfirmModal = ({ title, note, message, confirmText, confirmLabel, tone = 'amber', onCancel, onConfirm }) => {
  const fieldId = useId();
  const [typed, setTyped] = useState('');
  const matches = normalize(typed) === normalize(confirmText);
  const styles = TONES[tone];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (matches) onConfirm();
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={`${fieldId}-title`} className="fixed inset-0 z-[60] flex justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-3xl w-full max-w-md my-auto overflow-hidden shadow-2xl animate-slideUp">
        <div className={`p-5 sm:p-6 flex items-start gap-4 border-b ${styles.header}`}>
          <div className={`p-3 rounded-full shrink-0 ${styles.icon}`}><AlertTriangle className="w-6 h-6" /></div>
          <div className="flex-1 min-w-0">
            <h3 id={`${fieldId}-title`} className="text-lg font-bold text-gray-900">{title}</h3>
            <p className={`text-sm font-medium ${styles.note}`}>{note}</p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600 transition shrink-0"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-gray-600 leading-relaxed">{message}</p>
          <div>
            <label htmlFor={`${fieldId}-nombre`} className="text-sm text-gray-600 mb-1.5 block">
              Para confirmar, escribí <span className="font-bold text-gray-900">{confirmText}</span>
            </label>
            <input
              id={`${fieldId}-nombre`}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              autoFocus
              placeholder={confirmText}
              aria-describedby={`${fieldId}-ayuda`}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white"
            />
            <p id={`${fieldId}-ayuda`} className={`text-xs mt-1 ml-1 ${typed && !matches ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
              {typed && !matches ? 'El nombre no coincide.' : 'El botón se habilita cuando el nombre coincide.'}
            </p>
          </div>
        </div>
        <div className="bg-gray-50 px-5 sm:px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition">Cancelar</button>
          <button type="submit" disabled={!matches} className={`w-full sm:w-auto px-5 py-2.5 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ${styles.button}`}>
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TypeToConfirmModal;
