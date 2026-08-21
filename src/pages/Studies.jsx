import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, Eye, Calendar, Search, Activity, FileCheck, AlertCircle, HeartPulse, X, Printer } from 'lucide-react';
import Navbar from '../components/Navbar'; 
import { useAuth } from '../context/AuthContext';
const MedicalReport = ({ study, isPreview, user }) => {
    const transactionId = Math.random().toString(36).substring(2, 12).toUpperCase();
    return (
        <div className={`flex flex-col font-serif text-slate-900 bg-white mx-auto ${isPreview ? 'p-10 w-full max-w-4xl shadow-2xl min-h-[800px] my-10 relative z-10' : 'p-12 w-full max-w-none box-border absolute top-0 left-0 right-0 z-[99999] min-h-[100vh] hidden print:flex'}`} id={!isPreview ? 'print-area' : undefined}>
            <div className="flex justify-between items-end mb-8">
                <div className="flex items-center gap-4">
                    <HeartPulse className="w-14 h-14 text-slate-900" strokeWidth={1.2} />
                    <div>
                        <h1 className="text-4xl tracking-[0.3em] font-medium text-slate-900 ml-1">SAMSA</h1>
                        <p className="text-xs text-slate-500 tracking-[0.2em] uppercase mt-1">Sistema de Salud Integral</p>
                    </div>
                </div>
                <div className="text-right text-xs text-slate-500 space-y-1 mt-1 font-sans">
                    <p className="font-bold text-slate-700 text-sm">SAMSA Diagnóstico</p>
                    <p>Av. Aconquija 1024, 4000 Tucumán</p>
                    <p>Telf.: 0810-555-7267</p>
                    <p>www.samsa-salud.com.ar</p>
                </div>
            </div>
            <div className="text-[11px] text-slate-600 mb-6 font-sans space-y-1 uppercase">
                <p>MÉDICO INFORMANTE: {study.doctor}</p>
                <p>ADJUNTOS: Dr. M. Gómez, Dra. L. Sánchez</p>
                <p>NOTA INFORMATIVA PARA MÉDICOS PETICIONARIOS: Para consultar las imágenes o resultados completos, acceda a portal.samsa-salud.com.ar</p>
            </div>
            <div className="border-t-2 border-b-2 border-slate-900 py-4 mb-10 text-[13px] font-sans grid grid-cols-[120px_1fr] gap-y-1.5 uppercase">
                <div className="font-bold">Fecha:</div>
                <div className="font-bold">{study.date.split('-').reverse().join('/')}</div>
                <div className="font-bold">Nombre:</div>
                <div className="font-bold">{user?.lastname || "PACIENTE"}, {user?.name || "ANONIMO"} ({user?.dni || "S/DNI"})</div>
                <div className="font-bold">Código:</div>
                <div className="font-bold">{transactionId}</div>
                <div className="font-bold">Edad:</div>
                <div className="font-bold">
                    {user?.dob ? (() => {
                        const birth = new Date(user.dob);
                        const now = new Date();
                        let age = now.getFullYear() - birth.getFullYear();
                        if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
                            age--;
                        }
                        return `${age} AÑOS`;
                    })() : "NO ESPECIFICADA"}
                </div>
                <div className="font-bold">Procedencia:</div>
                <div className="font-bold">{user?.insurance || "PARTICULAR"}</div>
            </div>
            <h2 className="text-center text-2xl font-bold uppercase tracking-widest mb-10 font-serif">{study.title}</h2>
            <div className="flex-1 font-serif text-[15px] text-slate-900 leading-relaxed space-y-6 text-justify">
                {study.type === 'Laboratorio' && study.title.includes('Sangre') && (
                    <div className="space-y-8 mt-6">
                        {[
                            { 
                                category: "HEMOGRAMA - Recuento Globular e Índices", 
                                items: [
                                    { name: "Hematíes", result: "4.110.000", unit: "/mm3", ref: "4.000.000 - 5.500.000", status: "normal" },
                                    { name: "Leucocitos", result: "8.500", unit: "/mm3", ref: "4.000 - 10.000", status: "normal" },
                                    { name: "Volumen Globular", result: "38", unit: "%", ref: "41 - 46 (Mujer/Varón)", status: "low" },
                                    { name: "Hemoglobina", result: "12,5", unit: "g/dL", ref: "12,0 - 16,0", status: "normal" },
                                ]
                            },
                            { 
                                category: "FÓRMULA LEUCOCITARIA", 
                                items: [
                                    { name: "Neutrófilos - Mielocitos", result: "0", unit: "%", ref: "0", status: "normal" },
                                    { name: "Neutrófilos - Metamielocitos", result: "1", unit: "%", ref: "0 - 1", status: "normal" },
                                    { name: "Neutrófilos - En cayado", result: "1", unit: "%", ref: "3 - 5", status: "low" },
                                    { name: "Neutrófilos - Segmentado", result: "42", unit: "%", ref: "55 - 67", status: "low" },
                                    { name: "Eosinófilos", result: "5", unit: "%", ref: "2 - 4", status: "high" },
                                    { name: "Basófilos", result: "0", unit: "%", ref: "0 - 1", status: "normal" },
                                    { name: "Monocitos", result: "3", unit: "%", ref: "4 - 8", status: "low" },
                                    { name: "Linfocitos", result: "48", unit: "%", ref: "20 - 30", status: "high" },
                                ]
                            },
                            { 
                                category: "QUÍMICA CLÍNICA", 
                                items: [
                                    { name: "Glucemia", result: "0,73", unit: "g/l", ref: "0,70 - 1,10", status: "normal" },
                                    { name: "Calcemia", result: "8,8", unit: "mg/l", ref: "8,5 - 10,5", status: "normal" },
                                    { name: "Proteínas Totales", result: "8,72", unit: "g/dl", ref: "6,0 - 8,0", status: "high" },
                                    { name: "Uremia", result: "0,25", unit: "g/l", ref: "Hasta 0,45", status: "normal" },
                                ]
                            }
                        ].map((section, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm break-inside-avoid">
                                <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
                                    <h4 className="font-bold text-slate-700 tracking-widest text-sm uppercase">{section.category}</h4>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {section.items.map((item, itemIdx) => (
                                        <div key={itemIdx} className="px-6 py-2.5 grid grid-cols-12 items-center gap-4 hover:bg-slate-50/50 transition-colors">
                                            <div className="col-span-5 font-sans">
                                                <p className="font-semibold text-slate-800">{item.name}</p>
                                            </div>
                                            <div className="col-span-3 flex items-baseline gap-1">
                                                <span className={`text-[17px] font-bold ${item.status === 'normal' ? 'text-slate-900' : item.status === 'high' ? 'text-red-600' : 'text-blue-600'}`}>
                                                    {item.result} {item.status !== 'normal' && '*'}
                                                </span>
                                                <span className="text-xs text-slate-500 font-sans">{item.unit}</span>
                                            </div>
                                            <div className="col-span-4 flex items-center justify-between">
                                                <div className="text-[11px] text-slate-500 font-sans">
                                                    Ref: <span className="font-medium">{item.ref}</span>
                                                </div>
                                                <div>
                                                    {item.status === 'normal' ? (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px] font-bold tracking-wider uppercase border border-green-200 shadow-sm">Normal</span>
                                                    ) : item.status === 'high' ? (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[9px] font-bold tracking-wider uppercase border border-red-200 shadow-sm animate-pulse">Elevado</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-bold tracking-wider uppercase border border-blue-200 shadow-sm">Disminuido</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {study.type === 'Laboratorio' && study.title.includes('Orina') && (
                    <div className="space-y-8 mt-6">
                        {[
                            { 
                                category: "EXAMEN FÍSICO", 
                                items: [
                                    { name: "Color", result: "Amarillo ámbar", unit: "", ref: "Amarillo ámbar", status: "normal" },
                                    { name: "Aspecto", result: "Límpido", unit: "", ref: "Límpido", status: "normal" },
                                    { name: "Espuma", result: "Blanca", unit: "", ref: "Blanca", status: "normal" },
                                    { name: "Sedimento", result: "Escaso", unit: "", ref: "Escaso", status: "normal" },
                                    { name: "Reacción", result: "Ácida", unit: "", ref: "Ácida", status: "normal" },
                                    { name: "Densidad", result: "1021", unit: "", ref: "1010 - 1030", status: "normal" },
                                ]
                            },
                            { 
                                category: "EXAMEN QUÍMICO", 
                                items: [
                                    { name: "Proteínas", result: "No Contiene", unit: "", ref: "No Contiene", status: "normal" },
                                    { name: "Glucosa", result: "No Contiene", unit: "", ref: "No Contiene", status: "normal" },
                                    { name: "Cuerpos Cetónicos", result: "No Contiene", unit: "", ref: "No Contiene", status: "normal" },
                                    { name: "Pigmentos biliares", result: "No Contiene", unit: "", ref: "No Contiene", status: "normal" },
                                    { name: "Sangre / Hemoglobina", result: "No Contiene", unit: "", ref: "No Contiene", status: "normal" },
                                ]
                            },
                            { 
                                category: "OBSERVACIÓN MICROSCÓPICA", 
                                items: [
                                    { name: "Mucus", result: "Escaso", unit: "", ref: "Normal: Escaso", status: "normal" },
                                    { name: "Células", result: "Escasas", unit: "", ref: "Normal: Escasas", status: "normal" },
                                    { name: "Leucocitos", result: "2-3", unit: "x CPO", ref: "0 - 5 x CPO", status: "normal" },
                                    { name: "Eritrocitos", result: "0-1", unit: "x CPO", ref: "0 - 2 x CPO", status: "normal" },
                                ]
                            }
                        ].map((section, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm break-inside-avoid">
                                <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
                                    <h4 className="font-bold text-slate-700 tracking-widest text-sm uppercase">{section.category}</h4>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {section.items.map((item, itemIdx) => (
                                        <div key={itemIdx} className="px-6 py-2.5 grid grid-cols-12 items-center gap-4 hover:bg-slate-50/50 transition-colors">
                                            <div className="col-span-5 font-sans">
                                                <p className="font-semibold text-slate-800">{item.name}</p>
                                            </div>
                                            <div className="col-span-3 flex items-baseline gap-1">
                                                <span className={`text-[15px] font-bold ${item.status === 'normal' ? 'text-slate-900' : 'text-red-600'}`}>
                                                    {item.result} {item.status !== 'normal' && '*'}
                                                </span>
                                                <span className="text-xs text-slate-500 font-sans">{item.unit}</span>
                                            </div>
                                            <div className="col-span-4 flex items-center justify-between">
                                                <div className="text-[11px] text-slate-500 font-sans">
                                                    Ref: <span className="font-medium">{item.ref}</span>
                                                </div>
                                                <div>
                                                    {item.status === 'normal' && (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px] font-bold tracking-wider uppercase border border-green-200 shadow-sm">Normal</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {(study.type === 'Imágenes' || study.type === 'Cardiología') && (
                    <div className="space-y-4 text-justify mt-8">
                        <p><strong>Técnica:</strong> Estudio realizado bajo protocolos estandarizados con equipo de alta resolución. Imágenes obtenidas con excelente calidad técnica.</p>
                        <p><strong>Hallazgos:</strong> Las estructuras anatómicas evaluadas presentan morfología, tamaño y señal/ecogenicidad dentro de los parámetros normales. No se observan imágenes focales ni difusas de carácter patológico. Relaciones anatómicas conservadas. Ausencia de colecciones o líquido libre.</p>
                        <p><strong>Conclusión:</strong> Estudio dentro de parámetros fisiológicos conservados, sin evidencia de hallazgos patológicos agudos al momento del examen. Se sugiere correlación con clínica y antecedentes del paciente.</p>
                    </div>
                )}
                <div className="mt-20 pt-8 flex justify-end">
                    <div className="text-center">
                        <div className="w-48 h-16 border-b border-slate-400 mb-2 relative">
                            <div className="absolute inset-0 flex items-center justify-center -rotate-6">
                                <span className="font-['Brush_Script_MT',cursive,serif] text-3xl text-blue-900 opacity-80">{study.doctor.split(' ').slice(1).join(' ')}</span>
                            </div>
                        </div>
                        <p className="text-sm font-bold">{study.doctor}</p>
                        <p className="text-xs text-slate-500 uppercase">Médico Especialista</p>
                        <p className="text-xs text-slate-500">M.P. {Math.floor(Math.random() * 9000) + 1000}</p>
                    </div>
                </div>
            </div>
            <div className="border-t-2 border-slate-900 pt-4 mt-16 text-justify text-[10px] text-slate-500 font-sans print:mt-auto">
                <p className="mb-2">
                    <strong>AVISO LEGAL Y CONFIDENCIALIDAD:</strong> Este documento contiene información médica protegida por el secreto profesional y la Ley de Protección de Datos Personales (Ley N° 25.326). Queda estrictamente prohibida su reproducción, distribución o divulgación no autorizada. El presente informe tiene carácter complementario y debe ser interpretado exclusivamente por el profesional médico tratante en el contexto clínico del paciente.
                </p>
                <p className="text-center font-bold tracking-[0.2em] uppercase mt-4 text-xs text-slate-900">
                    SAMSA - Departamento de Diagnóstico
                </p>
            </div>
        </div>
    );
};
const Studies = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [previewStudy, setPreviewStudy] = useState(null);
  const [printStudy, setPrintStudy] = useState(null);
  const studies = [
    { id: 1, title: "Análisis de Sangre Completo", date: "2025-10-20", doctor: "Dr. Rocha", doctorId: "carlos-rodriguez", status: "Disponible", type: "Laboratorio" },
    { id: 5, title: "Análisis de Orina Completo", date: "2025-10-21", doctor: "Dr. Rocha", doctorId: "carlos-rodriguez", status: "Disponible", type: "Laboratorio" },
    { id: 2, title: "Radiografía de Tórax", date: "2025-09-15", doctor: "Dra. Etna Herrera", doctorId: "sofia-bermudez", status: "Disponible", type: "Imágenes" },
    { id: 3, title: "Ecografía Abdominal", date: "2025-08-01", doctor: "Dra. Emilse Romano", doctorId: "laura-quiroga", status: "Disponible", type: "Imágenes" },
    { id: 4, title: "Electrocardiograma", date: "2025-11-01", doctor: "Dr. Jesús Zelarayan", doctorId: "juan-perez", status: "Pendiente", type: "Cardiología" },
  ];
  const filteredStudies = studies.filter(study => 
    study.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handlePreview = (study) => {
      setPreviewStudy(study);
  };
  const handlePrint = (study) => {
      setPrintStudy(study);
      setTimeout(() => {
          const originalTitle = document.title;
          document.title = `samsa_estudio_${study.title.replace(/\s+/g, '_')}_${study.date}`;
          window.print();
          document.title = originalTitle;
          setTimeout(() => setPrintStudy(null), 500);
      }, 100);
  };
  return (
    <div className="font-sans text-slate-800 bg-gray-50 min-h-screen print:bg-white">
      <div className="print:hidden">
        <Navbar /> 
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    Mis Estudios
                </h1>
                <p className="mt-2 text-gray-500">Historial de informes y resultados médicos.</p>
            </div>
            <div className="relative w-full md:w-96">
                <input 
                    type="text" 
                    placeholder="Buscar estudio..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-6">
            {filteredStudies.map((study) => (
                <div key={study.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${study.status === 'Disponible' ? 'bg-green-50' : 'bg-orange-50'}`}>
                            {study.type === 'Laboratorio' ? <Activity className={`w-6 h-6 ${study.status === 'Disponible' ? 'text-green-600' : 'text-orange-600'}`} /> : 
                             study.type === 'Cardiología' ? <HeartPulse className={`w-6 h-6 ${study.status === 'Disponible' ? 'text-green-600' : 'text-orange-600'}`} /> : 
                             <FileCheck className={`w-6 h-6 ${study.status === 'Disponible' ? 'text-green-600' : 'text-orange-600'}`} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{study.title}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {study.date}</span>
                                <span className="flex items-center gap-1">
                                    👨‍⚕️ 
                                    <Link to={`/professionals/${study.doctorId}`} className="hover:underline hover:text-blue-800 transition-all">
                                        {study.doctor}
                                    </Link>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-end">
                        {study.status === 'Disponible' ? (
                            <>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                    Disponible
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => handlePreview(study)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Ver Vista Previa">
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handlePrint(study)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">
                                        <Download className="w-4 h-4" /> Descargar
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Procesando
                                </span>
                                <button disabled className="text-gray-300 cursor-not-allowed px-4 py-2 font-medium">
                                    No disponible
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>
      </div>
      {previewStudy && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/80 backdrop-blur-sm overflow-y-auto print:hidden animate-fadeIn">
            <div className="w-full max-w-5xl py-10 px-4 min-h-screen flex flex-col items-center relative">
                <div className="sticky top-4 right-4 self-end z-20 flex gap-3 mb-4">
                    <button onClick={() => handlePrint(previewStudy)} className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-blue-700 transition flex items-center gap-2">
                        <Printer className="w-5 h-5" /> Imprimir / PDF
                    </button>
                    <button onClick={() => setPreviewStudy(null)} className="bg-white text-slate-700 p-2.5 rounded-full font-bold shadow-lg hover:bg-slate-100 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="w-full animate-slideUp">
                    <MedicalReport study={previewStudy} isPreview={true} user={user} />
                </div>
            </div>
        </div>
      )}
      {printStudy && (
          <MedicalReport study={printStudy} isPreview={false} user={user} />
      )}
    </div>
  );
};
export default Studies;