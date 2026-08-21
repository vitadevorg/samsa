import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Calendar, Activity, Users, ArrowRight, Star, MapPin, CheckCircle, Smartphone, Building, TrendingUp, Clock, FileText, HeartPulse, UserCheck, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfessionalApplicationModal from './ProfessionalApplicationModal';

// --- HOOK DE REVELADO AL SCROLL ---
const useScrollReveal = (threshold = 0.1) => {
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
    }, { threshold, rootMargin: "0px 0px -50px 0px" });

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [threshold]);

  return [domRef, isVisible];
};

const Reveal = ({ children, delay = 0, className = "" }) => {
  const [ref, isVisible] = useScrollReveal();
  const transitionStyle = {
    transition: `all 1s cubic-bezier(0.215, 0.610, 0.355, 1.000) ${delay}ms`,
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)'
  };

  return (
    <div ref={ref} style={transitionStyle} className={className}>
      {children}
    </div>
  );
};

const AnimatedStepsFlow = () => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const currentRef = domRef.current;
        if (!currentRef) return;

        // Utilizamos un observer con un margen superior e inferior muy estricto
        // para asegurar que solo dispare cuando esté en el medio de la pantalla.
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );
        
        // Pequeño delay inicial para evitar disparos en falso durante el render inicial
        const timeout = setTimeout(() => {
            observer.observe(currentRef);
        }, 800);

        return () => {
            clearTimeout(timeout);
            observer.disconnect();
        };
    }, []);

    return (
        <div ref={domRef} className="grid grid-cols-1 md:grid-cols-4 gap-8 relative mt-16 min-h-[200px]">
            {/* Línea conectora de pasos y Progreso (solo desktop) */}
            <div className="hidden md:block absolute top-6 left-[12%] right-[12%] h-1 bg-slate-800 -z-10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ 
                    width: '100%', 
                    transformOrigin: 'left', 
                    animation: isVisible ? 'expand-x 3.6s linear forwards 200ms' : 'none',
                    transform: isVisible ? 'none' : 'scaleX(0)'
                }}></div>
            </div>
            
            {[
                { step: "01", title: "Enviá tu Solicitud", desc: "Completá tus datos y nuestro equipo evaluará tu perfil." },
                { step: "02", title: "Definí Horarios", desc: "Indicá tu disponibilidad y modalidad de atención." },
                { step: "03", title: "Recibí Pacientes", desc: "Aparecé en el mercado y recibí solicitudes de turnos." },
                { step: "04", title: "Optimizá tu Día", desc: "Administrá tu agenda desde nuestra plataforma." }
            ].map((item, idx) => (
                <div key={idx} className="text-center relative opacity-0" style={{ animation: isVisible ? `fade-in-up-delay 0.6s forwards ${200 + (idx * 1200)}ms` : 'none' }}>
                    <div className="relative w-12 h-12 rounded-full border-2 bg-slate-900 mx-auto mb-6 flex items-center justify-center overflow-hidden" style={{ animation: isVisible ? `step-border 0.6s forwards ${400 + (idx * 1200)}ms` : 'none', borderColor: '#334155' }}>
                        {/* Efecto de líquido llenándose */}
                        <div className="absolute bottom-0 left-0 w-full bg-blue-500 h-0" style={{ animation: isVisible ? `fill-up 0.8s ease-out forwards ${400 + (idx * 1200)}ms` : 'none' }}></div>
                        <span className="relative z-10 font-black text-slate-500" style={{ animation: isVisible ? `step-text 0.4s forwards ${800 + (idx * 1200)}ms` : 'none' }}>{item.step}</span>
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2">{item.title}</h4>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
            ))}
        </div>
    );
};

const AnimatedChartTrigger = ({ children, threshold = 0.5 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const currentRef = domRef.current;
        if (!currentRef) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && entry.intersectionRatio >= (threshold * 0.8)) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );
        const timeout = setTimeout(() => observer.observe(currentRef), 500);
        return () => {
            clearTimeout(timeout);
            observer.disconnect();
        };
    }, [threshold]);

    return (
        <div ref={domRef} className={isVisible ? "chart-visible" : "chart-hidden"}>
            {children(isVisible)}
        </div>
    );
};

