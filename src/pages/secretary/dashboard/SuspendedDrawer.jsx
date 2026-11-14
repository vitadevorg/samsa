import React, { useId, useState } from 'react';
import { Clock, X, CheckCircle, Phone, Calendar, AlertCircle } from 'lucide-react';
import { SecretaryModalOverlay, SecretaryModalCard, SecretaryModalHeader } from './SecretaryModal';
import { daysSince } from './dates';

// Panel lateral con la bolsa de suspenso: pacientes a los que hay que dar un nuevo turno.
const SuspendedDrawer = ({ patients, onSchedule, onRemove, onClose }) => {
  const titleId = useId();
  const [pendingRemoval, setPendingRemoval] = useState(null);
  return (
    <>
      <SecretaryModalOverlay onClose={onClose} variant="drawer" labelledBy={titleId}>
          <div className="bg-white shadow-2xl w-full max-w-md h-full flex flex-col overflow-hidden animate-slideLeft">
              <SecretaryModalHeader
                  icon={Clock}
                  title="Turnos a Reprogramar"
                  subtitle="Gestión de citas pendientes de nueva fecha."
                  onClose={onClose}
                  titleId={titleId}
              />

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/70 space-y-4">
                  {patients.length === 0 ? (
                      <div className="text-center py-10">
                          <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                          <p className="font-bold text-gray-500">No hay pacientes en suspenso.</p>
                      </div>
                  ) : (
                      patients.map((sp) => (
                          <div key={sp.id} className="bg-white border border-gray-100 p-4 sm:p-5 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-200 transition-all">
                              <div className="flex justify-between items-start gap-3 mb-5">
                                  <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold shrink-0">
                                          {sp.patient.charAt(0)}
                                      </div>
                                      <div className="min-w-0">
                                          <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">{sp.patient}</h3>
                                          <p className="text-xs font-bold text-gray-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3"/> {sp.phone || 'Sin número'}</p>
                                      </div>
                                  </div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 whitespace-nowrap">
                                      <Clock className="w-3 h-3" /> Hace {daysSince(sp.suspendDate)} días
                                  </span>
                              </div>

                              <div className="flex gap-3">
                                  <button
                                      type="button"
                                      onClick={() => setPendingRemoval(sp)}
                                      className="flex items-center justify-center w-12 h-12 bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all shrink-0 border border-gray-200 hover:border-red-200"
                                      title="Eliminar de la lista"
                                      aria-label={`Eliminar a ${sp.patient} de la lista`}
                                  >
                                      <X className="w-5 h-5" />
                                  </button>
                                  <button
                                      type="button"
                                      onClick={() => onSchedule(sp)}
                                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-bold py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                                  >
                                      <Calendar className="w-4 h-4"/> Agendar Ahora
                                  </button>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </SecretaryModalOverlay>
      {pendingRemoval && (
        <SecretaryModalOverlay onClose={() => setPendingRemoval(null)} zIndex="z-[150]" labelledBy={`${titleId}-remove`}>
            <SecretaryModalCard maxWidth="max-w-sm" className="p-6 sm:p-8 text-center animate-scaleIn">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6 bg-red-50 text-red-500">
                    <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h3 id={`${titleId}-remove`} className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">¿Eliminar paciente?</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    Estás por quitar a <strong className="text-gray-700">{pendingRemoval.patient}</strong> de la lista de reprogramación. Esta acción es irreversible.
                </p>
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={() => setPendingRemoval(null)}
                        className="flex-1 py-3 bg-white text-gray-700 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onRemove(pendingRemoval.id);
                            setPendingRemoval(null);
                        }}
                        className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                    >
                        Sí, eliminar
                    </button>
                </div>
            </SecretaryModalCard>
        </SecretaryModalOverlay>
      )}
    </>
  );
};

export default SuspendedDrawer;
