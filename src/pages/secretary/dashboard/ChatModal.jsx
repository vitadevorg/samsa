import React from 'react';
import { User, XCircle, Send } from 'lucide-react';

// Chat de ejemplo con el profesional (mensajes simulados).
const ChatModal = ({ doctor, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-[500px]">
          <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600"><User className="w-5 h-5"/></div>
                  <div>
                      <h2 className="font-bold">{doctor.name}</h2>
                      <p className="text-xs text-green-400 font-bold flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span> En línea</p>
                  </div>
              </div>
              <button onClick={onClose} className="text-white/70 hover:text-white"><XCircle className="w-6 h-6"/></button>
          </div>
          <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4">
              <div className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest my-4">Hoy</div>
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]">
                  <p className="text-slate-700 text-sm font-medium">Hola, por favor bloqueame la agenda a partir de las 13hs, tuve una urgencia.</p>
                  <span className="text-[10px] text-slate-400 font-bold mt-1 block">08:45 AM</span>
              </div>
              <div className="bg-pink-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] ml-auto">
                  <p className="text-sm font-medium">¡Entendido Doc! Ya cancelo los turnos de la tarde y notifico a los pacientes.</p>
                  <span className="text-[10px] text-pink-200 font-bold mt-1 block text-right">08:47 AM</span>
              </div>
          </div>
          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input type="text" placeholder="Escribe un mensaje..." className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-pink-400" />
              <button className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center shrink-0 hover:bg-slate-900 transition-colors">
                  <Send className="w-4 h-4 ml-1" />
              </button>
          </div>
      </div>
  </div>
);

export default ChatModal;
