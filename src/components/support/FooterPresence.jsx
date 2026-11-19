import React, { useCallback, useMemo, useState } from 'react';
import { FooterPresenceContext } from './footer-presence';

// Cuenta cuántos pies completos hay en pantalla (ver footer-presence.js).
const FooterPresenceProvider = ({ children }) => {
  const [count, setCount] = useState(0);
  // `register` es estable: si cambiara con `count`, el efecto del Footer se repetiría sin fin.
  const register = useCallback(() => {
    setCount((c) => c + 1);
    return () => setCount((c) => c - 1);
  }, []);
  const value = useMemo(() => ({ count, register }), [count, register]);
  return <FooterPresenceContext.Provider value={value}>{children}</FooterPresenceContext.Provider>;
};

export default FooterPresenceProvider;
