import React, { useId, useState } from 'react';
import { EditConfirmModal, SuccessModal } from './ClinicModals';
import { useTimeouts } from '../../hooks/useTimeouts';
import { getDocumentStatus, NON_EXPIRING_DOCUMENTS } from '../../data/institutions';
import { todayISO, formatDate } from './clinicDates';
import { validateExpiry, addYearsISO, MAX_EXPIRY_YEARS } from './clinicValidation';
import { FileText, X, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

// Cuánto tiempo (en milisegundos) queda visible la ventana verde de éxito.
const SUCCESS_DURATION_MS = 2500;

// Color e ícono del badge según el estado del documento.
const STATUS_BADGES = {
  vigente: { label: 'Vigente', className: 'bg-green-100 text-green-700 border-green-200', Icon: CheckCircle },
  vencido: { label: 'Vencido', className: 'bg-red-100 text-red-700 border-red-200', Icon: AlertTriangle },
  pendiente: { label: 'Pendiente', className: 'bg-amber-100 text-amber-700 border-amber-200', Icon: Clock },
};

// Panel con la documentación de un médico vinculado. No se suben archivos:
// solo se registra que el documento se recibió y hasta cuándo es válido.
// - `assignment`: la vinculación del médico (con su lista `documents`).
// - `onUpdate(type, expiresAt)`: guarda el documento como recibido.
const ClinicDocumentsModal = ({ doctorName, assignment, onUpdate, onClose }) => {
  const fieldId = useId();
  const today = todayISO();

  // Documento que se está actualizando (null = ninguno) y la fecha elegida.
  const [editingType, setEditingType] = useState(null);
  const [newExpiry, setNewExpiry] = useState('');
  const [error, setError] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [success, setSuccess] = useState(null);
  const { schedule } = useTimeouts();

  const needsExpiry = (type) => !NON_EXPIRING_DOCUMENTS.includes(type);

  const startEditing = (doc) => {
    setEditingType(doc.type);
    setNewExpiry('');
    setError('');
  };

  // "Guardar": validamos la fecha y pedimos confirmación (ventana naranja).
  const handleSave = () => {
    const expiryError = needsExpiry(editingType) ? validateExpiry(newExpiry, today) : '';
    if (expiryError) {
      setError(expiryError);
      return;
    }
    setIsConfirming(true);
  };

  const handleConfirm = () => {
    onUpdate(editingType, needsExpiry(editingType) ? newExpiry : null);
    setIsConfirming(false);
    setEditingType(null);
    setSuccess({ title: '¡Documentación actualizada!', message: `${editingType} registrado como recibido.` });
    schedule(() => setSuccess(null), SUCCESS_DURATION_MS);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-slideUp">
          <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-lg">Documentación</h3>
                <p className="text-blue-100 text-sm">{doctorName}</p>
              </div>
            </div>
            <button onClick={onClose} className="hover:bg-blue-700 p-1.5 rounded-full transition-colors" title="Cerrar">
              <X className="w-5 h-5" />
            </button>
          </div>

          <ul className="divide-y divide-gray-100">
            {assignment.documents.map((doc) => {
              const status = getDocumentStatus(doc, today);
              const { label, className, Icon } = STATUS_BADGES[status];
              const isEditing = editingType === doc.type;
              return (
                <li key={doc.type} className={`p-5 ${isEditing ? 'bg-orange-50' : ''}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900">{doc.type}</p>
                      <p className="text-sm text-gray-500">
                        {!needsExpiry(doc.type)
                          ? 'No vence'
                          : doc.expiresAt
                            ? `${status === 'vencido' ? 'Venció' : 'Vence'} el ${formatDate(doc.expiresAt)}`
                            : 'Sin fecha de vencimiento'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${className}`}>
                        <Icon className="w-3.5 h-3.5" /> {label}
                      </span>
                      {/* Un título vigente no necesita acción: no vence */}
                      {!isEditing && (needsExpiry(doc.type) || status !== 'vigente') && (
                        <button
                          onClick={() => startEditing(doc)}
                          className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                        >
                          {status === 'vigente' ? 'Actualizar vencimiento' : 'Marcar como recibido'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Formulario del documento que se está actualizando */}
                  {isEditing && (
                    <div className="mt-4 flex flex-wrap items-end gap-3">
                      {needsExpiry(doc.type) && (
                        <div>
                          <label htmlFor={`${fieldId}-vence`} className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Nuevo vencimiento</label>
                          <input
                            id={`${fieldId}-vence`}
                            type="date"
                            min={today}
                            max={addYearsISO(today, MAX_EXPIRY_YEARS)}
                            value={newExpiry}
                            onChange={(e) => { setNewExpiry(e.target.value); setError(''); }}
                            className="p-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                          />
                        </div>
                      )}
                      <button onClick={() => setEditingType(null)} className="py-2.5 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-xl transition-colors">
                        Cancelar
                      </button>
                      <button onClick={handleSave} className="py-2.5 px-4 bg-orange-500 text-white hover:bg-orange-600 font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/30">
                        Guardar
                      </button>
                      {error && <p role="alert" className="w-full text-sm text-red-600 font-medium">{error}</p>}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <EditConfirmModal
        isOpen={isConfirming}
        title="¿Registrar documento?"
        message={needsExpiry(editingType)
          ? `${editingType} de ${doctorName} quedará vigente hasta el ${newExpiry ? formatDate(newExpiry) : ''}.`
          : `${editingType} de ${doctorName} quedará registrado como recibido.`}
        confirmLabel="Sí, Registrar"
        onCancel={() => setIsConfirming(false)}
        onConfirm={handleConfirm}
      />
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />
    </>
  );
};

export default ClinicDocumentsModal;
