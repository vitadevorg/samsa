import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Stethoscope, Wind, Sun, Scan, ShieldCheck, Ear, Baby, 
  Droplet, Bug, Activity, Brain, Utensils, Smile, Eye, MessageCircle, 
  BrainCircuit, Image, User, Search, ArrowRight, Filter 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
      className={`transition-all duration-1000 ease-out transform ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};
const Turns = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const specialties = [
    { title: "Cardiología", desc: "Cuidamos tu corazón.", icon: Heart },
    { title: "Clínica Médica", desc: "Chequeos generales.", icon: Stethoscope },
    { title: "Neumonología", desc: "Salud respiratoria.", icon: Wind },
    { title: "Dermatología", desc: "Cuidado de la piel.", icon: Sun },
    { title: "Diagnóstico", desc: "Imágenes precisas.", icon: Scan },
    { title: "Endocrinología", desc: "Control hormonal.", icon: ShieldCheck },
    { title: "Fonoaudiología", desc: "Lenguaje y audición.", icon: Ear },
    { title: "Ginecología", desc: "Salud femenina.", icon: Baby },
    { title: "Hemoterapia", desc: "Salud sanguínea.", icon: Droplet },
    { title: "Infectología", desc: "Enf. infecciosas.", icon: Bug },
    { title: "Kinesiología", desc: "Rehabilitación.", icon: Activity },
    { title: "Neurología", desc: "Sistema nervioso.", icon: Brain },
    { title: "Nutrición", desc: "Alimentación.", icon: Utensils },
    { title: "Odontología", desc: "Salud bucal.", icon: Smile },
    { title: "Oftalmología", desc: "Salud visual.", icon: Eye },
    { title: "Pediatría", desc: "Salud infantil.", icon: Baby },
    { title: "Psicología", desc: "Bienestar mental.", icon: MessageCircle },
    { title: "Psiquiatría", desc: "Salud mental.", icon: BrainCircuit },
    { title: "Radiología", desc: "Imágenes.", icon: Image },
    { title: "Urología", desc: "Sistema urinario.", icon: User },
  ];
  const filteredSpecialties = specialties.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="font-sans text-slate-800 bg-white selection:bg-blue-100 selection:text-blue-900 min-h-screen">
      <Navbar />
      <div className="relative pt-32 pb-12 lg:pt-40 lg:pb-20 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 border border-blue-200 mb-8 mx-auto">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-blue-800 font-medium text-xs tracking-wide uppercase">Turnos Online</span>
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              Encuentra a tu <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                especialista ideal.
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
              Seleccioná la especialidad médica para acceder a la agenda de nuestros profesionales en tiempo real.
            </p>
          </FadeIn>
          <FadeIn delay={300} className="max-w-xl mx-auto mt-12 relative z-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-200 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative bg-white rounded-full shadow-lg shadow-blue-900/5 border border-gray-100 flex items-center p-2 transition-transform duration-300 focus-within:scale-[1.02]">
                <div className="pl-4 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  placeholder="¿Qué especialidad buscas hoy?" 
                  className="w-full px-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 placeholder-gray-400 font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="hidden sm:flex items-center justify-center w-10 h-10 bg-gray-900 rounded-full text-white hover:bg-blue-600 transition-colors duration-300">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-32">
        {filteredSpecialties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {filteredSpecialties.map((item, index) => (
              <FadeIn key={index} delay={Math.min(index * 50, 600)} className="h-full">
                <Link 
                  to={`/professionals?specialty=${encodeURIComponent(item.title)}`} 
                  className="group block h-full"
                >
                  <div className="relative bg-white h-full p-8 rounded-[2rem] border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/10 hover:border-blue-100 hover:-translate-y-1">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-500 ease-out">
                      <item.icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                      {item.desc}
                    </p>
                    <div className="absolute bottom-8 right-8 w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all duration-300">
                      <ArrowRight className="w-4 h-4 transform group-hover:-rotate-45 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn>
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No encontramos esa especialidad</h3>
              <p className="text-gray-500 mt-2">Intenta buscar con otro término o revisa la ortografía.</p>
              <button 
                onClick={() => setSearchTerm("")}
                className="mt-6 text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                Ver todas las especialidades
              </button>
            </div>
          </FadeIn>
        )}
      </div>
      <Footer />
    </div>
  );
};
export default Turns;