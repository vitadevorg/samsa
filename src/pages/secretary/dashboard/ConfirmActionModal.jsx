import React, { useState, useId } from 'react';
import { AlertCircle } from 'lucide-react';

// Confirmación de 'arrive' (llegó a sala) o 'cancel' (con motivo y opción de pasar a suspenso).
const ConfirmActionModal = ({ action, onConfirm, onClose }) => {
  const fieldId = useId();
  const [reason, setReason] = useState('');
  const [sendToSuspend, setSendToSuspend] = useState(false);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-slate-100">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${action === 'cancel' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}>
                <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">¿Estás seguro?</h3>
            <p className="text-slate-500 text-sm mb-5 text-center">
                {action === 'cancel' 
                    ? 'Estás por cancelar este turno. Esta acción no se puede deshacer.' 
                    : 'Marcarás que el paciente ya se encuentra en sala de espera.'}
            </p>

            {action === 'cancel' && (
                <div className="space-y-4 mb-6 text-left">
                    <div>
                        <label htmlFor={`${fieldId}-motivo-de-baja`} className="block text-xs font-bold text-slate-500 mb-1.5">Motivo de Baja *</label>
                        <select id={`${fieldId}-motivo-de-baja`} 
                            required
                            value={reason} 
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/50 outline-none font-semibold text-slate-700 appearance-none text-sm"
                        >
                            <option value="" disabled>Seleccione un motivo</option>
                            <option value="Paciente cancela">Paciente cancela</option>
                            <option value="Ausencia médica">Ausencia médica</option>
                            <option value="Error administrativo">Error administrativo</option>
                        </select>
                    </div>

                    <label className="flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                        <div className="pt-0.5">
                            <input 
                                type="checkbox" 
                                checked={sendToSuspend}
                                onChange={(e) => setSendToSuspend(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-blue-900 leading-tight">Enviar a Bolsa de Suspenso</p>
                            <p className="text-xs text-blue-700/70 mt-0.5 leading-tight">Ideal para recuperar pacientes.</p>
                        </div>
                    </label>
                </div>
            )}

            <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 bg-white text-slate-600 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Volver</button>
                <button 
                    onClick={() => onConfirm({ reason, sendToSuspend })} 
                    disabled={action === 'cancel' && !reason}
                    className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all ${action === 'cancel' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 shadow-green-500/30'}`}
                >
                    Confirmar
                </button>
            </div>
        </div>
    </div>
  );
};

export default ConfirmActionModal;
