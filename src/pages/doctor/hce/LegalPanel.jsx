import React, { useId, useState } from 'react';
import { Clock, FileCheck2, Fingerprint, Printer, ScrollText } from 'lucide-react';
import { ACCESS_ACTIONS, COPY_DEADLINE_HOURS } from '../../../constants/hce';
import { formatDateTimeAR } from '../../../utils/dates';
import { SecretaryModalCard, SecretaryModalHeader, SecretaryModalOverlay } from '../../secretary/dashboard/SecretaryModal';
import { EditConfirmModal } from '../../clinic/ClinicModals';
import { EmptyState, SectionTitle } from './HceStates';
import { cardClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './hceUi';

const REQUESTERS = ['Paciente (titular)', 'Representante legal', 'Autoridad judicial'];

const CopyRequestRow = ({ request, onDeliver, onPrint }) => {
  const delivered = request.status === 'delivered';
  const late = !delivered && new Date(request.deadline) < new Date();
  return (
    <li className={`rounded-2xl border p-4 ${late ? 'border-red-200 bg-red-50/50' : 'border-gray-100 bg-gray-50/50'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-bold text-gray-900">{request.requester}</p>
          <p className="text-gray-500">Pedido el {formatDateTimeAR(request.requestedAt)}</p>
          {delivered ? (
            <p className="font-semibold text-emerald-700">Entregada el {formatDateTimeAR(request.deliveredAt)}</p>
          ) : (
            <p className={`font-semibold ${late ? 'text-red-700' : 'text-amber-700'}`}>
              {late ? 'Plazo vencido el' : 'Entregar antes del'} {formatDateTimeAR(request.deadline)}
            </p>
          )}
        </div>
        {!delivered && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button type="button" onClick={onPrint} className={`${secondaryButtonClass} py-2`}>
              <Printer className="w-4 h-4" aria-hidden="true" /> Imprimir copia
            </button>
            <button type="button" onClick={() => onDeliver(request)} className={`${primaryButtonClass} py-2`}>
              Marcar entregada
            </button>
          </div>
        )}
      </div>
    </li>
  );
};

// Derechos del titular y controles de la historia: pedido de copia autenticada (48 h) y
// trazabilidad de quién accedió y qué hizo. Cada acción confirma y termina con la ventana de salida.
const LegalPanel = ({ copyRequests, accessLog, onRequestCopy, onDeliverCopy, onPrint, onSuccess }) => {
  const fieldId = useId();
  const [showModal, setShowModal] = useState(false);
  const [requester, setRequester] = useState(REQUESTERS[0]);
  const [confirm, setConfirm] = useState(null); // { kind: 'request' } | { kind: 'deliver', request }
  const [saving, setSaving] = useState(false);

  const runConfirmed = async () => {
    if (saving || !confirm) return;
    setSaving(true);
    try {
      if (confirm.kind === 'request') {
        await onRequestCopy(requester);
        setShowModal(false);
        onSuccess('Pedido registrado', `La copia autenticada debe entregarse dentro de las ${COPY_DEADLINE_HOURS} horas.`);
      } else {
        await onDeliverCopy(confirm.request.id);
        onSuccess('Copia entregada', 'La entrega quedó registrada en la trazabilidad de la historia.');
      }
    } finally {
      setSaving(false);
      setConfirm(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className={`${cardClass} p-5 sm:p-6`}>
        <SectionTitle icon={FileCheck2}>Copia autenticada</SectionTitle>
        <p className="text-sm text-gray-500 -mt-2 mb-4">
          El paciente es titular de su historia clínica. La copia autenticada se entrega dentro de las {COPY_DEADLINE_HOURS} horas desde el pedido.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={() => setShowModal(true)} className={primaryButtonClass}>
            <FileCheck2 className="w-5 h-5" aria-hidden="true" /> Registrar pedido de copia
          </button>
          <button type="button" onClick={onPrint} className={secondaryButtonClass}>
            <Printer className="w-5 h-5" aria-hidden="true" /> Imprimir historia
          </button>
        </div>
        {copyRequests.length > 0 && (
          <ul className="mt-5 space-y-3">
            {copyRequests.map((r) => (
              <CopyRequestRow key={r.id} request={r} onPrint={onPrint} onDeliver={(request) => setConfirm({ kind: 'deliver', request })} />
            ))}
          </ul>
        )}
      </section>

      <section className={`${cardClass} p-5 sm:p-6`}>
        <SectionTitle icon={Fingerprint}>Registro de accesos</SectionTitle>
        <p className="text-sm text-gray-500 -mt-2 mb-4">Cada acceso y cada acción sobre la historia queda registrado con usuario, fecha y hora.</p>
        {accessLog.length === 0 ? (
          <EmptyState icon={ScrollText} title="Sin movimientos registrados" />
        ) : (
          <>
            <ul className="md:hidden space-y-2">
              {accessLog.map((a) => (
                <li key={a.id} className="rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2 text-sm">
                  <p className="font-semibold text-gray-800">{ACCESS_ACTIONS[a.action] ?? a.action}</p>
                  {a.detail && <p className="text-gray-600 break-words">{a.detail}</p>}
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" aria-hidden="true" />{formatDateTimeAR(a.at)} · {a.by}</p>
                </li>
              ))}
            </ul>
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-bold">Fecha y hora</th>
                    <th scope="col" className="px-4 py-3 font-bold">Usuario</th>
                    <th scope="col" className="px-4 py-3 font-bold">Acción</th>
                    <th scope="col" className="px-4 py-3 font-bold">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {accessLog.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{formatDateTimeAR(a.at)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{a.by}</td>
                      <td className="px-4 py-3 text-gray-700">{ACCESS_ACTIONS[a.action] ?? a.action}</td>
                      <td className="px-4 py-3 text-gray-500">{a.detail || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {showModal && (
        <SecretaryModalOverlay onClose={saving ? () => {} : () => setShowModal(false)} labelledBy={`${fieldId}-titulo`}>
          <SecretaryModalCard maxWidth="max-w-md">
            <SecretaryModalHeader icon={FileCheck2} titleId={`${fieldId}-titulo`} title="Pedido de copia autenticada" onClose={() => setShowModal(false)} />
            <form className="p-5 sm:p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setConfirm({ kind: 'request' }); }}>
              <div>
                <label htmlFor={`${fieldId}-solicitante`} className={labelClass}>¿Quién la solicita?</label>
                <select id={`${fieldId}-solicitante`} value={requester} onChange={(e) => setRequester(e.target.value)} className={inputClass}>
                  {REQUESTERS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <p className="text-sm text-gray-500">
                Se registra el pedido con fecha y hora, y empieza a correr el plazo de {COPY_DEADLINE_HOURS} horas para la entrega.
              </p>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className={secondaryButtonClass}>Cancelar</button>
                <button type="submit" className={primaryButtonClass}>Registrar pedido</button>
              </div>
            </form>
          </SecretaryModalCard>
        </SecretaryModalOverlay>
      )}

      <EditConfirmModal
        isOpen={Boolean(confirm)}
        title={confirm?.kind === 'deliver' ? '¿Marcar la copia como entregada?' : '¿Registrar el pedido de copia?'}
        message={confirm?.kind === 'deliver'
          ? `Copia solicitada por ${confirm.request.requester}. La entrega queda registrada con tu nombre, fecha y hora.`
          : `Solicitante: ${requester}. El plazo de entrega es de ${COPY_DEADLINE_HOURS} horas.`}
        confirmLabel={saving ? 'Guardando...' : 'Sí, Confirmar'}
        onCancel={() => { if (!saving) setConfirm(null); }}
        onConfirm={runConfirmed}
      />
    </div>
  );
};

export default LegalPanel;
