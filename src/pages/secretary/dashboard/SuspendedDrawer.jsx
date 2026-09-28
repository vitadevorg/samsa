import React, { useState } from 'react';
import { Clock, X, CheckCircle, Phone, Calendar, AlertCircle } from 'lucide-react';
import { daysSince } from './dates';

// Panel lateral con la bolsa de suspenso: pacientes a los que hay que dar un nuevo turno.
const SuspendedDrawer = ({ patients, onSchedule, onRemove, onClose }) => {
  const [pendingRemoval, setPendingRemoval] = useState(null);
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white shadow-2xl w-full max-w-md h-full flex flex-col overflow-hidden animate-slideLeft">
              <div className="bg-slate-900 p-8 text-white flex justify-between items-start shrink-0 relative overflow-hidden border-b border-slate-800">
                  <div className="absolute top-0 right-0 opacity-5 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
                      <Clock className="w-48 h-48 text-white" />
                  </div>
                  <div className="relative z-10">
                      <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md mb-4 border border-white/10 shadow-inner">
                          <Clock className="w-6 h-6 text-blue-400" />
                      </div>
                      <h2 className="text-2xl font-black tracking-tight mb-1">Turnos a Reprogramar</h2>
                      <p className="text-sm text-slate-400 font-medium">Gestión de citas pendientes de nueva fecha.</p>
                  </div>
                  <button onClick={onClose} className="relative z-10 text-white/50 hover:text-white bg-white/5 p-2 rounded-full transition-colors hover:bg-white/10 border border-white/5"><X className="w-5 h-5"/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
                  {patients.length === 0 ? (
                      <div className="text-center py-10 opacity-50">
                          <CheckCircle className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                          <p className="font-bold">No hay pacientes en suspenso.</p>
                      </div>
                  ) : (
                      patients.map((sp) => (
                          <div key={sp.id} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-lg ring-1 ring-black/5 hover:shadow-xl transition-all relative overflow-hidden group">
                              <div className="flex justify-between items-start mb-5 relative">
                                  <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-blue-600 rounded-full flex items-center justify-center font-black shadow-sm">
                                          {sp.patient.charAt(0)}
                                      </div>
                                      <div>
                                          <h3 className="font-black text-slate-800 text-lg">{sp.patient}</h3>
                                          <p className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3"/> {sp.phone || 'Sin número'}</p>
                                      </div>
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full shadow-sm shrink-0 flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> Hace {daysSince(sp.suspendDate)} días
                                  </span>
                              </div>

                              <div className="flex gap-3 relative">
                                  <button 
                                      onClick={() => setPendingRemoval(sp)} 
                                      className="flex items-center justify-center w-12 h-12 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all shrink-0 border border-slate-200 hover:border-red-200 shadow-sm"
                                      title="Eliminar de la lista"
                                  >
                                      <X className="w-5 h-5" />
                                  </button>
                                  <button 
                                      onClick={() => onSchedule(sp)}
                                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-black py-3 rounded-2xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
                                  >
                                      <Calendar className="w-4 h-4"/> Agendar Ahora
                                  </button>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>
      {pendingRemoval && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-slate-100 animate-scaleIn">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-100 text-red-500">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">¿Eliminar paciente?</h3>
                <p className="text-slate-500 text-sm mb-6">
                    Estás por quitar a <strong className="text-slate-700">{pendingRemoval.patient}</strong> de la lista de reprogramación. Esta acción es irreversible.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setPendingRemoval(null)}
                        className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => {
                            onRemove(pendingRemoval.id);
                            setPendingRemoval(null);
                        }}
                        className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
                    >
                        Sí, eliminar
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default SuspendedDrawer;
