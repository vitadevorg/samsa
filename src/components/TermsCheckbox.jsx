import React, { useId, useState } from 'react';
import { LEGAL_DOCS } from '../data/legalTexts';
import LegalModal from './LegalModal';

// Check de aceptación de Términos y Política de Privacidad (siempre arranca desmarcado: el estado
// vive en la pantalla que lo usa). `doc` es el slug del texto legal de esa pantalla (ver legalTexts.js).
// El link abre el texto en una ventana flotante, así no se pierde lo ya cargado en el formulario.
const TermsCheckbox = ({ doc, checked, onChange, dark = false, className = '' }) => {
    const id = useId();
    const [isLegalOpen, setIsLegalOpen] = useState(false);
    const { checkbox } = LEGAL_DOCS[doc];
    const textClass = dark ? 'text-slate-300' : 'text-slate-600';
    const linkClass = `font-medium underline underline-offset-2 text-left ${dark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`;
    const boxClass = dark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50';

    const openLegal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLegalOpen(true);
    };

    return (
        <div className={className}>
            <label htmlFor={id} className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition ${boxClass}`}>
                <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="mt-0.5 w-4 h-4 shrink-0 accent-blue-600 cursor-pointer"
                />
                <span className={`text-xs leading-relaxed ${textClass}`}>
                    {checkbox.lead}{' '}
                    <button type="button" onClick={openLegal} className={linkClass}>
                        los Términos y Condiciones y la Política de Privacidad
                    </button>
                    .
                </span>
            </label>
            {isLegalOpen && <LegalModal doc={doc} dark={dark} onClose={() => setIsLegalOpen(false)} />}
        </div>
    );
};

export default TermsCheckbox;
