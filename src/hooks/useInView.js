import { useEffect, useRef, useState } from 'react';

/**
 * Indica si el elemento referenciado entró en el viewport.
 * - once: deja de observar tras la primera aparición (si es false, vuelve a ocultarse al salir).
 * - minRatio: porcentaje visible mínimo para considerarlo visible.
 * - startDelay: ms a esperar antes de empezar a observar (útil para animaciones encadenadas).
 */
export const useInView = ({
  threshold = 0.1,
  rootMargin = '0px',
  once = true,
  minRatio = 0,
  startDelay = 0,
} = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= minRatio) {
        setIsVisible(true);
        if (once) observer.disconnect();
      } else if (!once) {
        setIsVisible(false);
      }
    }, { threshold, rootMargin });

    const timeout = startDelay > 0
      ? setTimeout(() => observer.observe(node), startDelay)
      : (observer.observe(node), null);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, minRatio, startDelay]);

  return [ref, isVisible];
};
