import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { secondaryButtonClass } from './hceUi';

// Estados comunes de las pantallas de la HCE: cargando, error y vacío.

export const LoadingState = ({ label = 'Cargando...' }) => (
  <div role="status" className="flex flex-col items-center justify-center py-16 text-gray-500">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" aria-hidden="true" />
    <p className="font-medium">{label}</p>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div role="alert" className="flex flex-col items-center justify-center text-center py-16 px-4">
    <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
      <AlertCircle className="w-7 h-7" aria-hidden="true" />
    </div>
    <p className="font-bold text-gray-900 mb-1">Algo salió mal</p>
    <p className="text-gray-500 text-sm mb-5 max-w-sm">{message}</p>
    {onRetry && <button type="button" onClick={onRetry} className={secondaryButtonClass}>Reintentar</button>}
  </div>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-4">
    <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
      <Icon className="w-7 h-7" aria-hidden="true" />
    </div>
    <p className="font-bold text-gray-900">{title}</p>
    {description && <p className="text-gray-500 text-sm mt-1 max-w-sm">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

// Título de sección dentro de una tarjeta.
export const SectionTitle = ({ icon: Icon, children, action }) => (
  <div className="flex items-center justify-between gap-3 mb-4">
    <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-900">
      {Icon && <Icon className="w-5 h-5 text-blue-600 shrink-0" aria-hidden="true" />}
      {children}
    </h3>
    {action}
  </div>
);
