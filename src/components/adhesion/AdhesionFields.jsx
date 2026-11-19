import React, { useId } from 'react';
import { Check, File as FileIcon, Image as ImageIcon, X } from 'lucide-react';
import { WEEK_DAYS } from '../../constants/catalog';
import { formatBytes } from './adhesionForms';
import { labelClass, inputClass } from './adhesionStyles';

// Piezas del formulario oscuro de la solicitud de adhesión (mismo estilo que la sección B2B de la Home).

export const ErrorText = ({ id, children }) => (children
  ? <p id={id} role="alert" className="text-xs font-medium text-red-400 mt-1.5">{children}</p>
  : null);

// Campo con etiqueta, ayuda opcional y mensaje de error enlazados al control (`children(props)`).
export const Field = ({ label, error, hint, className = '', children }) => {
  const id = useId();
  const describedBy = `${id}-desc`;
  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className={labelClass}>{label}</label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy, className: inputClass(error) })}
      {error
        ? <ErrorText id={describedBy}>{error}</ErrorText>
        : hint ? <p id={describedBy} className="text-xs font-medium text-slate-500 mt-1.5">{hint}</p> : null}
    </div>
  );
};

// Título de cada paso con su número.
export const StepTitle = ({ number, children }) => (
  <h3 className="text-lg sm:text-xl font-bold text-white mb-5 sm:mb-6 flex items-center gap-3">
    <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0">{number}</span>
    {children}
  </h3>
);

// Días de atención (botones redondos, como en el alta del médico particular del admin SAMSA).
export const DaysPicker = ({ value, onChange, hasError }) => {
  const id = useId();
  const toggle = (day) => {
    const next = value.includes(day) ? value.filter((d) => d !== day) : [...value, day];
    onChange(WEEK_DAYS.filter((d) => next.includes(d)));
  };
  return (
    <div>
      <p id={id} className={labelClass}>Días de atención</p>
      <div role="group" aria-labelledby={id} className="flex flex-wrap gap-2">
        {WEEK_DAYS.map((day) => {
          const active = value.includes(day);
          return (
            <button
              key={day}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(day)}
              className={`w-11 h-11 rounded-full text-xs font-bold flex items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 scale-105'
                : `bg-slate-950 border text-slate-400 hover:text-white hover:border-slate-600 ${hasError ? 'border-red-500/60' : 'border-slate-800'}`}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Opciones excluyentes en botones grandes (ej. Clínica / Hospital).
export const SegmentedChoice = ({ label, options, value, onChange }) => {
  const id = useId();
  return (
    <div>
      <p id={id} className={labelClass}>{label}</p>
      <div role="radiogroup" aria-labelledby={id} className="grid grid-cols-2 gap-3">
        {options.map(({ value: optionValue, label: optionLabel, Icon }) => {
          const active = value === optionValue;
          return (
            <button
              key={optionValue}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(optionValue)}
              className={`min-h-[52px] border rounded-xl px-4 py-3 font-bold flex items-center justify-center gap-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${active
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'}`}
            >
              {Icon && <Icon className="w-5 h-5 shrink-0" />}
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Casilla oscura (ej. inscripción en ARCA).
export const CheckField = ({ checked, onChange, error, children }) => {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className={`flex items-start gap-3 min-h-[48px] p-3 rounded-xl border cursor-pointer transition ${checked
          ? 'bg-emerald-500/10 border-emerald-500/40'
          : error ? 'bg-red-500/5 border-red-500/60' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-error`}
          className="mt-0.5 w-5 h-5 accent-blue-600 shrink-0 cursor-pointer"
        />
        <span className="text-sm text-slate-300 leading-relaxed">{children}</span>
      </label>
      <ErrorText id={`${id}-error`}>{error}</ErrorText>
    </div>
  );
};

// Carga de un archivo. El input queda visualmente oculto pero accesible con teclado.
export const FileDrop = ({ spec, file, onSelect, onRemove, error }) => {
  const id = useId();
  const Icon = spec.image ? ImageIcon : FileIcon;
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className={`group h-full flex items-center gap-4 border-2 border-dashed rounded-2xl p-4 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-blue-400 ${file
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : error ? 'border-red-500/60 bg-red-500/5' : 'border-slate-800 bg-slate-950 hover:border-blue-500'}`}
      >
        <input
          id={id}
          type="file"
          accept={spec.accept.join(',')}
          className="sr-only"
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-error`}
          onChange={(e) => { const selected = e.target.files?.[0]; e.target.value = ''; if (selected) onSelect(selected); }}
        />
        <span className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center border transition-colors ${file
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-slate-900 border-slate-800 group-hover:bg-blue-500/10'}`}
        >
          {file ? <Check className="w-5 h-5 text-emerald-400" /> : <Icon className="w-5 h-5 text-slate-500 group-hover:text-blue-400" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-white font-bold text-sm sm:text-base">
            {spec.label}{!spec.required && <span className="text-slate-500 font-medium text-xs ml-1.5">(opcional)</span>}
          </span>
          <span className="block text-slate-400 text-xs sm:text-sm truncate">
            {file ? `${file.name} · ${formatBytes(file.size)}` : `${spec.hint} · hasta 1 MB`}
          </span>
          <span className="block text-blue-400 text-xs font-bold mt-1 group-hover:text-blue-300">
            {file ? 'Cambiar archivo' : 'Seleccionar archivo'}
          </span>
        </span>
        {file && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onRemove(); }}
            aria-label={`Quitar ${spec.label}`}
            className="w-9 h-9 shrink-0 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-red-500/80 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </label>
      <ErrorText id={`${id}-error`}>{error}</ErrorText>
    </div>
  );
};
