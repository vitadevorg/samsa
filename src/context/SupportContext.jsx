import React, { useCallback, useMemo, useState } from 'react';
import { SupportContext } from './support-context';
import { useNotifications } from './notifications-context';
import { ROLES } from '../constants/roles';
import { createId } from '../utils/ids';
import { normalizeEmail } from '../utils/email';
import {
  GUEST_ROLE, SUPPORT_AUTHOR, TICKET_STATUS, TICKET_STATUS_META, adminTicketPath,
} from '../data/support';

// Tickets de soporte. Es un mock en memoria, como el resto de los datos: se conservan
// mientras la página esté abierta y se pierden al recargar. Con backend, la verificación de
// quién puede ver o responder cada ticket la hace el servidor; acá se repite en el cliente.
// Cualquier usuario con sesión crea tickets y ve solo los suyos; solo el admin SAMSA ve todos,
// responde y cambia el estado. La ventana de soporte la monta <SupportModalHost /> (ver App.jsx).

const ADMIN_TARGET = { roles: [ROLES.VITADEV_ADMIN] };
const isAdmin = (user) => user?.role === ROLES.VITADEV_ADMIN;

const msg = (from, authorName, text, at) => ({ id: createId(), from, authorName, text, at });

// Ticket de demostración con el mensaje inicial del usuario (y, si hay, la respuesta del admin).
const seedTicket = ({ n, email, name, role, category, subject, at, status = TICKET_STATUS.OPEN, text, reply }) => ({
  id: `ticket-demo-${n}`,
  number: 1000 + n,
  authorEmail: email,
  authorName: name,
  authorRole: role,
  category,
  subject,
  status,
  createdAt: at,
  updatedAt: reply ? reply.at : at,
  messages: [msg('user', name, text, at), ...(reply ? [msg('admin', SUPPORT_AUTHOR, reply.text, reply.at)] : [])],
});

// Tickets de demostración para que el módulo del admin no arranque vacío.
const SEED_TICKETS = [
  seedTicket({
    n: 1, email: 'martin.gomez@samsa.med', name: 'Martín Gómez', role: ROLES.PATIENT, category: 'Problema con mi cuenta',
    subject: 'No puedo entrar: olvidé mi contraseña y no me llega el mail', at: '2026-11-17T18:10:00.000Z',
    text: 'Pedí recuperar la contraseña tres veces y no me llega ningún correo, ni en spam. ¿Me pueden dar una clave temporal para volver a entrar?',
  }),
  seedTicket({
    n: 2, email: 'sofia.luna@samsa.med', name: 'Sofía Luna', role: ROLES.PATIENT, category: 'Problema con mi cuenta',
    subject: 'Mi cuenta figura inhabilitada y quiero volver a usarla', at: '2026-11-15T14:20:00.000Z',
    text: 'Desde hace unos días no puedo sacar turnos porque dice que mi cuenta está inhabilitada. No pedí ninguna baja, ¿pueden revisarlo?',
  }),
  seedTicket({
    n: 3, email: 'admin.clinica@samsa.med', name: 'Carolina Medina', role: ROLES.CLINIC_ADMIN, category: 'Consulta u otro tema',
    subject: 'Falta una obra social en el listado del sistema', at: '2026-11-14T10:30:00.000Z',
    text: 'Atendemos pacientes de "Galeno" y no aparece en las obras sociales disponibles al reservar un turno. ¿Pueden agregarla al catálogo?',
  }),
  seedTicket({
    n: 4, email: 'priscila.gomez@samsa.med', name: 'Dra. Priscila Gómez', role: ROLES.DOCTOR, category: 'Problema con mi cuenta',
    subject: 'Actualizar el vencimiento de mi matrícula', at: '2026-11-10T08:15:00.000Z', status: TICKET_STATUS.RESOLVED,
    text: 'Renové mi matrícula y en el sistema sigue figurando como por vencer. Les envié el comprobante por mail.',
    reply: { at: '2026-11-11T12:00:00.000Z', text: 'Recibimos el comprobante y actualizamos la documentación en tu ficha. Ya figura como vigente.' },
  }),
];

