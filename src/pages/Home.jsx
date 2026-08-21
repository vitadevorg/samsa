import React, { useEffect, useRef, useState } from 'react';
import { Heart, Stethoscope, Activity, User, ShieldCheck, Search, Phone, Calendar, ArrowRight, CheckCircle, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProfessionalB2BSection from '../components/ProfessionalB2BSection';
const homeStyles = `
  html {
    scroll-behavior: smooth;
  }
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
    100% { transform: translateY(0px); }
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  @keyframes gradient-xy {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient-xy 15s ease infinite;
  }
  @keyframes elegantReveal {
    0% { opacity: 0; transform: translateY(30px) scale(0.9); filter: blur(12px); }
    100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
  }
  .animate-elegant-reveal {
    animation: elegantReveal 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes heartbeatIntro {
    0% { transform: scale(0.8); opacity: 0; filter: blur(10px); }
    50% { transform: scale(1.05); filter: drop-shadow(0px 10px 30px rgba(37, 99, 235, 0.4)); opacity: 1; filter: blur(0px); }
    100% { transform: scale(1); filter: drop-shadow(0px 8px 24px rgba(37, 99, 235, 0.25)); opacity: 1; filter: blur(0px); }
  }
  .animate-heartbeat-intro {
    animation: heartbeatIntro 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes expand-x {
    0% { transform: scaleX(0); }
    100% { transform: scaleX(1); }
  }
  .animate-expand-x {
    animation: expand-x 2s ease-out forwards;
  }
`;
const useScrollReveal = (delay = 0) => {
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
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);
  return [domRef, isVisible];
};
const Reveal = ({ children, delay = 0, className = "" }) => {
  const [ref, isVisible] = useScrollReveal();
  const transitionStyle = {
    transition: `all 1s cubic-bezier(0.215, 0.610, 0.355, 1.000) ${delay}ms`,
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.98)'
  };
  return (
    <div ref={ref} style={transitionStyle} className={className}>
      {children}
    </div>
  );
};
const IntroOverlay = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 2800); 
    const t2 = setTimeout(() => onComplete(), 3600); 
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);
  return (
    <div className={`fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${stage >= 1 ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}`}>
      <div className="absolute w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] bg-blue-300/10 rounded-full blur-[60px] lg:blur-[100px] opacity-0 animate-elegant-reveal" style={{ animationDelay: '200ms', animationDuration: '3s' }}></div>
      <div className="relative flex flex-col items-center justify-center">
        <div className="relative">
          <HeartPulse strokeWidth={1.2} className="w-24 h-24 lg:w-32 lg:h-32 text-blue-700 mb-8 opacity-0 animate-heartbeat-intro" style={{ animationDelay: '200ms' }} />
        </div>
        <h1 className="text-4xl lg:text-6xl tracking-[0.3em] lg:tracking-[0.4em] font-serif font-medium text-slate-800 ml-[0.3em] lg:ml-[0.4em]">
          {"SAMSA".split('').map((letter, i) => (
            <span key={i} className="inline-block opacity-0 animate-elegant-reveal" style={{ animationDelay: `${i * 100 + 700}ms` }}>
              {letter}
            </span>
          ))}
        </h1>
        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent my-6 opacity-0 animate-elegant-reveal" style={{ animationDelay: '1300ms' }}></div>
        <p className="text-sm lg:text-base tracking-[0.2em] lg:tracking-[0.3em] font-medium text-slate-600 uppercase opacity-0 animate-elegant-reveal" style={{ animationDelay: '1600ms' }}>
          Sistema de Salud Integral
        </p>
      </div>
    </div>
  );
};
const Home = () => {
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('samsa_intro_played');
  });
  const handleIntroComplete = () => {
    sessionStorage.setItem('samsa_intro_played', 'true');
    setShowIntro(false);
  };
  const services = [
    { title: "Cardiología", desc: "Cuidamos tu corazón y sistema circulatorio con tecnología de punta.", icon: <Heart className="w-6 h-6 text-white" />, color: "bg-red-500" },
    { title: "Clínica Médica", desc: "Tu primer paso para chequeos generales y prevención.", icon: <Stethoscope className="w-6 h-6 text-white" />, color: "bg-blue-500" },
    { title: "Neumonología", desc: "Diagnóstico y tratamiento de enfermedades respiratorias.", icon: <Activity className="w-6 h-6 text-white" />, color: "bg-cyan-500" },
    { title: "Dermatología", desc: "Salud visible y protegida para tu piel.", icon: <User className="w-6 h-6 text-white" />, color: "bg-purple-500" },
    { title: "Imágenes", desc: "Estudios de diagnóstico por imagen de alta resolución.", icon: <Search className="w-6 h-6 text-white" />, color: "bg-indigo-500" },
    { title: "Endocrinología", desc: "Control hormonal y metabólico integral.", icon: <ShieldCheck className="w-6 h-6 text-white" />, color: "bg-emerald-500" },
  ];
  return (
    <>
      {showIntro && <IntroOverlay onComplete={handleIntroComplete} />}
      <div className={`font-sans text-slate-800 bg-slate-50 selection:bg-blue-100 selection:text-blue-900 ${showIntro ? 'h-screen overflow-hidden' : ''}`}>
        <style>{homeStyles}</style>
      <Navbar />
      <div className="relative overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl animate-float" style={{animationDuration: '10s'}}></div>
            <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] bg-gradient-to-tr from-cyan-100/50 to-blue-100/50 rounded-full blur-3xl animate-float" style={{animationDuration: '15s', animationDelay: '1s'}}></div>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white/0 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-20 px-4 sm:px-6 lg:px-8">
            <main className="mt-10 mx-auto max-w-7xl sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <Reveal delay={100}>
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wider uppercase mb-4 border border-blue-100 shadow-sm">
                        S.A.M.S.A Salud Digital
                    </span>
                </Reveal>
                <Reveal delay={200}>
                    <h1 className="text-5xl tracking-tighter font-extrabold text-slate-900 sm:text-6xl md:text-7xl mb-6">
                    Tu salud <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">primero.</span>
                    <br />
                    <span className="block text-slate-800 text-4xl sm:text-5xl md:text-6xl mt-2">Sin filas, sin demoras.</span>
                    </h1>
                </Reveal>
                <Reveal delay={400}>
                    <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 leading-relaxed">
                    Gestioná tus turnos médicos de manera eficiente con el sistema líder en Argentina. Tecnología y calidez humana al servicio de tu bienestar.
                    </p>
                </Reveal>
                <div className="mt-10 sm:mt-12 sm:flex sm:justify-center lg:justify-start gap-4">
                  <Reveal delay={600} className="w-full sm:w-auto">
                    <Link to="/turns" className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 md:text-lg transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-500/30 group">
                      Solicitar turno
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                    </Link>
                  </Reveal>
                  <Reveal delay={700} className="w-full sm:w-auto mt-3 sm:mt-0">
                    <Link to="/about" className="w-full flex items-center justify-center px-8 py-4 border border-slate-200 text-base font-bold rounded-2xl text-slate-700 bg-white hover:bg-slate-50 md:text-lg transition-all hover:shadow-md">
                      Conocer más
                    </Link>
                  </Reveal>
                </div>
                <Reveal delay={900}>
                    <div className="mt-10 inline-flex flex-col sm:flex-row items-center gap-4 bg-white px-5 py-4 rounded-2xl sm:rounded-full border border-blue-100 shadow-[0_8px_30px_rgb(37,99,235,0.06)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.12)] transition-all duration-300">
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shrink-0 shadow-inner">
                            <ShieldCheck className="w-7 h-7" strokeWidth={1.5} />
                        </div>
                        <div className="text-center sm:text-left pr-3">
                            <p className="text-base font-bold text-slate-800">
                                Comprometidos con la salud de Argentina
                            </p>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Más de <span className="font-semibold text-blue-600">50.000 pacientes</span> confían en nuestra atención.
                            </p>
                        </div>
                    </div>
                </Reveal>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:h-full flex items-center justify-center pointer-events-none">
             <div className="relative w-full h-64 sm:h-72 md:h-96 lg:h-full animate-float">
                 <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent z-10 lg:via-white/20"></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 lg:hidden"></div>
                 <img 
                    className="w-full h-full object-cover object-center lg:object-left-top" 
                    src="/img/claudioMoya.png" 
                    alt="Equipo Médico SAMSA" 
                />
             </div>
        </div>
      </div>
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <Reveal delay={0}>
                <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3">Nuestras Especialidades</h2>
            </Reveal>
            <Reveal delay={200}>
                <p className="mt-2 text-3xl sm:text-4xl leading-8 font-extrabold tracking-tight text-slate-900">
                    Salud integral al alcance de tu mano
                </p>
            </Reveal>
            <Reveal delay={300}>
                <div className="w-24 h-1.5 bg-blue-600 mx-auto mt-6 rounded-full"></div>
            </Reveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Reveal key={index} delay={index * 100} className="h-full">
                  <Link to={`/professionals?specialty=${encodeURIComponent(service.title)}`} className="block group relative bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 h-full hover:-translate-y-2 overflow-hidden">
                    <div className={`absolute top-0 right-0 w-32 h-32 ${service.color} opacity-0 group-hover:opacity-5 rounded-bl-[100%] transition-all duration-500 translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0`}></div>
                    <div className={`inline-flex items-center justify-center p-4 ${service.color} rounded-2xl shadow-lg shadow-${service.color}/30 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        {service.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {service.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        {service.desc}
                    </p>
                    <div className="flex items-center text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        Consultar <ArrowRight className="ml-2 w-4 h-4"/>
                    </div>
                  </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-900">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-900/80 to-slate-900/80"></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
              <Reveal>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">¿Listo para cuidar tu salud?</h2>
                  <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                      Unite a los miles de pacientes que ya gestionan sus turnos de forma rápida y segura con S.A.M.S.A.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link to="/register">
                          <button className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-500 transition shadow-lg shadow-blue-900/50 hover:scale-105">
                              Crear mi cuenta ahora
                          </button>
                      </Link>
                  </div>
              </Reveal>
          </div>
      </section>
      <ProfessionalB2BSection />
      <Footer />
    </div>
    </>
  );
};
export default Home;