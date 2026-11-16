import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/useAuth';
import { useForum } from '../context/useForum';
import { ROLES } from '../constants/roles';
import { getDoctorLabel, stripTitle } from '../utils/doctorName';
import { useTimeouts } from '../hooks/useTimeouts';
import ForumPostModal from './forum/ForumPostModal';
import { formatPostDate } from './forum/forumPosts';
import {
    Newspaper, Calendar, ArrowRight, X, HeartPulse, Activity, BellRing,
    Plus, Pencil, Trash2, Stethoscope, CheckCircle, UserRound,
} from 'lucide-react';

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

// Nota escrita por un médico -> mismo formato que las notas fijas del foro.
const toNewsItem = (post) => ({
    id: post.id,
    title: post.title,
    category: post.category,
    image: post.image,
    icon: Stethoscope,
    date: formatPostDate(post.createdAt),
    edited: Boolean(post.updatedAt),
    authorName: post.authorName,
    post,
});

// Portada de una nota sin imagen.
const CoverPlaceholder = ({ className = '' }) => (
    <div className={`w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center ${className}`}>
        <Stethoscope className="w-16 h-16 text-white/40" />
    </div>
);

const PostBody = ({ body }) => (
    <>
        {body.split(/\n\s*\n/).map((paragraph, i) => (
            <p key={i} className="mb-6 whitespace-pre-line break-words">{paragraph}</p>
        ))}
    </>
);

