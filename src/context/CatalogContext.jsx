import React, { useMemo, useState } from 'react';
import { SPECIALTIES, INSURANCES, STUDY_GROUPS } from '../constants/catalog';
import { CatalogContext } from './catalog-context';

// Fecha de la carga inicial del catálogo (datos de ejemplo).
const SEED_UPDATED_AT = '2026-11-10T09:30:00';

// Estado del catálogo del sistema. Lo edita el administrador de SAMSA en Gestión de datos y lo leen
// todas las pantallas (filtros, formularios de alta, reserva de turnos...). Vive en memoria, como el
// resto de los datos de ejemplo.
// - specialties / insurances: listas de nombres.
// - studies: [{ name, group }] (el grupo ordena la lista desplegable: Laboratorio, Imágenes...).
// - updatedAt: última modificación de cada catálogo (ISO).
export const CatalogProvider = ({ children }) => {
  const [specialties, setSpecialties] = useState([...SPECIALTIES, 'Medicina General'].sort((a, b) => a.localeCompare(b, 'es')));
  const [insurances, setInsurances] = useState(INSURANCES);
  const [studies, setStudies] = useState(
    Object.entries(STUDY_GROUPS).flatMap(([group, names]) => names.map((name) => ({ name, group }))),
  );
  const [updatedAt, setUpdatedAt] = useState({ specialties: SEED_UPDATED_AT, insurances: SEED_UPDATED_AT, studies: SEED_UPDATED_AT });

  const touch = (kind) => setUpdatedAt((prev) => ({ ...prev, [kind]: new Date().toISOString() }));
  const sortByName = (a, b) => a.localeCompare(b, 'es');

  // Alta, edición y baja. `item` es un nombre, o { name, group } para los estudios.
  const addItem = (kind, item) => {
    if (kind === 'studies') setStudies((prev) => [...prev, item]);
    else (kind === 'specialties' ? setSpecialties : setInsurances)((prev) => [...prev, item].sort(sortByName));
    touch(kind);
  };
  const updateItem = (kind, oldName, item) => {
    if (kind === 'studies') setStudies((prev) => prev.map((s) => (s.name === oldName ? item : s)));
    else (kind === 'specialties' ? setSpecialties : setInsurances)((prev) => prev.map((n) => (n === oldName ? item : n)).sort(sortByName));
    touch(kind);
  };
  const removeItem = (kind, name) => {
    if (kind === 'studies') setStudies((prev) => prev.filter((s) => s.name !== name));
    else (kind === 'specialties' ? setSpecialties : setInsurances)((prev) => prev.filter((n) => n !== name));
    touch(kind);
  };

  const value = useMemo(() => {
    const studyGroups = {};
    studies.forEach(({ name, group }) => { (studyGroups[group] ??= []).push(name); });
    return {
      specialties,
      insurances,
      insuranceOptions: ['Ninguna', ...insurances], // para formularios donde el paciente puede no tener cobertura
      studies,
      studyGroups,
      studyGroupNames: Object.keys(STUDY_GROUPS),
      updatedAt,
      addItem,
      updateItem,
      removeItem,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialties, insurances, studies, updatedAt]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};
