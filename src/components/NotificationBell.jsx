import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, CalendarClock, Inbox, LifeBuoy, Info, X } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useNotifications } from '../context/notifications-context';
import { useSupport } from '../context/support-context';
import { INSTITUTION_ADMIN_PATHS } from '../constants/roles';
import { useDismissOnOutside } from '../hooks/useDismissOnOutside';
import { timeAgo } from '../utils/dates';

const TYPE_ICON = {
  support: { Icon: LifeBuoy, tone: 'bg-indigo-100 text-indigo-600' },
  turn: { Icon: CalendarClock, tone: 'bg-blue-100 text-blue-600' },
  request: { Icon: Inbox, tone: 'bg-amber-100 text-amber-600' },
  info: { Icon: Info, tone: 'bg-slate-100 text-slate-500' },
};

// Campana de la cabecera: lista desplegable con todos los mensajes que recibe el usuario.
// Mismo tono claro que el botón de cuenta, para todos los roles.
const NotificationBell = () => {
  const { user } = useAuth();
  const { forUser, markRead, markAllRead, dismiss, dismissAll } = useNotifications();
  const { openSupport } = useSupport();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const items = useMemo(() => forUser(user), [forUser, user]);
  const unread = items.filter((n) => !n.read).length;

  // Click afuera o Escape cierran el desplegable.
  const close = useCallback(() => setOpen(false), []);
  useDismissOnOutside(rootRef, open, close);

  if (!user) return null;

  const handleOpen = (n) => {
    markRead(n.id, user);
    setOpen(false);
    if (n.action?.type === 'link') navigate(n.action.to);
    else if (n.action?.type === 'institution-link') navigate(`${INSTITUTION_ADMIN_PATHS[user.role]}/${n.action.path}`);
    else if (n.action?.type === 'ticket') openSupport(n.action.ticketId);
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Notificaciones: ${unread} sin leer` : 'Notificaciones'}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative w-11 h-11 rounded-xl border flex items-center justify-center transition-all shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-[4.5rem] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 motion-reduce:animate-none">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100">
            <p className="font-bold text-slate-900">Notificaciones</p>
            <div className="flex items-center gap-3 text-xs font-bold">
              {unread > 0 && <button type="button" onClick={() => markAllRead(user)} className="text-blue-700 hover:underline">Marcar leídas</button>}
              {items.length > 0 && <button type="button" onClick={() => dismissAll(user)} className="text-slate-400 hover:text-red-600">Borrar todas</button>}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-slate-400">
              <BellOff className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No tenés notificaciones.</p>
            </div>
          ) : (
            <ul className="max-h-[60vh] sm:max-h-96 overflow-y-auto divide-y divide-slate-50">
              {items.map((n) => {
                const { Icon, tone } = TYPE_ICON[n.type] ?? TYPE_ICON.info;
                const clickable = Boolean(n.action);
                return (
                  <li key={n.id} className={`group relative flex items-start gap-3 px-4 py-3 ${n.read ? '' : 'bg-blue-50/50'}`}>
                    <div className={`mt-0.5 shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${tone}`}><Icon className="w-4 h-4" /></div>
                    <button
                      type="button"
                      onClick={() => (clickable ? handleOpen(n) : markRead(n.id, user))}
                      className={`min-w-0 flex-1 text-left ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <p className={`text-sm text-slate-900 ${n.read ? 'font-semibold' : 'font-bold'}`}>{n.title}</p>
                      {n.body && <p className="text-sm text-slate-500 line-clamp-2 break-words">{n.body}</p>}
                      <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                    </button>
                    {!n.read && <span className="mt-2 w-2 h-2 rounded-full bg-blue-600 shrink-0" aria-label="Sin leer" />}
                    <button type="button" onClick={() => dismiss(n.id, user)} aria-label="Quitar notificación" className="shrink-0 p-1 -mr-1 text-slate-300 hover:text-red-500 rounded-md">
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
