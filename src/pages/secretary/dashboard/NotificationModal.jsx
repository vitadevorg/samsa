import React, { useEffect } from 'react';
import { Send } from 'lucide-react';

const NotificationModal = ({ title = 'Notificación Enviada', message, autoCloseMs, onClose }) => {
  useEffect(() => {
    if (!autoCloseMs) return;
    const timeout = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(timeout);
  }, [autoCloseMs, onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">{title}</h3>
            <p className="text-slate-500 font-medium mb-8">{message}</p>
            <button onClick={onClose} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-colors">Entendido</button>
        </div>
    </div>
  );
};

export default NotificationModal;
