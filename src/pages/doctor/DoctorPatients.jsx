import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarClock, ChevronRight, FilePlus2, Loader2, Plus, Search, UserPlus, Users } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageHeader from '../../components/PageHeader';
import FadeIn from '../../components/FadeIn';
import { useAuth } from '../../context/useAuth';
import { createPatient, listPatients } from '../../services/hceService';
import { formatDateAR } from '../../utils/dates';
import { SecretaryModalCard, SecretaryModalHeader, SecretaryModalOverlay } from '../secretary/dashboard/SecretaryModal';
import { EmptyState, ErrorState, LoadingState } from './hce/HceStates';
import { cardClass, errorInputClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './hce/hceUi';
import { EditConfirmModal, SuccessModal } from '../clinic/ClinicModals';
import { useSuccessModal } from '../vitadev/useSuccessModal';
import { useTimeouts } from '../../hooks/useTimeouts';

const initialsOf = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

// Alta de paciente: abre su historia clínica (clave única) y lleva directo a la ficha.
const AddPatientModal = ({ onClose, onCreated, user }) => {
  const fieldId = useId();
  const [form, setForm] = useState({ name: '', dni: '', birthDate: '', sex: '', phone: '', email: '', insuranceName: '', memberNumber: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirming, setConfirming] = useState(false);

  const set = (name) => (e) => {
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Como en el resto del sistema: validar, confirmar (ventana naranja) y mostrar la salida (verde).
  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Ingresá el nombre completo.';
    if (!/^\d{1,2}\.?\d{3}\.?\d{3}$/.test(form.dni.trim())) nextErrors.dni = 'Ingresá un DNI válido (7 u 8 números).';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setConfirming(true);
  };

  const confirmCreate = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const patient = await createPatient(form, user);
      onCreated(patient);
    } catch (err) {
      setSubmitError(err.message || 'No pudimos registrar al paciente.');
      setSaving(false);
      setConfirming(false);
    }
  };

  const field = (name, label, props = {}) => (
    <div className={props.wide ? 'sm:col-span-2' : ''}>
      <label htmlFor={`${fieldId}-${name}`} className={labelClass}>{label}{props.required && <span className="text-red-500" aria-hidden="true"> *</span>}</label>
      <input
        id={`${fieldId}-${name}`}
        value={form[name]}
        onChange={set(name)}
        type={props.type ?? 'text'}
        placeholder={props.placeholder}
        aria-invalid={Boolean(errors[name]) || undefined}
        aria-describedby={errors[name] ? `${fieldId}-${name}-error` : undefined}
        className={`${inputClass} ${errors[name] ? errorInputClass : ''}`}
      />
      {errors[name] && <p id={`${fieldId}-${name}-error`} className="mt-1 ml-1 text-xs font-semibold text-red-600">{errors[name]}</p>}
    </div>
  );

  return (
    <SecretaryModalOverlay onClose={saving ? () => {} : onClose} labelledBy={`${fieldId}-titulo`}>
      <SecretaryModalCard maxWidth="max-w-xl">
        <SecretaryModalHeader icon={UserPlus} titleId={`${fieldId}-titulo`} title="Nuevo paciente" subtitle="Se abre su historia clínica con una clave única." onClose={onClose} />
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-5 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto">
            {submitError && <p role="alert" className="sm:col-span-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-700">{submitError}</p>}
            {field('name', 'Nombre completo', { required: true, wide: true, placeholder: 'Ej: Juan Pérez' })}
            {field('dni', 'DNI', { required: true, placeholder: 'Ej: 30.123.456' })}
            {field('birthDate', 'Fecha de nacimiento', { type: 'date' })}
            <div>
              <label htmlFor={`${fieldId}-sex`} className={labelClass}>Sexo</label>
              <select id={`${fieldId}-sex`} value={form.sex} onChange={set('sex')} className={inputClass}>
                <option value="">Sin especificar</option>
                <option>Femenino</option>
                <option>Masculino</option>
                <option>X</option>
              </select>
            </div>
            {field('phone', 'Teléfono', { placeholder: 'Opcional' })}
            {field('insuranceName', 'Cobertura', { placeholder: 'Ej: OSDE (vacío = Particular)' })}
            {field('memberNumber', 'Nº de afiliado', { placeholder: 'Opcional' })}
            {field('email', 'Email', { type: 'email', wide: true, placeholder: 'Opcional' })}
          </div>
          <div className="px-5 py-4 sm:px-8 sm:py-5 border-t border-gray-100 bg-gray-50/60 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button type="button" onClick={onClose} disabled={saving} className={secondaryButtonClass}>Cancelar</button>
            <button type="submit" disabled={saving} className={primaryButtonClass}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />} Abrir historia clínica
            </button>
          </div>
        </form>
      </SecretaryModalCard>
      <EditConfirmModal
        isOpen={confirming}
        title="¿Abrir la historia clínica?"
        message={`Se registra a ${form.name.trim()} (DNI ${form.dni.trim()}) y se le asigna un número de historia clínica único que no cambia.`}
        confirmLabel={saving ? 'Guardando...' : 'Sí, Registrar'}
        onCancel={() => { if (!saving) setConfirming(false); }}
        onConfirm={confirmCreate}
      />
    </SecretaryModalOverlay>
  );
};

