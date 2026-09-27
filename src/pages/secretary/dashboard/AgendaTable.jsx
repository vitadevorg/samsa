import React from 'react';
import { Calendar, Clock, MapPin, Search, List, Plus, Phone, User, XCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDateToLocale, getToday, isLate } from './dates';

// Vista de lista diaria de un profesional. `appointments` ya viene filtrado por fecha y búsqueda.
const AgendaTable = ({
  doctor, date, appointments, searchTerm, onSearchChange,
  suspendedCount, onOpenSuspended, onNewTurn, onAction, onPatientClick,
}) => {
  const isToday = date === getToday();
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-12">

        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="text-white flex items-center gap-4 w-full lg:w-auto">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                    <Calendar className="w-6 h-6 text-pink-300" />
                </div>
                <div>
                    <h2 className="text-xl font-black tracking-tight">{doctor.name}</h2>
                    <div className="text-slate-400 text-sm font-medium flex items-center gap-3">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {formatDateToLocale(date)}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-pink-400"/> {doctor.location}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">

                <div className="relative flex-grow sm:w-64">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar paciente..." 
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-pink-500/50 outline-none text-sm placeholder-slate-400"
                    />
                </div>

                <button 
                    onClick={onOpenSuspended}
                    className="flex items-center justify-center gap-2 bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-600 transition-colors text-sm"
                >
                    <List className="w-4 h-4" /> Suspenso ({suspendedCount})
                </button>

                <button 
                    onClick={onNewTurn}
                    className="flex items-center justify-center gap-2 bg-pink-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-pink-700 transition-colors shadow-lg shadow-pink-600/30 text-sm shrink-0"
                >
                    <Plus className="w-4 h-4" /> Nuevo Turno
                </button>
            </div>
        </div>

        <div className="p-0 sm:p-6 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="pb-4 pt-4 sm:pt-0 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Horario</th>
                        <th className="pb-4 pt-4 sm:pt-0 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                        <th className="pb-4 pt-4 sm:pt-0 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Origen</th>
                        <th className="pb-4 pt-4 sm:pt-0 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Estado</th>
                        <th className="pb-4 pt-4 sm:pt-0 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map((app) => {
                        const pendingLate = app.status === 'pending' && isToday && isLate(app.time);
                        return (
                        <tr key={app.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors group ${pendingLate ? 'bg-red-50/30 hover:bg-red-50/50' : ''}`}>
                            <td className="py-5 px-4">
                                <div className="flex items-center gap-2 font-mono font-bold text-slate-700">
                                    <Clock className={`w-4 h-4 ${pendingLate ? 'text-red-400' : 'text-slate-400'}`} /> {app.time}
                                </div>
                                {pendingLate && <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Atrasado</span>}
                            </td>
                            <td className="py-5 px-4">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => onPatientClick(app)} className="font-bold text-slate-800 hover:text-blue-600 transition-colors text-left focus:outline-none">
                                        {app.patient}
                                    </button>
                                    {app.phone && (
                                        <a href={`https://wa.me/${app.phone}`} target="_blank" rel="noreferrer" title="Contactar por WhatsApp"
                                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${pendingLate ? 'bg-red-100 text-red-600 animate-pulse hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200 opacity-0 group-hover:opacity-100'}`}
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                            </td>
                            <td className="py-5 px-4 text-sm font-medium text-slate-500">
                                <span className="flex items-center gap-1"><User className="w-3 h-3"/> {app.type || 'Web'}</span>
                            </td>
                            <td className="py-5 px-4"><StatusBadge status={app.status} /></td>
                            <td className="py-5 px-4 text-right space-x-2">
                                {app.status === 'pending' && (
                                    <button onClick={() => onAction('arrive', app)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors">
                                        <MapPin className="w-4 h-4" /> Llegó
                                    </button>
                                )}
                                {(app.status === 'pending' || app.status === 'waiting') && (
                                    <>
                                        <button onClick={() => onAction('reschedule', app)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">
                                            Reprogramar
                                        </button>
                                        <button onClick={() => onAction('cancel', app)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
                                            <XCircle className="w-4 h-4" /> Cancelar
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    )})}
                    {appointments.length === 0 && (
                        <tr>
                            <td colSpan="5" className="py-16 text-center text-slate-500 font-medium">No hay turnos para esta fecha.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default AgendaTable;
