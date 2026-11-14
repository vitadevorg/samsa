import React from 'react';
import { Calendar, Clock, MapPin, Search, List, Plus, Phone, User, XCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDateToLocale, getToday, isLate } from './dates';

// Acciones disponibles según el estado del turno (las comparten la tabla y las tarjetas mobile).
const AppointmentActions = ({ app, onAction, className = '' }) => (
  <div className={`flex flex-wrap gap-2 ${className}`}>
    {app.status === 'pending' && (
      <button onClick={() => onAction('arrive', app)} className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors">
        <MapPin className="w-4 h-4" /> Llegó
      </button>
    )}
    {(app.status === 'pending' || app.status === 'waiting') && (
      <>
        <button onClick={() => onAction('reschedule', app)} className="inline-flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors">
          <Calendar className="w-4 h-4" /> Reprogramar
        </button>
        <button onClick={() => onAction('cancel', app)} className="inline-flex items-center gap-1 px-3 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">
          <XCircle className="w-4 h-4" /> Cancelar
        </button>
      </>
    )}
  </div>
);

const WhatsAppLink = ({ phone, highlight, alwaysVisible = false }) => (
  <a
    href={`https://wa.me/${phone}`}
    target="_blank"
    rel="noreferrer"
    title="Contactar por WhatsApp"
    aria-label="Contactar por WhatsApp"
    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
      highlight
        ? 'bg-red-50 text-red-600 animate-pulse hover:bg-red-100'
        : `bg-emerald-50 text-emerald-600 hover:bg-emerald-100 ${alwaysVisible ? '' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`
    }`}
  >
    <Phone className="w-3.5 h-3.5" />
  </a>
);

// Vista de lista diaria de un profesional. `appointments` ya viene filtrado por fecha y búsqueda.
// En mobile y tablet se muestra como tarjetas; desde `lg` (desktop) como tabla.
const AgendaTable = ({
  doctor, date, appointments, searchTerm, onSearchChange,
  suspendedCount, onOpenSuspended, onNewTurn, onAction, onPatientClick,
}) => {
  const isToday = date === getToday();
  const isPendingLate = (app) => app.status === 'pending' && isToday && isLate(app.time);
  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-900/[0.04] border border-gray-100 overflow-hidden mb-12">

        <div className="p-4 sm:p-6 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 border-b border-gray-100">
            <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{doctor.name}</h2>
                    <div className="text-gray-500 text-sm flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400"/> {formatDateToLocale(date)}</span>
                        <span className="flex items-center gap-1 min-w-0"><MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0"/> <span className="truncate">{doctor.location}</span></span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-grow sm:w-64 group">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar paciente..."
                        aria-label="Buscar paciente"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-transparent text-gray-900 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm font-medium placeholder-gray-400 transition-all"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onOpenSuspended}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-3 rounded-2xl font-bold hover:bg-gray-50 hover:border-blue-300 transition-all text-sm whitespace-nowrap"
                    >
                        <List className="w-4 h-4 text-blue-500" /> Suspenso ({suspendedCount})
                    </button>

                    <button
                        onClick={onNewTurn}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-500/30 text-sm whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Turno
                    </button>
                </div>
            </div>
        </div>

        {/* Mobile y tablet: tarjetas */}
        <ul className="lg:hidden divide-y divide-gray-100">
            {appointments.map((app) => {
                const pendingLate = isPendingLate(app);
                return (
                    <li key={app.id} className={`p-4 sm:px-6 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4 ${pendingLate ? 'bg-red-50/40' : ''}`}>
                        <div className="flex items-start justify-between gap-3 sm:flex-1 sm:min-w-0">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 font-mono font-bold text-gray-700">
                                    <Clock className={`w-4 h-4 ${pendingLate ? 'text-red-400' : 'text-gray-400'}`} /> {app.time}
                                    {pendingLate && <span className="text-[10px] font-sans font-bold text-red-500 uppercase tracking-wider">Atrasado</span>}
                                </div>
                                <button onClick={() => onPatientClick(app)} className="mt-1 font-bold text-gray-900 hover:text-blue-600 transition-colors text-left break-words">
                                    {app.patient}
                                </button>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><User className="w-3 h-3"/> {app.type || 'Web'}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {app.phone && <WhatsAppLink phone={app.phone} highlight={pendingLate} alwaysVisible />}
                                <StatusBadge status={app.status} />
                            </div>
                        </div>
                        <AppointmentActions app={app} onAction={onAction} className="sm:justify-end sm:shrink-0" />
                    </li>
                );
            })}
            {appointments.length === 0 && (
                <li className="py-14 text-center text-gray-500 font-medium">No hay turnos para esta fecha.</li>
            )}
        </ul>

        {/* Desktop: tabla */}
        <div className="hidden lg:block p-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100">
                        <th className="pb-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Horario</th>
                        <th className="pb-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Paciente</th>
                        <th className="pb-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Origen</th>
                        <th className="pb-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                        <th className="pb-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map((app) => {
                        const pendingLate = isPendingLate(app);
                        return (
                        <tr key={app.id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors group ${pendingLate ? 'bg-red-50/30 hover:bg-red-50/50' : ''}`}>
                            <td className="py-4 px-4">
                                <div className="flex items-center gap-2 font-mono font-bold text-gray-700">
                                    <Clock className={`w-4 h-4 ${pendingLate ? 'text-red-400' : 'text-gray-400'}`} /> {app.time}
                                </div>
                                {pendingLate && <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Atrasado</span>}
                            </td>
                            <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => onPatientClick(app)} className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-left">
                                        {app.patient}
                                    </button>
                                    {app.phone && <WhatsAppLink phone={app.phone} highlight={pendingLate} />}
                                </div>
                            </td>
                            <td className="py-4 px-4 text-sm font-medium text-gray-500">
                                <span className="flex items-center gap-1"><User className="w-3 h-3"/> {app.type || 'Web'}</span>
                            </td>
                            <td className="py-4 px-4"><StatusBadge status={app.status} /></td>
                            <td className="py-4 px-4">
                                <AppointmentActions app={app} onAction={onAction} className="justify-end" />
                            </td>
                        </tr>
                    )})}
                    {appointments.length === 0 && (
                        <tr>
                            <td colSpan="5" className="py-16 text-center text-gray-500 font-medium">No hay turnos para esta fecha.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default AgendaTable;
