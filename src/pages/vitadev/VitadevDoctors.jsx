import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import ParticularDoctorsPanel from './ParticularDoctorsPanel';
import InstitutionDoctorsList from './InstitutionDoctorsList';
import ParticularSecretariesPanel from './ParticularSecretariesPanel';

// Pantalla del administrador de VitaDev: médicos particulares (sin clínica ni hospital)
// y las secretarias que manejan sus agendas. Solo datos de identidad, contacto y atención.
const VitadevDoctors = () => {
  // Solo puede haber un formulario abierto: al abrir uno (alta o edición) se cierra el de la otra
  // sección. Cambiar la `key` de un panel lo vuelve a montar con el formulario cerrado.
  const [doctorsKey, setDoctorsKey] = useState(0);
  const [secretariesKey, setSecretariesKey] = useState(0);

  return (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <div className="max-w-6xl mx-auto px-4 py-10">
      <ParticularDoctorsPanel key={`doctors-${doctorsKey}`} onOpen={() => setSecretariesKey((n) => n + 1)} />
      <ParticularSecretariesPanel key={`secretaries-${secretariesKey}`} onOpen={() => setDoctorsKey((n) => n + 1)} />
      <InstitutionDoctorsList />
    </div>
  </div>
  );
};

export default VitadevDoctors;
