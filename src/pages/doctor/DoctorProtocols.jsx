import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { BookOpen, ShieldAlert, FileText, Download, Search, AlertCircle, X, Printer, HeartPulse } from 'lucide-react';

const protocolsData = [
  {
    id: 1,
    title: 'Protocolo de Urgencias Cardiovasculares',
    category: 'Emergencias',
    date: '10/08/2026',
    description: 'Guía actualizada para el manejo de IAM, arritmias severas y emergencias hipertensivas en guardia.',
    icon: ShieldAlert,
    color: 'text-red-500',
    bg: 'bg-red-50',
    content: (
        <div className="font-serif">
          <div className="border-b-2 border-slate-900 pb-4 mb-8">
            <h1 className="text-4xl tracking-[0.2em] font-medium text-slate-900 uppercase leading-tight">PROTOCOLO DE URGENCIAS CARDIOVASCULARES</h1>
            <p className="text-xl text-slate-600 mt-4">Manejo de IAM, Arritmias Severas y Emergencias Hipertensivas en Guardia</p>
          </div>

          <div className="text-sm text-slate-500 mb-8 italic">
            <p>Fuente: Documento de Posición "Emergencias Cardiovasculares en Guardia" — Sociedad Argentina de Cardiología, Revista Argentina de Cardiología, Vol. 94, Supl. 7, Mayo 2026.</p>
            <p>Última actualización: 10/08/2026</p>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-4 bg-slate-100 p-3 border-l-4 border-slate-800 uppercase tracking-widest">1. INFARTO AGUDO DE MIOCARDIO (IAM)</h2>
          <h3 className="text-lg font-bold text-slate-700 mt-8 mb-4">1.1 Síndrome Coronario Agudo con Elevación del ST (SCACEST)</h3>

          <div className="space-y-5 mb-8">
            <p><strong>Paso 1 — Primer Contacto Médico (PCM):</strong> Ante síntomas sugestivos de isquemia, debe obtenerse un ECG de 12 derivaciones dentro de los primeros 10 minutos, con interpretación inmediata (presencial o por telemedicina).</p>
            <p><strong>Paso 2 — Activación de Código Infarto:</strong> Confirmado el SCACEST, se activa un equipo multidisciplinario (cardiología clínica e intervencionista, emergentología, coordinación de SEM) para optimizar tiempos de traslado y tratamiento.</p>
            <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
              <p className="font-bold text-blue-900 mb-3 text-lg">Paso 3 — Estrategia de reperfusión (dentro de las 12 h de inicio de síntomas):</p>
              <ul className="list-disc list-inside space-y-2 text-blue-900/90 ml-2">
                <li><strong>Centro con hemodinamia disponible dentro de los 120 minutos del PCM:</strong> Angioplastia primaria (apertura de la arteria dentro de los 60 min, o 90 min si requiere derivación).</li>
                <li><strong>Sin disponibilidad dentro de los 120 minutos:</strong> Fibrinolíticos (inicio dentro de los 10 minutos), con reevaluación de reperfusión a los 90 minutos según criterios clínicos, electrocardiográficos y enzimáticos.</li>
                <li><strong>Reperfusión exitosa:</strong> derivación para angioplastia fármaco-invasiva (2–24 h).</li>
                <li><strong>Reperfusión fallida:</strong> derivación para angioplastia de rescate.</li>
              </ul>
            </div>
            <p><strong>Tratamiento farmacológico concomitante:</strong> doble antiagregación (AAS + inhibidor P2Y12: ticagrelor, clopidogrel o prasugrel según esquema de carga/mantenimiento) y estatinas de alta intensidad (rosuvastatina o atorvastatina).</p>
            <div className="bg-red-50 border border-red-200 p-5 rounded-xl text-red-800 mt-6">
              <p className="font-black tracking-widest uppercase text-sm mb-2">Contraindicaciones absolutas para fibrinolíticos:</p>
              <p className="text-sm font-medium">ACV hemorrágico previo, ACV de cualquier tipo en los últimos 6 meses, neoplasia o malformación vascular intracraneal, hemorragia digestiva reciente, traumatismo/cirugía craneal reciente, sospecha de disección aórtica, coagulopatía activa, punciones no compresibles recientes.</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-700 mt-10 mb-4">1.2 Síndrome Coronario Agudo sin Elevación del ST (SCASEST)</h3>
          <div className="space-y-5 mb-12">
            <p>Se basa en la estratificación mediante troponina de alta sensibilidad (hs-cTn) con algoritmos 0/1 h o 0/2 h:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-700">
              <li><strong>Rule out</strong> (valores muy bajos o delta bajo): externación con manejo ambulatorio.</li>
              <li><strong>Rule in</strong> (valores muy altos o delta alto): internación para diagnóstico y tratamiento.</li>
              <li><strong>Zona de observación:</strong> requiere reevaluación individualizada con imágenes o troponina adicional.</li>
            </ul>
            <p className="font-bold mt-6 text-slate-800 text-lg">Estratificación de riesgo para conducta invasiva:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-700">
              <li><strong>Muy alto riesgo</strong> (inestabilidad hemodinámica, shock, dolor refractario, complicación mecánica): cinecoronariografía de emergencia.</li>
              <li><strong>Alto riesgo</strong> (GRACE &gt; 140, alteraciones eléctricas isquémicas): tratamiento médico óptimo + CCG dentro de las 24 h.</li>
              <li><strong>Bajo riesgo:</strong> estrategia conservadora inicial, con evaluación anatómica diferida.</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-4 bg-slate-100 p-3 border-l-4 border-slate-800 uppercase tracking-widest mt-12">2. ARRITMIAS SEVERAS EN LA URGENCIA</h2>

          <h3 className="text-lg font-bold text-slate-700 mt-8 mb-4">2.1 Bradiarritmias (FC &lt; 60 lpm)</h3>
          <div className="space-y-5 mb-10">
            <p>Diagnóstico diferencial mediante relación onda P / QRS en el ECG (bloqueo AV vs. disfunción del nodo sinusal).</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="border border-red-200 bg-red-50/50 p-6 rounded-xl">
                <p className="font-black text-red-800 mb-3 uppercase tracking-wider text-sm">Paciente hemodinámicamente inestable</p>
                <ul className="list-disc list-inside text-red-800/80 space-y-2 font-medium">
                  <li>Atropina 0,5 mg EV cada 3 minutos (hasta 6 dosis).</li>
                  <li>Isoproterenol o adrenalina en infusión continua si no hay respuesta.</li>
                  <li>Marcapasos transitorio si persiste la inestabilidad.</li>
                </ul>
              </div>
              <div className="border border-emerald-200 bg-emerald-50/50 p-6 rounded-xl">
                <p className="font-black text-emerald-800 mb-3 uppercase tracking-wider text-sm">Paciente estable</p>
                <p className="text-emerald-800/80 font-medium">Monitoreo continuo, evaluación de riesgo de asistolia (antecedente de asistolia o síncope, BAV 2° tipo II o completo, pausas &gt; 3 s) y búsqueda de causas reversibles (fármacos, isquemia, alteraciones metabólicas).</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-700 mt-8 mb-4">2.2 Taquiarritmias (FC &gt; 100 lpm)</h3>
          <div className="space-y-5 mb-12">
            <p className="bg-red-500 text-white font-bold p-4 rounded-xl shadow-sm text-center tracking-wide uppercase text-sm">Inestabilidad hemodinámica presente: Cardioversión eléctrica sincrónica inmediata.</p>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl mt-6">
                <p className="font-bold text-lg mb-3">Paciente estable, QRS angosto (taquicardia supraventricular):</p>
                <ul className="list-decimal list-inside space-y-2 ml-2 text-slate-700 font-medium">
                <li>Maniobras vagales (Valsalva, handgrip, masaje de seno carotídeo).</li>
                <li>Adenosina EV en bolo rápido (12–18 mg).</li>
                <li>Betabloqueantes o bloqueantes cálcicos EV si persiste.</li>
                <li>Flecainida o amiodarona como último escalón farmacológico.</li>
                <li>Cardioversión eléctrica sincrónica si fracasan las medidas previas.</li>
                </ul>
            </div>
            <p className="text-lg mt-4"><strong className="text-slate-800">QRS ancho (&gt; 120 ms):</strong> considerar taquicardia ventricular o TSV con aberrancia; el diagnóstico diferencial condiciona el tratamiento farmacológico específico.</p>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-4 bg-slate-100 p-3 border-l-4 border-slate-800 uppercase tracking-widest mt-12">3. EMERGENCIAS HIPERTENSIVAS EN LA GUARDIA</h2>
          <div className="space-y-6 mb-8">
            <p className="text-lg"><strong className="text-slate-800">Definición:</strong> presión arterial sistólica ≥ 180 mmHg y/o diastólica ≥ 110 mmHg, con o sin daño agudo de órgano blanco (DAOB).</p>
            <ul className="list-disc list-inside space-y-3 text-slate-700 text-lg">
              <li><strong>Urgencia hipertensiva (sin DAOB):</strong> normalización gradual con fármaco vía oral dentro de las 24 h; reevaluación tras 30 minutos de reposo.</li>
              <li><strong>Emergencia hipertensiva (con DAOB):</strong> descenso de la PA preferentemente con drogas endovenosas, con metas y velocidad de descenso específicas según el órgano comprometido.</li>
            </ul>

            <div className="overflow-x-auto mt-8 mb-8 border border-slate-200 rounded-2xl shadow-sm">
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="py-4 px-6 text-left font-bold uppercase tracking-widest text-xs">Cuadro clínico</th>
                    <th className="py-4 px-6 text-left font-bold uppercase tracking-widest text-xs">Meta / conducta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr><td className="py-4 px-6 font-bold text-slate-900">HTA maligna</td><td className="py-4 px-6">Descenso gradual, ≤25–50% de la PAM inicial en 2–6 h</td></tr>
                  <tr className="bg-slate-50"><td className="py-4 px-6 font-bold text-slate-900">Encefalopatía hipertensiva</td><td className="py-4 px-6">Descenso rápido con labetalol; PAS objetivo 140–90 mmHg</td></tr>
                  <tr><td className="py-4 px-6 font-bold text-slate-900">Síndrome coronario agudo</td><td className="py-4 px-6">Descenso gradual (20% en 1–3 h); NTG y betabloqueantes</td></tr>
                  <tr className="bg-slate-50"><td className="py-4 px-6 font-bold text-slate-900">Edema agudo de pulmón</td><td className="py-4 px-6">Oxígeno/VNI, vasodilatadores EV, diuréticos EV</td></tr>
                  <tr><td className="py-4 px-6 font-bold text-slate-900">Síndrome aórtico agudo</td><td className="py-4 px-6">Descenso rápido; PAS &lt; 120 mmHg, FC &lt; 65 lpm (betabloqueante + vasodilatador)</td></tr>
                  <tr className="bg-slate-50"><td className="py-4 px-6 font-bold text-slate-900">Preeclampsia/eclampsia</td><td className="py-4 px-6">PAS 140–110 / PAD 90–70 mmHg; sulfato de magnesio para prevención convulsiva</td></tr>
                  <tr><td className="py-4 px-6 font-bold text-slate-900">ACV isquémico</td><td className="py-4 px-6">Evitar hipotensión; umbral según elegibilidad para reperfusión</td></tr>
                  <tr className="bg-slate-50"><td className="py-4 px-6 font-bold text-slate-900">Insuficiencia renal aguda</td><td className="py-4 px-6">Descenso controlado con labetalol o nitroprusiato</td></tr>
                </tbody>
              </table>
            </div>

            <p className="mt-8 text-lg bg-indigo-50 border border-indigo-100 p-5 rounded-xl"><strong className="text-indigo-900">Fármacos de uso frecuente:</strong> <span className="text-indigo-800">labetalol, nitroglicerina, nitroprusiato de sodio, enalaprilato, nicardipina, hidralazina, clonidina, nifedipina</span> — con ajustes específicos según función renal/hepática y comorbilidad.</p>
          </div>

          <div className="mt-16 pt-6 border-t text-xs text-slate-400 font-sans uppercase tracking-widest font-bold">
            <p>Documento Oficial SAMSA</p>
          </div>
        </div>
    )
  },
  {
    id: 2,
    title: 'Manejo de Enfermedades Infecciosas (COVID/Dengue)',
    category: 'Infectología',
    date: '05/08/2026',
    description: 'Criterios de aislamiento, notificación obligatoria y esquemas de tratamiento sintomático.',
    icon: AlertCircle,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    content: null
  },
  {
    id: 3,
    title: 'Guía de Prescripción de Psicotrópicos',
    category: 'Administrativo',
    date: '20/07/2026',
    description: 'Requisitos para recetas archivadas, formularios oficiales y validación de coberturas.',
    icon: FileText,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    content: null
  },
  {
    id: 4,
    title: 'Atención Inicial al Paciente Pediátrico Traumatizado',
    category: 'Emergencias',
    date: '15/06/2026',
    description: 'Algoritmo ABCDE adaptado a pediatría, inmovilización y criterios de derivación.',
    icon: ShieldAlert,
    color: 'text-red-500',
    bg: 'bg-red-50',
    content: null
  },
  {
    id: 5,
    title: 'Manual de Uso del Sistema S.A.M.S.A',
    category: 'Tecnología',
    date: '01/01/2026',
    description: 'Instrucciones detalladas sobre carga de Historias Clínicas, firma digital y turnos.',
    icon: BookOpen,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    content: null
  },
];

