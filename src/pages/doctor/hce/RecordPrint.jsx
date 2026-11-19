import React from 'react';
import SamsaLogo from '../../../components/SamsaLogo';
import { ENTRY_TYPES, SELECT_OPTIONS, optionLabel } from '../../../constants/hce';
import { summarizeRecord } from '../../../services/hceService';
import { entryRows } from '../../../utils/hceFormat';
import { formatDateAR, formatDateTimeAR } from '../../../utils/dates';

const SectionHeading = ({ number, children }) => (
  <h2 className="mt-6 mb-2 border-b-2 border-slate-800 pb-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-900">
    {number}. {children}
  </h2>
);

const Cell = ({ label, children, wide }) => (
  <div className={`border border-slate-300 px-2 py-1.5 ${wide ? 'col-span-2' : ''}`}>
    <p className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
    <p className="text-[11px] text-slate-900">{children || '—'}</p>
  </div>
);

// Copia impresa de la historia clínica (copia autenticada para el titular). Sigue el orden
// habitual de una HC: datos filiatorios, alertas, antecedentes, medicación vigente y registros
// en orden cronológico con firma y sello de cada profesional. Solo se ve al imprimir.
const RecordPrint = ({ patient, entries, tasks, issuer, copyRequest }) => {
  const chronological = [...entries].reverse();
  const { backgrounds, medication } = summarizeRecord(entries, tasks);
  const issuedAt = new Date().toISOString();

  return (
    <div className="hidden print:block bg-white text-slate-900 font-serif px-12 py-10 text-[11px] leading-snug">
      {/* Encabezado institucional */}
      <header className="flex items-start justify-between border-b-4 border-double border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <SamsaLogo variant="mono" className="h-11 w-auto text-slate-900" />
          <div>
            <p className="text-xl font-bold tracking-tight font-sans">S.A.M.S.A</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-600 font-sans">Sistema de Administración Médica</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-bold uppercase tracking-wide">Historia Clínica</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-600">Copia autenticada</p>
          <p className="mt-1 font-mono text-[11px] font-bold">HC Nº {patient.historyId.replace('HC-', '')}</p>
          <p className="text-[10px] text-slate-600">Emitida: {formatDateTimeAR(issuedAt)}</p>
        </div>
      </header>

      {/* 1. Datos filiatorios */}
      <SectionHeading number={1}>Datos filiatorios</SectionHeading>
      <div className="grid grid-cols-4 -mt-px">
        <Cell label="Apellido y nombre" wide>{patient.name}</Cell>
        <Cell label="DNI">{patient.dni}</Cell>
        <Cell label="Fecha de nacimiento">
          {patient.birthDate ? `${formatDateAR(`${patient.birthDate}T12:00:00`)} (${patient.age} años)` : ''}
        </Cell>
        <Cell label="Sexo">{patient.sex}</Cell>
        <Cell label="Teléfono">{patient.phone}</Cell>
        <Cell label="Domicilio" wide>{patient.address}</Cell>
        <Cell label="Cobertura" wide>
          {patient.insurance.name}{patient.insurance.plan && ` · Plan ${patient.insurance.plan}`}{patient.insurance.memberNumber && ` · Afiliado Nº ${patient.insurance.memberNumber}`}
        </Cell>
        <Cell label="Apertura de la HC">{formatDateAR(patient.startedAt)}</Cell>
        <Cell label="Última actuación">{formatDateAR(patient.lastActivity)}</Cell>
        <Cell label="Núcleo familiar / contacto" wide>
          {patient.family.map((f) => `${f.name} (${f.relation}${f.phone ? `, ${f.phone}` : ''})`).join('; ')}
        </Cell>
      </div>

      {/* 2. Alertas clínicas */}
      <SectionHeading number={2}>Alertas clínicas</SectionHeading>
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <th scope="row" className="w-40 border border-slate-300 bg-slate-100 px-2 py-1 text-left text-[10px] uppercase">Alergias</th>
            <td className="border border-slate-300 px-2 py-1 font-bold">{patient.allergies.length ? patient.allergies.join(', ') : 'No refiere alergias conocidas'}</td>
          </tr>
          <tr>
            <th scope="row" className="border border-slate-300 bg-slate-100 px-2 py-1 text-left text-[10px] uppercase">Problemas activos</th>
            <td className="border border-slate-300 px-2 py-1">{patient.activeProblems.length ? patient.activeProblems.join('; ') : 'Sin problemas activos registrados'}</td>
          </tr>
        </tbody>
      </table>

      {/* 3. Antecedentes */}
      <SectionHeading number={3}>Antecedentes</SectionHeading>
      <table className="w-full border-collapse">
        <tbody>
          {SELECT_OPTIONS.BACKGROUND_KINDS.map((kind) => (
            <tr key={kind.value} className="break-inside-avoid">
              <th scope="row" className="w-40 border border-slate-300 bg-slate-100 px-2 py-1 text-left text-[10px] uppercase align-top">{kind.label}</th>
              <td className="border border-slate-300 px-2 py-1">
                {backgrounds[kind.value].length ? backgrounds[kind.value].map((b) => b.data.detail).join(' ') : 'No refiere / sin datos.'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 4. Medicación vigente */}
      <SectionHeading number={4}>Medicación vigente</SectionHeading>
      {medication.length === 0 ? (
        <p className="italic text-slate-600">Sin prescripciones en los últimos 90 días.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 text-[10px] uppercase">
              <th scope="col" className="border border-slate-300 px-2 py-1 text-left">Fármaco</th>
              <th scope="col" className="border border-slate-300 px-2 py-1 text-left">Posología</th>
              <th scope="col" className="border border-slate-300 px-2 py-1 text-left">Vía</th>
              <th scope="col" className="border border-slate-300 px-2 py-1 text-left">Duración</th>
              <th scope="col" className="border border-slate-300 px-2 py-1 text-left">Prescripción</th>
            </tr>
          </thead>
          <tbody>
            {medication.map((m) => (
              <tr key={m.id}>
                <td className="border border-slate-300 px-2 py-1 font-bold">{m.data.drug}</td>
                <td className="border border-slate-300 px-2 py-1">{m.data.dose}</td>
                <td className="border border-slate-300 px-2 py-1">{optionLabel('ROUTES', m.data.route)}</td>
                <td className="border border-slate-300 px-2 py-1">{m.data.duration || '—'}</td>
                <td className="border border-slate-300 px-2 py-1">{formatDateAR(m.createdAt)} · {m.professional.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 5. Registros clínicos */}
      <SectionHeading number={5}>Registros clínicos (orden cronológico)</SectionHeading>
      <div className="space-y-3">
        {chronological.map((e, index) => {
          const config = ENTRY_TYPES[e.type];
          return (
            <article key={e.id} className="break-inside-avoid border border-slate-400">
              <div className="flex justify-between bg-slate-100 border-b border-slate-400 px-2 py-1 text-[10px]">
                <p className="font-bold uppercase tracking-wide">
                  {index + 1}. {config.label}{e.amendedBy && ' — ENMENDADO'}
                </p>
                <p className="font-mono font-bold">{formatDateTimeAR(e.createdAt)}</p>
              </div>
              <div className="px-2 py-1.5 space-y-1">
                {e.amends && <p className="italic">Enmienda de un registro anterior. Motivo: {e.amendReason}</p>}
                {e.amendedBy && <p className="italic">Este registro fue corregido por una enmienda posterior.</p>}
                {entryRows(e).map((row) => (
                  <p key={row.name} className="text-justify">
                    <span className="font-bold">{row.soap ? `${row.soap} (${row.label})` : row.label}:</span>{' '}
                    {row.value}
                    {row.code && <span className="font-mono"> [CIE-10 {row.code.toUpperCase()}]</span>}
                  </p>
                ))}
              </div>
              <div className="flex justify-end border-t border-dashed border-slate-300 px-2 py-1.5">
                <div className="text-right text-[10px]">
                  <p className="font-bold">{e.professional.name}</p>
                  <p>{e.professional.license} · {e.professional.specialty}</p>
                  <p className="text-slate-600">Firmado electrónicamente{e.signature && ` · Sello ${e.signature}`}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Certificación */}
      <section className="mt-8 break-inside-avoid border border-slate-400 px-3 py-3">
        <p className="text-justify">
          Se certifica que la presente es copia fiel e íntegra de la Historia Clínica Nº {patient.historyId.replace('HC-', '')},
          perteneciente a {patient.name} (DNI {patient.dni}), que consta de {chronological.length} registros firmados.
          {copyRequest && ` Emitida a pedido de ${copyRequest.requester} el ${formatDateTimeAR(copyRequest.requestedAt)}.`}
        </p>
        <div className="mt-10 flex justify-end">
          <div className="w-64 border-t border-slate-800 pt-1 text-center text-[10px]">
            <p className="font-bold">{issuer.name}</p>
            <p>{issuer.license} · {issuer.specialty}</p>
            <p className="text-slate-600">Firma y sello del profesional que emite la copia</p>
          </div>
        </div>
      </section>

      <footer className="mt-4 border-t border-slate-300 pt-2 text-center text-[8.5px] text-slate-500">
        Documento confidencial alcanzado por el secreto profesional (Ley 26.529, art. 2 inc. d, y Decreto 1089/2012).
        Los registros son inalterables: las correcciones se asientan como enmiendas firmadas.
      </footer>
    </div>
  );
};

export default RecordPrint;
