import React, { useId } from 'react';
import { User, X, Send } from 'lucide-react';
import { SecretaryModalOverlay, SecretaryModalCard } from './SecretaryModal';

// Chat de ejemplo con el profesional (mensajes simulados).
const ChatModal = ({ doctor, onClose }) => {
  const titleId = useId();
  return (
    <SecretaryModalOverlay onClose={onClose} labelledBy={titleId}>
      <SecretaryModalCard maxWidth="max-w-md" className="flex flex-col h-[min(500px,calc(100dvh-2rem))]">
          <div className="bg-white px-5 py-4 flex justify-between items-center border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0"><User className="w-5 h-5"/></div>
                  <div className="min-w-0">
                      <h2 id={titleId} className="font-bold text-gray-900 truncate">{doctor.name}</h2>
                      <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"></span> En línea</p>
                  </div>
              </div>
              <button type="button" onClick={onClose} aria-label="Cerrar" className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors shrink-0"><X className="w-5 h-5"/></button>
          </div>
          <div className="flex-1 bg-gray-50/70 p-4 overflow-y-auto space-y-4">
              <div className="text-center text-xs text-gray-400 font-bold uppercase tracking-wider my-4">Hoy</div>
              <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]">
                  <p className="text-gray-700 text-sm font-medium">Hola, por favor bloqueame la agenda a partir de las 13hs, tuve una urgencia.</p>
                  <span className="text-[10px] text-gray-400 font-bold mt-1 block">08:45 AM</span>
              </div>
              <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none shadow-md shadow-blue-500/20 max-w-[85%] ml-auto">
                  <p className="text-sm font-medium">¡Entendido Doc! Ya cancelo los turnos de la tarde y notifico a los pacientes.</p>
                  <span className="text-[10px] text-blue-100 font-bold mt-1 block text-right">08:47 AM</span>
              </div>
          </div>
          <div className="p-4 bg-white border-t border-gray-100 flex gap-2 shrink-0">
              <input type="text" aria-label="Mensaje" placeholder="Escribe un mensaje..." className="flex-1 min-w-0 bg-gray-100 border border-transparent rounded-full px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
              <button type="button" aria-label="Enviar mensaje" className="w-11 h-11 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/30">
                  <Send className="w-4 h-4 ml-0.5" />
              </button>
          </div>
      </SecretaryModalCard>
    </SecretaryModalOverlay>
  );
};

export default ChatModal;
