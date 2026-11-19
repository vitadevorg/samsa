import React from 'react';
import { AlertTriangle, ChevronDown, HeartPulse, ShieldCheck, Users } from 'lucide-react';
import { formatDateAR } from '../../../utils/dates';
import { cardClass } from './hceUi';

const initialsOf = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const DataRow = ({ label, children }) => (
  <div className="min-w-0">
    <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</dt>
    <dd className="text-sm font-semibold text-gray-800 break-words">{children || '-'}</dd>
  </div>
);

// Datos filiatorios del paciente, alertas clínicas (alergias y problemas activos) y datos de la historia
// (clave única, apertura y conservación). El contacto y el núcleo familiar quedan plegados: se muestran
// solo cuando el profesional los necesita.
const PatientIdentityCard = ({ patient }) => {
  const { insurance } = patient;
  return (
    <section aria-label="Datos filiatorios del paciente" className={`${cardClass} p-5 sm:p-6`}>
      <div className="flex items-center gap-4">
        {patient.img ? (
          <img src={patient.img} alt="" className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-gray-100" />
        ) : (
          <div aria-hidden="true" className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 font-black text-xl flex items-center justify-center shrink-0">
            {initialsOf(patient.name)}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Datos filiatorios</h2>
          <p className="text-sm font-semibold text-gray-700 mt-0.5">{patient.age != null ? `${patient.age} años` : 'Edad sin registrar'}{patient.sex && ` · ${patient.sex}`}</p>
          <p className="mt-1 inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 font-mono" title="Número de historia clínica (clave única)">
            HC {patient.historyId.replace('HC-', '')}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className={`rounded-2xl border px-4 py-3 ${patient.allergies.length ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50/60'}`}>
          <p className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider ${patient.allergies.length ? 'text-red-700' : 'text-gray-500'}`}>
            <AlertTriangle className="w-4 h-4" aria-hidden="true" /> Alergias
          </p>
          <p className={`mt-1 text-sm font-bold ${patient.allergies.length ? 'text-red-800' : 'text-gray-500'}`}>
            {patient.allergies.length ? patient.allergies.join(' · ') : 'No refiere alergias conocidas'}
          </p>
        </div>
        {patient.activeProblems.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700">
              <HeartPulse className="w-4 h-4" aria-hidden="true" /> Problemas activos
            </p>
            <ul className="mt-1 text-sm font-semibold text-amber-900 space-y-0.5">
              {patient.activeProblems.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
        )}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
        <DataRow label="DNI">{patient.dni}</DataRow>
        <DataRow label="Fecha de nacimiento">{patient.birthDate ? formatDateAR(`${patient.birthDate}T12:00:00`) : ''}</DataRow>
        <div className="col-span-2">
          <DataRow label="Cobertura">
            {insurance.name}
            {insurance.plan && ` · Plan ${insurance.plan}`}
            {insurance.memberNumber && ` · Afiliado Nº ${insurance.memberNumber}`}
          </DataRow>
        </div>
      </dl>

      <details className="group mt-5 rounded-2xl border border-gray-100 bg-gray-50/60">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-bold text-gray-700 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <span className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" aria-hidden="true" /> Contacto y núcleo familiar</span>
          <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="px-4 pb-4 space-y-3">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <DataRow label="Teléfono">{patient.phone}</DataRow>
            <DataRow label="Domicilio">{patient.address}</DataRow>
          </dl>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Núcleo familiar</p>
            {patient.family.length === 0 ? (
              <p className="text-sm text-gray-500">Sin familiares registrados.</p>
            ) : (
              <ul className="space-y-1.5">
                {patient.family.map((member) => (
                  <li key={member.name} className="text-sm">
                    <span className="font-semibold text-gray-800">{member.name}</span>
                    <span className="text-gray-500"> · {member.relation}{member.phone && ` · ${member.phone}`}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </details>

      <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-x-4 gap-y-3">
        <DataRow label="Apertura de la HC">{formatDateAR(patient.startedAt)}</DataRow>
        <DataRow label="Última actuación">{formatDateAR(patient.lastActivity)}</DataRow>
        <div className="col-span-2 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
          <span>Historia única e inalterable. Conservación mínima hasta el <strong>{formatDateAR(patient.retentionUntil)}</strong> (10 años desde la última actuación).</span>
        </div>
      </div>
    </section>
  );
};

export default PatientIdentityCard;
