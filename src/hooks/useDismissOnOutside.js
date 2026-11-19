import { useEffect } from 'react';

// Cierra un menú desplegable al hacer click afuera de `ref` o al apretar Escape. Solo escucha mientras `open` es true.
// Se escucha el documento y no una capa `fixed inset-0`: el desenfoque del Navbar limitaría la capa al alto de la barra.
export const useDismissOnOutside = (ref, open, onClose) => {
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, open, onClose]);
};
