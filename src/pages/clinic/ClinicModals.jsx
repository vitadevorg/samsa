import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, X } from 'lucide-react';

// Ventanas de confirmación (naranja) y de éxito (verde) de las pantallas de clínica.
// Copian el mismo estilo que las de src/pages/MyReviews.jsx, que están escritas
// dentro de esa página y por eso no se pueden importar directamente.
// La ventana roja de eliminar es src/components/ConfirmModal.jsx; como su botón
// siempre dice "Sí, Eliminar", para rechazar usamos RejectConfirmModal (abajo),
// que tiene el mismo diseño.

// Naranja: "¿seguro que querés guardar los cambios?"
// Si `isOpen` es false no se dibuja nada (return null).
// `confirmLabel` permite cambiar el texto del botón (por defecto "Sí, Modificar").
export const EditConfirmModal = ({ isOpen, title, message, onCancel, onConfirm, confirmLabel = 'Sí, Modificar' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-slideUp text-center p-8">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-amber-600" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-3">{title}</h3>
        <p className="text-slate-500 font-medium mb-8">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-xl transition-colors">
            Revisar
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 px-4 bg-amber-500 text-white hover:bg-amber-600 font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/30">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// Verde: aviso de que la operación salió bien. Se cierra sola (lo controla la página).
export const SuccessModal = ({ isOpen, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-slideUp text-center p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 font-medium">{message}</p>
      </div>
    </div>
  );
};

// Roja: igual a src/components/ConfirmModal.jsx pero con el botón "Sí, Rechazar".
export const RejectConfirmModal = ({ isOpen, title, message, onCancel, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all scale-100 animate-slideUp">
        <div className="bg-red-50 p-6 flex items-center gap-4 border-b border-red-100">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-red-600 font-medium">Esta acción no se puede deshacer</p>
          </div>
          <button onClick={onCancel} className="ml-auto text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-base leading-relaxed">{message}</p>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button onClick={onCancel} className="px-4 py-2 text-gray-700 font-bold hover:bg-gray-200 rounded-lg transition">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-lg transition">Sí, Rechazar</button>
        </div>
      </div>
    </div>
  );
};
