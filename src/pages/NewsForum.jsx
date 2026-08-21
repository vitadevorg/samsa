import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Newspaper, Calendar, ArrowRight, X, HeartPulse, Activity, BellRing } from 'lucide-react';

const mockNews = [
    {
        id: 1,
        title: "El Poder del Sueño: Cómo 8 horas transforman tu sistema inmunológico",
        date: "20 de Agosto, 2026",
        category: "Salud Preventiva",
        image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=1000",
        icon: HeartPulse,
        content: (
            <>
                <p className="text-xl text-slate-500 mb-6 font-light leading-relaxed">El sueño no es un lujo, es una necesidad biológica. Durante las fases de sueño profundo, nuestro cuerpo realiza tareas críticas de mantenimiento que son imposibles durante la vigilia.</p>

                <h3 className="text-2xl font-bold text-slate-800 mt-8 mb-4">La reparación celular silenciosa</h3>
                <p className="mb-6">Mientras dormimos, el sistema inmunológico libera proteínas llamadas citocinas, algunas de las cuales ayudan a promover el sueño. Ciertas citocinas necesitan aumentar cuando tienes una infección o inflamación, o cuando estás bajo estrés. La falta de sueño puede disminuir la producción de estas citocinas protectoras.</p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-2xl my-8">
                    <h4 className="font-bold text-blue-800 mb-2">Consejos prácticos para un descanso óptimo:</h4>
                    <ul className="list-disc list-inside space-y-2 text-blue-900/80">
                        <li>Mantén un horario regular incluso los fines de semana.</li>
                        <li>Limita la exposición a pantallas 1 hora antes de dormir.</li>
                        <li>Mantén la habitación a una temperatura de entre 18°C y 20°C.</li>
                    </ul>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Fuentes y Recursos</p>
                    <p className="text-sm text-slate-500">National Sleep Foundation (2025). <em>The Link Between Sleep and Immunity</em>. Disponible en repositorio médico global.</p>
                </div>
            </>
        )
    },
    {
        id: 2,
        title: "Microbioma Intestinal: Tu segundo cerebro y cómo alimentarlo",
        date: "12 de Agosto, 2026",
        category: "Salud Preventiva",
        image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1000",
        icon: Activity,
        content: (
            <>
                <p className="text-xl text-slate-500 mb-6 font-light leading-relaxed">El intestino humano alberga billones de microorganismos que no solo regulan la digestión, sino que tienen un impacto directo en nuestra salud mental, inmunológica y metabólica.</p>

                <h3 className="text-2xl font-bold text-slate-800 mt-8 mb-4">El eje intestino-cerebro</h3>
                <p className="mb-6">Más del 90% de la serotonina (el neurotransmisor de la felicidad) se produce en el tracto gastrointestinal. Un microbioma desequilibrado, conocido como disbiosis, está estrechamente vinculado a cuadros de ansiedad, fatiga crónica e inflamación sistémica.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                        <h4 className="font-bold text-emerald-800 mb-2">Alimentos Probióticos</h4>
                        <p className="text-emerald-700/80 text-sm">Kéfir, kombucha, chucrut, kimchi y yogur natural. Introducen cepas bacterianas beneficiosas.</p>
                    </div>
                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                        <h4 className="font-bold text-indigo-800 mb-2">Alimentos Prebióticos</h4>
                        <p className="text-indigo-700/80 text-sm">Ajo, cebolla, espárragos, plátanos verdes y avena. Actúan como fertilizante para tu flora actual.</p>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Fuentes y Recursos</p>
                    <p className="text-sm text-slate-500">Gut Microbiome Research Institute (2026). <em>Dietary impact on the Gut-Brain Axis</em>.</p>
                </div>
            </>
        )
    },
    {
        id: 3,
        title: "Neuroplasticidad y Ejercicio: Prevención del deterioro cognitivo",
        date: "2 de Agosto, 2026",
        category: "Salud Preventiva",
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1000",
        icon: BellRing,
        content: (
            <>
                <p className="text-xl text-slate-500 mb-6 font-light leading-relaxed">El ejercicio físico regular es, hoy en día, la herramienta no farmacológica más potente para mantener el cerebro joven y prevenir enfermedades neurodegenerativas.</p>

                <h3 className="text-2xl font-bold text-slate-800 mt-8 mb-4">El milagro del BDNF</h3>
                <p className="mb-6">El ejercicio aeróbico estimula la liberación del Factor Neurotrófico Derivado del Cerebro (BDNF, por sus siglas en inglés). Esta proteína actúa como "fertilizante" para el cerebro, promoviendo el crecimiento de nuevas neuronas y fortaleciendo las sinapsis existentes, especialmente en el hipocampo, el centro de la memoria.</p>

                <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl my-8 text-center shadow-sm">
                    <Activity className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <h4 className="text-lg font-bold text-slate-800 mb-2">Dosis Recomendada</h4>
                    <p className="text-slate-600">Se recomiendan al menos 150 minutos a la semana de actividad aeróbica moderada, como caminata rápida, natación o ciclismo, para observar mejoras medibles en la neuroplasticidad.</p>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Fuentes y Recursos</p>
                    <p className="text-sm text-slate-500">Journal of Aging Neuroscience (2025). <em>Exercise-Induced Neurogenesis</em>.</p>
                </div>
            </>
        )
    }
];

