import React, { useEffect, useId } from 'react';
import { Send } from 'lucide-react';
import { SecretaryModalOverlay, SecretaryModalCard } from './SecretaryModal';

const NotificationModal = ({ title = 'Notificación Enviada', message, autoCloseMs, onClose }) => {
  const titleId = useId();
  useEffect(() => {
    if (!autoCloseMs) return;
    const timeout = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(timeout);
  }, [autoCloseMs, onClose]);

  return (
    <SecretaryModalOverlay onClose={onClose} zIndex="z-[70]" labelledBy={titleId}>
        <SecretaryModalCard maxWidth="max-w-sm" className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
                <Send className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h3 id={titleId} className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">{message}</p>
            <button type="button" onClick={onClose} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">Entendido</button>
        </SecretaryModalCard>
    </SecretaryModalOverlay>
  );
};

export default NotificationModal;
