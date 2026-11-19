import React, { useId, useMemo, useState } from 'react';
import { Database, Stethoscope, ShieldCheck, FlaskConical, Plus, Search, Pencil, Trash2, Check, X, Clock, AlertTriangle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import PageHeader from '../../components/PageHeader';
import FadeIn from '../../components/FadeIn';
import IconAction from './IconAction';
import { EditConfirmModal, SuccessModal } from '../clinic/ClinicModals';
import { useSuccessModal } from './useSuccessModal';
import { useCatalog, CATALOG_KINDS } from '../../context/catalog-context';
import { useClinicData } from '../clinic/clinicDataContext';
import { doctorsData } from '../../data/doctors';

// Gestión de datos (administrador de SAMSA): ver, crear, editar y eliminar el catálogo de
// especialidades, obras sociales y estudios que usa todo el sistema.
// Regla: lo que está en uso (médicos o instituciones que lo tienen) no se puede eliminar ni renombrar;
// la ventana avisa dónde se usa. A un estudio en uso sí se le puede cambiar el grupo.

const TABS = [
  { key: 'specialties', icon: Stethoscope },
  { key: 'insurances', icon: ShieldCheck },
  { key: 'studies', icon: FlaskConical },
];

const clean = (text) => text.trim().replace(/\s+/g, ' ');
const sameName = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }) === 0;