const NewsForum = () => {
    const [selectedNote, setSelectedNote] = useState(null);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">

                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none opacity-50"></div>

                <div className="relative z-10 mb-12">
                    <div className="flex items-center gap-3 text-blue-600 mb-3">
                        <div className="bg-blue-100 p-2 rounded-xl">
                            <Newspaper className="w-6 h-6 text-blue-700" />
                        </div>
                        <span className="font-black tracking-widest uppercase text-sm text-blue-700">Comunidad SAMSA</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">Foro de Novedades</h1>
                    <p className="text-slate-500 mt-4 text-lg max-w-2xl">
                        Mantente informado con las últimas noticias de nuestra institución, avances médicos y consejos de salud preventiva redactados por nuestros profesionales.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                    {mockNews.map((news) => {
                        const IconComponent = news.icon;
                        return (
                            <div 
                                key={news.id} 
                                onClick={() => setSelectedNote(news)}
                                className="bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden cursor-pointer group hover:-translate-y-2 transition-all duration-300"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 shadow-sm">
                                        <IconComponent className="w-3.5 h-3.5" /> {news.category}
                                    </div>
                                    <img 
                                        src={news.image} 
                                        alt={news.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6">
                                    <p className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                        <Calendar className="w-4 h-4" /> {news.date}
                                    </p>
                                    <h3 className="text-xl font-bold text-slate-800 leading-tight mb-4 group-hover:text-blue-600 transition-colors">
                                        {news.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                                        Leer nota completa <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {selectedNote && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative animate-slideUp">

                        <button 
                            onClick={() => setSelectedNote(null)}
                            className="absolute top-6 right-6 w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors z-20 shadow-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="h-64 relative shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
                            <img src={selectedNote.image} alt={selectedNote.title} className="w-full h-full object-cover" />
                            <div className="absolute bottom-6 left-8 z-10 pr-8">
                                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 inline-block">
                                    {selectedNote.category}
                                </span>
                                <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                                    {selectedNote.title}
                                </h2>
                            </div>
                        </div>

                        <div className="p-8 md:p-10 overflow-y-auto">
                            <p className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 border-b pb-4">
                                <Calendar className="w-4 h-4" /> Publicado el {selectedNote.date}
                            </p>

                            <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-medium leading-relaxed">
                                <p>{selectedNote.content}</p>
                            </div>

                            <div className="mt-12 text-center">
                                <button 
                                    onClick={() => setSelectedNote(null)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold transition-colors"
                                >
                                    Cerrar y volver al foro
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default NewsForum;