export const SupportProvider = ({ children }) => {
  const { push } = useNotifications();
  const [tickets, setTickets] = useState(SEED_TICKETS);
  // Ventana de soporte: { ticketId?, guest } cuando está abierta, null cuando no.
  // `guest`: la abre alguien sin sesión (Preguntas Frecuentes); reporta con nombre y email, sin seguimiento en el sistema.
  const [modal, setModal] = useState(null);

  const openSupport = useCallback((ticketId = null, { guest = false } = {}) => setModal({ ticketId, guest }), []);
  const closeSupport = useCallback(() => setModal(null), []);

  // Avisos de soporte: al admin SAMSA (con acceso directo al ticket en su módulo) o al autor del ticket.
  const notifyAdmin = useCallback((title, body, ticketId) => push({
    to: ADMIN_TARGET, type: 'support', title, body, action: { type: 'link', to: adminTicketPath(ticketId) },
  }), [push]);
  const notifyAuthor = useCallback((ticket, title, body) => push({
    to: { email: ticket.authorEmail }, type: 'support', title, body, action: { type: 'ticket', ticketId: ticket.id },
  }), [push]);

  // Tickets visibles para `viewer`: todos para el admin SAMSA, solo los propios para el resto.
  const ticketsFor = useCallback((viewer) => {
    if (!viewer) return [];
    const list = isAdmin(viewer) ? tickets : tickets.filter((t) => t.authorEmail === normalizeEmail(viewer.email));
    return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [tickets]);

  const createTicket = useCallback((author, { category, subject, description }) => {
    if (!author?.email) return null;
    const now = new Date().toISOString();
    const ticket = {
      id: createId(),
      number: Math.max(1000, ...tickets.map((t) => t.number)) + 1,
      authorEmail: normalizeEmail(author.email),
      authorName: author.name,
      authorRole: author.role,
      category,
      subject: subject.trim(),
      status: TICKET_STATUS.OPEN,
      createdAt: now,
      updatedAt: now,
      messages: [msg('user', author.name, description.trim(), now)],
    };
    setTickets((prev) => [ticket, ...prev]);
    notifyAdmin(`Nuevo ticket #${ticket.number}`, `${author.name}${author.role === GUEST_ROLE ? ' (invitado)' : ''}: ${ticket.subject}`, ticket.id);
    return ticket;
  }, [tickets, notifyAdmin]);

  // Agrega un mensaje al hilo. El admin responde cualquier ticket; el resto, solo los propios.
  // Cuando responde el admin, un ticket abierto pasa a "En curso"; si el usuario escribe en uno resuelto, se reabre.
  const addMessage = useCallback((ticketId, author, text) => {
    const target = tickets.find((t) => t.id === ticketId);
    const admin = isAdmin(author);
    if (!target || !text.trim() || (!admin && target.authorEmail !== normalizeEmail(author?.email))) return;
    const now = new Date().toISOString();
    let status = target.status;
    if (admin && status === TICKET_STATUS.OPEN) status = TICKET_STATUS.IN_PROGRESS;
    if (!admin && status === TICKET_STATUS.RESOLVED) status = TICKET_STATUS.OPEN;
    const message = msg(admin ? 'admin' : 'user', admin ? SUPPORT_AUTHOR : author.name, text.trim(), now);
    setTickets((prev) => prev.map((t) => (
      t.id === ticketId ? { ...t, status, updatedAt: now, messages: [...t.messages, message] } : t
    )));
    if (admin) notifyAuthor(target, `Respuesta de soporte (#${target.number})`, message.text);
    else notifyAdmin(`Nuevo mensaje en el ticket #${target.number}`, `${author.name}: ${message.text}`, ticketId);
  }, [tickets, notifyAdmin, notifyAuthor]);

  // Solo el admin SAMSA cambia el estado; el usuario recibe el aviso.
  const setStatus = useCallback((ticketId, status, admin) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!isAdmin(admin) || !target || target.status === status || !TICKET_STATUS_META[status]) return;
    setTickets((prev) => prev.map((t) => (
      t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t
    )));
    notifyAuthor(target, `Tu ticket #${target.number} está ${TICKET_STATUS_META[status].label.toLowerCase()}`, target.subject);
  }, [tickets, notifyAuthor]);

  const openCount = useMemo(() => tickets.filter((t) => t.status !== TICKET_STATUS.RESOLVED).length, [tickets]);

  const value = useMemo(
    () => ({ ticketsFor, createTicket, addMessage, setStatus, openCount, modal, openSupport, closeSupport }),
    [ticketsFor, createTicket, addMessage, setStatus, openCount, modal, openSupport, closeSupport]
  );

  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
};
