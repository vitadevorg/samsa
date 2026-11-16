import React, { useId, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import { EditConfirmModal, SuccessModal } from '../clinic/ClinicModals';
import { useClinicData } from '../clinic/clinicDataContext';
import { resetPassword, updateAccount, getRegisteredEmails } from '../../services/authService';
import { stripTitle, getTitleFromName } from '../../utils/doctorName';
import { USER_GROUPS, buildUserDirectory } from './userDirectory';
import { useSuccessModal } from './useSuccessModal';
import TemporaryPasswordModal from './TemporaryPasswordModal';
import EditUserModal from './EditUserModal';
import PageHeader from '../../components/PageHeader';
import FadeIn from '../../components/FadeIn';
import IconAction from './IconAction';
import { UserCog, Search, X, KeyRound, UserX, UserCheck, Ban, Pencil, SlidersHorizontal, ChevronDown } from 'lucide-react';

// Filtro por estado de la cuenta (también se puede elegir desde el panel general).
const STATUS_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'disabled', label: 'Inhabilitados' },
  { key: 'deactivated', label: 'Dados de baja' },
];

// Sublista de filtros plegada: la cabecera muestra el nombre y la opción elegida; al tocarla, las opciones.
// `onSelect`: se llama al elegir una opción (la pantalla cierra el panel de Filtros).
const FilterRow = ({ id, label, groupLabel, summary, alwaysOpen = false, onSelect, children }) => {
  const [isOpen, setOpen] = useState(false);
  // `alwaysOpen`: la sublista se muestra abierta y sin cabecera desplegable (Atención).
  const open = alwaysOpen || isOpen;
  if (alwaysOpen) {
    return (
      <div className="border border-gray-100 rounded-2xl">
        <p className="px-4 pt-3 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <div id={id} role="group" aria-label={groupLabel} onClick={(e) => { if (e.target.closest('button')) onSelect?.(); }} className="px-4 pb-4 flex flex-wrap gap-2">{children}</div>
      </div>
    );
  }
  return (
    <div className="border border-gray-100 rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={id}
        className="w-full min-h-[48px] px-4 py-3 flex items-center justify-between gap-3 text-left rounded-2xl hover:bg-gray-50 transition"
      >
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-bold text-gray-700 truncate">{summary}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {open && (
        // Al elegir una opción se cierran la sublista y el panel de Filtros; lo elegido queda en los chips.
        <div id={id} role="group" aria-label={groupLabel} onClick={(e) => { if (e.target.closest('button')) { setOpen(false); onSelect?.(); } }} className="px-4 pb-4 flex flex-wrap gap-2 animate-fadeIn">{children}</div>
      )}
    </div>
  );
};

// Botón de filtro. `primary`: azul sólido al estar activo (el filtro principal, Tipo);
// el resto usa el azul suave, para que la jerarquía se lea de un vistazo.
const FilterChip = ({ active, onClick, label, primary = false }) => {
  const activeClass = primary ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200';
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 min-h-[36px] px-3.5 py-1.5 rounded-full text-sm font-bold border transition ${active ? activeClass : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
    >
      {label}
    </button>
  );
};

// Texto para comparar en la búsqueda: minúsculas y sin tildes ("gonzalez" encuentra "González").
const normalizeText = (text) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

