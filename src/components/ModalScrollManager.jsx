import { useEffect } from 'react';

// Comportamiento común de TODAS las ventanas flotantes (modales) de la app, sin tocar cada una:
//  1. Mientras haya un modal abierto, el fondo no se desplaza (ni con la rueda ni con el teclado).
//  2. Las flechas, RePág/AvPág, Inicio/Fin y Espacio mueven el contenido del modal en lugar del
//     fondo, aunque el foco siga en la página de atrás (por ejemplo, después de hacer click en un botón).
//
// Un modal es cualquier capa `fixed inset-0` con desenfoque de fondo (`backdrop-blur`), que es el
// patrón que usan todos los modales del proyecto. Las capas transparentes que solo cierran un menú
// al hacer click afuera no tienen desenfoque, así que no cuentan.
const MODAL_SELECTOR = '[class*="fixed"][class*="inset-0"][class*="backdrop-blur"]';

const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);
const EDITABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="slider"]';

// Modales abiertos (los que no son clickeables a través, como los de impresión, quedan afuera).
const getOpenModals = () =>
  Array.from(document.querySelectorAll(MODAL_SELECTOR)).filter((el) => !el.className.includes('pointer-events-none'));

// Elemento con scroll vertical dentro del modal: el propio overlay o su contenido (el más externo).
const findScroller = (modal) => {
  const candidates = [modal, ...modal.querySelectorAll('*')];
  return candidates.find((el) => {
    if (el.scrollHeight <= el.clientHeight + 1) return false;
    const { overflowY } = getComputedStyle(el);
    return overflowY === 'auto' || overflowY === 'scroll';
  });
};

const ModalScrollManager = () => {
  useEffect(() => {
    let locked = false;
    let frame = 0;

    const sync = () => {
      frame = 0;
      const shouldLock = getOpenModals().length > 0;
      if (shouldLock === locked) return;
      locked = shouldLock;
      if (shouldLock) {
        // Se compensa el ancho de la barra de scroll para que la página no "salte" al bloquearse.
        const scrollbar = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
      } else {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    schedule();

    const handleKeyDown = (event) => {
      if (!SCROLL_KEYS.has(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
      const modals = getOpenModals();
      if (modals.length === 0) return;
      const top = modals[modals.length - 1];
      // Si el foco ya está dentro del modal, el navegador mueve su contenido por sí solo.
      if (top.contains(event.target)) return;
      if (event.target instanceof Element && event.target.matches(EDITABLE)) return;
      const scroller = findScroller(top);
      event.preventDefault();
      if (!scroller) return;
      const page = scroller.clientHeight * 0.9;
      const step = {
        ArrowUp: -48, ArrowDown: 48,
        PageUp: -page, PageDown: page,
        ' ': event.shiftKey ? -page : page,
      }[event.key];
      if (event.key === 'Home') scroller.scrollTo({ top: 0 });
      else if (event.key === 'End') scroller.scrollTo({ top: scroller.scrollHeight });
      else scroller.scrollBy({ top: step });
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, []);

  return null;
};

export default ModalScrollManager;
