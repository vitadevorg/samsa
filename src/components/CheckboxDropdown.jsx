import React, { useId, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

// Clases del tema claro (paneles de administración) y del oscuro (solicitud de adhesión de la Home).
const THEMES = {
  light: {
    trigger: (open) => (open ? 'bg-white ring-2 ring-blue-500 border-transparent' : 'bg-gray-50 hover:bg-white'),
    triggerError: 'border-red-300',
    value: (filled) => (filled ? 'text-gray-800 font-medium' : 'text-gray-400'),
    count: 'bg-blue-100 text-blue-700',
    chevron: 'text-gray-400',
    error: 'text-red-600',
    panel: 'border-gray-200 bg-white shadow-sm',
    section: 'text-gray-400',
    option: (checked) => (checked ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'),
    box: (checked) => (checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'),
    footer: 'border-gray-100',
    hint: 'text-gray-400',
    clear: 'text-gray-500 hover:text-red-600 hover:bg-red-50',
    done: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50',
  },
  dark: {
    trigger: (open) => (open ? 'bg-slate-950 ring-2 ring-blue-500/40 border-blue-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'),
    triggerError: 'border-red-500',
    value: (filled) => (filled ? 'text-white font-medium' : 'text-slate-500'),
    count: 'bg-blue-500/20 text-blue-300',
    chevron: 'text-slate-500',
    error: 'text-red-400',
    panel: 'border-slate-800 bg-slate-950 shadow-lg shadow-black/20',
    section: 'text-slate-500',
    option: (checked) => (checked ? 'bg-blue-500/10 text-blue-300' : 'text-slate-300 hover:bg-slate-900'),
    box: (checked) => (checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-700 bg-slate-900'),
    footer: 'border-slate-800',
    hint: 'text-slate-500',
    clear: 'text-slate-400 hover:text-red-400 hover:bg-red-500/10',
    done: 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10',
  },
};

// Lista desplegable con checkboxes (mismo formato que las obras sociales del médico particular).
// `selected` se devuelve siempre en el orden de `options`. Con `groups` ({ título: [opciones] }) se muestran por secciones.
// `dark` la adapta a superficies oscuras.
const CheckboxDropdown = ({ label, options: plainOptions, groups, selected, onChange, placeholder, error, labelClass = 'text-sm text-gray-600 mb-1.5 block', dark = false }) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const theme = THEMES[dark ? 'dark' : 'light'];
  const options = groups ? Object.values(groups).flat() : plainOptions;
  const sections = groups ? Object.entries(groups) : [[null, plainOptions]];
  const toggle = (option) => {
    const next = selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option];
    onChange(options.filter((o) => next.includes(o)));
  };

  return (
    <div>
      <p id={`${id}-label`} className={labelClass}>{label}</p>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        aria-labelledby={`${id}-label`}
        className={`w-full p-3 border rounded-xl flex items-center justify-between gap-3 text-left transition ${theme.trigger(open)} ${error ? theme.triggerError : ''}`}
      >
        <span className={`truncate ${theme.value(selected.length > 0)}`}>
          {selected.length ? selected.join(', ') : placeholder}
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {selected.length > 0 && <span className={`${theme.count} px-2 py-0.5 rounded-full text-xs font-bold`}>{selected.length}</span>}
          <ChevronDown className={`w-5 h-5 ${theme.chevron} transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {error && <p role="alert" className={`text-xs ${theme.error} font-medium mt-1 ml-1`}>{error}</p>}
      {open && (
        <div id={`${id}-panel`} className={`mt-2 p-3 border rounded-xl ${theme.panel} animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none`}>
          <div className="max-h-80 overflow-y-auto space-y-3">
          {sections.map(([title, items]) => (
          <div key={title ?? 'opciones'}>
          {title && <p className={`text-xs font-bold ${theme.section} uppercase tracking-wider px-3 mb-1`}>{title}</p>}
          <ul role="group" aria-label={title ?? label} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {items.map((option) => {
              const checked = selected.includes(option);
              return (
                <li key={option}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggle(option)}
                    className={`w-full min-h-[40px] px-3 py-2 rounded-lg flex items-center gap-2.5 text-sm font-medium text-left transition ${theme.option(checked)}`}
                  >
                    <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${theme.box(checked)}`}>
                      {checked && <Check className="w-3.5 h-3.5" />}
                    </span>
                    {option}
                  </button>
                </li>
              );
            })}
          </ul>
          </div>
          ))}
          </div>
          <div className={`flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t ${theme.footer}`}>
            <p className={`text-xs ${theme.hint} ml-1`}>{selected.length} seleccionada(s).</p>
            <div className="flex gap-2">
              {selected.length > 0 && (
                <button type="button" onClick={() => onChange([])} className={`text-sm font-bold px-3 py-1.5 rounded-lg transition ${theme.clear}`}>Quitar todas</button>
              )}
              <button type="button" onClick={() => setOpen(false)} className={`text-sm font-bold px-3 py-1.5 rounded-lg transition ${theme.done}`}>Listo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckboxDropdown;
