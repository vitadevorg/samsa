import React, { useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, FilePlus2, FileText, LayoutDashboard, Printer, ShieldCheck } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import PageHeader from '../../../components/PageHeader';
import { useAuth } from '../../../context/useAuth';
import { ENTRY_TYPES } from '../../../constants/hce';
import { effectiveFollowupStatus, getProfessionalStamp } from '../../../services/hceService';
import { useHceRecord } from './useHceRecord';
import PatientIdentityCard from './PatientIdentityCard';
import SummaryPanel from './SummaryPanel';
import RecordTimeline from './RecordTimeline';
import FollowupPanel from './FollowupPanel';
import LegalPanel from './LegalPanel';
import EntryFormModal from './EntryFormModal';
import RecordPrint from './RecordPrint';
import { ErrorState, LoadingState } from './HceStates';
import { primaryButtonClass, secondaryButtonClass } from './hceUi';
import { useSuccessModal } from '../../vitadev/useSuccessModal';
import { SuccessModal } from '../../clinic/ClinicModals';

const TABS = [
  { key: 'resumen', label: 'Resumen clínico', icon: LayoutDashboard },
  { key: 'registros', label: 'Registros clínicos', icon: FileText },
  { key: 'seguimiento', label: 'Plan de seguimiento', icon: CalendarClock },
  { key: 'legal', label: 'Copia y accesos', icon: ShieldCheck },
];

// Ficha del paciente en el panel médico: identificación fija a la izquierda (arriba en mobile)
// y la historia organizada en pestañas. La pestaña activa queda en la URL (?tab=...).
export default function PatientRecord() {
  const { historyId } = useParams();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const record = useHceRecord(historyId, user);
  const tabRefs = useRef([]);
  // Ventana verde de salida del sistema, igual que en el resto de los módulos.
  const { success, showSuccess } = useSuccessModal();

  const requestedType = searchParams.get('nuevo');
  const [modal, setModal] = useState(() => (requestedType && ENTRY_TYPES[requestedType] ? { type: requestedType } : null));

  const activeTab = TABS.some((t) => t.key === searchParams.get('tab')) ? searchParams.get('tab') : 'resumen';
  const goTo = (tab) => setSearchParams({ tab }, { replace: true });

  const onTabKeyDown = (e, index) => {
    const delta = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + TABS.length) % TABS.length;
    goTo(TABS[next].key);
    tabRefs.current[next]?.focus();
  };

  const openNew = (type = 'evolution') => setModal({ type });
  const closeModal = () => {
    setModal(null);
    if (searchParams.has('nuevo')) setSearchParams({ tab: activeTab }, { replace: true });
  };

  const overdueCount = record.followups.filter((t) => effectiveFollowupStatus(t) === 'overdue').length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 overflow-x-clip">
      {/* `contents`: el contenedor no genera caja, así la Navbar (sticky) sigue fija al recorrer la página. */}
      <div className="contents print:hidden"><Navbar /></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 print:hidden">
        <Link to="/doctor/patients" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-700 mb-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Mis pacientes
        </Link>

        <PageHeader
          icon={FileText}
          eyebrow="Historia clínica electrónica"
          title={record.patient?.name ?? 'Historia clínica'}
          actions={record.status === 'ready' && (
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button type="button" onClick={() => window.print()} className={secondaryButtonClass}>
                <Printer className="w-5 h-5" aria-hidden="true" /> Imprimir
              </button>
              <button type="button" onClick={() => openNew()} className={primaryButtonClass}>
                <FilePlus2 className="w-5 h-5" aria-hidden="true" /> Nuevo registro
              </button>
            </div>
          )}
        />

        {record.status === 'loading' && <LoadingState label="Cargando la historia clínica..." />}
        {record.status === 'error' && <ErrorState message={record.error} onRetry={record.reload} />}

        {record.status === 'ready' && (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)] gap-6 items-start">
            <aside>
              <PatientIdentityCard patient={record.patient} />
            </aside>

            <section className="min-w-0">
              <div role="tablist" aria-label="Secciones de la historia clínica" className="grid grid-cols-2 2xl:grid-cols-4 gap-1 bg-white border border-gray-100 shadow-sm rounded-2xl p-1.5 mb-5">
                {TABS.map((tab, index) => {
                  const Icon = tab.icon;
                  const selected = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      ref={(el) => { tabRefs.current[index] = el; }}
                      id={`tab-${tab.key}`}
                      role="tab"
                      type="button"
                      aria-selected={selected}
                      aria-controls={`panel-${tab.key}`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => goTo(tab.key)}
                      onKeyDown={(e) => onTabKeyDown(e, index)}
                      className={`relative min-w-0 inline-flex items-center justify-center gap-2 px-2 sm:px-3 py-2.5 rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        selected ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{tab.label}</span>
                      {tab.key === 'seguimiento' && overdueCount > 0 && (
                        <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center" aria-label={`${overdueCount} vencidas`}>
                          {overdueCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} className="animate-fadeIn">
                {activeTab === 'resumen' && (
                  <SummaryPanel entries={record.entries} tasks={record.followups} onGoTo={goTo} onNew={openNew} />
                )}
                {activeTab === 'registros' && (
                  <RecordTimeline entries={record.entries} onNew={() => openNew()} onAmend={(entry) => setModal({ original: entry })} />
                )}
                {activeTab === 'seguimiento' && (
                  <FollowupPanel tasks={record.followups} onCreate={record.addFollowup} onChangeStatus={record.setFollowupStatus} onSuccess={showSuccess} />
                )}
                {activeTab === 'legal' && (
                  <LegalPanel
                    copyRequests={record.copyRequests}
                    accessLog={record.accessLog}
                    onRequestCopy={record.requestCopy}
                    onDeliverCopy={record.deliverCopy}
                    onPrint={() => window.print()}
                    onSuccess={showSuccess}
                  />
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {record.status === 'ready' && (
        <RecordPrint
          patient={record.patient}
          entries={record.entries}
          tasks={record.followups}
          issuer={getProfessionalStamp(user)}
          copyRequest={record.copyRequests.find((r) => r.status === 'pending')}
        />
      )}

      {modal && record.patient && (
        <EntryFormModal
          key={modal.original?.id ?? modal.type}
          patient={record.patient}
          user={user}
          original={modal.original}
          initialType={modal.type}
          onClose={closeModal}
          onDone={(isAmend) => {
            closeModal();
            showSuccess(isAmend ? 'Enmienda firmada' : 'Registro firmado', 'Quedó agregado a la historia clínica con fecha, hora y sello del profesional.');
          }}
          onSubmit={({ type, data, reason }) => (
            modal.original ? record.amend(modal.original.id, data, reason) : record.addEntry(type, data)
          )}
        />
      )}

      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />

      <div className="print:hidden"><Footer /></div>
    </div>
  );
}
