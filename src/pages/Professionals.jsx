import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Search, Filter, MapPin, Clock, Star, ChevronDown, 
  ChevronUp, ShieldCheck, Calendar, User, Wallet, X, Check,
  ArrowRight, Sun 
} from 'lucide-react';

// Nota: Si este archivo (Professionals.jsx) está dentro de una subcarpeta (ej: pages/doctor/),
// deberás ajustar la ruta a '../../components/ui/Navbar'
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { doctorsData } from '../data/doctors';

// --- UTILIDAD: FadeIn (Para animaciones suaves de entrada) ---
const FadeIn = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const { current } = domRef;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};

// --- DATOS CONSTANTES ---
const SPECIALTIES = [
  "Todas", "Cardiología", "Clínica Médica", "Dermatología", "Diagnóstico", 
  "Endocrinología", "Fonoaudiología", "Ginecología", "Hemoterapia", 
  "Infectología", "Kinesiología", "Neumonología", "Neurología", 
  "Nutrición", "Odontología", "Oftalmología", "Pediatría", 
  "Psicología", "Psiquiatría", "Radiología", "Traumatología", "Urología"
];

const INSURANCES = [
  "Prensa", "Subsidio de Salud", "OSDE", "Swiss Medical", 
  "Galeno", "PAMI", "IOS", "OSECAC"
];

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// --- MOCK DATA DE DOCTORES ---
// Datos movidos a src/data/doctors.js

// --- COMPONENTE CARD INDIVIDUAL ---
const DoctorCard = ({ doctor }) => {
    const hoursString = doctor.hours.map(h => `${h.start}-${h.end}`).join(" / ");
    const isPublic = doctor.attentionType === 'Pública';

    return (
        <div className="bg-white rounded-[1.5rem] border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 group flex flex-col h-full relative overflow-hidden">
            {/* Decoración Hover Lateral */}
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>

            <div className="flex gap-5 items-start mb-4">
                <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm bg-gray-50">
                        <img 
                            src={doctor.img} 
                            alt={doctor.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentNode.classList.add('flex', 'items-center', 'justify-center', 'bg-gray-100', 'text-gray-400');
                                e.target.parentNode.innerHTML = '<span class="text-[10px] font-bold">Sin Foto</span>';
                            }}
                        />
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-2.5 py-1 rounded-full shadow-md border border-gray-100 flex items-center gap-1 text-[11px] font-bold text-gray-700 whitespace-nowrap z-10">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {doctor.rating}
                    </div>
                </div>
                
                <div className="flex-1 min-w-0 pt-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-gray-900 truncate pr-2">{doctor.name}</h3>
                        {isPublic && <ShieldCheck className="w-5 h-5 text-blue-500" title="Médico Staff Público" />}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold mt-1">
                        {doctor.specialty}
                    </span>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {doctor.location}
                    </p>
                </div>
            </div>

            <div className="space-y-3 mt-2 mb-6">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-blue-500 mt-0.5 shrink-0"/> 
                    <span className="leading-tight">{doctor.days.join(", ")}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0"/>
                    <span className="leading-tight">{hoursString}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                    <Wallet className="w-4 h-4 text-blue-500 mt-0.5 shrink-0"/>
                    <span className="leading-tight font-medium">
                        {isPublic ? "Atención Hospitalaria Gratuita" : (doctor.insurance.length > 0 ? doctor.insurance.join(", ") : "Solo Particular")}
                    </span>
                </div>
            </div>

            <div className="mt-auto">
                <Link to={`/professionals/${doctor.id}`} className="block">
                    <button className="w-full py-3 bg-gray-50 text-gray-900 font-bold rounded-xl hover:bg-gray-900 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg text-sm">
                        Ver Disponibilidad <ArrowRight className="w-4 h-4" />
                    </button>
                </Link>
            </div>
        </div>
    );
};

