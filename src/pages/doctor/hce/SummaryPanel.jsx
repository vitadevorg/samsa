import React, { useMemo } from 'react';
import { Activity, CalendarClock, Dna, FlaskConical, HeartPulse, Pill } from 'lucide-react';
import { FOLLOWUP_STATUS, SELECT_OPTIONS, optionLabel } from '../../../constants/hce';
import { summarizeRecord } from '../../../services/hceService';
import { formatDateAR, formatDateTimeAR } from '../../../utils/dates';
import { VitalsChips } from './EntryCard';
import { SectionTitle } from './HceStates';
import { cardClass } from './hceUi';

const Empty = ({ children }) => <p className="text-sm text-gray-400">{children}</p>;

const LinkButton = ({ onClick, children }) => (
  <button type="button" onClick={onClick} className="text-sm font-bold text-blue-600 hover:text-blue-700 shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{children}</button>
);

const SoapLine = ({ letter, label, children }) => (
  <div className="flex gap-2 text-sm">
    <span aria-hidden="true" className="mt-0.5 w-5 h-5 shrink-0 rounded bg-blue-600 text-white text-[11px] font-black flex items-center justify-center">{letter}</span>
    <p className="min-w-0 text-gray-700"><span className="sr-only">{label}: </span>{children}</p>
  </div>
);

// Resumen clínico: lo que el médico necesita leer antes de atender, en una sola vista.
const SummaryPanel = ({ entries, tasks, onGoTo, onNew }) => {
  const summary = useMemo(() => summarizeRecord(entries, tasks), [entries, tasks]);
  const { backgrounds, lastVitals } = summary;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <section className={`${cardClass} p-5 sm:p-6 xl:col-span-2`}>
        <SectionTitle icon={HeartPulse}>Últimos signos vitales</SectionTitle>
        {lastVitals ? (
          <>
            <VitalsChips vitals={lastVitals.data.vitals} />
            <p className="mt-2 text-xs text-gray-500">Registrados el {formatDateTimeAR(lastVitals.createdAt)} por {lastVitals.professional.name}</p>
          </>
        ) : <Empty>Sin signos vitales registrados.</Empty>}
      </section>

      <section className={`${cardClass} p-5 sm:p-6`}>
        <SectionTitle icon={Activity} action={<LinkButton onClick={() => onGoTo('registros')}>Ver todas</LinkButton>}>Últimas evoluciones</SectionTitle>
        {summary.evolutions.length === 0 ? <Empty>Sin evoluciones registradas.</Empty> : (
          <ul className="space-y-3">
            {summary.evolutions.map((e) => (
              <li key={e.id} className="rounded-2xl bg-gray-50/70 border border-gray-100 p-3 space-y-1.5">
                <p className="text-xs font-bold text-blue-700">{formatDateAR(e.createdAt)} · {e.professional.name}</p>
                <p className="text-sm font-bold text-gray-900">{e.data.reason}</p>
                {e.data.assessment && (
                  <SoapLine letter="A" label="Evaluación">
                    {e.data.assessment}{e.data.code && <span className="ml-1 font-mono text-xs text-slate-500">({e.data.code})</span>}
                  </SoapLine>
                )}
                {e.data.plan && <SoapLine letter="P" label="Plan"><span className="line-clamp-2">{e.data.plan}</span></SoapLine>}
              </li>
            ))}
          </ul>
        )}
        <button type="button" onClick={() => onNew('evolution')} className="mt-4 w-full sm:w-auto text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-colors">
          + Nueva evolución
        </button>
      </section>

      <section className={`${cardClass} p-5 sm:p-6`}>
        <SectionTitle icon={Pill}>Medicación vigente</SectionTitle>
        {summary.medication.length === 0 ? <Empty>Sin prescripciones en los últimos 90 días.</Empty> : (
          <ul className="divide-y divide-gray-100">
            {summary.medication.map((m) => (
              <li key={m.id} className="py-2 first:pt-0 last:pb-0 text-sm">
                <p className="font-bold text-gray-900">{m.data.drug}</p>
                <p className="text-gray-700">{m.data.dose} · {optionLabel('ROUTES', m.data.route)}{m.data.duration && ` · ${m.data.duration}`}</p>
                <p className="text-xs text-gray-500">Prescripta el {formatDateAR(m.createdAt)} por {m.professional.name}</p>
              </li>
            ))}
          </ul>
        )}
        <button type="button" onClick={() => onNew('prescription')} className="mt-4 w-full sm:w-auto text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-xl transition-colors">
          + Nueva prescripción
        </button>
      </section>

      <section className={`${cardClass} p-5 sm:p-6`}>
        <SectionTitle icon={CalendarClock} action={<LinkButton onClick={() => onGoTo('seguimiento')}>Ver plan</LinkButton>}>Seguimiento pendiente</SectionTitle>
        {summary.openTasks.length === 0 ? <Empty>No hay tareas pendientes.</Empty> : (
          <ul className="space-y-2">
            {summary.openTasks.map((t) => (
              <li key={t.id} className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 border ${t.effectiveStatus === 'overdue' ? 'bg-red-50/60 border-red-100' : 'bg-gray-50/70 border-gray-100'}`}>
                <span className="text-sm font-semibold text-gray-800 min-w-0 break-words">{t.title}</span>
                <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border ${FOLLOWUP_STATUS[t.effectiveStatus].badge}`}>
                  {t.effectiveStatus === 'overdue' ? `Venció ${formatDateAR(t.dueDate)}` : formatDateAR(t.dueDate)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`${cardClass} p-5 sm:p-6`}>
        <SectionTitle icon={Dna} action={<LinkButton onClick={() => onNew('background')}>+ Agregar</LinkButton>}>Antecedentes</SectionTitle>
        <dl className="space-y-3">
          {SELECT_OPTIONS.BACKGROUND_KINDS.map((kind) => (
            <div key={kind.value}>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{kind.label}</dt>
              <dd className="text-sm text-gray-700">
                {backgrounds[kind.value].length === 0 ? <span className="text-gray-400">No refiere / sin datos</span> : (
                  <ul className="list-disc ml-4 space-y-0.5">{backgrounds[kind.value].map((b) => <li key={b.id}>{b.data.detail}</li>)}</ul>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${cardClass} p-5 sm:p-6 xl:col-span-2`}>
        <SectionTitle icon={FlaskConical} action={<LinkButton onClick={() => onGoTo('registros')}>Ver registros</LinkButton>}>Estudios complementarios recientes</SectionTitle>
        {summary.studies.length === 0 ? <Empty>Sin estudios registrados.</Empty> : (
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {summary.studies.map((s) => (
              <li key={s.id} className="rounded-2xl bg-gray-50/70 border border-gray-100 p-3">
                <p className="text-sm font-bold text-gray-900">{s.data.title}</p>
                <p className="text-xs text-gray-500">{formatDateAR(s.createdAt)} · {optionLabel('STUDY_CATEGORIES', s.data.category)} · {optionLabel('STUDY_STATUS', s.data.studyStatus)}</p>
                <p className="text-sm text-gray-700 mt-1 line-clamp-3">{s.data.result}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default SummaryPanel;
