import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, X } from 'lucide-react';
import { LEGAL_DOCS } from '../data/legalTexts';

const Section = ({ heading, items, dark }) => (
    <section>
        <h3 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>{heading}</h3>
        <div className="space-y-4">
            {items.map((item, index) => {
                const paragraphs = Array.isArray(item.text) ? item.text : [item.text];
                return (
                    <div key={item.title}>
                        <h4 className={`text-sm font-bold mb-1 ${dark ? 'text-slate-200' : 'text-gray-900'}`}>{index + 1}. {item.title}</h4>
                        <div className="space-y-1.5">
                            {paragraphs.map(paragraph => (
                                <p key={paragraph} className={`text-sm leading-relaxed ${dark ? 'text-slate-400' : 'text-gray-600'}`}>{paragraph}</p>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    </section>
);

// Ventana flotante con los Términos y la Política de Privacidad de una pantalla (ver legalTexts.js).
// Se monta en <body> y queda por encima de otros modales (ej. la solicitud de adhesión profesional).
const LegalModal = ({ doc, onClose, dark = false }) => {
    const titleId = useId();
    const content = LEGAL_DOCS[doc];

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    if (!content) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm animate-fadeIn ${dark ? 'bg-slate-950/80' : 'bg-slate-900/60'}`}
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border animate-scaleIn ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
            >
                <div className={`flex items-start gap-4 p-5 sm:p-6 border-b ${dark ? 'border-slate-800 bg-slate-900/50' : 'border-gray-100'}`}>
                    <div className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center border ${dark ? 'bg-blue-500/20 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                        <ShieldCheck className={`w-6 h-6 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 id={titleId} className={`text-lg sm:text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{content.title}</h2>
                        <p className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>Última actualización: {content.updatedAt}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className={`p-2 rounded-full transition-colors ${dark ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-8">
                    <p className={`text-sm leading-relaxed ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{content.subtitle}</p>
                    <Section heading="Términos y Condiciones" items={content.terms} dark={dark} />
                    <Section heading="Política de Privacidad" items={content.privacy} dark={dark} />
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LegalModal;
