import React, { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

// Botón de acción solo con ícono. La descripción aparece en un globo al pasar el mouse o al
// enfocarlo con el teclado, y también es su nombre accesible (aria-label) para lectores de pantalla.
// El globo se muestra desde lg (pantallas con mouse). Se dibuja en el body con posición fija, así no lo
// recorta una tabla con scroll ni queda debajo de otra tarjeta, y hay uno solo a la vez: aparece con el
// mouse encima o con foco de teclado (no queda visible después de un click). Se acomoda para no salirse
// de la pantalla. En mobile y tablet (táctiles) no se dibuja: el aria-label ya lo anuncia.
const TONES = {
  blue: 'hover:text-blue-600 hover:bg-blue-50 focus-visible:text-blue-600 focus-visible:bg-blue-50',
  orange: 'hover:text-orange-600 hover:bg-orange-50 focus-visible:text-orange-600 focus-visible:bg-orange-50',
  amber: 'hover:text-amber-600 hover:bg-amber-50 focus-visible:text-amber-600 focus-visible:bg-amber-50',
  green: 'hover:text-green-600 hover:bg-green-50 focus-visible:text-green-600 focus-visible:bg-green-50',
  red: 'hover:text-red-600 hover:bg-red-50 focus-visible:text-red-600 focus-visible:bg-red-50',
};

// `badge`: número opcional que se muestra en rojo sobre el ícono (por ejemplo, documentos pendientes).
// `warning`: sin badge rojo, muestra un aviso ámbar "!" (por ejemplo, documentos por vencer).
const IconAction = ({ icon: Icon, label, tone = 'blue', onClick, disabled = false, badge = 0, warning = false }) => {
  const id = useId();
  const [tip, setTip] = useState(null); // { x, y } del centro superior del botón

  const show = (target) => {
    if (!window.matchMedia('(min-width: 1024px)').matches) return;
    const box = target.getBoundingClientRect();
    setTip({ x: box.left + box.width / 2, y: box.top });
    // Avisa a los demás botones para que oculten su globo: nunca hay dos a la vez.
    window.dispatchEvent(new CustomEvent('iconaction:show', { detail: id }));
  };
  const hide = () => setTip(null);

  // Al hacer scroll el botón se mueve: el globo se oculta para no quedar flotando en otro lugar.
  useEffect(() => {
    if (!tip) return undefined;
    const onOtherShown = (e) => { if (e.detail !== id) hide(); };
    window.addEventListener('scroll', hide, true);
    window.addEventListener('iconaction:show', onOtherShown);
    return () => {
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('iconaction:show', onOtherShown);
    };
  }, [tip, id]);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => { hide(); if (!disabled) onClick?.(e); }}
        aria-disabled={disabled || undefined}
        aria-label={label}
        onMouseEnter={(e) => show(e.currentTarget)}
        onMouseLeave={hide}
        onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) show(e.currentTarget); }}
        onBlur={hide}
        className={`w-10 h-10 inline-flex items-center justify-center rounded-lg text-gray-500 transition outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${disabled ? 'opacity-40 cursor-not-allowed' : TONES[tone]}`}
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
      {tip && createPortal(
        <span
          role="tooltip"
          style={{ top: tip.y - 8, left: Math.min(Math.max(tip.x, 140), window.innerWidth - 140) }}
          className="pointer-events-none fixed z-[70] -translate-x-1/2 -translate-y-full max-w-[260px] w-max rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white text-center shadow-lg animate-fadeIn"
        >
          {label}
        </span>,
        document.body,
      )}
    </span>
  );
};

export default IconAction;
