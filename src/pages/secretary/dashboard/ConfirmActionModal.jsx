import React, { useState, useId } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { SecretaryModalOverlay, SecretaryModalCard } from './SecretaryModal';

// Confirmación de 'arrive' (llegó a sala) o 'cancel' (con motivo y opción de pasar a suspenso).
const ConfirmActionModal = ({ action, onConfirm, onClose }) => {
  const fieldId = useId();
  const [reason, setReason] = useState('');
  const [sendToSuspend, setSendToSuspend] = useState(false);
  const isCancel = action === 'cancel';
  return (
    <SecretaryModalOverlay onClose={onClose} zIndex="z-[100]" labelledBy={`${fieldId}-title`}>
        <SecretaryModalCard maxWidth="max-w-sm" className="p-6 sm:p-8 text-center">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6 ${isCancel ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h3 id={`${fieldId}-title`} className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">¿Estás seguro?</h3>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                {isCancel
                    ? 'Estás por cancelar este turno. Esta acción no se puede deshacer.'
                    : 'Marcarás que el paciente ya se encuentra en sala de espera.'}
            </p>

            {isCancel && (
                <div className="space-y-4 mb-6 text-left">
                    <div>
                        <label htmlFor={`${fieldId}-motivo-de-baja`} className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Motivo de Baja *</label>
                        <div className="relative">
                            <select id={`${fieldId}-motivo-de-baja`}
                                required
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium text-gray-700 appearance-none text-sm transition-all"
                            >
                                <option value="" disabled>Seleccione un motivo</option>
                                <option value="Paciente cancela">Paciente cancela</option>
                                <option value="Ausencia médica">Ausencia médica</option>
                                <option value="Error administrativo">Error administrativo</option>
                            </select>
                            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <label className="flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                        <div className="pt-0.5">
                            <input
                                type="checkbox"
                                checked={sendToSuspend}
                                onChange={(e) => setSendToSuspend(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-blue-900 leading-tight">Enviar a Bolsa de Suspenso</p>
                            <p className="text-xs text-blue-700/70 mt-0.5 leading-tight">Ideal para recuperar pacientes.</p>
                        </div>
                    </label>
                </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-3 bg-white text-gray-700 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Volver</button>
                <button
                    type="button"
                    onClick={() => onConfirm({ reason, sendToSuspend })}
                    disabled={isCancel && !reason}
                    className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isCancel ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'}`}
                >
                    Confirmar
                </button>
            </div>
        </SecretaryModalCard>
    </SecretaryModalOverlay>
  );
};

export default ConfirmActionModal;
