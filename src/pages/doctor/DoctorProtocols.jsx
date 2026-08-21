import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { BookOpen, ShieldAlert, FileText, Download, Search, AlertCircle } from 'lucide-react';

const protocolsData = [
  {
    id: 1,
    title: 'Protocolo de Urgencias Cardiovasculares',
    category: 'Emergencias',
    date: '10/08/2026',
    description: 'Guía actualizada para el manejo de IAM, arritmias severas y emergencias hipertensivas en guardia.',
    icon: ShieldAlert,
    color: 'text-red-500',
    bg: 'bg-red-50'
  },
  {
    id: 2,
    title: 'Manejo de Enfermedades Infecciosas (COVID/Dengue)',
    category: 'Infectología',
    date: '05/08/2026',
    description: 'Criterios de aislamiento, notificación obligatoria y esquemas de tratamiento sintomático.',
    icon: AlertCircle,
    color: 'text-orange-500',
    bg: 'bg-orange-50'
  },
  {
    id: 3,
    title: 'Guía de Prescripción de Psicotrópicos',
    category: 'Administrativo',
    date: '20/07/2026',
    description: 'Requisitos para recetas archivadas, formularios oficiales y validación de coberturas.',
    icon: FileText,
    color: 'text-blue-500',
    bg: 'bg-blue-50'
  },
  {
    id: 4,
    title: 'Atención Inicial al Paciente Pediátrico Traumatizado',
    category: 'Emergencias',
    date: '15/06/2026',
    description: 'Algoritmo ABCDE adaptado a pediatría, inmovilización y criterios de derivación.',
    icon: ShieldAlert,
    color: 'text-red-500',
    bg: 'bg-red-50'
  },
  {
    id: 5,
    title: 'Manual de Uso del Sistema S.A.M.S.A',
    category: 'Tecnología',
    date: '01/01/2026',
    description: 'Instrucciones detalladas sobre carga de Historias Clínicas, firma digital y turnos.',
    icon: BookOpen,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50'
  },
];

const DoctorProtocols = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProtocols = protocolsData.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            
            <div className="relative z-10 w-full md:w-auto text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 text-blue-600 mb-3">
                    <div className="bg-blue-100 p-2 rounded-xl">
                        <BookOpen className="w-5 h-5 text-blue-700" />
                    </div>
                    <span className="font-black tracking-widest uppercase text-xs text-blue-700/80">Biblioteca Médica</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Protocolos y Guías</h1>
                <p className="text-slate-500 mt-2 font-medium">Documentación oficial y guías de práctica clínica de S.A.M.S.A.</p>
            </div>

            <div className="relative w-full md:w-96 z-10 mt-4 md:mt-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                    type="text"
                    placeholder="Buscar protocolos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                />
            </div>
        </div>

        {/* Lista de Protocolos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProtocols.map(protocol => (
            <div key={protocol.id} className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
              
              <div className="flex justify-between items-start mb-5 relative z-10">
                <div className={`p-3.5 rounded-2xl ${protocol.bg} shadow-sm group-hover:shadow-md transition-shadow`}>
                  <protocol.icon className={`w-6 h-6 ${protocol.color}`} />
                </div>
                <span className="text-[10px] font-black text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                  {protocol.category}
                </span>
              </div>
              
              <h3 className="text-xl font-black text-slate-800 mb-3 leading-tight group-hover:text-blue-600 transition-colors relative z-10">
                {protocol.title}
              </h3>
              
              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow font-medium relative z-10">
                {protocol.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-100 relative z-10">
                <span className="text-xs font-bold text-slate-400 font-mono tracking-wide">Actualizado: {protocol.date}</span>
                <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors group/btn">
                  <Download className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProtocols.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-slate-100 shadow-inner">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">No se encontraron resultados</h3>
            <p className="text-slate-500 font-medium">Intentá con otros términos de búsqueda.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DoctorProtocols;