const NewsForum = () => {
    const { user } = useAuth();
    const { posts, addPost, updatePost, deletePost, isOwnPost } = useForum();
    const { schedule } = useTimeouts();
    const isDoctor = user?.role === ROLES.DOCTOR;

    const [selectedId, setSelectedId] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all' | 'mine' (solo médicos)
    const [editor, setEditor] = useState(null); // null | { post?: publicación a editar }
    const [postToDelete, setPostToDelete] = useState(null);
    const [toast, setToast] = useState(null);

    const isOwn = (item) => isDoctor && Boolean(item.post) && isOwnPost(item.post, user.email);
    const doctorItems = posts.map(toNewsItem);
    const allItems = [...doctorItems, ...mockNews];
    const visibleItems = filter === 'mine' ? doctorItems.filter(isOwn) : allItems;
    const selectedNote = allItems.find((item) => item.id === selectedId) ?? null;
    const ownCount = doctorItems.filter(isOwn).length;

    const showToast = (message) => {
        setToast(message);
        schedule(() => setToast(null), 3000);
    };

    const handleSubmitPost = (data) => {
        if (editor?.post) {
            updatePost(editor.post.id, data, user.email);
            showToast('Los cambios de tu publicación se guardaron.');
        } else {
            // "Dra. Gómez" no alcanza como firma: se muestra título + nombre completo.
            const authorName = `${getDoctorLabel(user).split(' ')[0]} ${stripTitle(user.name)}`;
            addPost(data, { email: user.email, name: authorName });
            setFilter('all');
            showToast('Tu nota ya está publicada en el foro.');
        }
        setEditor(null);
    };

    const handleConfirmDelete = () => {
        deletePost(postToDelete.id, user.email);
        if (selectedId === postToDelete.id) setSelectedId(null);
        setPostToDelete(null);
        showToast('La publicación se eliminó del foro.');
    };

    const editButtonClass = 'inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors';
    const deleteButtonClass = 'inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">

                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none opacity-50"></div>

                <div className="relative z-10 mb-8 sm:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 text-blue-600 mb-3">
                            <div className="bg-blue-100 p-2 rounded-xl">
                                <Newspaper className="w-6 h-6 text-blue-700" />
                            </div>
                            <span className="font-black tracking-widest uppercase text-sm text-blue-700">Comunidad SAMSA</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight">Foro de Novedades</h1>
                        <p className="text-slate-500 mt-4 text-base sm:text-lg max-w-2xl">
                            {isDoctor
                                ? 'Compartí tu experiencia con la comunidad SAMSA. Cada nota que publicás contribuye a que te conozcan más pacientes.'
                                : 'Mantente informado con las últimas noticias de nuestra institución, avances médicos y consejos de salud preventiva redactados por nuestros profesionales.'}
                        </p>
                    </div>
                    {isDoctor && (
                        <button
                            type="button"
                            onClick={() => setEditor({})}
                            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4 text-base font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-500/30 group"
                        >
                            <Plus className="mr-2 w-5 h-5 group-hover:rotate-90 transition-transform" />
                            Publicar
                        </button>
                    )}
                </div>

                {isDoctor && (
                    <div className="relative z-10 mb-6 sm:mb-8 flex gap-2" role="tablist" aria-label="Filtrar publicaciones">
                        {[{ key: 'all', label: 'Todas' }, { key: 'mine', label: `Mis publicaciones (${ownCount})` }].map(({ key, label }) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={filter === key}
                                onClick={() => setFilter(key)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filter === key ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}

                {visibleItems.length === 0 ? (
                    <div className="relative z-10 bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-12 text-center">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Newspaper className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-800">Todavía no publicaste notas</h3>
                        <p className="text-slate-500 mt-2 mb-6">Compartí consejos o novedades con los pacientes de SAMSA.</p>
                        <button type="button" onClick={() => setEditor({})} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition">
                            <Plus className="w-5 h-5" /> Publicar mi primera nota
                        </button>
                    </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative z-10">
                    {visibleItems.map((news) => {
                        const IconComponent = news.icon;
                        const own = isOwn(news);
                        return (
                            <article
                                key={news.id}
                                className="bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group hover:-translate-y-2 transition-all duration-300 flex flex-col"
                            >
                                <button type="button" onClick={() => setSelectedId(news.id)} className="text-left flex-1 flex flex-col cursor-pointer">
                                    <div className="h-48 w-full overflow-hidden relative">
                                        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 shadow-sm">
                                            <IconComponent className="w-3.5 h-3.5" /> {news.category}
                                        </div>
                                        {own && (
                                            <div className="absolute top-4 right-4 z-10 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                                Tu publicación
                                            </div>
                                        )}
                                        {news.image ? (
                                            <img
                                                src={news.image}
                                                alt={news.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <CoverPlaceholder className="group-hover:scale-105 transition-transform duration-500" />
                                        )}
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <p className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                            <Calendar className="w-4 h-4" /> {news.date}{news.edited && ' · Editada'}
                                        </p>
                                        <h3 className="text-xl font-bold text-slate-800 leading-tight mb-3 group-hover:text-blue-600 transition-colors break-words">
                                            {news.title}
                                        </h3>
                                        {news.authorName && (
                                            <p className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
                                                <UserRound className="w-4 h-4 shrink-0" /> Por {news.authorName}
                                            </p>
                                        )}
                                        <div className="mt-auto flex items-center gap-2 text-sm font-bold text-blue-600">
                                            Leer nota completa <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </button>
                                {own && (
                                    <div className="px-6 pb-6 flex gap-2">
                                        <button type="button" onClick={() => setEditor({ post: news.post })} className={`flex-1 ${editButtonClass}`}>
                                            <Pencil className="w-4 h-4" /> Editar
                                        </button>
                                        <button type="button" onClick={() => setPostToDelete(news.post)} className={`flex-1 ${deleteButtonClass}`}>
                                            <Trash2 className="w-4 h-4" /> Borrar
                                        </button>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
                )}
            </main>

            {selectedNote && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={selectedNote.title}
                    onClick={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn"
                >
                    <div className="bg-white rounded-3xl sm:rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative animate-slideUp">

                        <button
                            type="button"
                            onClick={() => setSelectedId(null)}
                            aria-label="Cerrar"
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors z-20 shadow-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="h-48 sm:h-64 relative shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
                            {selectedNote.image
                                ? <img src={selectedNote.image} alt={selectedNote.title} className="w-full h-full object-cover" />
                                : <CoverPlaceholder />}
                            <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-8 z-10 pr-5 sm:pr-8">
                                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 inline-block">
                                    {selectedNote.category}
                                </span>
                                <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white leading-tight break-words">
                                    {selectedNote.title}
                                </h2>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 md:p-10 overflow-y-auto">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 border-b pb-4">
                                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Publicado el {selectedNote.date}{selectedNote.edited && ' · Editada'}</span>
                                {selectedNote.authorName && (
                                    <span className="flex items-center gap-2 normal-case tracking-normal text-slate-500"><UserRound className="w-4 h-4" /> {selectedNote.authorName}</span>
                                )}
                            </div>

                            <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-medium leading-relaxed">
                                {selectedNote.post ? <PostBody body={selectedNote.post.body} /> : selectedNote.content}
                            </div>

                            <div className="mt-12 flex flex-col sm:flex-row sm:justify-center gap-3">
                                {isOwn(selectedNote) && (
                                    <>
                                        <button type="button" onClick={() => setEditor({ post: selectedNote.post })} className={`${editButtonClass} px-6 py-3`}>
                                            <Pencil className="w-4 h-4" /> Editar
                                        </button>
                                        <button type="button" onClick={() => setPostToDelete(selectedNote.post)} className={`${deleteButtonClass} px-6 py-3`}>
                                            <Trash2 className="w-4 h-4" /> Borrar
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setSelectedId(null)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold transition-colors"
                                >
                                    Cerrar y volver al foro
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editor && (
                <ForumPostModal
                    key={editor.post?.id ?? 'new'}
                    post={editor.post}
                    onCancel={() => setEditor(null)}
                    onSubmit={handleSubmitPost}
                />
            )}

            <div className="relative z-[110]">
                <ConfirmModal
                    isOpen={postToDelete !== null}
                    onClose={() => setPostToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title="¿Borrar publicación?"
                    message={postToDelete ? `"${postToDelete.title}" se quitará del foro para todos los usuarios.` : ''}
                    confirmLabel="Sí, borrar"
                />
            </div>

            {toast && (
                <div role="status" className="fixed inset-x-0 bottom-6 z-[120] flex justify-center px-4 pointer-events-none">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 relative overflow-hidden flex items-center gap-4 max-w-sm w-full animate-fadeIn pointer-events-auto">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
                        <div className="bg-green-100 rounded-full p-2 ml-2 shrink-0">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="flex-1 text-gray-800 font-semibold text-sm">{toast}</p>
                        <button type="button" onClick={() => setToast(null)} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600 shrink-0">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default NewsForum;
