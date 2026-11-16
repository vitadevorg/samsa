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
    <div className="relative mb-6 sm:mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5 lg:gap-6">
        <div className="w-full lg:w-1/2">
            <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-50 p-2.5 rounded-2xl text-blue-600">
                    <Calendar className="w-5 h-5" />
                </div>
                <span className="font-bold tracking-wider uppercase text-xs text-blue-600">Gestión de Agendas</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                Agenda <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Diaria</span>
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">Turnos del día, llegadas y reprogramaciones de tus profesionales.</p>
        </div>

        <div className="w-full lg:w-auto flex gap-3">
            <div className="relative flex-1 lg:flex-none min-w-0">
                <button
                    onClick={() => setShowDoctorMenu(!showDoctorMenu)}
                    aria-expanded={showDoctorMenu}
                    className="flex items-center gap-3 bg-white border border-gray-200 text-gray-900 font-bold py-3 px-4 sm:px-5 rounded-2xl shadow-sm hover:border-blue-300 transition-colors outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 w-full lg:w-72"
                >
                    <User className="w-5 h-5 text-blue-500 shrink-0" />
                    <span className="flex-1 text-left truncate text-sm sm:text-base">{doctors.find(d => d.id === selectedDoctorId)?.name || 'Seleccionar Profesional'}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${showDoctorMenu ? 'rotate-180' : ''}`} />
                </button>

                {showDoctorMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowDoctorMenu(false)}></div>
                        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                            <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
                                {Object.entries(groupedDoctors).map(([specialty, docs]) => (
                                    <div key={specialty} className="mb-2 last:mb-0">
                                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{specialty}</div>
                                        {docs.map(doc => (
                                            <button
                                                key={doc.id}
                                                onClick={() => { onSelectDoctor(doc.id); setShowDoctorMenu(false); }}
                                                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${selectedDoctorId === doc.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
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

            <div className="bg-white p-1 rounded-2xl border border-gray-200 shadow-sm hidden md:flex items-center">
                <button onClick={() => onViewModeChange('single')} title="Lista Diaria" aria-pressed={viewMode === 'single'} className={`p-2.5 rounded-xl transition-all ${viewMode === 'single' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <List className="w-5 h-5"/>
                </button>
                <button onClick={() => onViewModeChange('columns')} title="Vista en Columnas" aria-pressed={viewMode === 'columns'} className={`p-2.5 rounded-xl transition-all ${viewMode === 'columns' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <LayoutGrid className="w-5 h-5"/>
                </button>
            </div>

            <button
                onClick={onOpenChat}
                title="Chat Profesional"
                aria-label="Chat Profesional"
                className="flex items-center justify-center w-12 shrink-0 bg-white text-gray-600 rounded-2xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
            >
                <MessageSquare className="w-5 h-5" />
            </button>
        </div>
    </div>
  );
};

export default AgendaHeader;
