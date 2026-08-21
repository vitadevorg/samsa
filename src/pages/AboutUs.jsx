import React, { useState, useEffect, useRef } from 'react';
import { Clock, Users, Activity, Phone, Calendar, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
const FadeIn = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setIsVisible(entry.isIntersecting));
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
          : 'opacity-0 translate-y-12' 
      } ${className}`}
    >
      {children}
    </div>
  );
};
const Counter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setIsVisible(true);
    });
    if (domRef.current) observer.observe(domRef.current);
  }, []);
  useEffect(() => {
    if (!isVisible) return;
    let startTime;
    let animationFrame;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const ease = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      setCount(Math.floor(ease * end));
      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, end, duration]);
  return <span ref={domRef}>{count}{suffix}</span>;
};
const AboutUs = () => {
  return (
    <div className="font-sans text-slate-800 bg-white selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <div className="relative pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="z-10 order-2 lg:order-1">
              <FadeIn delay={0}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  <span className="text-blue-700 font-medium text-xs tracking-wide uppercase">Innovación en Salud</span>
                </div>
              </FadeIn>
              <FadeIn delay={100}>
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6">
                  Su salud es nuestra <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    máxima prioridad.
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={200}>
                <p className="text-xl text-gray-500 leading-relaxed max-w-lg mb-8 font-light">
                  Transformamos el acceso a la salud eliminando filas, no calidad. 
                  Un sistema diseñado para la era moderna.
                </p>
              </FadeIn>
              <FadeIn delay={300}>
                <div className="flex flex-wrap gap-4">
                  <button className="px-8 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 duration-300 shadow-lg shadow-gray-900/20">
                    Agendar Turno
                  </button>
                  <button className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-medium hover:border-gray-400 transition-all hover:scale-105 active:scale-95 duration-300">
                    Conocer más
                  </button>
                </div>
              </FadeIn>
            </div>
            <div className="relative order-1 lg:order-2 lg:h-[600px] flex items-center justify-center">
              <FadeIn delay={400} className="w-full h-full">
                <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/10 group">
                   <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-transparent z-10 mix-blend-multiply transition-opacity group-hover:opacity-75"></div>
                   <img 
                    src="/img/matarSoto.png" 
                    alt="Doctor Matar y Soto" 
                    className="w-full h-full object-cover scale-105 transition-transform duration-[2s] ease-out group-hover:scale-110"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.style.backgroundColor = '#e2e8f0'; 
                    }}
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: 150, suffix: "K+", label: "Turnos Gestionados" },
              { value: 30, suffix: "+", label: "Años Experiencia" },
              { value: 50, suffix: "K+", label: "Pacientes" },
              { value: 300, suffix: "+", label: "Especialistas" }
            ].map((item, index) => (
              <FadeIn key={index} delay={index * 100}>
                <div className="text-center group cursor-default">
                  <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2 font-mono tracking-tighter">
                    <Counter end={item.value} suffix={item.suffix} />
                  </div>
                  <div className="text-gray-500 text-sm font-medium uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                    {item.label}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 lg:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mb-20">
            <FadeIn>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Cuidado integral, <span className="text-blue-600">sin esperas.</span></h2>
                <p className="text-lg text-gray-500 font-light">
                Diseñamos S.A.M.S.A pensando en la eficiencia clínica y la comodidad humana.
                </p>
            </FadeIn>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: "Gestión Ágil", desc: "Turnos en tiempo real, sin burocracia innecesaria." },
              { icon: Activity, title: "Tecnología Smart", desc: "Historiales digitales y seguimiento preciso." },
              { icon: Users, title: "Trato Humano", desc: "Profesionales que valoran tu tiempo y bienestar." }
            ].map((feature, i) => (
              <FadeIn key={i} delay={i * 150} className="h-full">
                <div className="group h-full p-8 rounded-3xl bg-white border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 cursor-pointer flex flex-col">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors duration-500">
                    <feature.icon className="w-6 h-6 text-gray-900 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed flex-grow">{feature.desc}</p>
                  <div className="mt-6 flex items-center text-blue-600 text-sm font-medium opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                    Saber más <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 bg-blue-50/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
             <FadeIn>
                <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3">Cómo Funciona</h2>
             </FadeIn>
             <FadeIn delay={100}>
                <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Flujo de atención simplificado</h3>
             </FadeIn>
             <FadeIn delay={200}>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">Tres simples pasos que te conectan directamente con la solución que necesitas, sin demoras ni burocracia.</p>
             </FadeIn>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
             <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 z-0"></div>
             {[
               { num: "1", title: "Solicitud", text: "Seleccioná la especialidad y el horario desde tu dispositivo." },
               { num: "2", title: "Confirmación", text: "Recibí tu ticket digital instantáneo con los detalles." },
               { num: "3", title: "Atención", text: "Llegá y accedé directamente al consultorio sin esperas." }
             ].map((step, i) => (
               <FadeIn key={i} delay={i * 200} className="relative z-10">
                   <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 border border-white shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-300 h-full text-center flex flex-col items-center group">
                      <div className="w-16 h-16 rounded-full bg-white border-4 border-blue-50 shadow-md flex items-center justify-center text-2xl font-black text-blue-600 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:border-white group-hover:text-white transition-all duration-500">
                          {step.num}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                      <p className="text-slate-500 leading-relaxed text-sm">{step.text}</p>
                   </div>
               </FadeIn>
             ))}
          </div>
        </div>
      </section>
      <Footer theme="light" />
    </div>
  );
};
export default AboutUs;