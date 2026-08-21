import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { LifeBuoy, Send, MessageSquare, PhoneCall, Mail, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Printer } from 'lucide-react';

const faqs = [
  {
    q: "¿Cómo corregir un error en una Historia Clínica guardada?",
    a: "Por normativas legales, una evolución clínica no puede ser borrada una vez confirmada. Deberás crear una nueva evolución aclarando el error de la anterior y agregando la información correcta."
  },
  {
    q: "Un paciente no aparece en mi lista de Turnos Asignados",
    a: "Verificá en la recepción si el paciente ha sido admitido correctamente. Si el problema persiste, comunicate al interno 112 (Soporte TI)."
  },
  {
    q: "¿Cómo configuro mis días de ausencia por vacaciones/congresos?",
    a: "Desde la app, no está disponible. Debés enviar un correo a recursos_humanos@samsa.com.ar con 15 días de anticipación para que bloqueen tu agenda en el sistema."
  },
  {
    q: "Olvidé mi contraseña o se bloqueó mi usuario",
    a: "Hacé clic en 'Olvidé mi contraseña' en la pantalla de inicio de sesión para recibir un enlace de recuperación. Si tu usuario está bloqueado por múltiples intentos, contactá a Soporte TI."
  }
];

const DoctorSupport = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [ticketStatus, setTicketStatus] = useState('idle'); 
  const [ticketId, setTicketId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTicketStatus('sending');
    const newId = Math.floor(Math.random() * 9000) + 1000;
    setTimeout(() => {
      setTicketId(newId);
      setTicketStatus('success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      <div className="print:hidden flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            <div className="relative z-10 w-full text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 text-blue-600 mb-3">
                    <div className="bg-blue-100 p-2 rounded-xl">
                        <LifeBuoy className="w-5 h-5 text-blue-700" />
                    </div>
                    <span className="font-black tracking-widest uppercase text-xs text-blue-700/80">Centro de Ayuda</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Soporte Técnico</h1>
                <p className="text-slate-500 mt-2 font-medium max-w-2xl">
                    Estamos para ayudarte. Consultá las dudas frecuentes o envianos un mensaje directo y nuestro equipo de TI lo resolverá a la brevedad.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm h-fit relative overflow-hidden">

            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none"></div>

            <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3 relative z-10 tracking-tight">
              <MessageSquare className="w-6 h-6 text-blue-600" /> Abrir un Ticket
            </h2>

            {ticketStatus === 'success' ? (
              <div className="bg-green-50/50 border border-green-100 rounded-2xl p-10 text-center animate-fadeIn relative z-10">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-5" />
                <h3 className="text-2xl font-black text-slate-800 mb-2">¡Ticket enviado!</h3>
                <p className="text-slate-500 font-medium mb-6">
                  Hemos recibido tu consulta. Nos pondremos en contacto a la brevedad. Tu número de ticket es <strong className="text-slate-800 bg-white px-2 py-1 rounded-md border border-slate-200">#TK-{ticketId}</strong>.
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => window.print()}
                    className="w-full px-6 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                  >
                    <Printer className="w-5 h-5" /> Descargar / Imprimir Comprobante
                  </button>
                  <button 
                    onClick={() => {
                        setTicketStatus('idle');
                        setTicketId(null);
                    }}
                    className="w-full px-6 py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200"
                  >
                    Enviar otro ticket
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Asunto</label>
                  <input type="text" required placeholder="Ej: Error al guardar historia clínica" className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-slate-700 shadow-sm" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Categoría</label>
                    <select className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-slate-700 shadow-sm appearance-none">
                      <option>Problema en el Sistema</option>
                      <option>Sugerencia de Mejora</option>
                      <option>Problema de Hardware</option>
                      <option>Dudas Generales</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Prioridad</label>
                    <select className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-slate-700 shadow-sm appearance-none">
                      <option>Baja (Consulta)</option>
                      <option>Media (Fallo menor)</option>
                      <option>Alta (Crítico)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Descripción Detallada</label>
                  <textarea required rows="4" placeholder="Describí el problema con la mayor cantidad de detalles posible..." className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none font-medium text-slate-700 shadow-sm"></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={ticketStatus === 'sending'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                >
                  {ticketStatus === 'sending' ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <><Send className="w-5 h-5"/> Enviar Ticket de Soporte</>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-7 text-white shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
                <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-5 backdrop-blur-sm">
                    <PhoneCall className="w-6 h-6 text-blue-300" />
                </div>
                <h3 className="font-black text-lg mb-1 tracking-tight">Mesa de Ayuda</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Lun a Vie 8-20h</p>
                <p className="font-mono font-bold text-2xl text-blue-300 group-hover:text-white transition-colors">Int. 112</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-3xl p-7 shadow-sm group hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
                    <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-black text-slate-800 text-lg mb-1 tracking-tight">Email Soporte</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Respuesta 24h</p>
                <p className="font-bold text-blue-600 text-sm break-all group-hover:text-blue-800 transition-colors">soporte_ti@samsa.com.ar</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm relative overflow-hidden">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3 tracking-tight">
                <AlertTriangle className="w-6 h-6 text-amber-500" /> Dudas Frecuentes
              </h2>

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className={`border ${openFaq === index ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200'} rounded-2xl overflow-hidden transition-colors`}>
                    <button 
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full px-6 py-5 text-left font-bold text-slate-800 flex justify-between items-center hover:bg-slate-50 transition-colors"
                    >
                      <span className="pr-4">{faq.q}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${openFaq === index ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        {openFaq === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed font-medium">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
      </div>

      {ticketStatus === 'success' && ticketId && (
        <div className="hidden print:flex flex-col p-12 font-serif text-slate-900 bg-white w-full absolute top-0 left-0 right-0 z-[99999] min-h-[100vh]">
            <div className="flex justify-between items-end mb-8 border-b-2 border-slate-900 pb-6">
                <div>
                    <h1 className="text-4xl tracking-[0.3em] font-medium text-slate-900">SAMSA</h1>
                    <p className="text-xs text-slate-500 tracking-[0.2em] uppercase mt-1">Soporte Técnico IT</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-slate-700">Comprobante de Ticket</p>
                    <p className="text-sm">N° TK-{ticketId}</p>
                </div>
            </div>

            <div className="my-10 space-y-6 flex-grow">
                <p className="text-xl font-bold">Hemos recibido tu solicitud de soporte.</p>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 inline-block">
                    <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-1">Número de Seguimiento</p>
                    <p className="text-4xl font-mono font-black text-slate-800">#TK-{ticketId}</p>
                </div>
                <p className="text-lg">Nuestro equipo de Mesa de Ayuda se pondrá en contacto a la brevedad para brindarte una solución.</p>
                <p className="text-sm text-slate-500 mt-10">Fecha de emisión: {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            <div className="mt-auto border-t pt-6 flex justify-between items-center text-xs text-slate-500">
                <p>Documento generado automáticamente por SAMSA Core.</p>
                <p>Uso interno exclusivamente.</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSupport;
