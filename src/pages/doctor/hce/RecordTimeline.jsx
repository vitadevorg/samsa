import React, { useId, useMemo, useState } from 'react';
import { FileSearch, FilePlus2, Search } from 'lucide-react';
import { ENTRY_TYPES, RECORD_SECTIONS } from '../../../constants/hce';
import { entrySearchText } from '../../../utils/hceFormat';
import EntryCard from './EntryCard';
import { EmptyState } from './HceStates';
import { inputClass, primaryButtonClass, secondaryButtonClass } from './hceUi';

const PAGE_SIZE = 8;

// Fecha local (aaaa-mm-dd) para comparar con los filtros de fecha.
const dayKey = (iso) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });

// Línea de tiempo cronológica de la historia (lo más reciente arriba), con filtros y carga progresiva.
const RecordTimeline = ({ entries, onNew, onAmend }) => {
  const fieldId = useId();
  const [group, setGroup] = useState('all');
  const [query, setQuery] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const byId = useMemo(() => Object.fromEntries(entries.map((e) => [e.id, e])), [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (group !== 'all' && ENTRY_TYPES[e.type].section !== group) return false;
      const day = dayKey(e.createdAt);
      if (from && day < from) return false;
      if (to && day > to) return false;
      return !q || entrySearchText(e).includes(q);
    });
  }, [entries, group, query, from, to]);

  // Cantidad de registros por sección, para orientar la lectura.
  const counts = useMemo(() => {
    const result = { all: entries.length };
    entries.forEach((e) => { const s = ENTRY_TYPES[e.type].section; result[s] = (result[s] ?? 0) + 1; });
    return result;
  }, [entries]);

  const hasFilters = group !== 'all' || query || from || to;
  const resetFilters = () => { setGroup('all'); setQuery(''); setFrom(''); setTo(''); setVisible(PAGE_SIZE); };

  return (
    <div>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-5 space-y-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por sección de la historia">
          {RECORD_SECTIONS.filter((f) => f.value === 'all' || counts[f.value]).map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={group === f.value}
              onClick={() => { setGroup(f.value); setVisible(PAGE_SIZE); }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                group === f.value ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
              <span className={`text-xs font-bold rounded-md px-1.5 ${group === f.value ? 'bg-white/20' : 'bg-white text-gray-500'}`}>{counts[f.value] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto_auto] gap-3">
          <div className="relative">
            <label htmlFor={`${fieldId}-buscar`} className="sr-only">Buscar en la historia</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input id={`${fieldId}-buscar`} type="search" value={query} onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE); }} placeholder="Buscar diagnóstico, medicación, profesional..." className={`${inputClass} pl-10`} />
          </div>
          <div className="grid grid-cols-2 xl:contents gap-3">
            <div>
              <label htmlFor={`${fieldId}-desde`} className="sr-only">Desde</label>
              <input id={`${fieldId}-desde`} type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={inputClass} title="Desde" />
            </div>
            <div>
              <label htmlFor={`${fieldId}-hasta`} className="sr-only">Hasta</label>
              <input id={`${fieldId}-hasta`} type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={inputClass} title="Hasta" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-gray-500" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}{hasFilters ? ' con los filtros aplicados' : ' en total'}
          </p>
          {hasFilters && <button type="button" onClick={resetFilters} className="font-bold text-blue-600 hover:text-blue-700">Limpiar filtros</button>}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          {entries.length === 0 ? (
            <EmptyState icon={FilePlus2} title="La historia todavía no tiene registros" description="Asentá la primera evolución o los antecedentes del paciente." action={<button type="button" onClick={onNew} className={primaryButtonClass}><FilePlus2 className="w-5 h-5" /> Nuevo registro</button>} />
          ) : (
            <EmptyState icon={FileSearch} title="No hay registros con esos filtros" action={<button type="button" onClick={resetFilters} className={secondaryButtonClass}>Limpiar filtros</button>} />
          )}
        </div>
      ) : (
        <ol className="relative space-y-4 sm:pl-6 sm:before:absolute sm:before:left-2 sm:before:top-2 sm:before:bottom-2 sm:before:w-0.5 sm:before:bg-blue-100">
          {filtered.slice(0, visible).map((entry) => (
            <li key={entry.id} className="relative">
              <span aria-hidden="true" className="hidden sm:block absolute -left-[1.4rem] top-6 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-slate-50" />
              <EntryCard entry={entry} original={byId[entry.amends]} correction={byId[entry.amendedBy]} onAmend={onAmend} />
            </li>
          ))}
        </ol>
      )}

      {filtered.length > visible && (
        <div className="mt-6 text-center">
          <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className={secondaryButtonClass}>
            Ver registros anteriores ({filtered.length - visible})
          </button>
        </div>
      )}
    </div>
  );
};

export default RecordTimeline;
