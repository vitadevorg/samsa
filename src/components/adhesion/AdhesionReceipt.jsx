import React from 'react';
import { createPortal } from 'react-dom';
import SamsaLogo from '../SamsaLogo';

// Comprobante de recepción para imprimir. Se monta en <body> y solo se ve al imprimir
// (el resto de la app se oculta con la clase `hide-root-for-print`).
const AdhesionReceipt = ({ receiptNumber, subject, rows }) => createPortal(
  <div className="hidden print:block bg-white text-black p-10 min-h-screen font-serif absolute top-0 left-0 w-full">
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-end border-b-2 border-slate-900 pb-6 mb-12">
        <div className="flex items-center gap-4">
          <SamsaLogo className="h-12 w-auto shrink-0" />
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-1">SAMSA<span className="text-blue-600">.</span></h1>
            <p className="text-slate-500 uppercase tracking-widest text-xs font-bold font-sans">Sistema de Adhesión</p>
          </div>
        </div>
        <div className="text-right font-sans">
          <p className="text-slate-400 uppercase text-xs font-bold tracking-wider mb-1">Comprobante N°</p>
          <p className="font-mono font-bold text-2xl text-slate-800">{receiptNumber}</p>
          <p className="text-sm text-slate-500 mt-1">{new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="mb-16 px-4">
        <h2 className="text-3xl font-bold mb-8 text-slate-900 border-l-4 border-blue-600 pl-4">Certificado de Recepción de Solicitud</h2>
        <p className="text-slate-700 leading-loose mb-10 text-lg">
          Por medio del presente documento se certifica que {subject} completó el envío de la <strong>Solicitud de Adhesión</strong> a la red de salud SAMSA.
        </p>

        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 font-sans shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-4">Detalle del solicitante</h3>
          <div className="grid grid-cols-2 gap-y-8 gap-x-12">
            {rows.map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="font-medium text-lg text-slate-800 break-words">{value || 'No provisto'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-10 mt-16 flex justify-between items-end px-4">
        <div className="text-slate-500 text-sm w-2/3 font-sans">
          <p className="mb-3 leading-relaxed"><strong>Aviso:</strong> Este documento es un comprobante de recepción e inicio de trámite. No constituye una aprobación automática ni una habilitación. La solicitud será evaluada por el equipo de Admisiones de SAMSA en un plazo de 48 a 72 horas hábiles.</p>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} SAMSA, Tucumán, Argentina. Documento generado automáticamente.</p>
        </div>
        <div className="w-64 text-center">
          <div className="border-b border-slate-400 pb-2 mb-2">
            <span className="font-serif text-3xl italic text-slate-300">SAMSA Admisiones</span>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest font-sans">Sello de Recepción</p>
        </div>
      </div>
    </div>
  </div>,
  document.body,
);

export default AdhesionReceipt;
