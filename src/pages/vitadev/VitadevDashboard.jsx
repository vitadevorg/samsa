import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useClinicData } from '../clinic/clinicDataContext';
import { buildUserDirectory } from './userDirectory';
import SynapseCanvas from './SynapseCanvas';
import PageHeader from '../../components/PageHeader';
import FadeIn from '../../components/FadeIn';
import { Shield, Stethoscope, Building2, Hospital, UserX, Ban, Users, ClipboardList } from 'lucide-react';

// Tarjeta con un número del resumen. Si tiene `to`, lleva a la pantalla correspondiente.
const StatCard = ({ label, value, Icon, color, to }) => {
  const content = (
    <div className="h-full bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center justify-center text-center gap-3">
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
  const directory = buildUserDirectory(data);
  const countGroup = (group) => directory.filter((person) => person.group === group).length;
  const doctors = countGroup('doctor');
  const secretaries = countGroup('secretary');
  const patients = countGroup('patient');
  // Se cuentan las personas del directorio (las mismas que lista Gestión de Usuarios al filtrar por estado).
  const countStatus = (emails) => directory.filter((person) => emails.has(person.email.toLowerCase())).length;
  const clinics = institutions.filter((i) => i.areas).length;
  const hospitals = institutions.filter((i) => i.sectors).length;
  // Zona del título: la red de fondo no dibuja nada ahí.
  const titleRef = useRef(null);

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
      <Navbar />
      {/* Decoración de fondo: neuronas pegadas al borde inferior, detrás del contenido */}
      <SynapseCanvas avoidRef={titleRef} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div ref={titleRef} className="inline-block">
          <PageHeader icon={Shield} eyebrow="Administración SAMSA" title="Panel general" />
        </div>
        {/* Primera fila: personas e instituciones. Segunda fila: estado de las cuentas. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
          <FadeIn delay={0} className="h-full"><StatCard label="Médicos" value={doctors} Icon={Stethoscope} color="bg-blue-100 text-blue-600" to="/vitadev/users?tipo=doctor" /></FadeIn>
          <FadeIn delay={80} className="h-full"><StatCard label="Secretarias" value={secretaries} Icon={ClipboardList} color="bg-pink-100 text-pink-600" to="/vitadev/users?tipo=secretary" /></FadeIn>
          <FadeIn delay={160} className="h-full"><StatCard label="Pacientes" value={patients} Icon={Users} color="bg-emerald-100 text-emerald-600" to="/vitadev/users?tipo=patient" /></FadeIn>
          <FadeIn delay={240} className="h-full"><StatCard label="Clínicas" value={clinics} Icon={Building2} color="bg-indigo-100 text-indigo-600" to="/vitadev/clinics" /></FadeIn>
          <FadeIn delay={320} className="h-full"><StatCard label="Hospitales" value={hospitals} Icon={Hospital} color="bg-teal-100 text-teal-600" to="/vitadev/hospitals" /></FadeIn>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5 mt-5">
          <FadeIn delay={400} className="h-full"><StatCard label="Inhabilitados" value={countStatus(disabledEmails)} Icon={Ban} color="bg-amber-100 text-amber-600" to="/vitadev/users?estado=disabled" /></FadeIn>
          <FadeIn delay={480} className="h-full"><StatCard label="Bajas" value={countStatus(deactivatedEmails)} Icon={UserX} color="bg-red-100 text-red-600" to="/vitadev/users?estado=deactivated" /></FadeIn>
        </div>
      </div>
    </div>
  );
};

export default VitadevDashboard;