const DoctorProtocols = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  const filteredProtocols = protocolsData.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      <div className="print:hidden flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProtocols.map(protocol => (
            <div 
                key={protocol.id} 
                onClick={() => protocol.content && setSelectedProtocol(protocol)}
                className={`bg-white rounded-3xl border border-slate-100 p-7 shadow-sm transition-all duration-300 group flex flex-col relative overflow-hidden ${protocol.content ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : 'opacity-80'}`}
            >
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
                <button 
                  onClick={(e) => {
                      if(protocol.content) {
                          e.stopPropagation();
                          setSelectedProtocol(protocol);
                      }
                  }}
                  className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-colors group/btn ${protocol.content ? 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100' : 'text-slate-400 bg-slate-50 cursor-not-allowed'}`}
                >
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

      {selectedProtocol && (
        <>

            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 print:hidden animate-fadeIn">
                <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[95vh] flex flex-col relative shadow-2xl overflow-hidden animate-slideUp">

                    <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50 shrink-0">
                        <div className="flex items-center gap-3">
                            <HeartPulse className="w-8 h-8 text-blue-600" />
                            <div>
                                <h3 className="font-black tracking-widest uppercase text-slate-800 text-sm">Biblioteca Médica SAMSA</h3>
                                <p className="text-xs font-bold text-slate-400">Documento Oficial</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => window.print()}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
                            >
                                <Printer className="w-4 h-4" /> Imprimir / PDF
                            </button>
                            <button 
                                onClick={() => setSelectedProtocol(null)}
                                className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-10 overflow-y-auto custom-scrollbar">
                        {selectedProtocol.content}
                    </div>
                </div>
            </div>

            <div className="hidden print:flex flex-col p-8 font-serif text-slate-900 bg-white w-full">
                <div className="flex justify-between items-end mb-8 border-b-2 border-slate-900 pb-6">
                    <div className="flex items-center gap-4">
                        <HeartPulse className="w-14 h-14 text-slate-900" strokeWidth={1.2} />
                        <div>
                            <h1 className="text-4xl tracking-[0.3em] font-medium text-slate-900 ml-1">SAMSA</h1>
                            <p className="text-xs text-slate-500 tracking-[0.2em] uppercase mt-1">Sistema de Salud Integral</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-slate-700 uppercase tracking-widest text-sm">Biblioteca Médica</p>
                        <p className="text-xs text-slate-500 mt-1">Impreso: {new Date().toLocaleDateString('es-AR')}</p>
                    </div>
                </div>

                <div className="my-4 flex-grow">
                    {selectedProtocol.content}
                </div>
            </div>
        </>
      )}

    </div>
  );
};

export default DoctorProtocols;
