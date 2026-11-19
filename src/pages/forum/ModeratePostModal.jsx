import React, { useId, useState } from 'react';
import { ShieldAlert, X, Trash2 } from 'lucide-react';
import { REASON_MAX, validateReason } from './forumPosts';

// VitaDev (o la clínica u hospital, con sus médicos) borra la nota de otro autor: el motivo es obligatorio y el autor lo ve en el foro.
// Como pide escribir, no se cierra con click afuera: solo con Cancelar o la X.
const ModeratePostModal = ({ post, onCancel, onConfirm }) => {
  const fieldId = useId();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validateReason(reason);
    setError(found);
    if (!found) onConfirm(reason.trim());
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${fieldId}-title`}
      className="fixed inset-0 z-[110] flex justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-fadeIn"
    >
      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg my-auto overflow-hidden animate-slideUp">
        <div className="bg-red-50 px-5 py-4 sm:px-6 sm:py-5 flex items-start gap-3 sm:gap-4 border-b border-red-100">
          <div className="bg-red-100 p-2.5 rounded-full shrink-0">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id={`${fieldId}-title`} className="text-lg font-bold text-gray-900">Eliminar publicación de otro autor</h2>
            <p className="text-sm text-red-600 font-medium">Esta acción no se puede deshacer</p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600 transition shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6 space-y-4">
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Publicación</p>
            <p className="font-bold text-gray-900 break-words">{post.title}</p>
            <p className="text-sm text-gray-500 mt-0.5">Por {post.authorName}</p>
          </div>
          <div>
            <label htmlFor={`${fieldId}-motivo`} className="text-sm font-semibold text-gray-600 mb-1 block">Aclaración para el autor</label>
            <textarea
              id={`${fieldId}-motivo`}
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(''); }}
              maxLength={REASON_MAX}
              rows={4}
              placeholder="Ej.: La nota recomienda un tratamiento sin respaldo científico."
              aria-invalid={Boolean(error)}
              aria-describedby={`${fieldId}-motivo-ayuda`}
              className={`w-full px-4 py-2.5 rounded-xl border bg-white focus:ring-2 focus:outline-none text-gray-800 shadow-sm transition-all resize-y ${error ? 'border-red-400 bg-red-50 focus:ring-red-100' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'}`}
            />
            <div id={`${fieldId}-motivo-ayuda`} className="flex justify-between gap-3 mt-1">
              {error
                ? <p role="alert" className="text-xs text-red-600 font-medium">{error}</p>
                : <p className="text-xs text-gray-400">{post.authorName} verá este motivo en el foro.</p>}
              <p className="text-xs text-gray-400 shrink-0">{reason.trim().length} / {REASON_MAX}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-5 py-4 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="w-full sm:w-auto px-5 py-2.5 text-gray-700 font-bold bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition">
            Cancelar
          </button>
          <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg transition">
            <Trash2 className="w-4 h-4" /> Eliminar publicación
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModeratePostModal;
