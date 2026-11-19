import { createContext, useContext, useLayoutEffect } from 'react';

// Las pantallas con el pie completo (Footer) ya incluyen el contacto con soporte. Las demás
// (administración, perfiles, etc.) muestran la barra fina <SupportBar />. Para saber cuál toca,
// el Footer se registra acá mientras está en pantalla (ver FooterPresence.jsx).
export const FooterPresenceContext = createContext({ register: () => () => {}, count: 0 });

// El Footer llama a esto para avisar que está en pantalla.
export const useRegisterFooter = () => {
  const { register } = useContext(FooterPresenceContext);
  useLayoutEffect(() => register(), [register]);
};
