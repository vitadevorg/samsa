import { createContext, useContext } from 'react';

// Catálogo del sistema (especialidades, obras sociales y estudios) que administra Gestión de datos.
// El estado vive en <CatalogProvider> (CatalogContext.jsx); acá solo el contexto y el hook.
export const CatalogContext = createContext(null);

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog debe usarse dentro de <CatalogProvider>');
  return context;
};

// Tipos de catálogo: clave → textos para la interfaz.
export const CATALOG_KINDS = {
  specialties: { label: 'Especialidades', single: 'especialidad', article: 'la especialidad' },
  insurances: { label: 'Obras sociales', single: 'obra social', article: 'la obra social' },
  studies: { label: 'Estudios', single: 'estudio', article: 'el estudio' },
};
