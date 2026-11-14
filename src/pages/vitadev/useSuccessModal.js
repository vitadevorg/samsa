import { useState } from 'react';
import { useTimeouts } from '../../hooks/useTimeouts';

// Cuánto tiempo (en milisegundos) queda visible la ventana verde de éxito.
// Si el mensaje incluye una contraseña temporal se deja más tiempo para poder copiarla.
const SUCCESS_DURATION_MS = 2500;
export const PASSWORD_SUCCESS_DURATION_MS = 12000;

// Estado de la ventana verde de éxito (<SuccessModal>): `success` es null (cerrada) o
// { title, message }; `showSuccess` la abre y la cierra sola pasado un tiempo.
export const useSuccessModal = () => {
  const [success, setSuccess] = useState(null);
  const { schedule } = useTimeouts();

  const showSuccess = (title, message, duration = SUCCESS_DURATION_MS) => {
    setSuccess({ title, message });
    schedule(() => setSuccess(null), duration);
  };

  return { success, showSuccess };
};
