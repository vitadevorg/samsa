import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import ParticularDoctorsPanel from './ParticularDoctorsPanel';
import ParticularSecretariesPanel from './ParticularSecretariesPanel';
import { UserRound } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

// Pantalla "Particulares" del administrador de VitaDev: médicos particulares (sin clínica ni hospital)
// y las secretarias que manejan sus agendas. Los médicos de clínicas y hospitales se ven en
// Gestión de Usuarios y en cada institución. Solo datos de identidad, contacto y atención.
const VitadevDoctors = () => {
  // Solo puede haber un formulario abierto: al abrir uno (alta o edición) se cierra el de la otra
  // sección, avisándole con `closeToken` (sin volver a montar el panel).
  const [closeDoctors, setCloseDoctors] = useState(0);
  const [closeSecretaries, setCloseSecretaries] = useState(0);

  return (
  <div className="min-h-screen bg-slate-50 overflow-x-hidden">
    <Navbar />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <PageHeader icon={UserRound} eyebrow="Administración SAMSA" title="Particulares" />
      <ParticularDoctorsPanel closeToken={closeDoctors} onOpen={() => setCloseSecretaries((n) => n + 1)} />
      <ParticularSecretariesPanel closeToken={closeSecretaries} onOpen={() => setCloseDoctors((n) => n + 1)} />
    </div>
  </div>
  );
};

export default VitadevDoctors;
