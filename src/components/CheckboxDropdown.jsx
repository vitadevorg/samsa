import React, { useId, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

// Lista desplegable con checkboxes (mismo formato que las obras sociales del médico particular).
// `selected` se devuelve siempre en el orden de `options`. Con `groups` ({ título: [opciones] }) se muestran por secciones.
const CheckboxDropdown = ({ label, options: plainOptions, groups, selected, onChange, placeholder, error, labelClass = 'text-sm text-gray-600 mb-1.5 block' }) => {
  const id = useId();
  const [open, setOpen] = useState(false);
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
        className={`w-full p-3 border rounded-xl flex items-center justify-between gap-3 text-left transition ${open ? 'bg-white ring-2 ring-blue-500 border-transparent' : 'bg-gray-50 hover:bg-white'} ${error ? 'border-red-300' : ''}`}
      >
        <span className={`truncate ${selected.length ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
          {selected.length ? selected.join(', ') : placeholder}
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {selected.length > 0 && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{selected.length}</span>}
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {error && <p role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{error}</p>}
      {open && (
        <div id={`${id}-panel`} className="mt-2 p-3 border border-gray-200 rounded-xl bg-white shadow-sm animate-fadeIn">
          <div className="max-h-80 overflow-y-auto space-y-3">
          {sections.map(([title, items]) => (
          <div key={title ?? 'opciones'}>
          {title && <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-1">{title}</p>}
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
                    className={`w-full min-h-[40px] px-3 py-2 rounded-lg flex items-center gap-2.5 text-sm font-medium text-left transition ${checked ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'}`}>
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
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 ml-1">{selected.length} seleccionada(s).</p>
            <div className="flex gap-2">
              {selected.length > 0 && (
                <button type="button" onClick={() => onChange([])} className="text-sm font-bold text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">Quitar todas</button>
              )}
              <button type="button" onClick={() => setOpen(false)} className="text-sm font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">Listo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckboxDropdown;
