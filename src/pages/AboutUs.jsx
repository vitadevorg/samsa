import React, { useState, useEffect } from 'react';
import { Clock, Users, Activity, ArrowRight, CheckCircle, CalendarCheck, Sparkles, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BaseFadeIn from '../components/FadeIn';
import { useInView } from '../hooks/useInView';

const FadeIn = (props) => (
  <BaseFadeIn once={false} duration="duration-1000" offset="translate-y-12" {...props} />
);

const aboutFlowStyles = `
  @keyframes flow-beam {
    0% { transform: translateX(-100%); opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { transform: translateX(350%); opacity: 0; }
  }
  .animate-flow-beam {
    animation: flow-beam 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
  @keyframes pulse-ring {
    0% { transform: scale(0.92); opacity: 0.65; }
    70% { transform: scale(1.25); opacity: 0; }
    100% { transform: scale(1.25); opacity: 0; }
  }
  .animate-pulse-ring {
    animation: pulse-ring 2.4s cubic-bezier(0.24, 0, 0.38, 1) infinite;
  }
`;

const CareFlowSection = () => {
  const [flowRef, isFlowVisible] = useInView({ threshold: 0.2, once: false });
  const [activeStep, setActiveStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isFlowVisible || isHovered) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 3200);
    return () => clearInterval(interval);
  }, [isFlowVisible, isHovered]);

  const steps = [
    {
      num: "01",
      title: "Solicitud",
      text: "Seleccioná la especialidad, el profesional y el horario ideal desde tu dispositivo, las 24 horas.",
      detail: "Disponibilidad en tiempo real",
      icon: CalendarCheck,
      accent: "from-blue-600 to-indigo-600",
    },
    {
      num: "02",
      title: "Confirmación",
      text: "Recibí tu ticket digital al instante con todos los detalles, ubicación y recordatorios automáticos.",
      detail: "Pase digital y alertas",
      icon: Sparkles,
      accent: "from-indigo-600 to-blue-600",
    },
    {
      num: "03",
      title: "Atención",
      text: "Llegá a la clínica y accedé directamente al consultorio sin filas en recepción ni trámites.",
      detail: "Ingreso directo al consultorio",
      icon: Stethoscope,
      accent: "from-blue-600 to-cyan-600",
    }
  ];

  return (
    <section
      id="care-flow"
      ref={flowRef}
      className="pt-12 pb-16 sm:pt-14 sm:pb-24 lg:pt-16 lg:pb-28 bg-gradient-to-b from-slate-50/70 via-blue-50/40 to-white relative overflow-hidden border-t border-slate-100"
    >
      <style>{aboutFlowStyles}</style>

      {/* Ambient decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 right-[-10%] sm:right-[-5%] w-64 h-64 sm:w-[28rem] sm:h-[28rem] bg-blue-200/35 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 left-[-10%] sm:left-[-5%] w-60 h-60 sm:w-[26rem] sm:h-[26rem] bg-indigo-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <FadeIn>
            <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3 sm:mb-5 leading-tight">
              Flujo de atención{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                simplificado
              </span>
            </h3>
          </FadeIn>

          <FadeIn delay={100}>
            <p className="text-slate-500 text-sm sm:text-lg md:text-xl leading-relaxed px-1 sm:px-0">
              Tres simples pasos que te conectan directamente con la solución que necesitás, sin demoras ni burocracia.
            </p>
          </FadeIn>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Desktop Animated Timeline Connector */}
          <div
            style={{ transitionDelay: isFlowVisible ? '900ms' : '0ms' }}
            className={`hidden md:block absolute top-[4.5rem] left-[16%] right-[16%] h-1 bg-slate-200/80 rounded-full overflow-hidden z-0 transition-opacity duration-700 ${
              isFlowVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
              style={{
                width: isFlowVisible ? `${(activeStep / 2) * 100}%` : '0%',
              }}
            />
            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-blue-400/70 to-transparent animate-flow-beam" />
          </div>

          {/* Mobile Vertical Connector */}
          <div
            style={{ transitionDelay: isFlowVisible ? '900ms' : '0ms' }}
            className={`md:hidden absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-0.5 bg-slate-200/90 rounded-full overflow-hidden z-0 transition-opacity duration-700 ${
              isFlowVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="w-full bg-gradient-to-b from-blue-600 via-indigo-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
              style={{
                height: isFlowVisible ? `${(activeStep / 2) * 100}%` : '0%',
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 lg:gap-10 relative z-10">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = activeStep === i;
              const isCompleted = activeStep > i;

              return (
                <FadeIn key={step.num} delay={i * 180} className="h-full">
                  <div
                    onMouseEnter={() => setActiveStep(i)}
                    onClick={() => setActiveStep(i)}
                    className={`group relative h-full rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 lg:p-9 transition-all duration-500 cursor-pointer flex flex-col items-center text-center overflow-hidden border backdrop-blur-xl ${
                      isActive
                        ? 'bg-white border-blue-200/90 shadow-[0_20px_50px_-15px_rgba(37,99,235,0.18)] -translate-y-1 sm:-translate-y-2.5'
                        : 'bg-white/90 border-slate-100/90 shadow-lg shadow-slate-900/[0.04] hover:bg-white hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-900/10 sm:hover:-translate-y-1.5'
                    }`}
                  >
                    {/* Top gradient highlight bar */}
                    <div
                      className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${step.accent} transition-all duration-500 ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                      }`}
                    />

                    {/* Subtle radial spotlight inside active card */}
                    <div
                      className={`absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 bg-gradient-to-b from-blue-500/10 to-transparent rounded-full blur-2xl pointer-events-none transition-opacity duration-500 ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
                      }`}
                    />

                    {/* Large decorative background number */}
                    <span
                      className={`absolute top-3 right-4 sm:top-4 sm:right-6 text-5xl sm:text-6xl font-black tracking-tighter select-none pointer-events-none transition-all duration-500 ${
                        isActive
                          ? 'text-blue-600/[0.08] scale-110 -translate-y-1'
                          : 'text-slate-900/[0.04] group-hover:text-blue-600/[0.06]'
                      }`}
                    >
                      {step.num}
                    </span>

                    {/* Central Node (Icon + Number Badge) */}
                    <div className="relative mb-5 sm:mb-7 mt-1">
                      {isActive && (
                        <span className="absolute inset-0 rounded-2xl bg-blue-500/25 animate-pulse-ring pointer-events-none" />
                      )}
                      <div
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                          isActive
                            ? `bg-gradient-to-br ${step.accent} text-white shadow-lg shadow-blue-600/30 scale-105 sm:scale-110`
                            : isCompleted
                            ? 'bg-blue-50 text-blue-600 border-2 border-blue-200 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-2 border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/60 group-hover:text-blue-600 group-hover:scale-105'
                        }`}
                      >
                        <Icon className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.8} />
                      </div>

                      {/* Step Number Pill */}
                      <div
                        className={`absolute -bottom-2 -right-2 sm:-bottom-2.5 sm:-right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black tracking-tight transition-all duration-500 ${
                          isActive || isCompleted
                            ? 'bg-blue-600 text-white border-2 border-white shadow-md shadow-blue-600/30 scale-110'
                            : 'bg-white text-blue-600 border-2 border-blue-200 ring-2 ring-white shadow-sm group-hover:border-blue-400'
                        }`}
                      >
                        {i + 1}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-5 sm:mb-6 flex-grow">
                      {step.text}
                    </p>

                    {/* Bottom status footer inside card */}
                    <div
                      className={`w-full pt-3.5 sm:pt-4 border-t flex items-center justify-center gap-2 text-xs font-semibold transition-colors duration-300 ${
                        isActive
                          ? 'border-blue-100/80 text-blue-600'
                          : 'border-slate-100 text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      <CheckCircle
                        className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                          isActive ? 'text-blue-600 scale-110' : 'text-slate-400 group-hover:text-blue-500'
                        }`}
                      />
                      <span>{step.detail}</span>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          {/* Interactive Step Indicators & CTA */}
          <FadeIn delay={500}>
            <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-8 sm:gap-10">
              <div className="inline-flex items-center justify-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full border border-slate-200/80 shadow-sm">
                {steps.map((s, idx) => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    aria-label={`Ver paso ${idx + 1}: ${s.title}`}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      activeStep === idx
                        ? 'w-8 bg-blue-600'
                        : 'w-2 bg-slate-300 hover:bg-blue-400'
                    }`}
                  />
                ))}
              </div>

              <Link
                to="/turns"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4 border border-transparent text-base font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 md:text-lg transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-500/30 group"
              >
                Solicitar mi turno ahora
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

const Counter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [domRef, isVisible] = useInView({ threshold: 0 });
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
    <div className="font-sans text-slate-800 bg-white selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      <Navbar />
      <div className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-x-16 lg:gap-y-0 items-center">
            <div className="z-10 order-1 lg:col-start-1 lg:row-start-1 lg:self-end text-center lg:text-left">
              <FadeIn delay={100}>
                <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.15] sm:leading-[1.1] mb-4 sm:mb-6">
                  Su salud es nuestra <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    máxima prioridad.
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={200}>
                <p className="text-base sm:text-xl text-gray-500 leading-relaxed max-w-lg mx-auto lg:mx-0 lg:mb-8 font-light">
                  Transformamos el acceso a la salud eliminando filas, no calidad. 
                  Un sistema diseñado para la era moderna.
                </p>
              </FadeIn>
            </div>
            <div className="relative order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 aspect-[4/3] w-full max-w-xl mx-auto lg:max-w-none lg:aspect-auto lg:h-[600px] flex items-center justify-center">
              <FadeIn delay={300} className="w-full h-full">
                <div className="relative w-full h-full rounded-3xl sm:rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/10 group">
                   <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-transparent z-10 mix-blend-multiply transition-opacity group-hover:opacity-75"></div>
                   <img 
                    src="/img/matarSoto.png" 
                    alt="Doctor Matar y Soto" 
                    className="w-full h-full object-cover object-top scale-100 lg:scale-105 transition-transform duration-[2s] ease-out group-hover:scale-105 lg:group-hover:scale-110"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.style.backgroundColor = '#e2e8f0'; 
                    }}
                  />
                </div>
              </FadeIn>
            </div>
            <div className="z-10 order-3 lg:col-start-1 lg:row-start-2 lg:self-start text-center lg:text-left">
              <FadeIn delay={400}>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4">
                  <Link
                    to="/turns"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4 border border-transparent text-base font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 md:text-lg transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-500/30 group"
                  >
                    Agendar Turno
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a
                    href="#care-flow"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4 border border-slate-200 text-base font-bold rounded-2xl text-slate-700 bg-white hover:bg-slate-50 md:text-lg transition-all hover:shadow-md"
                  >
                    Conocer más
                  </a>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 sm:gap-8 lg:gap-12">
            {[
              { value: 150, suffix: "K+", label: "Turnos Gestionados" },
              { value: 30, suffix: "+", label: "Años Experiencia" },
              { value: 50, suffix: "K+", label: "Pacientes" },
              { value: 300, suffix: "+", label: "Especialistas" }
            ].map((item, index) => (
              <FadeIn key={item.label} delay={index * 100}>
                <div className="text-center group cursor-default px-1">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-1.5 sm:mb-2 font-mono tracking-tighter">
                    <Counter end={item.value} suffix={item.suffix} />
                  </div>
                  <div className="text-gray-500 text-[11px] sm:text-sm font-medium uppercase tracking-wider group-hover:text-blue-600 transition-colors leading-tight">
                    {item.label}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      <section className="pt-14 pb-10 sm:pt-20 sm:pb-12 lg:pt-28 lg:pb-14 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 sm:mb-16 text-center sm:text-left mx-auto sm:mx-0">
            <FadeIn>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-6 leading-tight">Cuidado integral, <span className="text-blue-600">sin esperas.</span></h2>
                <p className="text-base sm:text-lg text-gray-500 font-light leading-relaxed">
                Diseñamos S.A.M.S.A pensando en la eficiencia clínica y la comodidad humana.
                </p>
            </FadeIn>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            {[
              { icon: Clock, title: "Gestión Ágil", desc: "Turnos en tiempo real, sin burocracia innecesaria." },
              { icon: Activity, title: "Tecnología Smart", desc: "Historiales digitales y seguimiento preciso." },
              { icon: Users, title: "Trato Humano", desc: "Profesionales que valoran tu tiempo y bienestar." }
            ].map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 150} className="h-full">
                <div className="group h-full p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 cursor-pointer flex flex-col items-center text-center sm:items-start sm:text-left">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-5 sm:mb-8 group-hover:bg-blue-600 transition-colors duration-500">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2.5 sm:mb-4">{feature.title}</h3>
                  <p className="text-gray-500 text-sm sm:text-base leading-relaxed flex-grow">{feature.desc}</p>
                  <div className="mt-4 sm:mt-6 flex items-center text-blue-600 text-sm font-medium opacity-100 translate-x-0 sm:opacity-0 sm:-translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                    Saber más <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      <CareFlowSection />
      <Footer theme="light" />
    </div>
  );
};

export default AboutUs;
