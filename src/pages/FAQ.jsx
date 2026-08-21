import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, HelpCircle, Phone, Calendar, Mail, 
  MessageCircle, ArrowRight, Search, FileText 
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
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};
const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const toggleQuestion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  const faqs = [
    {
      id: "01",
      question: "¿Qué pasos debe seguir el paciente para solicitar un turno?",
      answer: "El proceso consta de tres pasos principales: 1) Seleccionar especialidad, médico y horario disponible. 2) Ingresar datos personales (Nombre, Apellido, CUIL y Email). 3) Seleccionar fecha en el calendario y confirmar. Finalmente, podrás descargar tu comprobante de turno."
    },
    {
      id: "02",
      question: "¿Qué datos se solicitan para el registro del paciente?",
      answer: "Para registrarte debés completar un formulario con: Nombre, Apellido, CUIL, Fecha de nacimiento, Correo electrónico (confirmándolo dos veces) y una contraseña segura (con al menos una mayúscula y un carácter especial)."
    },
    {
      id: "03",
      question: "¿Cómo es el proceso de recuperación de contraseña?",
      answer: "Si olvidaste tu contraseña, usá la opción 'Recuperar'. Ingresá tu email para recibir un código de verificación. Luego, ingresá ese código en la app y creá una nueva contraseña. Al finalizar, presioná 'Continuar' para guardar los cambios."
    },
    {
      id: "04",
      question: "¿La app es accesible desde cualquier dispositivo?",
      answer: "Sí. SAMSA fue diseñada con un enfoque responsivo, lo que permite su uso cómodo tanto desde celulares como tablets. Cuenta con un menú lateral que facilita la navegación."
    },
    {
      id: "05",
      question: "¿Es segura la información que ingreso en la app?",
      answer: "Sí, toda la información personal y médica se almacena en servidores seguros cumpliendo normativas de protección de datos. El acceso está protegido por contraseña y verificación de email."
    },
    {
      id: "06",
      question: "¿La app me avisa si mi turno se cancela o se atrasa?",
      answer: "Sí. En la pantalla principal, dentro del apartado 'Novedades', se informa si un médico no asistirá o si existen demoras imprevistas en la atención."
    },
    {
      id: "07",
      question: "¿Qué pasa si llego tarde a mi turno?",
      answer: "Si llegás tarde, tu turno podrá ser reprogramado o anulado automáticamente, dependiendo de la política de tolerancia establecida por la institución."
    },
    {
      id: "08",
      question: "¿Puedo sacar más de un turno a la vez?",
      answer: "Dependiendo del tipo de servicio, el sistema puede permitir múltiples turnos, pero en general se limita a uno por persona para evitar sobrecargas y asegurar disponibilidad para todos."
    }
  ];
  return (
    <div className="font-sans text-slate-800 bg-white min-h-screen selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <Navbar />
      <div className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl opacity-60 translate-x-1/2 -translate-y-1/2"></div>
         </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <FadeIn>
            <div className="inline-flex items-center justify-center p-3 mb-8 bg-blue-50 rounded-2xl text-blue-600">
                <HelpCircle className="w-8 h-8" />
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              Preguntas <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Frecuentes
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
              Resolvemos tus dudas sobre el funcionamiento de SAMSA para que tu experiencia sea simple y transparente.
            </p>
          </FadeIn>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pb-24 flex-grow">
        <div className="space-y-4">
          {faqs.map((item, index) => (
            <FadeIn key={index} delay={Math.min(index * 50, 500)}>
                <div 
                    className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                        activeIndex === index 
                        ? 'border-blue-200 shadow-xl shadow-blue-900/5' 
                        : 'border-gray-100 shadow-sm hover:border-blue-100 hover:shadow-md'
                    }`}
                >
                <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full flex justify-between items-start p-6 focus:outline-none text-left cursor-pointer"
                >
                    <div className="flex gap-5 pr-4">
                        <span className={`text-sm font-mono font-bold pt-1 transition-colors duration-300 ${activeIndex === index ? 'text-blue-600' : 'text-gray-300 group-hover:text-blue-400'}`}>
                            {item.id}
                        </span>
                        <span className={`text-lg font-bold transition-colors duration-300 ${activeIndex === index ? 'text-blue-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                            {item.question}
                        </span>
                    </div>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeIndex === index ? 'bg-blue-600 text-white rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                        <ChevronDown className="w-5 h-5" />
                    </div>
                </button>
                <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="px-6 pb-6 pl-[4.5rem] text-gray-600 leading-relaxed text-base">
                        {item.answer}
                    </div>
                </div>
                </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={400}>
            <div className="mt-16 text-center bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border border-gray-100 shadow-lg shadow-gray-200/50">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">¿No encontraste lo que buscabas?</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Nuestro equipo de soporte está disponible para ayudarte con cualquier consulta adicional.
                </p>
                <div className="flex justify-center gap-4">
                    <button className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-gray-900/20 active:scale-95 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Contactar Soporte
                    </button>
                    <Link to="/about">
                        <button className="bg-white text-gray-700 px-8 py-3 rounded-xl font-bold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-95">
                            Ver más info
                        </button>
                    </Link>
                </div>
            </div>
        </FadeIn>
      </div>
      <Footer theme="light" />
    </div>
  );
};
export default FAQ;