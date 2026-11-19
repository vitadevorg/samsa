import React from 'react';
import { BadgeCheck, CornerDownRight, FilePenLine, History } from 'lucide-react';
import { ENTRY_TYPES, TONE_BADGE } from '../../../constants/hce';
import { entryRows, vitalsList } from '../../../utils/hceFormat';
import { formatDateTimeAR } from '../../../utils/dates';

// Signos vitales como chips legibles de un vistazo (TA, FC, FR, T, SatO₂, Peso).
export const VitalsChips = ({ vitals, muted = false }) => (
  <ul className="flex flex-wrap gap-1.5">
    {vitalsList(vitals).map((v) => (
      <li key={v.key} title={v.label} className={`inline-flex items-baseline gap-1 rounded-lg border px-2 py-1 text-xs ${muted ? 'border-gray-200 bg-white text-gray-500' : 'border-blue-100 bg-blue-50/60 text-gray-800'}`}>
        <span className="font-bold text-blue-700">{v.short}</span>
        <span className="font-mono font-semibold">{v.value}</span>
        <span className="text-gray-500">{v.unit}</span>
      </li>
    ))}
  </ul>
);

// Un registro de la historia, con sus campos en el orden clínico (SOAP en la evolución).
// No tiene "editar" ni "borrar": solo se puede enmendar, y el original queda visible,
// marcado y enlazado con su corrección.
const EntryCard = ({ entry, original, correction, onAmend }) => {
  const config = ENTRY_TYPES[entry.type];
  const { professional } = entry;
  const isAmended = Boolean(entry.amendedBy);
  const rows = entryRows(entry);
  const headlineRow = rows.find((r) => r.name === config.headline && r.kind !== 'textarea');
  const bodyRows = rows.filter((r) => r !== headlineRow);

  return (
    <article
      id={`registro-${entry.id}`}
      className={`scroll-mt-28 rounded-2xl border shadow-sm p-4 sm:p-5 transition-shadow hover:shadow-md ${isAmended ? 'border-gray-200 bg-gray-50/70' : 'border-gray-100 bg-white'}`}
    >
      <header className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${TONE_BADGE[config.tone]}`}>{config.label}</span>
        {isAmended && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200">
            <History className="w-3.5 h-3.5" aria-hidden="true" /> Enmendado
          </span>
        )}
        <time dateTime={entry.createdAt} className="ml-auto font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">
          {formatDateTimeAR(entry.createdAt)}
        </time>
      </header>

      {headlineRow && (
        <h4 className={`mt-3 font-bold break-words ${isAmended ? 'text-gray-500 line-through decoration-gray-300' : 'text-gray-900'}`}>{headlineRow.value}</h4>
      )}

      {entry.amends && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50/70 border border-amber-100 px-3 py-2 text-xs text-amber-900">
          <CornerDownRight className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Enmienda del registro del{' '}
            <a href={`#registro-${entry.amends}`} className="font-bold underline underline-offset-2 hover:text-amber-700">
              {original ? formatDateTimeAR(original.createdAt) : 'original'}
            </a>
            . Motivo: <strong>{entry.amendReason}</strong>
          </span>
        </p>
      )}

      <dl className={`mt-3 space-y-2.5 ${isAmended ? 'opacity-70' : ''}`}>
        {bodyRows.map((row) => (
          <div key={row.name} className={row.soap ? 'flex gap-3' : ''}>
            {row.soap && (
              <span aria-hidden="true" className="mt-0.5 w-6 h-6 shrink-0 rounded-md bg-blue-600 text-white text-xs font-black flex items-center justify-center">{row.soap}</span>
            )}
            <div className="min-w-0 flex-1">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {row.label}{row.hint && <span className="normal-case tracking-normal font-semibold"> · {row.hint}</span>}
              </dt>
              <dd className={`text-sm leading-relaxed text-gray-700 whitespace-pre-line break-words ${isAmended ? 'line-through decoration-gray-300' : ''}`}>
                {row.kind === 'vitals' ? <div className="mt-1"><VitalsChips vitals={row.raw} muted={isAmended} /></div> : row.value}
                {row.code && (
                  <span className="ml-1.5 inline-block font-mono text-xs bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded no-underline">CIE-10 {row.code.toUpperCase()}</span>
                )}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <footer className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="min-w-0 flex-1 text-xs text-gray-500">
          <p className="font-bold text-gray-700">{professional.name}</p>
          <p>{professional.license} · {professional.specialty}</p>
          <p className="mt-1 inline-flex flex-wrap items-center gap-1 text-emerald-700 font-semibold">
            <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Firmado electrónicamente{entry.signature && <span className="font-mono text-gray-500"> · Sello {entry.signature}</span>}
          </p>
        </div>
        {isAmended ? (
          <a href={`#registro-${entry.amendedBy}`} className="self-start sm:self-center text-sm font-bold text-amber-700 hover:text-amber-800 underline underline-offset-2">
            Ver corrección{correction ? ` del ${formatDateTimeAR(correction.createdAt)}` : ''}
          </a>
        ) : (
          <button
            type="button"
            onClick={() => onAmend(entry)}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:text-amber-700 hover:bg-amber-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <FilePenLine className="w-4 h-4" aria-hidden="true" /> Enmendar
          </button>
        )}
      </footer>
    </article>
  );
};

export default EntryCard;
