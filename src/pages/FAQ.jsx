import React, { useState } from 'react';
import { 
  ChevronDown, HelpCircle, Phone, Calendar, Mail, 
  MessageCircle, ArrowRight, Search, FileText 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FadeIn from '../components/FadeIn';

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
      answer: "Para registrarte debés completar un formulario con: Nombre, Apellido, DNI, CUIL (opcional), Fecha de nacimiento, Teléfono, Obra Social, Correo electrónico y una contraseña segura."
    },
    {
      id: "03",
      question: "¿Cómo es el proceso de recuperación de contraseña?",
      answer: "Si olvidaste tu contraseña, debés usar la opción de recuperar. Recibirás un mail con instrucciones para restablecer la contraseña y recuperar el acceso a tu cuenta."
    },
    {
      id: "04",
      question: "¿Es segura la información que ingreso en la app?",
      answer: "Sí, toda la información personal y médica se almacena en servidores seguros cumpliendo normativas de protección de datos."
    },
    {
      id: "05",
      question: "¿La app me avisa si mi turno se cancela o se atrasa?",
      answer: "Sí. Si tu turno se cancela o sufre una demora imprevista, recibirás una notificación directamente en tu método de contacto."
    },
    {
      id: "06",
      question: "¿Qué pasa si llego tarde a mi turno?",
      answer: "Si llegás tarde, tu turno podrá ser reprogramado o anulado automáticamente, dependiendo de la política de tolerancia establecida por la institución."
    },
    {
      id: "07",
      question: "¿Puedo sacar más de un turno a la vez?",
      answer: "Dependiendo del tipo de servicio, el sistema puede permitir múltiples turnos, pero en general se limita a uno por persona para evitar sobrecargas y asegurar disponibilidad para todos."
    }
  ];

  return (
    <div className="font-sans text-slate-800 bg-white min-h-screen selection:bg-blue-100 selection:text-blue-900 flex flex-col overflow-x-hidden">
      <Navbar />
      <div className="relative pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-16 lg:pb-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-blue-50/50 rounded-full blur-3xl opacity-60 translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <FadeIn>
            <div className="inline-flex items-center justify-center p-2.5 sm:p-3 mb-4 sm:mb-6 bg-blue-50 rounded-2xl text-blue-600">
              <HelpCircle className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.15] sm:leading-[1.1] mb-4 sm:mb-6">
              Preguntas <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Frecuentes
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed px-1 sm:px-0">
              Resolvemos tus dudas sobre el funcionamiento de SAMSA para que tu experiencia sea simple y transparente.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 flex-grow">
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((item, index) => (
            <FadeIn key={item.question} delay={Math.min(index * 50, 500)}>
              <div 
                className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                  activeIndex === index 
                    ? 'border-blue-200 shadow-xl shadow-blue-900/5' 
                    : 'border-gray-100 shadow-sm hover:border-blue-100 hover:shadow-md'
                }`}
              >
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full flex justify-between items-start sm:items-center p-4 sm:p-6 focus:outline-none text-left cursor-pointer"
                >
                  <div className="flex gap-3 sm:gap-5 pr-3 sm:pr-4 items-start">
                    <span className={`text-xs sm:text-sm font-mono font-bold pt-0.5 sm:pt-1 transition-colors duration-300 ${activeIndex === index ? 'text-blue-600' : 'text-gray-300 group-hover:text-blue-400'}`}>
                      {item.id}
                    </span>
                    <span className={`text-base sm:text-lg font-bold leading-snug transition-colors duration-300 ${activeIndex === index ? 'text-blue-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                      {item.question}
                    </span>
                  </div>
                  <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeIndex === index ? 'bg-blue-600 text-white rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    activeIndex === index ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-4 sm:px-6 pb-5 sm:pb-6 pl-10 sm:pl-[4.5rem] text-gray-600 leading-relaxed text-sm sm:text-base">
                    {item.answer}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={400}>
          <div className="mt-12 sm:mt-16 text-center bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-lg shadow-gray-200/50">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2.5 sm:mb-3">¿No encontraste lo que buscabas?</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed">
              Nuestro equipo de soporte está disponible para ayudarte con cualquier consulta adicional.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button className="w-full sm:w-auto justify-center bg-gray-900 text-white px-7 py-3.5 sm:px-8 sm:py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-gray-900/20 active:scale-95 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Contactar Soporte
              </button>
              <Link to="/about" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-white text-gray-700 px-7 py-3.5 sm:px-8 sm:py-3 rounded-xl font-bold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-95">
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
