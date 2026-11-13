import React, { useEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { LEGAL_DOCS } from '../data/legalTexts';

const Section = ({ id, heading, items }) => (
    <section id={id} className="scroll-mt-28">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">{heading}</h2>
        <div className="space-y-5">
            {items.map((item, index) => {
                const paragraphs = Array.isArray(item.text) ? item.text : [item.text];
                return (
                    <div key={item.title}>
                        <h3 className="text-base font-bold text-gray-900 mb-1.5">{index + 1}. {item.title}</h3>
                        <div className="space-y-2">
                            {paragraphs.map(paragraph => (
                                <p key={paragraph} className="text-gray-600 text-sm leading-relaxed">{paragraph}</p>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    </section>
);

// Página de Términos y Política de Privacidad. Una por pantalla: /terms/:slug
const LegalDocument = () => {
    const { slug } = useParams();
    const { hash } = useLocation();
    const doc = LEGAL_DOCS[slug];

    useEffect(() => {
        if (!doc) return;
        const target = hash ? document.getElementById(hash.slice(1)) : null;
        if (target) target.scrollIntoView();
        else window.scrollTo(0, 0);
    }, [doc, hash, slug]);

    if (!doc) return <Navigate to="/" replace />;

    return (
        <div className="font-sans text-slate-800 bg-white min-h-screen selection:bg-blue-100 selection:text-blue-900 flex flex-col overflow-x-hidden">
            <Navbar />
            <main className="flex-1 pt-8 sm:pt-12 lg:pt-16 pb-16 sm:pb-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10 sm:mb-14">
                        <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <ShieldCheck className="w-7 h-7 text-blue-600" />
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.15]">
                            {doc.title}
                        </h1>
                        <p className="text-gray-500 text-sm sm:text-base leading-relaxed mt-4">{doc.subtitle}</p>
                        <p className="text-gray-400 text-xs mt-2">Última actualización: {doc.updatedAt}</p>
                    </div>
                    <div className="space-y-12 sm:space-y-16">
                        <Section id="terminos" heading="Términos y Condiciones" items={doc.terms} />
                        <Section id="privacidad" heading="Política de Privacidad" items={doc.privacy} />
                    </div>
                </div>
            </main>
            <Footer theme="light" />
        </div>
    );
};

export default LegalDocument;
