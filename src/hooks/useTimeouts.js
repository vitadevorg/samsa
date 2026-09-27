import { useCallback, useEffect, useRef } from 'react';

/**
 * setTimeout ligado al ciclo de vida del componente: todo lo programado con
 * `schedule` se cancela al desmontar, así no se actualiza estado (ni se navega
 * o imprime) después de que el usuario salió de la página.
 */
export const useTimeouts = () => {
  const idsRef = useRef(new Set());

  useEffect(() => {
    const ids = idsRef.current;
    return () => {
      ids.forEach(clearTimeout);
      ids.clear();
    };
  }, []);

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      idsRef.current.delete(id);
      fn();
    }, ms);
    idsRef.current.add(id);
    return id;
  }, []);

  const clear = useCallback((id) => {
    if (id == null) return;
    clearTimeout(id);
    idsRef.current.delete(id);
  }, []);

  return { schedule, clear };
};