// Pantalla del administrador de VitaDev: todas las cuentas (médicos, secretarias y
// administradores de clínica y de hospital, y pacientes). Permite inhabilitarlas (reversible), habilitarlas de nuevo,
// darlas de baja definitivamente, resetear su contraseña y editar sus datos de contacto.
// Nunca muestra contraseñas actuales ni datos clínicos; la temporal se ve una sola vez al resetear.
const VitadevUsers = () => {
  const fieldId = useId();
  const data = useClinicData();
  const { deactivatedEmails, disabledEmails, deactivate, disable, enable, updateSecretary, updateParticularDoctor, updateInstitutionAdmin, updateDoctorContact } = data;

  const [search, setSearch] = useState('');
  // El panel general puede abrir la pantalla ya filtrada (?tipo=patient, ?tipo=secretary...).
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState(() => (USER_GROUPS[searchParams.get('tipo')] ? searchParams.get('tipo') : 'all')); // 'all' o una clave de USER_GROUPS
  // Solo para médicos y secretarias: 'all', 'particular' (sin institución) o 'institution'.
  const [practice, setPractice] = useState('all');
  // Estado de la cuenta: 'all', 'active', 'disabled' o 'deactivated'. El panel general abre la
  // pantalla ya filtrada (?estado=disabled para inhabilitados, ?estado=deactivated para bajas).
  // Panel de filtros plegado por defecto (ocupa mucho lugar); la búsqueda queda siempre visible.
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState(() => (STATUS_FILTERS.some((s) => s.key === searchParams.get('estado')) ? searchParams.get('estado') : 'all'));
  const [toDisable, setToDisable] = useState(null);       // persona a inhabilitar (null = ventana cerrada)
  const [toEnable, setToEnable] = useState(null);         // persona a volver a habilitar
  const [toDeactivate, setToDeactivate] = useState(null); // persona a dar de baja definitiva
  const [toReset, setToReset] = useState(null);           // persona a resetear (null = ventana cerrada)
  const [toEdit, setToEdit] = useState(null);             // persona cuyos datos se editan
  const [pendingEdit, setPendingEdit] = useState(null);   // cambios validados, esperando confirmación
  // Las cuentas de pacientes viven en authService (fuera del estado de React): este contador
  // fuerza a volver a leerlas después de editar una.
  const [, setAccountsVersion] = useState(0);
  const { success, showSuccess } = useSuccessModal();
  const [credentials, setCredentials] = useState(null); // contraseña temporal recién generada (null = ventana cerrada)

  const directory = buildUserDirectory(data);
  // Estado de la cuenta: 'deactivated' (baja definitiva), 'disabled' (inhabilitada) o 'active'.
  const statusOf = (person) => {
    const key = person.email.toLowerCase();
    if (deactivatedEmails.has(key)) return 'deactivated';
    return disabledEmails.has(key) ? 'disabled' : 'active';
  };

  const hasPracticeFilter = filter === 'doctor' || filter === 'secretary';
  // Los pacientes no pertenecen a una institución: con ese filtro la columna se oculta.
  const showInstitution = filter !== 'patient';
  const matchesPractice = (person) => !hasPracticeFilter || practice === 'all' || person.particular === (practice === 'particular');
  const clearFilters = () => {
    setSearch('');
    setFilter('all');
    setPractice('all');
    setStatusFilter('all');
  };

  const selectFilter = (key) => {
    setFilter(key);
    setPractice('all');
  };

  const query = normalizeText(search.trim());
  const isSearching = query !== '';
  const hasActiveFilters = isSearching || filter !== 'all' || practice !== 'all' || statusFilter !== 'all';
  // Filtros aplicados (sin contar la búsqueda): se muestran como chips con el panel cerrado.
  const PRACTICE_LABELS = { particular: 'Particulares', institution: 'De institución' };
  const appliedFilters = [
    filter !== 'all' && { key: 'rol', label: `Rol: ${USER_GROUPS[filter].label}`, clear: () => selectFilter('all') },
    hasPracticeFilter && practice !== 'all' && { key: 'atencion', label: `Atención: ${PRACTICE_LABELS[practice]}`, clear: () => setPractice('all') },
    statusFilter !== 'all' && { key: 'estado', label: `Estado: ${STATUS_FILTERS.find((s) => s.key === statusFilter).label}`, clear: () => setStatusFilter('all') },
  ].filter(Boolean);
  const visibleUsers = directory
    .filter((person) => filter === 'all' || person.group === filter)
    .filter(matchesPractice)
    .filter((person) => statusFilter === 'all' || statusOf(person) === statusFilter)
    .filter((person) => !isSearching || normalizeText(`${person.name} ${person.email} ${person.where} ${USER_GROUPS[person.group].label}`).includes(query))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleConfirmDisable = () => {
    disable(toDisable.email);
    showSuccess('¡Cuenta inhabilitada!', `${toDisable.name} no puede iniciar sesión hasta que la vuelvas a habilitar.`);
    setToDisable(null);
  };

  const handleConfirmEnable = () => {
    enable(toEnable.email);
    showSuccess('¡Cuenta habilitada!', `${toEnable.name} ya puede volver a iniciar sesión.`);
    setToEnable(null);
  };

  const handleConfirmDeactivate = () => {
    deactivate(toDeactivate.email);
    showSuccess('¡Cuenta dada de baja!', `${toDeactivate.name} fue dado de baja definitivamente.`);
    setToDeactivate(null);
  };

  const handleConfirmReset = () => {
    const temporaryPassword = resetPassword(toReset.email, toReset.profile);
    setCredentials({
      title: '¡Contraseña reseteada!',
      message: `Pasale esta contraseña temporal a ${toReset.name} (${toReset.email}).`,
      password: temporaryPassword,
    });
    setToReset(null);
  };

  // Emails de las demás cuentas, para no repetir uno al editar.
  const takenEmailsFor = (person) => [...directory.map((p) => p.email), ...getRegisteredEmails()]
    .map((email) => email.toLowerCase())
    .filter((email) => email !== person.email.toLowerCase());

  // Guarda los datos en la cuenta de acceso y en el estado compartido que corresponda al tipo.
  const handleConfirmEdit = () => {
    const person = toEdit;
    const { name, lastName, email, phone } = pendingEdit;
    if (person.group === 'patient') {
      updateAccount(person.email, { email, name, lastname: lastName, phone });
      setAccountsVersion((v) => v + 1);
    } else if (person.group === 'doctor') {
      // Particular: su ficha la administra VitaDev. De institución: solo sus datos de contacto.
      if (person.particular) updateParticularDoctor(person.sourceId, { name, email, phone });
      else updateDoctorContact(person.sourceId, { name, email, phone });
      updateAccount(person.email, { email, name: stripTitle(name), title: getTitleFromName(name) });
    } else if (person.group === 'secretary') {
      updateSecretary(person.sourceId, { name, email, phone });
      updateAccount(person.email, { email, name });
    } else {
      updateInstitutionAdmin(person.sourceId, { name, email, phone });
      updateAccount(person.email, { email, name });
    }
    showSuccess('¡Cambios guardados!', `Los datos de ${person.group === 'patient' ? `${name} ${lastName}` : name} fueron actualizados.`);
    setPendingEdit(null);
    setToEdit(null);
  };


  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Navbar />
      <ConfirmModal
        isOpen={toDeactivate !== null}
        onClose={() => setToDeactivate(null)}
        onConfirm={handleConfirmDeactivate}
        title="Dar de baja definitivamente"
        message={`¿Confirma que desea dar de baja definitivamente a ${toDeactivate?.name}? Ya no podrá iniciar sesión ni volver a habilitarse.`}
        confirmLabel="Sí, Dar de baja"
      />
      <EditConfirmModal
        isOpen={toDisable !== null}
        title="¿Inhabilitar cuenta?"
        message={`${toDisable?.name} no podrá iniciar sesión hasta que vuelvas a habilitar su cuenta. Podés revertirlo cuando quieras.`}
        confirmLabel="Sí, Inhabilitar"
        onCancel={() => setToDisable(null)}
        onConfirm={handleConfirmDisable}
      />
      <EditConfirmModal
        isOpen={toEnable !== null}
        title="¿Habilitar cuenta?"
        message={`${toEnable?.name} podrá volver a iniciar sesión con normalidad.`}
        confirmLabel="Sí, Habilitar"
        onCancel={() => setToEnable(null)}
        onConfirm={handleConfirmEnable}
      />
      <EditConfirmModal
        isOpen={toReset !== null}
        title="¿Resetear contraseña?"
        message={`Se asignará una contraseña temporal a ${toReset?.name}. La contraseña actual dejará de funcionar y tendrá que elegir una nueva al iniciar sesión.`}
        confirmLabel="Sí, Resetear"
        onCancel={() => setToReset(null)}
        onConfirm={handleConfirmReset}
      />
      {toEdit && (
        <EditUserModal
          key={toEdit.key}
          person={toEdit}
          takenEmails={takenEmailsFor(toEdit)}
          onCancel={() => setToEdit(null)}
          onSubmit={setPendingEdit}
        />
      )}
      <EditConfirmModal
        isOpen={pendingEdit !== null}
        title="¿Guardar cambios?"
        message={pendingEdit && pendingEdit.email !== toEdit?.email.toLowerCase()
          ? `Los datos de ${toEdit?.name} se actualizarán y su usuario pasará a ser ${pendingEdit.email}.`
          : `Se actualizarán los datos de ${toEdit?.name}.`}
        confirmLabel="Sí, Guardar"
        onCancel={() => setPendingEdit(null)}
        onConfirm={handleConfirmEdit}
      />
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />
      <TemporaryPasswordModal credentials={credentials} onClose={() => setCredentials(null)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <PageHeader icon={UserCog} eyebrow="Administración SAMSA" title="Gestión de Usuarios" />

        {/* Filtros: búsqueda arriba y una fila por filtro, con su etiqueta en una columna fija. */}
        <FadeIn delay={100}><section aria-label="Filtros de usuarios" className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-6">
          <div className={`p-4 sm:p-5 ${showFilters || appliedFilters.length > 0 ? 'border-b border-gray-100' : ''}`}>
            <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                id={`${fieldId}-buscar`}
                type="search"
                aria-label="Buscar usuarios"
                placeholder="Buscar por nombre, email o institución..."
                maxLength={60}
                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {isSearching && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition" title="Borrar búsqueda" aria-label="Borrar búsqueda">
                  <X className="w-4 h-4"/>
                </button>
              )}
            </div>
              <button
                type="button"
                onClick={() => setShowFilters((open) => !open)}
                aria-expanded={showFilters}
                aria-controls={`${fieldId}-panel-filtros`}
                className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border font-bold text-sm transition ${showFilters || appliedFilters.length > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
                {appliedFilters.length > 0 && (
                  <span className="min-w-[1.25rem] px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold text-center">{appliedFilters.length}</span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
            {/* Panel cerrado: los filtros aplicados se ven (y se quitan) como chips. */}
            {!showFilters && appliedFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3" aria-label="Filtros aplicados">
                {appliedFilters.map(({ key, label, clear }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={clear}
                    aria-label={`Quitar filtro ${label}`}
                    className="inline-flex items-center gap-1.5 min-h-[32px] pl-3 pr-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-sm font-bold hover:bg-blue-100 transition"
                  >
                    {label}
                    <X className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {showFilters && (
          <div id={`${fieldId}-panel-filtros`} className="p-4 sm:p-5 space-y-2 animate-fadeIn">
            <FilterRow id={`${fieldId}-sub-tipo`} onSelect={() => setShowFilters(false)} label="Rol" groupLabel="Filtrar por rol" summary={filter === 'all' ? 'Todos' : USER_GROUPS[filter].label}>
              <FilterChip primary active={filter === 'all'} onClick={() => selectFilter('all')} label="Todos" />
              {Object.entries(USER_GROUPS).map(([key, group]) => (
                <FilterChip key={key} primary active={filter === key} onClick={() => selectFilter(key)} label={group.label} />
              ))}
            </FilterRow>

            {hasPracticeFilter && (
              <FilterRow id={`${fieldId}-sub-atencion`} onSelect={() => setShowFilters(false)} alwaysOpen label="Atención" summary={{ all: 'Todos', particular: 'Particulares', institution: 'De institución' }[practice]} groupLabel={`Filtrar ${USER_GROUPS[filter].label.toLowerCase()} por tipo de atención`}>
                {[
                  { key: 'all', label: 'Todos' },
                  { key: 'particular', label: 'Particulares' },
                  { key: 'institution', label: 'De institución' },
                ].map(({ key, label }) => (
                  <FilterChip key={key} active={practice === key} onClick={() => setPractice(key)} label={label} />
                ))}
              </FilterRow>
            )}

            <FilterRow id={`${fieldId}-sub-estado`} onSelect={() => setShowFilters(false)} label="Estado" groupLabel="Filtrar por estado de la cuenta" summary={STATUS_FILTERS.find((s) => s.key === statusFilter).label}>
              {STATUS_FILTERS.map(({ key, label }) => (
                <FilterChip
                  key={key}
                  active={statusFilter === key}
                  onClick={() => setStatusFilter(key)}
                  label={label}
                />
              ))}
            </FilterRow>
          </div>
          )}

          <div className="px-4 sm:px-5 py-3 bg-gray-50 border-t border-gray-100 rounded-b-3xl flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-500" aria-live="polite">
              Mostrando <span className="font-bold text-gray-800">{visibleUsers.length}</span> de {directory.length} usuarios
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition">
                <X className="w-4 h-4"/> Limpiar filtros
              </button>
            )}
          </div>
        </section></FadeIn>

        <FadeIn delay={200}><div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
          {/* Hasta lg cada fila es una tarjeta apilada (sin scroll lateral); desde lg, tabla. */}
          <table className="w-full text-left border-collapse block lg:table">
            <thead className="hidden lg:table-header-group bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Usuario</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Tipo</th>
                {showInstitution && <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Institución</th>}
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Estado</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="block lg:table-row-group divide-y divide-gray-100 lg:divide-gray-50">
              {visibleUsers.map((person) => {
                const status = statusOf(person);
                const deactivated = status === 'deactivated';
                return (
                  <tr key={person.key} className={`block lg:table-row px-5 py-4 lg:p-0 hover:bg-blue-50/50 transition ${status !== 'active' ? 'bg-gray-50/70' : ''}`}>
                    <td className="block lg:table-cell py-1 lg:p-5">
                      <div className={`font-bold ${status !== 'active' ? 'text-gray-400' : 'text-gray-900'}`}>{person.name}</div>
                      <div className="text-xs text-gray-500">{person.email}</div>
                    </td>
                    <td className="block lg:table-cell py-1 lg:p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${USER_GROUPS[person.group].badge}`}>
                        {USER_GROUPS[person.group].single}
                      </span>
                    </td>
                    {showInstitution && <td className="block lg:table-cell py-1 lg:p-5 text-sm text-gray-500">{person.where || '—'}</td>}
                    <td className="block lg:table-cell py-1 lg:p-5">
                      {deactivated ? (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">Baja definitiva</span>
                      ) : status === 'disabled' ? (
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">Inhabilitado</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Activo</span>
                      )}
                    </td>
                    <td className="block lg:table-cell py-1 lg:p-5">
                      <div className="flex justify-start lg:justify-center gap-1 pt-2 lg:pt-0">
                        {status === 'active' && (
                          <>
                            <IconAction icon={Pencil} tone="blue" onClick={() => setToEdit(person)} label={`Editar datos de ${person.name}`} />
                            <IconAction icon={KeyRound} tone="orange" onClick={() => setToReset(person)} label={`Resetear contraseña de ${person.name}`} />
                            <IconAction icon={Ban} tone="amber" onClick={() => setToDisable(person)} label={`Inhabilitar a ${person.name}`} />
                          </>
                        )}
                        {status === 'disabled' && (
                          <>
                            <IconAction icon={UserCheck} tone="green" onClick={() => setToEnable(person)} label={`Habilitar a ${person.name}`} />
                            <IconAction icon={UserX} tone="red" onClick={() => setToDeactivate(person)} label={`Dar de baja definitivamente a ${person.name}`} />
                          </>
                        )}
                        {deactivated && <span className="text-sm text-gray-400 py-2 whitespace-nowrap">Sin acciones</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visibleUsers.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-gray-500 font-medium">No encontramos usuarios con esos filtros.</p>
              <button onClick={clearFilters} className="mt-3 text-blue-600 font-bold hover:text-blue-800 transition">
                Ver todos los usuarios
              </button>
            </div>
          )}
        </div></FadeIn>
      </div>
    </div>
  );
};

export default VitadevUsers;
