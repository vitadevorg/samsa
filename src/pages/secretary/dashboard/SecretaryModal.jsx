import React, { useEffect, useRef } from 'react';
import { X, Stethoscope } from 'lucide-react';

// Fondo y contenedor compartido por los modales del panel de secretaría.
// - Se cierra con click en el fondo (afuera del contenido) o con la tecla Escape.
// - Si hay modales apilados, solo se cierra el de arriba.
// - `my-auto` (en lugar de items-center) lo centra sin cortar su parte superior
//   cuando es más alto que la pantalla; en ese caso se puede scrollear completo.
// - `variant="drawer"`: panel lateral a la derecha, de alto completo.
export const SecretaryModalOverlay = ({ onClose, children, variant = 'dialog', zIndex = 'z-50', labelledBy }) => {
  const overlayRef = useRef(null);
  // Solo cierra si el click empezó y terminó en el fondo: arrastrar una selección
  // de texto desde un input hacia afuera no cierra el modal.
  const pressedOnBackdrop = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      const overlays = document.querySelectorAll('[data-secretary-modal]');
      if (overlays[overlays.length - 1] === overlayRef.current) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isDrawer = variant === 'drawer';
  return (
    <div
      ref={overlayRef}
      data-secretary-modal=""
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onMouseDown={(e) => { pressedOnBackdrop.current = e.target === e.currentTarget; }}
      onClick={(e) => {
        if (pressedOnBackdrop.current && e.target === e.currentTarget) onClose();
        pressedOnBackdrop.current = false;
      }}
      className={`fixed inset-0 ${zIndex} flex bg-slate-900/50 backdrop-blur-sm animate-fadeIn ${
        isDrawer ? 'justify-end' : 'justify-center p-4 sm:p-6 overflow-y-auto'
      }`}
    >
      {children}
    </div>
  );
};

// Encabezado claro, con el mismo estilo que las tarjetas de las pantallas principales.
export const SecretaryModalHeader = ({ icon: Icon, title, subtitle, badge, onClose, titleId, tone = 'blue' }) => {
  const toneClass = tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600';
  return (
    <div className="bg-white px-5 py-4 sm:px-8 sm:py-6 flex justify-between items-start gap-4 border-b border-gray-100 shrink-0">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {Icon && (
          <div className={`p-2.5 sm:p-3 rounded-2xl shrink-0 ${toneClass}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
        <div className="min-w-0">
          <h2 id={titleId} className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          {badge}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors shrink-0"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

// Etiqueta chica con el profesional dueño de la agenda. Evita cargar un turno en la
// agenda equivocada cuando la secretaria maneja varios médicos.
export const DoctorTag = ({ doctor }) => {
  if (!doctor) return null;
  return (
    <p className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
      <Stethoscope className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">Agenda de {doctor.name}{doctor.specialty ? ` · ${doctor.specialty}` : ''}</span>
    </p>
  );
};

// Tarjeta del modal: blanca, redondeada y con borde suave (como la reserva de turno).
export const SecretaryModalCard = ({ children, maxWidth = 'max-w-2xl', className = '' }) => (
  <div className={`bg-white rounded-3xl shadow-2xl border border-gray-100 w-full ${maxWidth} my-auto overflow-hidden ${className}`}>
    {children}
  </div>
);
