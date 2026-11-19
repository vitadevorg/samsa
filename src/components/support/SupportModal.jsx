import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle, LifeBuoy, X } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useSupport } from '../../context/support-context';
import {
  DESCRIPTION_MAX, DESCRIPTION_MIN, GUEST_ROLE, SUBJECT_MAX, TICKET_CATEGORIES,
} from '../../data/support';
import { validateEmail } from '../../pages/clinic/clinicValidation';
import TicketThread, { TicketRow } from './TicketThread';

const fieldClass = 'w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

const EMPTY_FORM = { category: TICKET_CATEGORIES[0], subject: '', description: '', name: '', email: '' };

// Ventana de soporte para cualquier usuario con sesión: reportar un problema al administrador
// SAMSA y seguir sus tickets. Se abre desde el pie de la página o desde la campana.
// `guest`: versión sin sesión (Preguntas Frecuentes): pide nombre y correo y no tiene "Mis tickets".
const SupportModal = ({ initialTicketId, guest = false, onClose }) => {
  const { user } = useAuth();
  const { ticketsFor, createTicket, addMessage } = useSupport();
  const myTickets = useMemo(() => ticketsFor(user), [ticketsFor, user]);
  const [tab, setTab] = useState(initialTicketId ? 'tickets' : 'new');
  const [selectedId, setSelectedId] = useState(initialTicketId);
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState(false);
  const [created, setCreated] = useState(null);

  // Escape cierra la ventana.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const selected = myTickets.find((t) => t.id === selectedId);
  const errors = {
    subject: form.subject.trim() ? '' : 'Indicá un asunto.',
    description: form.description.trim().length >= DESCRIPTION_MIN ? '' : `Contanos el problema con al menos ${DESCRIPTION_MIN} caracteres.`,
    // Solo el invitado carga sus datos de contacto: quien tiene sesión ya está identificado.
    name: !guest || form.name.trim() ? '' : 'Indicá tu nombre.',
    email: guest ? validateEmail(form.email) : '',
  };
  const invalid = Object.values(errors).some(Boolean);

  const setField = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (invalid) return;
    const author = guest ? { name: form.name.trim(), email: form.email.trim(), role: GUEST_ROLE } : user;
    const ticket = createTicket(author, form);
    if (ticket) setCreated(ticket);
  };

  const viewCreated = () => {
    setSelectedId(created.id);
    setTab('tickets');
    setCreated(null);
    setForm(EMPTY_FORM);
    setTouched(false);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200 motion-reduce:animate-none"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="support-title" className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300 motion-reduce:animate-none">
        <div className="flex items-center gap-3 p-5 sm:p-6 border-b border-slate-100">
          <div className="bg-blue-100 p-2 rounded-xl"><LifeBuoy className="w-5 h-5 text-blue-700" /></div>
          <div className="min-w-0">
            <h2 id="support-title" className="text-lg sm:text-xl font-bold text-slate-900">Contacto con soporte</h2>
            <p className="text-sm text-slate-500">{guest ? 'Contanos tu consulta y te respondemos por correo.' : 'Reportá un error o problema al administrador de SAMSA.'}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="ml-auto shrink-0 p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!guest && <div className="px-5 sm:px-6 pt-4 flex gap-2" role="tablist">
          {[['new', 'Nuevo reporte'], ['tickets', `Mis tickets (${myTickets.length})`]].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => { setTab(key); if (key === 'tickets') setSelectedId(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {label}
            </button>
          ))}
        </div>}

        <div className="p-5 sm:p-6">
          {tab === 'new' && created && (
            <div className="text-center py-4">
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
              <p className="text-lg font-bold text-slate-900">Reporte enviado</p>
              <p className="text-sm text-slate-500 mt-1">{guest ? `Tu reporte #${created.number} llegó al administrador. Te responderemos al correo ${created.authorEmail}.` : `Tu ticket #${created.number} llegó al administrador. Te avisaremos en la campana cuando responda.`}</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                {!guest && <button type="button" onClick={viewCreated} className="flex-1 px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">Ver mi ticket</button>}
                <button type="button" onClick={onClose} className={`flex-1 px-5 py-3 rounded-xl font-bold transition-colors ${guest ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>Cerrar</button>
              </div>
            </div>
          )}

          {tab === 'new' && !created && (
            <form onSubmit={submit} noValidate className="space-y-4">
              {guest && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="support-name" className="block text-sm font-bold text-slate-700 mb-1.5">Nombre</label>
                    <input id="support-name" value={form.name} onChange={setField('name')} maxLength={80} autoComplete="name" className={fieldClass} aria-invalid={touched && Boolean(errors.name)} />
                    {touched && errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="support-email" className="block text-sm font-bold text-slate-700 mb-1.5">Correo</label>
                    <input id="support-email" type="email" value={form.email} onChange={setField('email')} maxLength={120} autoComplete="email" placeholder="nombre@ejemplo.com" className={fieldClass} aria-invalid={touched && Boolean(errors.email)} />
                    {touched && errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="support-category" className="block text-sm font-bold text-slate-700 mb-1.5">Tipo de problema</label>
                <select id="support-category" value={form.category} onChange={setField('category')} className={fieldClass}>
                  {TICKET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="support-subject" className="block text-sm font-bold text-slate-700 mb-1.5">Asunto</label>
                <input id="support-subject" value={form.subject} onChange={setField('subject')} maxLength={SUBJECT_MAX} placeholder="Ej.: No puedo ver mis turnos" className={fieldClass} aria-invalid={touched && Boolean(errors.subject)} />
                {touched && errors.subject && <p className="text-xs text-red-600 mt-1">{errors.subject}</p>}
              </div>
              <div>
                <label htmlFor="support-description" className="block text-sm font-bold text-slate-700 mb-1.5">Descripción</label>
                <textarea id="support-description" value={form.description} onChange={setField('description')} maxLength={DESCRIPTION_MAX} rows={5} placeholder="Contanos qué pasó, en qué pantalla y qué esperabas que ocurra." className={`${fieldClass} resize-none`} aria-invalid={touched && Boolean(errors.description)} />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-red-600">{touched && errors.description}</p>
                  <p className="text-xs text-slate-400">{form.description.length}/{DESCRIPTION_MAX}</p>
                </div>
              </div>
              <button type="submit" className="w-full px-6 py-3.5 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-colors">
                Enviar reporte
              </button>
            </form>
          )}

          {tab === 'tickets' && !selected && (
            myTickets.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Todavía no enviaste ningún reporte.</p>
            ) : (
              <ul className="space-y-2">
                {myTickets.map((t) => (
                  <li key={t.id}>
                    <TicketRow ticket={t} onClick={() => setSelectedId(t.id)} />
                  </li>
                ))}
              </ul>
            )
          )}

          {tab === 'tickets' && selected && (
            <div>
              <button type="button" onClick={() => setSelectedId(null)} className="flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:underline mb-3">
                <ArrowLeft className="w-4 h-4" /> Mis tickets
              </button>
              <TicketThread ticket={selected} onSend={(text) => addMessage(selected.id, user, text)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
