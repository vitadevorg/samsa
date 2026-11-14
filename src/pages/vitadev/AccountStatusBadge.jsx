import React from 'react';
import { useClinicData } from '../clinic/clinicDataContext';

// Etiqueta junto al nombre de una cuenta dada de baja o inhabilitada (no muestra nada si está activa).
const AccountStatusBadge = ({ email }) => {
  const { deactivatedEmails, disabledEmails } = useClinicData();
  const key = email.toLowerCase();
  if (deactivatedEmails.has(key)) {
    return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-200">Baja</span>;
  }
  if (disabledEmails.has(key)) {
    return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200">Inhabilitado</span>;
  }
  return null;
};

export default AccountStatusBadge;
