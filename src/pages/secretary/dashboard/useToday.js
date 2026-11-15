import { useEffect, useState } from 'react';
import { getToday } from './dates';

// Fecha de hoy ("YYYY-MM-DD") que se mantiene al día mientras la pantalla está abierta:
// se vuelve a calcular a medianoche y cuando la pestaña vuelve a estar visible (el
// navegador frena los timers de una pestaña en segundo plano o de una PC suspendida).
// Sin esto, la agenda dejaba marcado como "Hoy" el día en que se abrió la página.
export const useToday = () => {
  const [today, setToday] = useState(getToday);

  useEffect(() => {
    let timerId;
    const refresh = () => setToday(getToday());
    const scheduleMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
      timerId = setTimeout(() => {
        refresh();
        scheduleMidnight();
      }, nextMidnight - now);
    };
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      refresh();
      clearTimeout(timerId);
      scheduleMidnight();
    };
    scheduleMidnight();
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    return () => {
      clearTimeout(timerId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);

  return today;
};
