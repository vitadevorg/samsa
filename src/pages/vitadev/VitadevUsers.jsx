import React, { useId, useState } from 'react';
import Navbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import { EditConfirmModal, SuccessModal } from '../clinic/ClinicModals';
import { useClinicData } from '../clinic/clinicDataContext';
import { resetPassword } from '../../services/authService';
import { USER_GROUPS, buildUserDirectory } from './userDirectory';
import { useSuccessModal, PASSWORD_SUCCESS_DURATION_MS } from './useSuccessModal';
import { UserCog, Search, X, KeyRound, UserX, UserCheck, Ban } from 'lucide-react';

// Texto para comparar en la búsqueda: minúsculas y sin tildes ("gonzalez" encuentra "González").
const normalizeText = (text) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

// Pantalla del administrador de VitaDev: todas las cuentas (médicos, secretarias y
// administradores de clínica y de hospital). Permite inhabilitarlas (reversible), habilitarlas de nuevo,
// darlas de baja definitivamente y resetear su contraseña.
// Nunca muestra contraseñas actuales ni datos clínicos; la temporal se ve una sola vez al resetear.
const VitadevUsers = () => {
  const fieldId = useId();
  const data = useClinicData();
  const { deactivatedEmails, disabledEmails, deactivate, disable, enable } = data;

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' o una clave de USER_GROUPS
  const [toDisable, setToDisable] = useState(null);       // persona a inhabilitar (null = ventana cerrada)
  const [toEnable, setToEnable] = useState(null);         // persona a volver a habilitar
  const [toDeactivate, setToDeactivate] = useState(null); // persona a dar de baja definitiva
  const [toReset, setToReset] = useState(null);           // persona a resetear (null = ventana cerrada)
  const { success, showSuccess } = useSuccessModal();

  const directory = buildUserDirectory(data);
  // Estado de la cuenta: 'deactivated' (baja definitiva), 'disabled' (inhabilitada) o 'active'.
  const statusOf = (person) => {
    const key = person.email.toLowerCase();
    if (deactivatedEmails.has(key)) return 'deactivated';
    return disabledEmails.has(key) ? 'disabled' : 'active';
  };

  const query = normalizeText(search.trim());
  const isSearching = query !== '';
  const visibleUsers = directory
    .filter((person) => filter === 'all' || person.group === filter)
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
    showSuccess(
      '¡Contraseña reseteada!',
      `Contraseña temporal de ${toReset.name}: ${temporaryPassword}. Tendrá que cambiarla al iniciar sesión.`,
      PASSWORD_SUCCESS_DURATION_MS
    );
    setToReset(null);
  };

  const tabClass = (active) => `px-4 py-2 rounded-full text-sm font-bold border transition ${
    active ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
  }`;

  return (
    <div className="min-h-screen bg-gray-50">
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
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg"><UserCog className="text-blue-600 w-8 h-8"/></div>
            Usuarios y administradores
          </h1>
        </div>

        {/* Búsqueda (mismo estilo que la de Personal) */}
        <div className="relative mb-4 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            id={`${fieldId}-buscar`}
            type="search"
            aria-label="Buscar usuarios"
            placeholder="Buscar por nombre, email o institución..."
            maxLength={60}
            className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isSearching && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition" title="Borrar búsqueda" aria-label="Borrar búsqueda">
              <X className="w-4 h-4"/>
            </button>
          )}
        </div>

        <div role="group" aria-label="Filtrar por tipo de usuario" className="flex flex-wrap gap-2 mb-6">
          <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')} className={tabClass(filter === 'all')}>Todos ({directory.length})</button>
          {Object.entries(USER_GROUPS).map(([key, group]) => (
            <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)} className={tabClass(filter === key)}>
              {group.label} ({directory.filter((p) => p.group === key).length})
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Usuario</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Tipo</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Institución</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Estado</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleUsers.map((person) => {
                const status = statusOf(person);
                const deactivated = status === 'deactivated';
                return (
                  <tr key={person.key} className={`hover:bg-blue-50/50 transition ${status !== 'active' ? 'bg-gray-50/70' : ''}`}>
                    <td className="p-5">
                      <div className={`font-bold ${status !== 'active' ? 'text-gray-400' : 'text-gray-900'}`}>{person.name}</div>
                      <div className="text-xs text-gray-500">{person.email}</div>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${USER_GROUPS[person.group].badge}`}>
                        {USER_GROUPS[person.group].single}
                      </span>
                    </td>
                    <td className="p-5 text-sm text-gray-500">{person.where || '—'}</td>
                    <td className="p-5">
                      {deactivated ? (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">Baja definitiva</span>
                      ) : status === 'disabled' ? (
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">Inhabilitado</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Activo</span>
                      )}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        {status === 'active' && (
                          <>
                            <button
                              onClick={() => setToReset(person)}
                              className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                              aria-label={`Resetear contraseña de ${person.name}`}
                            >
                              <KeyRound className="w-5 h-5"/> Resetear contraseña
                            </button>
                            <button
                              onClick={() => setToDisable(person)}
                              className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              aria-label={`Inhabilitar a ${person.name}`}
                            >
                              <Ban className="w-5 h-5"/> Inhabilitar
                            </button>
                          </>
                        )}
                        {status === 'disabled' && (
                          <>
                            <button
                              onClick={() => setToEnable(person)}
                              className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                              aria-label={`Habilitar a ${person.name}`}
                            >
                              <UserCheck className="w-5 h-5"/> Habilitar
                            </button>
                            <button
                              onClick={() => setToDeactivate(person)}
                              className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              aria-label={`Dar de baja definitivamente a ${person.name}`}
                            >
                              <UserX className="w-5 h-5"/> Dar de baja
                            </button>
                          </>
                        )}
                        {deactivated && <span className="text-sm text-gray-400 py-2">Sin acciones</span>}
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
              <button onClick={() => { setSearch(''); setFilter('all'); }} className="mt-3 text-blue-600 font-bold hover:text-blue-800 transition">
                Ver todos los usuarios
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VitadevUsers;
