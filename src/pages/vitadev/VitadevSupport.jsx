import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, LifeBuoy, Search } from 'lucide-react';
import Navbar from '../../components/Navbar';
import PageHeader from '../../components/PageHeader';
import FadeIn from '../../components/FadeIn';
import TicketThread, { TicketRow } from '../../components/support/TicketThread';
import { useAuth } from '../../context/useAuth';
import { useSupport } from '../../context/support-context';
import { TICKET_CATEGORIES, TICKET_STATUS, TICKET_STATUS_META } from '../../data/support';

const selectClass = 'rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500';

// Módulo del administrador SAMSA para gestionar los tickets de soporte que envían los usuarios:
// ver todos, filtrar, responder en el hilo y cambiar el estado.
const VitadevSupport = () => {
  const { user } = useAuth();
  const { ticketsFor, addMessage, setStatus } = useSupport();
  const [params, setParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [query, setQuery] = useState('');

  const all = useMemo(() => ticketsFor(user), [ticketsFor, user]);
  const selectedId = params.get('ticket');
  const selected = all.find((t) => t.id === selectedId);

  const select = (id) => setParams(id ? { ticket: id } : {}, { replace: true });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((t) => (
      (statusFilter === 'all' || t.status === statusFilter)
      && (categoryFilter === 'all' || t.category === categoryFilter)
      && (!q || `${t.number} ${t.subject} ${t.authorName} ${t.authorEmail}`.toLowerCase().includes(q))
    ));
  }, [all, statusFilter, categoryFilter, query]);

  const countOf = (status) => all.filter((t) => t.status === status).length;

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-clip">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <PageHeader
          icon={LifeBuoy}
          eyebrow="Administración SAMSA"
          title="Soporte"
          description="Tickets que reportan los usuarios del sistema. Respondé desde acá: cada usuario recibe el aviso en su campana."
        />

        <FadeIn delay={80} className="grid grid-cols-3 gap-3 sm:gap-5 mb-6">
          {Object.values(TICKET_STATUS).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              aria-pressed={statusFilter === status}
              className={`text-left bg-white rounded-3xl border p-4 sm:p-5 shadow-lg shadow-slate-900/[0.04] transition-all hover:-translate-y-0.5 ${statusFilter === status ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-100'}`}
            >
              <p className="font-mono tracking-tighter font-bold text-3xl sm:text-4xl text-slate-900">{countOf(status)}</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">{TICKET_STATUS_META[status].label}</p>
            </button>
          ))}
        </FadeIn>

        <FadeIn delay={160} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <section className={`lg:col-span-2 ${selected ? 'hidden lg:block' : ''}`} aria-label="Lista de tickets">
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por asunto, usuario o Nº"
                  aria-label="Buscar tickets"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Filtrar por tipo" className={selectClass}>
                <option value="all">Todos los tipos</option>
                {TICKET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center text-slate-400">
                {all.length === 0 ? 'Todavía no llegó ningún ticket.' : 'Ningún ticket coincide con los filtros.'}
              </div>
            ) : (
              <ul className="space-y-2">
                {filtered.map((t) => (
                  <li key={t.id}>
                    <TicketRow ticket={t} showAuthor selected={t.id === selectedId} onClick={() => select(t.id)} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={`lg:col-span-3 ${selected ? '' : 'hidden lg:block'}`} aria-label="Detalle del ticket">
            <div className="bg-white rounded-3xl sm:rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-900/[0.04] p-5 sm:p-6 min-h-[16rem]">
              {selected ? (
                <>
                  <button type="button" onClick={() => select(null)} className="lg:hidden flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:underline mb-3">
                    <ArrowLeft className="w-4 h-4" /> Todos los tickets
                  </button>
                  <TicketThread
                    ticket={selected}
                    adminView
                    onSend={(text) => addMessage(selected.id, user, text)}
                    onStatusChange={(status) => setStatus(selected.id, status, user)}
                  />
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                  <LifeBuoy className="w-10 h-10 mb-3" />
                  <p>Elegí un ticket de la lista para ver la conversación.</p>
                </div>
              )}
            </div>
          </section>
        </FadeIn>
      </div>
    </div>
  );
};

export default VitadevSupport;
