import React, { useId, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, ClipboardCheck, Plus, RotateCcw, XCircle } from 'lucide-react';
import { FOLLOWUP_KINDS, FOLLOWUP_STATUS } from '../../../constants/hce';
import { effectiveFollowupStatus } from '../../../services/hceService';
import { dateInputValue, formatDateAR, formatDateTimeAR } from '../../../utils/dates';
import { EditConfirmModal } from '../../clinic/ClinicModals';
import { EmptyState } from './HceStates';
import { cardClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './hceUi';

const kindLabel = (value) => FOLLOWUP_KINDS.find((k) => k.value === value)?.label ?? value;

const STATUS_ACTIONS = {
  done: { label: 'Marcar realizada', verb: 'marcar como realizada', icon: CheckCircle2, tone: 'text-emerald-700 hover:bg-emerald-50' },
  cancelled: { label: 'Cancelar', verb: 'cancelar', icon: XCircle, tone: 'text-gray-600 hover:bg-gray-100' },
  pending: { label: 'Reabrir', verb: 'reabrir', icon: RotateCcw, tone: 'text-blue-700 hover:bg-blue-50' },
};

const TaskRow = ({ task, onChange }) => {
  const status = effectiveFollowupStatus(task);
  const config = FOLLOWUP_STATUS[status];
  const isOpen = status === 'pending' || status === 'overdue';
  const lastChange = task.history.at(-1);
  const actions = isOpen ? ['done', 'cancelled'] : ['pending'];

  return (
    <li className={`rounded-2xl border p-4 transition-colors ${status === 'overdue' ? 'border-red-200 bg-red-50/50' : 'border-gray-100 bg-white'}`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.badge}`}>{config.label}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{kindLabel(task.kind)}</span>
          </div>
          <p className={`mt-1.5 font-bold break-words ${isOpen ? 'text-gray-900' : 'text-gray-500'}`}>{task.title}</p>
          <p className={`mt-0.5 flex items-center gap-1.5 text-sm ${status === 'overdue' ? 'text-red-700 font-semibold' : 'text-gray-500'}`}>
            <CalendarClock className="w-4 h-4 shrink-0" aria-hidden="true" />
            {status === 'overdue' ? 'Venció el ' : 'Fecha prevista: '}{formatDateAR(task.dueDate)}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {lastChange
              ? `${FOLLOWUP_STATUS[lastChange.status].label} por ${lastChange.by} el ${formatDateTimeAR(lastChange.at)}`
              : `Indicada por ${task.createdBy} el ${formatDateAR(task.createdAt)}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-1 sm:justify-end">
          {actions.map((key) => {
            const action = STATUS_ACTIONS[key];
            const Icon = action.icon;
            return (
              <button key={key} type="button" onClick={() => onChange(task, key)} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${action.tone}`}>
                <Icon className="w-4 h-4" aria-hidden="true" /> {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </li>
  );
};

// Plan de seguimiento del paciente: controles clínicos, estudios pendientes, interconsultas y medicación.
// Como en el resto del sistema: cada acción pide confirmación (ventana naranja) y termina con la
// ventana verde de salida, que muestra la página (`onSuccess`).
const FollowupPanel = ({ tasks, onCreate, onChangeStatus, onSuccess }) => {
  const fieldId = useId();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ kind: 'control', title: '', dueDate: dateInputValue(30) });
  const [formError, setFormError] = useState('');
  const [confirmCreate, setConfirmCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingChange, setPendingChange] = useState(null); // { task, status }
  const [showClosed, setShowClosed] = useState(false);

  const groups = useMemo(() => {
    const withStatus = tasks.map((t) => ({ task: t, status: effectiveFollowupStatus(t) }));
    return {
      overdue: withStatus.filter((t) => t.status === 'overdue').map((t) => t.task),
      pending: withStatus.filter((t) => t.status === 'pending').map((t) => t.task),
      closed: withStatus.filter((t) => t.status === 'done' || t.status === 'cancelled').map((t) => t.task).reverse(),
    };
  }, [tasks]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setFormError('Describí la tarea.'); return; }
    if (!form.dueDate) { setFormError('Elegí la fecha prevista.'); return; }
    setConfirmCreate(true);
  };

  const confirmCreateTask = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onCreate(form);
      setForm({ kind: 'control', title: '', dueDate: dateInputValue(30) });
      setFormError('');
      setShowForm(false);
      onSuccess('Tarea agregada', 'Se sumó al plan de seguimiento del paciente.');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
      setConfirmCreate(false);
    }
  };

  const confirmChange = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onChangeStatus(pendingChange.task.id, pendingChange.status);
      onSuccess('Estado actualizado', `La tarea quedó como ${FOLLOWUP_STATUS[pendingChange.status].label.toLowerCase()}. El cambio se registró con tu nombre, fecha y hora.`);
      setPendingChange(null);
    } finally {
      setSaving(false);
    }
  };

  const openCount = groups.overdue.length + groups.pending.length;
  const dueLabel = form.dueDate ? formatDateAR(`${form.dueDate}T12:00:00`) : '';

  return (
    <div className="space-y-5">
      <section className={`${cardClass} p-5 sm:p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Plan de seguimiento</h3>
            <p className="text-sm text-gray-500">
              {openCount === 0 ? 'No hay tareas abiertas.' : `${openCount} ${openCount === 1 ? 'tarea abierta' : 'tareas abiertas'}`}
              {groups.overdue.length > 0 && <span className="text-red-600 font-bold"> · {groups.overdue.length} vencida{groups.overdue.length > 1 ? 's' : ''}</span>}
            </p>
          </div>
          {!showForm && (
            <button type="button" onClick={() => setShowForm(true)} className={primaryButtonClass}>
              <Plus className="w-5 h-5" aria-hidden="true" /> Nueva tarea
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>
            <div>
              <label htmlFor={`${fieldId}-tipo`} className={labelClass}>Tipo</label>
              <select id={`${fieldId}-tipo`} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className={inputClass}>
                {FOLLOWUP_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor={`${fieldId}-fecha`} className={labelClass}>Fecha prevista</label>
              <input id={`${fieldId}-fecha`} type="date" value={form.dueDate} min={dateInputValue(0)} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className={inputClass} required />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={`${fieldId}-detalle`} className={labelClass}>Descripción</label>
              <input id={`${fieldId}-detalle`} type="text" value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); setFormError(''); }} placeholder="Ej: Control de TA con registros domiciliarios" className={inputClass} aria-invalid={Boolean(formError) || undefined} aria-describedby={formError ? `${fieldId}-error` : undefined} />
              {formError && <p id={`${fieldId}-error`} className="mt-1 ml-1 text-xs font-semibold text-red-600">{formError}</p>}
            </div>
            <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button type="button" onClick={() => { setShowForm(false); setFormError(''); }} className={secondaryButtonClass}>Cancelar</button>
              <button type="submit" className={primaryButtonClass}>Agregar al plan</button>
            </div>
          </form>
        )}
      </section>

      {tasks.length === 0 ? (
        <div className={cardClass}>
          <EmptyState icon={ClipboardCheck} title="Sin plan de seguimiento" description="Agregá controles clínicos, estudios pendientes, interconsultas o renovaciones de medicación." />
        </div>
      ) : (
        <>
          {openCount > 0 && (
            <ul className="space-y-3">
              {[...groups.overdue, ...groups.pending].map((task) => (
                <TaskRow key={task.id} task={task} onChange={(t, status) => setPendingChange({ task: t, status })} />
              ))}
            </ul>
          )}
          {groups.closed.length > 0 && (
            <div>
              <button type="button" aria-expanded={showClosed} onClick={() => setShowClosed((v) => !v)} className="text-sm font-bold text-blue-600 hover:text-blue-700">
                {showClosed ? 'Ocultar' : 'Ver'} tareas cerradas ({groups.closed.length})
              </button>
              {showClosed && (
                <ul className="mt-3 space-y-3">
                  {groups.closed.map((task) => (
                    <TaskRow key={task.id} task={task} onChange={(t, status) => setPendingChange({ task: t, status })} />
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      <EditConfirmModal
        isOpen={confirmCreate}
        title="¿Agregar la tarea al plan?"
        message={`${kindLabel(form.kind)}: ${form.title.trim()}. Fecha prevista: ${dueLabel}.`}
        confirmLabel={saving ? 'Guardando...' : 'Sí, Agregar'}
        onCancel={() => { if (!saving) setConfirmCreate(false); }}
        onConfirm={confirmCreateTask}
      />
      <EditConfirmModal
        isOpen={Boolean(pendingChange)}
        title="¿Cambiar el estado de la tarea?"
        message={pendingChange ? `Vas a ${STATUS_ACTIONS[pendingChange.status].verb} “${pendingChange.task.title}”. El cambio queda registrado con tu nombre, la fecha y la hora.` : ''}
        confirmLabel={saving ? 'Guardando...' : 'Sí, Confirmar'}
        onCancel={() => { if (!saving) setPendingChange(null); }}
        onConfirm={confirmChange}
      />
    </div>
  );
};

export default FollowupPanel;