const formatUpdatedAt = (iso) => {
  const date = new Date(iso);
  return `${date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
};

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const VitadevCatalog = () => {
  const fieldId = useId();
  const catalog = useCatalog();
  const { institutions, particularDoctors, allAssignments } = useClinicData();
  const { success, showSuccess } = useSuccessModal();

  const [tab, setTab] = useState('specialties');
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState(catalog.studyGroupNames[0]);
  const [newError, setNewError] = useState('');
  const [editing, setEditing] = useState(null); // { original, name, group, error }
  const [confirm, setConfirm] = useState(null); // { type: 'add' | 'edit' | 'delete', ... }

  const kind = CATALOG_KINDS[tab];
  const items = tab === 'studies' ? catalog.studies : catalog[tab].map((name) => ({ name }));

  // Dónde se usa cada elemento: médicos (de la cartilla y particulares) e instituciones.
  const usage = useMemo(() => {
    const map = new Map();
    const add = (name, where) => {
      if (!name) return;
      const key = name.toLowerCase();
      const entry = map.get(key) ?? { doctors: new Set(), institutions: new Set() };
      entry[where.type].add(where.id);
      map.set(key, entry);
    };
    if (tab === 'specialties') {
      doctorsData.forEach((d) => add(d.specialty, { type: 'doctors', id: d.id }));
      particularDoctors.forEach((d) => add(d.specialty, { type: 'doctors', id: d.id }));
      allAssignments.forEach((a) => add(a.area, { type: 'doctors', id: a.doctorId }));
      institutions.forEach((i) => (i.areas ?? i.sectors ?? []).forEach((u) => add(u, { type: 'institutions', id: i.id })));
    } else if (tab === 'insurances') {
      doctorsData.forEach((d) => (d.insurance ?? []).forEach((n) => add(n, { type: 'doctors', id: d.id })));
      particularDoctors.forEach((d) => (d.insurances ?? []).forEach((n) => add(n, { type: 'doctors', id: d.id })));
      institutions.forEach((i) => (i.insurances ?? []).forEach((n) => add(n, { type: 'institutions', id: i.id })));
    } else {
      institutions.forEach((i) => (i.studies ?? []).forEach((n) => add(n, { type: 'institutions', id: i.id })));
    }
    return map;
  }, [tab, institutions, particularDoctors, allAssignments]);

  const usageOf = (name) => {
    const entry = usage.get(name.toLowerCase());
    return { doctors: entry?.doctors.size ?? 0, institutions: entry?.institutions.size ?? 0 };
  };
  const usageText = ({ doctors, institutions: inst }) =>
    [doctors && plural(doctors, 'médico', 'médicos'), inst && plural(inst, 'institución', 'instituciones')].filter(Boolean).join(' y ');

  const validate = (value, original = null) => {
    const name = clean(value);
    if (!name) return `Ingresá el nombre de ${kind.article}.`;
    if (name.length < 2) return 'El nombre es demasiado corto.';
    if (name.length > 60) return 'El nombre no puede superar los 60 caracteres.';
    if (items.some((item) => sameName(item.name, name) && !(original && sameName(item.name, original)))) return 'Ya existe en el catálogo.';
    return '';
  };

  const changeTab = (key) => {
    setTab(key);
    setSearch('');
    setNewName('');
    setNewError('');
    setEditing(null);
  };

  const visible = items.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()));

  // --- Alta ---
  const handleAdd = (e) => {
    e.preventDefault();
    const error = validate(newName);
    if (error) { setNewError(error); return; }
    setConfirm({ type: 'add', item: tab === 'studies' ? { name: clean(newName), group: newGroup } : clean(newName) });
  };

  // --- Edición ---
  const startEdit = (item) => setEditing({ original: item.name, name: item.name, group: item.group, error: '' });
  const handleSaveEdit = () => {
    const inUse = usageOf(editing.original);
    const renamed = clean(editing.name) !== editing.original;
    if (renamed && (inUse.doctors || inUse.institutions)) {
      setEditing({ ...editing, error: `No se puede renombrar: lo usan ${usageText(inUse)}.` });
      return;
    }
    const error = validate(editing.name, editing.original);
    if (error) { setEditing({ ...editing, error }); return; }
    setConfirm({ type: 'edit', original: editing.original, item: tab === 'studies' ? { name: clean(editing.name), group: editing.group } : clean(editing.name) });
  };

  const handleConfirm = () => {
    const name = typeof confirm.item === 'string' ? confirm.item : confirm.item?.name;
    if (confirm.type === 'add') {
      catalog.addItem(tab, confirm.item);
      setNewName('');
      showSuccess('¡Agregado al catálogo!', `${name} ya se puede elegir en todo SAMSA.`);
    } else if (confirm.type === 'edit') {
      catalog.updateItem(tab, confirm.original, confirm.item);
      setEditing(null);
      showSuccess('¡Cambios guardados!', `${name} se actualizó en el catálogo.`);
    } else {
      catalog.removeItem(tab, confirm.name);
      showSuccess('¡Eliminado del catálogo!', `${confirm.name} ya no se puede elegir.`);
    }
    setConfirm(null);
  };

  const inputClass = 'w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white';

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-clip">
      <Navbar />
      <EditConfirmModal
        isOpen={confirm?.type === 'add' || confirm?.type === 'edit'}
        title={confirm?.type === 'add' ? `¿Agregar ${kind.single}?` : `¿Modificar ${kind.single}?`}
        message={confirm?.type === 'add'
          ? `Vas a agregar “${typeof confirm.item === 'string' ? confirm.item : confirm.item.name}” al catálogo de ${kind.label.toLowerCase()}. ¿Confirmar?`
          : `Vas a guardar los cambios de “${confirm?.original}”. ¿Confirmar?`}
        confirmLabel={confirm?.type === 'add' ? 'Sí, Agregar' : 'Sí, Modificar'}
        onCancel={() => setConfirm(null)}
        onConfirm={handleConfirm}
      />
      {confirm?.type === 'delete' && (
        <div role="dialog" aria-modal="true" aria-labelledby={`${fieldId}-borrar`} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-slideUp">
            <div className="p-5 sm:p-6 flex items-start gap-4 border-b bg-red-50 border-red-100">
              <div className="p-3 rounded-full shrink-0 bg-red-100 text-red-600"><AlertTriangle className="w-6 h-6" /></div>
              <div className="flex-1 min-w-0">
                <h3 id={`${fieldId}-borrar`} className="text-lg font-bold text-gray-900">¿Eliminar {kind.single}?</h3>
                <p className="text-sm font-medium text-red-600">Esta acción no se puede deshacer</p>
              </div>
              <button type="button" onClick={() => setConfirm(null)} aria-label="Cerrar" className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-300 outline-none flex items-center justify-center transition-colors shrink-0"><X className="w-5 h-5" /></button>
            </div>
            <p className="p-5 sm:p-6 text-gray-600 leading-relaxed">Vas a eliminar “{confirm.name}” del catálogo. Ya no se podrá elegir en ninguna pantalla de SAMSA.</p>
            <div className="bg-gray-50 px-5 sm:px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100">
              <button type="button" onClick={() => setConfirm(null)} className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition">Cancelar</button>
              <button type="button" onClick={handleConfirm} className="w-full sm:w-auto px-5 py-2.5 text-white font-bold rounded-xl shadow-lg bg-red-600 hover:bg-red-700 shadow-red-600/30 transition">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <PageHeader
          icon={Database}
          eyebrow="Administración SAMSA"
          title="Gestión de datos"
          description="Catálogo de especialidades, obras sociales y estudios que se usa en todo el sistema."
        />

        {/* Pestañas */}
        <FadeIn delay={100}>
          <div role="tablist" aria-label="Catálogos" className="grid grid-cols-3 gap-2 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
            {TABS.map(({ key, icon: Icon }) => {
              const active = tab === key;
              const count = key === 'studies' ? catalog.studies.length : catalog[key].length;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => changeTab(key)}
                  className={`min-h-[44px] px-2 sm:px-4 py-2.5 rounded-xl text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-center leading-tight">{CATALOG_KINDS[key].label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <section role="tabpanel" aria-label={kind.label} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Encabezado: título, última actualización y búsqueda */}
            <div className="p-5 sm:p-6 border-b border-gray-100 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{kind.label}</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" /> Última actualización: {formatUpdatedAt(catalog.updatedAt[tab])}
                </span>
              </div>
              <div className="relative">
                <label htmlFor={`${fieldId}-buscar`} className="sr-only">Buscar en {kind.label.toLowerCase()}</label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input id={`${fieldId}-buscar`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Buscar ${kind.single}...`} autoComplete="off" className={`${inputClass} pl-10`} />
              </div>
            </div>

            {/* Alta */}
            <form onSubmit={handleAdd} noValidate className="p-5 sm:p-6 border-b border-gray-100 bg-slate-50/60">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
                <div className="flex-1">
                  <label htmlFor={`${fieldId}-nuevo`} className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Agregar {kind.single}</label>
                  <input id={`${fieldId}-nuevo`} value={newName} maxLength={60} autoComplete="off" aria-invalid={Boolean(newError)} aria-describedby={`${fieldId}-nuevo-error`} onChange={(e) => { setNewName(e.target.value); setNewError(''); }} placeholder={`Nombre de ${kind.article}`} className={`${inputClass} ${newError ? 'border-red-300 bg-red-50/40' : 'border-gray-200'}`} />
                  {newError && <p id={`${fieldId}-nuevo-error`} role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{newError}</p>}
                </div>
                {tab === 'studies' && (
                  <div className="sm:w-48">
                    <label htmlFor={`${fieldId}-grupo`} className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Grupo</label>
                    <select id={`${fieldId}-grupo`} value={newGroup} onChange={(e) => setNewGroup(e.target.value)} className={`${inputClass} border-gray-200`}>
                      {catalog.studyGroupNames.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                )}
                <button type="submit" className="sm:mt-6 min-h-[48px] px-5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/30 transition flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" /> Agregar
                </button>
              </div>
            </form>

            {/* Listado */}
            {visible.length === 0 ? (
              <p className="p-10 text-center text-gray-400">{search ? 'No hay resultados para esa búsqueda.' : 'El catálogo está vacío.'}</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {visible.map((item) => {
                  const inUse = usageOf(item.name);
                  const used = inUse.doctors + inUse.institutions > 0;
                  const isEditing = editing?.original === item.name;
                  return (
                    <li key={item.name} className={`px-5 sm:px-6 py-3.5 ${isEditing ? 'bg-orange-50/40' : 'hover:bg-slate-50/60'} transition`}>
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <label htmlFor={`${fieldId}-editar`} className="sr-only">Nombre</label>
                            <input id={`${fieldId}-editar`} autoFocus maxLength={60} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, error: '' })} className={`${inputClass} flex-1 ${editing.error ? 'border-red-300' : 'border-orange-200'}`} />
                            {tab === 'studies' && (
                              <select aria-label="Grupo" value={editing.group} onChange={(e) => setEditing({ ...editing, group: e.target.value, error: '' })} className={`${inputClass} sm:w-44 border-orange-200`}>
                                {catalog.studyGroupNames.map((g) => <option key={g} value={g}>{g}</option>)}
                              </select>
                            )}
                            <div className="flex gap-1 justify-end">
                              <IconAction icon={Check} tone="green" onClick={handleSaveEdit} label="Guardar cambios" />
                              <IconAction icon={X} tone="red" onClick={() => setEditing(null)} label="Cancelar edición" />
                            </div>
                          </div>
                          {editing.error && <p role="alert" className="text-xs text-red-600 font-medium ml-1">{editing.error}</p>}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 break-words">{item.name}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {item.group && <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">{item.group}</span>}
                              <span className={`text-xs font-semibold ${used ? 'text-emerald-600' : 'text-gray-400'}`}>{used ? `En uso: ${usageText(inUse)}` : 'Sin uso'}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <IconAction icon={Pencil} tone="orange" onClick={() => startEdit(item)} label={`Editar ${item.name}`} />
                            <IconAction
                              icon={Trash2}
                              tone="red"
                              disabled={used}
                              onClick={() => setConfirm({ type: 'delete', name: item.name })}
                              label={used ? `No se puede eliminar: lo usan ${usageText(inUse)}` : `Eliminar ${item.name}`}
                            />
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </FadeIn>
      </div>
    </div>
  );
};

export default VitadevCatalog;
