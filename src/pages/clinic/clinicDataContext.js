import { createContext, useContext } from 'react';

// Contexto con los datos de las instituciones (médicos vinculados, secretarias y
// solicitudes). Un "contexto" de React es una forma de compartir datos entre varias
// pantallas sin pasarlos de componente en componente. Lo llena <ClinicDataProvider>,
// que en App.jsx envuelve a toda la aplicación.
export const ClinicDataContext = createContext(null);

// Hook para leer esos datos desde cualquier pantalla (clínica, perfil del médico, etc.).
export const useClinicData = () => {
  const context = useContext(ClinicDataContext);
  if (!context) {
    throw new Error('useClinicData debe usarse dentro de <ClinicDataProvider>');
  }
  return context;
};
