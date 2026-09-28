import React, { useState } from 'react';
import { Calendar, User, ChevronDown, List, LayoutGrid, MessageSquare } from 'lucide-react';

const groupBySpecialty = (doctors) =>
  doctors.reduce((acc, doc) => {
    (acc[doc.specialty] ||= []).push(doc);
    return acc;
  }, {});

const AgendaHeader = ({ doctors, selectedDoctorId, onSelectDoctor, viewMode, onViewModeChange, onOpenChat }) => {
  const [showDoctorMenu, setShowDoctorMenu] = useState(false);
  const groupedDoctors = groupBySpecialty(doctors);
  return (
    <div className="relative rounded-3xl bg-slate-900 p-8 text-white shadow-xl mb-8 border border-slate-800">
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                <Calendar className="w-64 h-64 text-slate-100" />
            </div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="w-full md:w-1/2">
                <div className="flex items-center gap-3 text-slate-300 mb-2">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-black tracking-widest uppercase text-xs">Gestión de Agendas</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white">Agenda Diaria</h1>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                <div className="relative">
                    <button 
                        onClick={() => setShowDoctorMenu(!showDoctorMenu)}
                        className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold py-3 px-5 rounded-xl shadow-inner hover:bg-white/20 transition-colors outline-none w-full sm:w-72"
                    >
                        <User className="w-5 h-5 text-blue-400" />
                        <span className="flex-1 text-left truncate">{doctors.find(d => d.id === selectedDoctorId)?.name || 'Seleccionar Profesional'}</span>
                        <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${showDoctorMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showDoctorMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowDoctorMenu(false)}></div>
                            <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fadeIn">
                                <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
                                    {Object.entries(groupedDoctors).map(([specialty, docs]) => (
                                        <div key={specialty} className="mb-2 last:mb-0">
                                            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{specialty}</div>
                                            {docs.map(doc => (
                                                <button 
                                                    key={doc.id}
                                                    onClick={() => { onSelectDoctor(doc.id); setShowDoctorMenu(false); }}
                                                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${selectedDoctorId === doc.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${selectedDoctorId === doc.id ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                                    {doc.name}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex bg-white/5 rounded-xl p-1 backdrop-blur-md border border-white/10 hidden md:flex items-center">
                    <button onClick={() => onViewModeChange('single')} title="Lista Diaria" className={`p-2.5 rounded-lg transition-all ${viewMode === 'single' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/50 hover:text-white'}`}>
                        <List className="w-5 h-5"/>
                    </button>
                    <button onClick={() => onViewModeChange('columns')} title="Vista en Columnas" className={`p-2.5 rounded-lg transition-all ${viewMode === 'columns' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/50 hover:text-white'}`}>
                        <LayoutGrid className="w-5 h-5"/>
                    </button>
                </div>

                <button 
                    onClick={onOpenChat}
                    title="Chat Profesional"
                    className="flex items-center justify-center p-3 bg-white/10 text-white rounded-xl hover:bg-white hover:text-slate-900 transition-all shadow-sm border border-white/10"
                >
                    <MessageSquare className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
  );
};

export default AgendaHeader;
