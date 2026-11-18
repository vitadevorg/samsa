import React, { useId } from 'react';
import { DOCUMENT_TYPES } from '../../data/institutions';
import { addYearsISO, MAX_EXPIRY_YEARS, errorBorder } from './clinicValidation';
import { needsExpiry } from './documentsForm';
import { Check, FileText } from 'lucide-react';

// Casilleros de la documentación del alta. `onChange(tipo, cambios)` actualiza un documento.
const DocumentsChecklist = ({ docs, errors, today, onChange, labelClass, inputClass, purpose = 'para crear la cuenta' }) => {
  const fieldId = useId();
  return (
    <fieldset className="border-t border-gray-100 pt-5">
      <legend className="font-bold text-gray-800 flex items-center gap-2 mb-1">
        <FileText className="w-5 h-5 text-blue-600"/> Documentación
      </legend>
      <p className="text-sm text-gray-500 mb-4">Obligatoria {purpose}: marcá los cuatro documentos como recibidos y cargá el vencimiento de los que vencen.</p>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
        {DOCUMENT_TYPES.map((type) => {
          const doc = docs[type];
          const checkId = `${fieldId}-doc-${type.replace(/\s+/g, '-')}`;
          return (
            <li key={type} className={`p-2 rounded-xl border transition ${doc.received ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 bg-white'}`}>
              <button
                id={checkId}
                type="button"
                role="checkbox"
                aria-checked={doc.received}
                onClick={() => onChange(type, { received: !doc.received, expiresAt: doc.received ? '' : doc.expiresAt })}
                className={`w-full min-h-[40px] px-3 py-2 rounded-lg flex items-center gap-2.5 text-sm font-medium text-left transition ${doc.received ? 'text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${doc.received ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'}`}>
                  {doc.received && <Check className="w-3.5 h-3.5" />}
                </span>
                <span className="font-bold">{type}</span>
                <span className={`ml-auto text-xs font-bold ${doc.received ? 'text-green-700' : 'text-amber-600'}`}>
                  {doc.received ? 'Recibido' : 'Pendiente'}
                </span>
              </button>
              {doc.received && needsExpiry(type) && (
                <div className="mt-2 px-3 pb-2">
                  <label htmlFor={`${checkId}-vence`} className={labelClass}>Vencimiento</label>
                  <input
                    id={`${checkId}-vence`}
                    type="date"
                    min={today}
                    max={addYearsISO(today, MAX_EXPIRY_YEARS)}
                    value={doc.expiresAt}
                    onChange={(e) => onChange(type, { expiresAt: e.target.value })}
                    aria-invalid={Boolean(errors[type])}
                    className={`${inputClass} ${errorBorder(errors[type])}`}
                  />
                  {errors[type] && <p role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors[type]}</p>}
                </div>
              )}
              {doc.received && !needsExpiry(type) && <p className="text-xs text-gray-500 ml-[2.625rem] pb-2">No vence.</p>}
              {!doc.received && errors[type] && <p role="alert" className="text-xs text-red-600 font-medium ml-[2.625rem] pr-3 pb-2">{errors[type]}</p>}
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
};

export default DocumentsChecklist;
