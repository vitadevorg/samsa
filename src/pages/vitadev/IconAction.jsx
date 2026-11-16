import React from 'react';

// Botón de acción solo con ícono. La descripción aparece en un globo al pasar el mouse o al
// enfocarlo con el teclado, y también es su nombre accesible (aria-label) para lectores de pantalla.
// El globo se muestra desde lg (pantallas con mouse) y se alinea al borde derecho del botón. En mobile y
// tablet (táctiles, sin hover) no se dibuja: las descripciones largas no entran y el aria-label ya las anuncia.
const TONES = {
  blue: 'hover:text-blue-600 hover:bg-blue-50 focus-visible:text-blue-600 focus-visible:bg-blue-50',
  orange: 'hover:text-orange-600 hover:bg-orange-50 focus-visible:text-orange-600 focus-visible:bg-orange-50',
  amber: 'hover:text-amber-600 hover:bg-amber-50 focus-visible:text-amber-600 focus-visible:bg-amber-50',
  green: 'hover:text-green-600 hover:bg-green-50 focus-visible:text-green-600 focus-visible:bg-green-50',
  red: 'hover:text-red-600 hover:bg-red-50 focus-visible:text-red-600 focus-visible:bg-red-50',
};

// `badge`: número opcional que se muestra en rojo sobre el ícono (por ejemplo, documentos pendientes).
// `warning`: sin badge rojo, muestra un aviso ámbar "!" (por ejemplo, documentos por vencer).
const IconAction = ({ icon: Icon, label, tone = 'blue', onClick, disabled = false, badge = 0, warning = false }) => (
  <span className="relative group/action inline-flex">
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`w-10 h-10 inline-flex items-center justify-center rounded-lg text-gray-500 transition outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500 ${disabled ? '' : TONES[tone]}`}
    >
      <Icon className="w-5 h-5" />
      {badge > 0 && (
        <span aria-hidden="true" className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
      {badge === 0 && warning && (
        <span aria-hidden="true" className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center">!</span>
      )}
    </button>
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full right-0 mb-2 z-20 hidden lg:block whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg opacity-0 translate-y-1 transition group-hover/action:opacity-100 group-hover/action:translate-y-0 group-focus-within/action:opacity-100 group-focus-within/action:translate-y-0"
    >
      {label}
    </span>
  </span>
);

export default IconAction;