// --- PÁGINA PRINCIPAL: PROFESSIONALS ---
const Professionals = () => {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todas');
  const [selectedInsurance, setSelectedInsurance] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [timeOfDay, setTimeOfDay] = useState('');
  const [attentionType, setAttentionType] = useState('all');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Inicializar filtro desde URL si existe (ej: viene desde "Turnos")
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const specialtyParam = params.get('specialty');
    if (specialtyParam) {
        const exists = SPECIALTIES.some(s => s.toLowerCase() === specialtyParam.toLowerCase());
        if (exists) {
            const exactMatch = SPECIALTIES.find(s => s.toLowerCase() === specialtyParam.toLowerCase());
            setSelectedSpecialty(exactMatch || 'Todas');
        } else if (specialtyParam !== 'Todas') {
             setSearch(specialtyParam);
        }
    }
  }, [location]);

  // Lógica de filtrado
  const filteredDoctors = useMemo(() => {
      return doctorsData.filter(doc => {
          const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                                doc.specialty.toLowerCase().includes(search.toLowerCase());
          
          const matchesSpecialty = selectedSpecialty === 'Todas' || doc.specialty === selectedSpecialty;

          const matchesInsurance = !selectedInsurance || 
                                   (doc.attentionType === 'Particular' && doc.insurance.includes(selectedInsurance));

          const matchesType = attentionType === 'all' || doc.attentionType === attentionType;

          const matchesDays = selectedDays.length === 0 || 
                              selectedDays.some(day => doc.days.includes(day));

          let matchesTime = true;
          if (timeOfDay) {
              const hasMorning = doc.hours.some(h => parseInt(h.start) < 13);
              const hasAfternoon = doc.hours.some(h => parseInt(h.start) >= 12);
              
              if (timeOfDay === 'both') {
                  matchesTime = hasMorning && hasAfternoon;
              } else if (timeOfDay === 'morning') {
                  matchesTime = hasMorning;
              } else if (timeOfDay === 'afternoon') {
                  matchesTime = hasAfternoon;
              }
          }

          return matchesSearch && matchesSpecialty && matchesInsurance && matchesType && matchesDays && matchesTime;
      });
  }, [search, selectedSpecialty, selectedInsurance, attentionType, selectedDays, timeOfDay]);

  // Handlers
  const toggleDay = (day) => {
      setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const toggleTime = (time) => {
      setTimeOfDay(prev => prev === time ? '' : time);
  };

  const clearFilters = () => {
      setSearch('');
      setSelectedSpecialty('Todas');
      setSelectedInsurance('');
      setSelectedDays([]);
      setTimeOfDay('');
      setAttentionType('all');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      
      {/* NAVBAR REAL */}
      <Navbar />

      {/* SEARCH HEADER */}
      <div className="relative z-40 bg-white shadow-sm border-b border-gray-200 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <FadeIn className="flex gap-3">
                  <div className="relative flex-1 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Buscar por nombre, especialidad..." 
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-2xl transition-all outline-none font-medium placeholder-gray-400 text-gray-900 shadow-inner focus:shadow-lg"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                  </div>
                  <button 
                    onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                    className={`lg:hidden px-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold flex items-center gap-2 transition active:scale-95 ${showFiltersMobile ? 'bg-blue-50 border-blue-200 text-blue-600' : ''}`}
                  >
                      <Filter className="w-5 h-5"/>
                  </button>
              </FadeIn>
          </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* --- SIDEBAR FILTERS --- */}
            <aside className={`lg:w-72 shrink-0 space-y-8 bg-white lg:bg-transparent p-6 lg:p-0 rounded-3xl lg:rounded-none shadow-xl lg:shadow-none border border-gray-100 lg:border-none transition-all duration-300 ${showFiltersMobile ? 'block fixed inset-4 z-50 overflow-y-auto lg:static' : 'hidden lg:block'}`}>
                
                {/* Mobile Close */}
                <div className="lg:hidden flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Filtros</h2>
                    <button onClick={() => setShowFiltersMobile(false)} className="p-2 bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <FadeIn delay={100}>
                    <div className="space-y-1">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            Especialidad
                        </h3>
                        <div className="relative">
                            <select 
                                value={selectedSpecialty} 
                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none cursor-pointer hover:border-blue-300 transition-colors shadow-sm text-gray-700"
                            >
                                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </FadeIn>

                <FadeIn delay={150}>
                    <div className="space-y-1">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Tipo de Atención
                        </h3>
                        <div className="bg-white p-1 rounded-xl border border-gray-200 flex shadow-sm">
                            {[
                                { val: 'all', label: 'Todos' },
                                { val: 'Particular', label: 'Particular' },
                                { val: 'Pública', label: 'Pública' }
                            ].map(opt => (
                                <button
                                    key={opt.val}
                                    onClick={() => setAttentionType(opt.val)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                        attentionType === opt.val 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </FadeIn>

                <FadeIn delay={200} className={attentionType === 'Pública' ? 'opacity-40 pointer-events-none grayscale' : ''}>
                    <div className="space-y-1">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Obra Social
                        </h3>
                        <div className="relative">
                            <select 
                                value={selectedInsurance} 
                                onChange={(e) => setSelectedInsurance(e.target.value)}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none cursor-pointer hover:border-blue-300 transition-colors shadow-sm text-gray-700"
                            >
                                <option value="">Todas las coberturas</option>
                                {INSURANCES.map(ins => <option key={ins} value={ins}>{ins}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </FadeIn>

                <FadeIn delay={250}>
                    <div className="space-y-1">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Disponibilidad
                        </h3>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {DAYS.map(day => (
                                <button
                                    key={day}
                                    onClick={() => toggleDay(day)}
                                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                                        selectedDays.includes(day) 
                                        ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105' 
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => toggleTime('morning')}
                                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                                        timeOfDay === 'morning' ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    {timeOfDay === 'morning' ? <Check className="w-3.5 h-3.5"/> : <Sun className="w-3.5 h-3.5"/>} Mañana
                                </button>
                                <button 
                                    onClick={() => toggleTime('afternoon')}
                                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                                        timeOfDay === 'afternoon' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    {timeOfDay === 'afternoon' ? <Check className="w-3.5 h-3.5"/> : <Clock className="w-3.5 h-3.5"/>} Tarde
                                </button>
                            </div>
                            <button 
                                onClick={() => toggleTime('both')}
                                className={`w-full py-2.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                                    timeOfDay === 'both' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {timeOfDay === 'both' ? <Check className="w-3.5 h-3.5"/> : <div className="flex items-center"><Sun className="w-3.5 h-3.5 mr-1"/><Clock className="w-3.5 h-3.5"/></div>} Mañana y Tarde
                            </button>
                        </div>
                    </div>
                </FadeIn>
                
                <FadeIn delay={300}>
                    <button onClick={clearFilters} className="w-full py-3 text-sm text-gray-500 hover:text-red-500 font-bold border border-transparent hover:bg-red-50 hover:border-red-100 rounded-xl transition-all flex items-center justify-center gap-2">
                        <X className="w-4 h-4" /> Limpiar Filtros
                    </button>
                </FadeIn>
            </aside>

            {/* --- RESULTADOS --- */}
            <div className="flex-1 min-w-0">
                <FadeIn>
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900">Profesionales</h2>
                            <p className="text-gray-500 text-sm mt-1">Encontrá el especialista ideal para vos.</p>
                        </div>
                        <span className="hidden sm:inline-block text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                            {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Resultado' : 'Resultados'}
                        </span>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredDoctors.length > 0 ? (
                        filteredDoctors.map((doc, index) => (
                            <FadeIn key={doc.id} delay={index * 100}>
                                <DoctorCard doctor={doc} />
                            </FadeIn>
                        ))
                    ) : (
                        <FadeIn className="col-span-full">
                            <div className="py-24 text-center bg-white rounded-[2rem] border border-dashed border-gray-300">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No encontramos coincidencias</h3>
                                <p className="text-gray-500 max-w-xs mx-auto mb-8">
                                    Intentá cambiando los filtros o buscando por otro término.
                                </p>
                                <button onClick={clearFilters} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                                    Ver todos los profesionales
                                </button>
                            </div>
                        </FadeIn>
                    )}
                </div>
            </div>

        </div>
      </main>
      
      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Professionals;