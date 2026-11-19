import React, { useContext } from 'react';
import { LifeBuoy } from 'lucide-react';
import { useSupport, useCanReportSupport } from '../../context/support-context';
import { FooterPresenceContext } from './footer-presence';

// Barra fina "Contactar soporte" al final de las pantallas sin pie completo.
// El admin SAMSA no la ve: él recibe los tickets en su módulo de Soporte.
const SupportBar = () => {
  const canReport = useCanReportSupport();
  const { openSupport } = useSupport();
  const { count } = useContext(FooterPresenceContext);
  if (!canReport || count > 0) return null;

  return (
    <div className="print:hidden border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <p className="text-slate-500 text-center sm:text-left">¿Encontraste un error o tenés un problema con el sistema?</p>
        <button
          type="button"
          onClick={() => openSupport()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
        >
          <LifeBuoy className="w-4 h-4" /> Contactar soporte
        </button>
      </div>
    </div>
  );
};

export default SupportBar;