const AnimatedNumber = ({ end, duration = 1500, isVisible, suffix = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isVisible) {
            setCount(0);
            return;
        }

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // easeOutCubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeProgress * end));
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        
        window.requestAnimationFrame(step);
    }, [end, duration, isVisible]);

    return <span>{count}{suffix}</span>;
};

const ProfessionalB2BSection = () => {
    const [showApplicationModal, setShowApplicationModal] = useState(false);

    return (
        <section className="relative bg-slate-950 overflow-hidden pt-24 pb-32 font-sans border-t border-slate-900">
            {/* BACKGROUND DECORATIONS */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[150px]"></div>
                {/* Grid pattern sutil */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* 1. HERO B2B */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <Reveal>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-blue-400 text-xs font-bold tracking-widest uppercase mb-6 shadow-xl">
                            <Building className="w-4 h-4" /> Para Profesionales de la Salud
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
                            Llevá tu práctica profesional al <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">siguiente nivel.</span>
                        </h2>
                    </Reveal>
                    <Reveal delay={200}>
                        <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                            Unite a la red médica más innovadora. Conectá con pacientes, centralizá tus agendas y reducí la carga administrativa en un ecosistema diseñado para potenciar tu tiempo.
                        </p>
                    </Reveal>
                </div>

                {/* 2. MOCKUP & PROPOSICIÓN DE VALOR */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-28">
                    
                    {/* Visual Mockup (Show, Don't Tell) */}
                    <Reveal delay={300} className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-[2.5rem] blur-2xl transform -rotate-3 scale-105"></div>
                        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[2rem] shadow-2xl hover:-translate-y-2 transition-transform duration-500">
                            
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex gap-5">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-700/50 shadow-inner">
                                        <img src="https://i.pravatar.cc/150?img=47" alt="Dra. Elena Villarroel" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white mb-1">Dra. Elena Villarroel</h3>
                                        <p className="text-blue-400 font-semibold mb-2">Cardiología Clínica</p>
                                        <div className="flex items-center gap-1 bg-slate-800 w-fit px-2 py-1 rounded-lg">
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                            <span className="text-white text-xs font-bold">4.9</span>
                                            <span className="text-slate-400 text-xs">(120 reseñas)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="space-y-4 mb-8 bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                                <div className="flex items-center gap-3 text-slate-300">
                                    <MapPin className="w-5 h-5 text-slate-500" />
                                    <span className="font-medium">Consultorios SAMSA Norte</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300">
                                    <Calendar className="w-5 h-5 text-slate-500" />
                                    <span className="font-medium">Próximo turno: <span className="text-white font-bold">Mañana, 10:30hs</span></span>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2 group">
                                Reservar Turno <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        
                        {/* Widget: Nuevo Turno */}
                        <div className="absolute -bottom-6 -right-6 bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-xl animate-float z-10" style={{ animationDuration: '7s' }}>
                            <div className="flex items-center gap-3">
                                <div className="bg-green-500/20 p-2 rounded-full">
                                    <Activity className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Nuevo turno reservado</p>
                                    <p className="text-slate-400 text-xs">Hace 2 minutos</p>
                                </div>
                            </div>
                        </div>

                        {/* Widget: Ahorro de tiempo */}
                        <div className="absolute -top-10 -left-6 bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-xl animate-float z-10" style={{ animationDuration: '9s', animationDelay: '1s' }}>
                            <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                        <path className="text-blue-500" strokeDasharray="40, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">40%</div>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Ahorro de Tiempo</p>
                                    <p className="text-slate-400 text-xs">En carga administrativa</p>
                                </div>
                            </div>
                        </div>

                        {/* Widget: Crecimiento */}
                        <div className="absolute top-1/2 -right-12 transform -translate-y-1/2 bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-xl animate-float z-10 hidden sm:block" style={{ animationDuration: '8s', animationDelay: '2s' }}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-blue-500/20 p-1.5 rounded-lg">
                                    <TrendingUp className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-white font-bold text-sm">Nuevos Pacientes</span>
                            </div>
                            <svg className="w-32 h-12" viewBox="0 0 100 30" preserveAspectRatio="none">
                                <path d="M0,30 L10,25 L20,28 L30,20 L40,22 L50,15 L60,18 L70,10 L80,12 L100,5 L100,30 Z" fill="rgba(59,130,246,0.1)" />
                                <path d="M0,30 L10,25 L20,28 L30,20 L40,22 L50,15 L60,18 L70,10 L80,12 L100,5" fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            </svg>
                            <p className="text-emerald-400 text-xs font-bold mt-1 text-right">+24% este mes</p>
                        </div>
                    </Reveal>

                    {/* Tarjetas de Propuesta de Valor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { icon: <Users />, title: "Mayor Visibilidad", desc: "Tu perfil disponible para miles de pacientes buscando tu especialidad." },
                            { icon: <Calendar />, title: "Agenda Inteligente", desc: "Recordatorios automáticos, sin sobreturnos accidentales." },
                            { icon: <Smartphone />, title: "Gestión Integral", desc: "Historias clínicas, métricas y comunicaciones en un solo lugar." },
                            { icon: <CheckCircle />, title: "Menos Burocracia", desc: "Nosotros ordenamos la demanda, vos te enfocás en la salud." }
                        ].map((item, idx) => (
                            <Reveal key={idx} delay={400 + (idx * 100)}>
                                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl hover:bg-slate-800 transition-colors h-full">
                                    <div className="bg-blue-500/10 w-fit p-3 rounded-xl text-blue-400 mb-4 border border-blue-500/20">
                                        {item.icon}
                                    </div>
                                    <h4 className="text-white font-bold text-lg mb-2">{item.title}</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>

                {/* 3. MÉTRICAS CONCEPTUALES */}
                <Reveal delay={200}>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 border-y border-slate-800 py-10 mb-28 bg-slate-900/30">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-black text-white mb-2">+ Múltiples</div>
                            <div className="text-slate-400 font-semibold tracking-wide uppercase text-xs">Especialidades Médicas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-black text-white mb-2">Activos</div>
                            <div className="text-slate-400 font-semibold tracking-wide uppercase text-xs">Pacientes buscando atención</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-black text-white mb-2">100%</div>
                            <div className="text-slate-400 font-semibold tracking-wide uppercase text-xs">Gestión Digital Integrada</div>
                        </div>
                    </div>
                </Reveal>

                {/* 4. ONBOARDING (CÓMO FUNCIONA) */}
                <div className="mb-28">
                    <Reveal>
                        <h3 className="text-2xl md:text-3xl font-black text-white text-center mb-16">Unirte es muy sencillo</h3>
                    </Reveal>
                    
                    <AnimatedStepsFlow />
                    
                    <style>{`
                        @keyframes fill-up {
                            0% { height: 0%; }
                            100% { height: 100%; }
                        }
                        @keyframes step-border {
                            to { border-color: #3b82f6; box-shadow: 0 0 15px rgba(59,130,246,0.6); }
                        }
                        @keyframes step-text {
                            to { color: #ffffff; }
                        }
                        @keyframes fade-in-up-delay {
                            0% { opacity: 0; transform: translateY(20px); }
                            100% { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                </div>

                {/* NUEVA SECCIÓN: ECOSISTEMA DETALLADO APILADO */}
                <div className="mb-28 mt-20">
                    <Reveal>
                        <div className="text-center mb-20">
                            <h3 className="text-3xl md:text-5xl font-black text-white mb-6">Un ecosistema que beneficia a todos</h3>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Cuando la tecnología conecta cada parte del proceso médico, todos ganan tiempo, comodidad y calidad de vida.</p>
                        </div>
                    </Reveal>

                    <div className="space-y-24">
                        
                        {/* 1. Especialistas */}
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <Reveal className="w-full md:w-1/2">
                                <div className="bg-blue-500/20 text-blue-400 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                                    <UserCheck className="w-8 h-8" />
                                </div>
                                <h4 className="text-3xl font-black text-white mb-4">Especialistas Médicos</h4>
                                <p className="text-slate-400 text-lg leading-relaxed mb-6">
                                    Gestión de agenda 100% autónoma. Conectá con nuevos pacientes de manera directa, aumentando tu visibilidad sin depender de derivaciones, y reducí a casi cero el ausentismo gracias a nuestros recordatorios inteligentes.
                                </p>
                            </Reveal>
                            <Reveal className="w-full md:w-1/2" delay={200}>
                                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex items-center justify-center h-72">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                                    <div className="text-center relative z-10">
                                        <AnimatedChartTrigger threshold={0.5}>
                                            {(isVisible) => (
                                                <div className="relative w-40 h-40 mx-auto flex items-center justify-center mb-4">
                                                    <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 36 36">
                                                        <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                        <path className="text-blue-500 transition-all duration-[1500ms] ease-out" style={{ strokeDasharray: isVisible ? "98, 100" : "0, 100" }} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                    </svg>
                                                    <div className="text-3xl font-black text-white"><AnimatedNumber end={98} isVisible={isVisible} suffix="%" /></div>
                                                </div>
                                            )}
                                        </AnimatedChartTrigger>
                                        <div className="text-blue-400 font-bold uppercase tracking-wider text-sm">Asistencia de Pacientes</div>
                                    </div>
                                </div>
                            </Reveal>
                        </div>

                        {/* 2. Pacientes */}
                        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                            <Reveal className="w-full md:w-1/2">
                                <div className="bg-emerald-500/20 text-emerald-400 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                                    <HeartPulse className="w-8 h-8" />
                                </div>
                                <h4 className="text-3xl font-black text-white mb-4">Pacientes</h4>
                                <p className="text-slate-400 text-lg leading-relaxed mb-6">
                                    Reservas 24/7 sin esperas al teléfono ni horarios limitados. Historial médico unificado y recordatorios automáticos al celular. Encontrar al profesional ideal y gestionar la salud familiar nunca fue tan rápido.
                                </p>
                            </Reveal>
                            <Reveal className="w-full md:w-1/2" delay={200}>
                                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden h-72 flex flex-col justify-center">
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                                    <h5 className="text-white font-bold mb-6 text-center">Tiempo promedio para reservar</h5>
                                    <AnimatedChartTrigger threshold={0.5}>
                                        {(isVisible) => (
                                            <div className="space-y-6">
                                                <div className="relative">
                                                    <div className="flex justify-between text-slate-400 text-sm font-bold mb-2"><span>Por Teléfono</span> <span><AnimatedNumber end={4} isVisible={isVisible} suffix=" min" /></span></div>
                                                    <div className="w-full bg-slate-800 rounded-full h-3"><div className="bg-red-500/80 h-3 rounded-full transition-all duration-[1500ms] ease-out" style={{ width: isVisible ? '90%' : '0%' }}></div></div>
                                                </div>
                                                <div className="relative">
                                                    <div className="flex justify-between text-emerald-400 text-sm font-bold mb-2"><span>Con App SAMSA</span> <span><AnimatedNumber end={30} duration={1000} isVisible={isVisible} suffix=" seg" /></span></div>
                                                    <div className="w-full bg-slate-800 rounded-full h-3"><div className="bg-emerald-500 h-3 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out delay-[500ms]" style={{ width: isVisible ? '15%' : '0%' }}></div></div>
                                                </div>
                                            </div>
                                        )}
                                    </AnimatedChartTrigger>
                                </div>
                            </Reveal>
                        </div>

                        {/* 3. Secretarias */}
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <Reveal className="w-full md:w-1/2">
                                <div className="bg-amber-500/20 text-amber-400 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                                    <Clock className="w-8 h-8" />
                                </div>
                                <h4 className="text-3xl font-black text-white mb-4">Personal Administrativo</h4>
                                <p className="text-slate-400 text-lg leading-relaxed mb-6">
                                    Adiós al papel y a las agendas desordenadas. El sistema unifica absolutamente todo en un solo lugar. Reducción drástica del volumen de llamadas y confirmaciones manuales, liberando tiempo para una atención presencial de calidad.
                                </p>
                            </Reveal>
                            <Reveal className="w-full md:w-1/2" delay={200}>
                                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden h-72 flex flex-col justify-center">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
                                    <h5 className="text-white font-bold mb-8 text-center">Origen de los turnos</h5>
                                    
                                    <AnimatedChartTrigger threshold={0.5}>
                                        {(isVisible) => (
                                            <div className="flex items-end justify-center gap-16 h-32 border-b border-slate-700 pb-2 px-8">
                                                <div className="flex flex-col items-center gap-2 group w-1/3">
                                                    <span className="text-amber-400 font-black text-xl"><AnimatedNumber end={85} isVisible={isVisible} suffix="%" /></span>
                                                    <div className="w-full bg-amber-500 rounded-t-lg shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-[1500ms] ease-out" style={{ height: isVisible ? '6rem' : '0' }}></div>
                                                    <span className="text-slate-400 text-xs font-bold uppercase">Online / App</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-2 w-1/3">
                                                    <span className="text-slate-400 font-bold text-sm"><AnimatedNumber end={15} isVisible={isVisible} suffix="%" /></span>
                                                    <div className="w-full bg-slate-700 rounded-t-lg transition-all duration-[1500ms] ease-out delay-300" style={{ height: isVisible ? '1.5rem' : '0' }}></div>
                                                    <span className="text-slate-400 text-xs font-bold uppercase">Recepción</span>
                                                </div>
                                            </div>
                                        )}
                                    </AnimatedChartTrigger>
                                </div>
                            </Reveal>
                        </div>

                        {/* 4. Directores Médicos */}
                        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                            <Reveal className="w-full md:w-1/2">
                                <div className="bg-purple-500/20 text-purple-400 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                                    <Building className="w-8 h-8" />
                                </div>
                                <h4 className="text-3xl font-black text-white mb-4">Directores de Clínicas</h4>
                                <p className="text-slate-400 text-lg leading-relaxed mb-6">
                                    Control total de las métricas de la institución. Reportes de desempeño, facturación centralizada y optimización del uso de consultorios físicos. Evitá los espacios vacíos y maximizá la rentabilidad de la clínica.
                                </p>
                            </Reveal>
                            <Reveal className="w-full md:w-1/2" delay={200}>
                                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden h-72 flex flex-col justify-center">
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h5 className="text-white font-bold">Ocupación de Consultorios</h5>
                                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-lg border border-purple-500/30">ÓPTIMA: 92%</span>
                                    </div>
                                    
                                    {/* Heatmap Simulado */}
                                    <div className="grid grid-cols-5 gap-2">
                                        <div className="col-span-5 flex justify-between text-xs text-slate-500 font-bold mb-1 px-1"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span></div>
                                        {/* Fila Mañana */}
                                        <div className="aspect-square bg-purple-500/90 rounded-md"></div>
                                        <div className="aspect-square bg-purple-500/70 rounded-md"></div>
                                        <div className="aspect-square bg-purple-500 rounded-md"></div>
                                        <div className="aspect-square bg-purple-500/80 rounded-md"></div>
                                        <div className="aspect-square bg-purple-500/90 rounded-md"></div>
                                        
                                        {/* Fila Tarde */}
                                        <div className="aspect-square bg-purple-500 rounded-md shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                                        <div className="aspect-square bg-purple-500/80 rounded-md"></div>
                                        <div className="aspect-square bg-slate-800 rounded-md relative flex items-center justify-center"><span className="text-[10px] text-slate-500">Mantenimiento</span></div>
                                        <div className="aspect-square bg-purple-500/90 rounded-md"></div>
                                        <div className="aspect-square bg-purple-500 rounded-md"></div>
                                    </div>
                                </div>
                            </Reveal>
                        </div>

                    </div>
                </div>

                {/* 5. CTA DE CIERRE */}
                <Reveal delay={300}>
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                        
                        <h3 className="text-3xl md:text-4xl font-black text-white mb-4 relative z-10">
                            Tu consultorio, tus reglas.<br />
                            <span className="text-blue-400">Nosotros ponemos la tecnología.</span>
                        </h3>
                        <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                            Sumate a SAMSA y llevá tu práctica profesional a una nueva forma de gestionar pacientes, sin fricciones.
                        </p>
                        
                        <button onClick={() => setShowApplicationModal(true)} className="px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-black text-lg transition-all shadow-lg hover:shadow-white/20 hover:-translate-y-1 group flex items-center gap-2 mx-auto relative z-10">
                            Enviar Solicitud de Adhesión <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </Reveal>

            </div>

            <ProfessionalApplicationModal isOpen={showApplicationModal} onClose={() => setShowApplicationModal(false)} />
        </section>
    );
};

export default ProfessionalB2BSection;
