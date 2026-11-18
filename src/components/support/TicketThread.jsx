import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Send } from 'lucide-react';
import { DESCRIPTION_MAX, GUEST_ROLE, ROLE_LABELS, TICKET_STATUS, TICKET_STATUS_META } from '../../data/support';
import { formatDateTime } from '../../utils/dates';

export const StatusBadge = ({ status }) => {
  const meta = TICKET_STATUS_META[status];
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${meta.badge}`}>{meta.label}</span>;
};

// Fila de la lista de tickets (ventana del usuario y módulo del admin). `showAuthor` agrega quién lo envió.
export const TicketRow = ({ ticket, onClick, selected = false, showAuthor = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left flex items-center gap-3 p-4 rounded-2xl border bg-white transition-colors hover:border-blue-200 hover:bg-blue-50/40 ${selected ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-100'}`}
  >
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2 mb-0.5">
        <span className="font-mono text-xs font-bold text-slate-400">#{ticket.number}</span>
        <StatusBadge status={ticket.status} />
      </div>
      <p className="font-bold text-slate-900 truncate">{ticket.subject}</p>
      {showAuthor && <p className="text-xs text-slate-500 truncate">{ticket.authorName} · {ROLE_LABELS[ticket.authorRole] ?? ticket.authorRole}</p>}
      <p className="text-xs text-slate-400">{formatDateTime(ticket.updatedAt)}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
  </button>
);

// Hilo de mensajes de un ticket + caja para responder. Lo usan la ventana de soporte del usuario
// y el módulo del admin SAMSA (`adminView`: muestra quién escribió y los botones de estado).
const TicketThread = ({ ticket, onSend, adminView = false, onStatusChange }) => {
  const [text, setText] = useState('');
  const endRef = useRef(null);

  // Al abrir el ticket o llegar un mensaje nuevo, el hilo baja al último.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [ticket.id, ticket.messages.length]);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <div className="flex flex-col min-h-0">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="font-mono text-xs font-bold text-slate-400">#{ticket.number}</span>
        <StatusBadge status={ticket.status} />
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">{ticket.category}</span>
      </div>
      <h3 className="text-lg font-bold text-slate-900 break-words">{ticket.subject}</h3>
      {adminView && (
        <p className="text-sm text-slate-500 mt-0.5">
          {ticket.authorName} · {ROLE_LABELS[ticket.authorRole] ?? ticket.authorRole} · {ticket.authorEmail}
        </p>
      )}

      {adminView && ticket.authorRole === GUEST_ROLE && (
        <p className="mt-3 text-sm bg-amber-50 text-amber-800 border border-amber-200 rounded-xl px-3 py-2">
          Es un invitado sin cuenta: no ve las respuestas en el sistema. Contestale por correo a {ticket.authorEmail}.
        </p>
      )}

      {adminView && onStatusChange && (
        <div className="flex flex-wrap gap-2 mt-3" role="group" aria-label="Cambiar estado">
          {Object.values(TICKET_STATUS).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(status)}
              aria-pressed={ticket.status === status}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${ticket.status === status ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              {TICKET_STATUS_META[status].label}
            </button>
          ))}
        </div>
      )}

      <ul className="mt-4 space-y-3 overflow-y-auto max-h-72 sm:max-h-80 pr-1">
        {ticket.messages.map((m) => {
          const mine = adminView ? m.from === 'admin' : m.from === 'user';
          return (
            <li key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] rounded-2xl px-4 py-2.5 ${mine ? 'bg-blue-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md'}`}>
                <p className={`text-xs font-bold mb-0.5 ${mine ? 'text-blue-100' : 'text-slate-500'}`}>{m.authorName}</p>
                <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
                <p className={`text-[11px] mt-1 ${mine ? 'text-blue-200' : 'text-slate-400'}`}>{formatDateTime(m.at)}</p>
              </div>
            </li>
          );
        })}
        <li ref={endRef} aria-hidden="true" />
      </ul>

      <form onSubmit={submit} className="mt-4 flex items-end gap-2">
        <label className="sr-only" htmlFor={`reply-${ticket.id}`}>Escribir un mensaje</label>
        <textarea
          id={`reply-${ticket.id}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={DESCRIPTION_MAX}
          rows={2}
          placeholder={adminView ? 'Responder al usuario…' : 'Escribir un mensaje…'}
          className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label="Enviar mensaje"
          className="shrink-0 h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default TicketThread;
