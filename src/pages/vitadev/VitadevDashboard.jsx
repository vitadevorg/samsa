import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useClinicData } from '../clinic/clinicDataContext';
import { buildUserDirectory } from './userDirectory';
import SynapseCanvas from './SynapseCanvas';
import { Shield, Stethoscope, Building2, Hospital, UserX, Ban } from 'lucide-react';

// Tarjeta con un número del resumen. Si tiene `to`, lleva a la pantalla correspondiente.
const StatCard = ({ label, value, Icon, color, to }) => {
  const content = (
    <div className="h-full bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center justify-center text-center gap-3">
      <div className={`p-3 rounded-xl ${color}`}><Icon className="w-7 h-7"/></div>
      <div>
        <p className="text-3xl font-black text-gray-900">{value}</p>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to} className="block">{content}</Link> : content;
};

// Resumen del administrador de VitaDev: cantidades generales, sin ningún dato clínico.
const VitadevDashboard = () => {
  const data = useClinicData();
  const { institutions, deactivatedEmails, disabledEmails } = data;
  const doctors = buildUserDirectory(data).filter((person) => person.group === 'doctor').length;
  const clinics = institutions.filter((i) => i.areas).length;
  const hospitals = institutions.filter((i) => i.sectors).length;
  // Zona del título: la red de fondo no dibuja nada ahí.
  const titleRef = useRef(null);

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden">
      <Navbar />
      {/* Decoración de fondo: neuronas pegadas al borde inferior, detrás del contenido */}
      <SynapseCanvas avoidRef={titleRef} />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        <div ref={titleRef} className="inline-block pb-2 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg"><Shield className="text-blue-600 w-8 h-8"/></div>
            Panel de VitaDev
          </h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <StatCard label="Médicos" value={doctors} Icon={Stethoscope} color="bg-blue-100 text-blue-600" to="/vitadev/doctors" />
          <StatCard label="Clínicas" value={clinics} Icon={Building2} color="bg-indigo-100 text-indigo-600" to="/vitadev/clinics" />
          <StatCard label="Hospitales" value={hospitals} Icon={Hospital} color="bg-teal-100 text-teal-600" to="/vitadev/hospitals" />
          <StatCard label="Inhabilitados" value={disabledEmails.size} Icon={Ban} color="bg-amber-100 text-amber-600" to="/vitadev/users" />
          <StatCard label="Bajas" value={deactivatedEmails.size} Icon={UserX} color="bg-red-100 text-red-600" to="/vitadev/users" />
        </div>
      </div>
    </div>
  );
};

export default VitadevDashboard;