const PatientCard = ({ patient }) => (
  <article className={`${cardClass} p-5 sm:p-6 h-full flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}>
    <div className="flex items-start gap-4">
      {patient.img ? (
        <img src={patient.img} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shrink-0 border border-gray-100" />
      ) : (
        <div aria-hidden="true" className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 text-blue-700 font-black text-lg flex items-center justify-center shrink-0">
          {initialsOf(patient.name)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold text-gray-900 break-words leading-tight">{patient.name}</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          DNI {patient.dni}{patient.age != null && ` · ${patient.age} años`}
        </p>
        <p className="mt-1.5 inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 font-mono">{patient.historyId}</p>
      </div>
    </div>

    <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
      {patient.overdueTasks > 0 && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
          <CalendarClock className="w-3.5 h-3.5" aria-hidden="true" /> {patient.overdueTasks} seguimiento{patient.overdueTasks > 1 ? 's' : ''} vencido{patient.overdueTasks > 1 ? 's' : ''}
        </span>
      )}
      {patient.pendingTasks > 0 && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          {patient.pendingTasks} pendiente{patient.pendingTasks > 1 ? 's' : ''}
        </span>
      )}
      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
        Última actuación: {formatDateAR(patient.lastActivity)}
      </span>
    </div>

    <div className="mt-auto pt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Link to={`/doctor/patients/${patient.historyId}?tab=registros&nuevo=evolution`} className="inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        <FilePlus2 className="w-4 h-4" aria-hidden="true" /> Nueva evolución
      </Link>
      <Link to={`/doctor/patients/${patient.historyId}`} className="inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
        Abrir historia clínica <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
      </Link>
    </div>
  </article>
);

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'overdue', label: 'Con seguimiento vencido' },
  { value: 'pending', label: 'Con tareas pendientes' },
];

// Listado de pacientes del médico: punto de entrada a la historia clínica y al seguimiento.
export default function DoctorPatients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchId = useId();
  const [state, setState] = useState({ status: 'loading', patients: [], error: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const { success, showSuccess } = useSuccessModal();
  const { schedule } = useTimeouts();

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'loading', error: '' }));
    try {
      const patients = await listPatients();
      setState({ status: 'ready', patients, error: '' });
    } catch (err) {
      setState({ status: 'error', patients: [], error: err.message || 'No pudimos cargar los pacientes.' });
    }
  }, []);

  useEffect(() => {
    // Carga inicial desde el servicio de la HCE.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const digits = q.replace(/\D/g, '');
    return state.patients
      .filter((p) => (filter === 'overdue' ? p.overdueTasks > 0 : filter === 'pending' ? p.pendingTasks + p.overdueTasks > 0 : true))
      .filter((p) => !q
        || p.name.toLowerCase().includes(q)
        || p.historyId.toLowerCase().includes(q)
        || (digits && p.dni.replace(/\D/g, '').includes(digits)))
      .sort((a, b) => b.overdueTasks - a.overdueTasks || String(b.lastActivity).localeCompare(String(a.lastActivity)));
  }, [state.patients, searchTerm, filter]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 overflow-x-clip">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <PageHeader
          icon={Users}
          eyebrow="Panel médico"
          title="Mis pacientes"
          description="Historia clínica electrónica y seguimiento de cada paciente."
          actions={(
            <button type="button" onClick={() => setShowAdd(true)} className={`${primaryButtonClass} w-full lg:w-auto`}>
              <Plus className="w-5 h-5" aria-hidden="true" /> Nuevo paciente
            </button>
          )}
        />

        <FadeIn delay={100} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-6 flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1">
            <label htmlFor={searchId} className="sr-only">Buscar paciente</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input id={searchId} type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por nombre, DNI o Nº de historia..." className={`${inputClass} pl-10`} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1" role="group" aria-label="Filtrar pacientes">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  filter === f.value ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {state.status === 'loading' && <LoadingState label="Cargando pacientes..." />}
        {state.status === 'error' && <ErrorState message={state.error} onRetry={load} />}
        {state.status === 'ready' && (
          filtered.length === 0 ? (
            <div className={cardClass}>
              <EmptyState
                icon={Search}
                title={state.patients.length === 0 ? 'Todavía no tenés pacientes' : 'No encontramos pacientes'}
                description={state.patients.length === 0 ? 'Registrá un paciente para abrir su historia clínica.' : 'Probá con otro nombre, DNI o filtro.'}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {filtered.map((patient, i) => (
                <FadeIn key={patient.historyId} delay={Math.min(i, 5) * 60} className="h-full">
                  <PatientCard patient={patient} />
                </FadeIn>
              ))}
            </div>
          )
        )}
      </main>
      <Footer />

      {showAdd && (
        <AddPatientModal
          user={user}
          onClose={() => setShowAdd(false)}
          onCreated={(patient) => {
            setShowAdd(false);
            showSuccess('Paciente registrado', `Se abrió su historia clínica Nº ${patient.historyId.replace('HC-', '')}.`);
            schedule(() => navigate(`/doctor/patients/${patient.historyId}`), 1800);
          }}
        />
      )}
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />
    </div>
  );
}
