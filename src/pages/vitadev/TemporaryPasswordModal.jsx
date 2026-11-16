import React, { useId, useRef, useState } from 'react';
import { CheckCircle, Copy, Check, X, KeyRound } from 'lucide-react';
import { useTimeouts } from '../../hooks/useTimeouts';

// Copia un texto al portapapeles. Si el navegador no permite la API moderna (por ejemplo,
// fuera de HTTPS) usa la forma clásica con un campo oculto. Devuelve true si se copió.
const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    return copied;
  }
};

// Ventana que muestra una contraseña temporal recién generada, con botón para copiarla.
// No se cierra sola ni con un click afuera: la contraseña se ve una única vez, así que
// se cierra solo con "Listo" o la X, cuando ya se la pasó a la persona.
// `credentials`: null (cerrada) o { title, message, password }.
const TemporaryPasswordModal = ({ credentials, onClose }) => {
  const fieldId = useId();
  const passwordRef = useRef(null);
  const { schedule } = useTimeouts();
  const [copyState, setCopyState] = useState('idle'); // 'idle' | 'copied' | 'error'

  if (!credentials) return null;

  const handleCopy = async () => {
    const copied = await copyText(credentials.password);
    setCopyState(copied ? 'copied' : 'error');
    // Si no se pudo copiar, se deja la contraseña seleccionada para copiarla a mano.
    if (!copied) passwordRef.current?.select();
    schedule(() => setCopyState('idle'), 2500);
  };

  const handleClose = () => {
    setCopyState('idle');
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={`${fieldId}-title`} className="fixed inset-0 z-[60] flex justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative bg-white rounded-3xl w-full max-w-md my-auto overflow-hidden shadow-2xl animate-slideUp text-center p-6 sm:p-8">
        <button type="button" onClick={handleClose} aria-label="Cerrar" className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-900 transition">
          <X className="w-5 h-5" />
        </button>
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
        </div>
        <h3 id={`${fieldId}-title`} className="text-xl sm:text-2xl font-black text-slate-800 mb-2">{credentials.title}</h3>
        <p className="text-slate-500 font-medium mb-6 break-words">{credentials.message}</p>

        <label htmlFor={`${fieldId}-password`} className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          <KeyRound className="w-3.5 h-3.5" /> Contraseña temporal
        </label>
        <div className="flex items-stretch gap-2">
          <input
            ref={passwordRef}
            id={`${fieldId}-password`}
            readOnly
            value={credentials.password}
            onFocus={(e) => e.target.select()}
            className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-mono text-lg font-bold tracking-wider text-gray-900 text-center outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleCopy}
            className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-4 rounded-xl font-bold text-sm transition ${copyState === 'copied' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'}`}
          >
            {copyState === 'copied' ? <><Check className="w-4 h-4" /> Copiada</> : <><Copy className="w-4 h-4" /> Copiar</>}
          </button>
        </div>
        <p role="status" aria-live="polite" className={`text-xs mt-2 min-h-[1rem] ${copyState === 'error' ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
          {copyState === 'error'
            ? 'No se pudo copiar automáticamente: quedó seleccionada para copiarla con Ctrl + C.'
            : copyState === 'copied'
              ? 'Contraseña copiada al portapapeles.'
              : 'Se muestra solo esta vez. La tendrá que cambiar al iniciar sesión.'}
        </p>

        <button type="button" onClick={handleClose} className="mt-6 w-full py-3 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-xl transition-colors">
          Listo
        </button>
      </div>
    </div>
  );
};

export default TemporaryPasswordModal;
