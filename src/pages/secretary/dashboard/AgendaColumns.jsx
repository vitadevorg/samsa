import React from 'react';
import { Calendar, Clock, Plus, User, XCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { filterAgenda } from './agenda';
import { getToday, isLate } from './dates';

// Vista en columnas: una agenda por profesional para la fecha elegida.
const AgendaColumns = ({ doctors, appointmentsByDoctor, date, searchTerm, onNewTurn, onAction, onPatientClick }) => {
  const isToday = date === getToday();
  return (
    <div className="flex overflow-x-auto custom-scrollbar pb-6 gap-6 items-start snap-x mb-12">
        {doctors.map(doctor => {
            const docAppointments = filterAgenda(appointmentsByDoctor[doctor.id], date, searchTerm);

            return (
                <div key={doctor.id} className="min-w-[320px] max-w-[350px] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden snap-start flex-1 shrink-0 flex flex-col h-[600px]">
                    <div className="bg-slate-900 p-5 text-white flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-blue-300" />
                        </div>
                        <div>
                            <h3 className="font-black text-sm">{doctor.name}</h3>
                            <p className="text-xs text-slate-400 font-medium mb-1">{doctor.specialty}</p>
                            <p className="text-[10px] bg-white/10 inline-block px-2 py-0.5 rounded-full text-white/80 border border-white/5">{doctor.location}</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 custom-scrollbar">
                        {docAppointments.map(app => {
                            const pendingLate = app.status === 'pending' && isToday && isLate(app.time);
                            return (
                            <div key={app.id} className={`bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group ${pendingLate ? 'border-red-200' : 'border-slate-100 hover:border-blue-200'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-mono font-black text-slate-700 flex items-center gap-1 text-sm">
                                        <Clock className={`w-3 h-3 ${pendingLate ? 'text-red-400' : 'text-slate-400'}`} /> {app.time}
                                    </div>
                                    <StatusBadge status={app.status} />
                                </div>
                                <button onClick={() => onPatientClick(app)} className="font-bold text-slate-800 text-sm mb-1 hover:text-blue-600 transition-colors text-left w-full focus:outline-none">
                                    {app.patient}
                                </button>
                                <div className="flex justify-between items-end mt-3 pt-3 border-t border-slate-50">
                                    <span className="text-xs text-slate-400 font-medium">{app.type}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onAction('reschedule', doctor.id, app)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Calendar className="w-3.5 h-3.5"/></button>
                                        <button onClick={() => onAction('cancel', doctor.id, app)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><XCircle className="w-3.5 h-3.5"/></button>
                                    </div>
                                </div>
                            </div>
                        )})}
                        {docAppointments.length === 0 && (
                            <div className="text-center py-10 text-slate-400 text-sm font-medium bg-white rounded-2xl border border-slate-100 border-dashed">
                                Agenda vacía
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-white border-t border-slate-100">
                        <button onClick={() => onNewTurn(doctor.id)} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1">
                            <Plus className="w-3.5 h-3.5"/> Asignar Turno
                        </button>
                    </div>
                </div>
            );
        })}
    </div>
  );
};

export default AgendaColumns;
