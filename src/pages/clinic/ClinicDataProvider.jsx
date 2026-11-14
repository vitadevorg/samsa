import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { createId } from '../../utils/ids';
import { deactivateAccount, disableAccount, enableAccount, getDeactivatedEmails, getDisabledEmails } from '../../services/authService';
import { INSTITUTION_ADMIN_PATHS } from '../../constants/roles';
import {
  CLINICS, HOSPITALS, PARTICULAR_DOCTORS, INSTITUTION_ADMINS,
  getAllDoctorAssignments, SECRETARIES, SCHEDULE_REQUESTS,
  getInstitutionUnits, getInstitutionTerms,
  pendingDocuments, getDoctorEmail,
} from '../../data/institutions';
import { ClinicDataContext } from './clinicDataContext';
import { todayISO } from './clinicDates';

// Guarda en memoria los datos de TODAS las instituciones (vinculaciones de médicos,
// secretarias y solicitudes) y los comparte con toda la aplicación.
//
// En App.jsx envuelve a todas las rutas: se monta una sola vez al abrir la app y no
// se desmonta al navegar ni al cerrar sesión, así los cambios del admin de clínica
// (horarios aceptados, bajas) se ven también en otras pantallas, como el perfil
// del médico. `children` son las rutas que envuelve.
const ClinicDataProvider = ({ children }) => {
  // Institución del administrador logueado (su `institutionId`). Es undefined si
  // no hay sesión o si el usuario no administra una institución.
  const { user } = useAuth();
  // Clínicas y hospitales (con sus áreas o sectores). Viven en el estado porque el
  // administrador de VitaDev puede editar sus datos y crear áreas.
  const [institutions, setInstitutions] = useState(() => [...CLINICS, ...HOSPITALS]);
  // Se llama `clinic` por historia, pero puede ser una clínica o un hospital.
  const clinic = institutions.find((institution) => institution.id === user?.institutionId);
  // Áreas (clínica) o sectores (hospital), textos según el tipo y ruta base de sus pantallas.
  const units = getInstitutionUnits(clinic);
  const terms = getInstitutionTerms(clinic);
  const basePath = INSTITUTION_ADMIN_PATHS[user?.role];

  // Estado de TODAS las instituciones. useState con una función: los datos
  // iniciales se calculan una sola vez, al montar.
  const [allAssignments, setAllAssignments] = useState(getAllDoctorAssignments);
  const [allSecretaries, setAllSecretaries] = useState(() => [...SECRETARIES]);
  const [allRequests, setAllRequests] = useState(() => [...SCHEDULE_REQUESTS]);
  // Médicos particulares (sin clínica ni hospital) y emails dados de baja: los usa VitaDev.
  const [particularDoctors, setParticularDoctors] = useState(() => [...PARTICULAR_DOCTORS]);
  const [institutionAdmins, setInstitutionAdmins] = useState(() => [...INSTITUTION_ADMINS]);
  const [deactivatedEmails, setDeactivatedEmails] = useState(() => new Set(getDeactivatedEmails()));
  const [disabledEmails, setDisabledEmails] = useState(() => new Set(getDisabledEmails()));

  // Lo que ven las pantallas de clínica: solo los datos de la clínica del admin.
  // Se recalculan en cada render a partir del estado completo.
  const assignments = allAssignments.filter((a) => a.institutionId === clinic?.id);
  const secretaries = allSecretaries.filter((s) => s.institutionId === clinic?.id);
  const requests = allRequests.filter((r) => r.institutionId === clinic?.id);

  // Da de baja una cuenta (ya no puede iniciar sesión) y lo anota en el estado para
  // que las pantallas lo muestren. Todas las bajas pasan por acá.
  // Una cuenta dada de baja deja de estar inhabilitada: la baja es definitiva.
  const deactivate = (email) => {
    const key = email.trim().toLowerCase();
    deactivateAccount(email);
    enableAccount(email);
    setDeactivatedEmails((prev) => new Set(prev).add(key));
    setDisabledEmails((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  // Inhabilitar es reversible: la cuenta no puede iniciar sesión hasta que se vuelva a habilitar.
  const disable = (email) => {
    disableAccount(email);
    setDisabledEmails((prev) => new Set(prev).add(email.trim().toLowerCase()));
  };

  const enable = (email) => {
    enableAccount(email);
    setDisabledEmails((prev) => {
      const next = new Set(prev);
      next.delete(email.trim().toLowerCase());
      return next;
    });
  };

  // --- Médicos -------------------------------------------------------------
  // Siempre creamos listas NUEVAS (con map/filter/spread) en lugar de modificar
  // la existente: React detecta los cambios comparando referencias.

  // Un médico recién vinculado arranca con toda su documentación pendiente.
  const addAssignment = (data) => {
    setAllAssignments((prev) => [
      ...prev,
      { ...data, id: createId(), institutionId: clinic.id, documents: pendingDocuments() },
    ]);
  };

  const updateAssignment = (id, changes) => {
    setAllAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));
  };

  // Quitar un médico de la clínica:
  // - sale de las agendas de las secretarias DE ESA MISMA institución;
  // - si no le queda ninguna otra vinculación, se da de baja su cuenta
  //   (la clínica solo administra a su propio personal).
  const removeAssignment = (id) => {
    const removed = allAssignments.find((a) => a.id === id);
    if (!removed) return;
    setAllAssignments((prev) => prev.filter((a) => a.id !== id));
    setAllSecretaries((prev) =>
      prev.map((s) =>
        s.institutionId === removed.institutionId
          ? { ...s, doctorIds: s.doctorIds.filter((docId) => docId !== removed.doctorId) }
          : s
      )
    );
    const worksElsewhere = allAssignments.some((a) => a.doctorId === removed.doctorId && a.id !== removed.id);
    if (!worksElsewhere) {
      deactivate(getDoctorEmail(removed.doctorId));
    }
  };

  // Marca un documento como recibido: queda vigente con la nueva fecha de vencimiento.
  const updateDocument = (assignmentId, type, expiresAt) => {
    setAllAssignments((prev) =>
      prev.map((a) =>
        a.id !== assignmentId
          ? a
          : {
              ...a,
              documents: a.documents.map((doc) =>
                doc.type === type ? { ...doc, status: 'vigente', expiresAt: expiresAt || null } : doc
              ),
            }
      )
    );
  };

  // --- Secretarias ---------------------------------------------------------

  const addSecretary = (data) => {
    setAllSecretaries((prev) => [...prev, { ...data, id: createId(), institutionId: clinic.id }]);
  };

  const updateSecretary = (id, changes) => {
    setAllSecretaries((prev) => prev.map((s) => (s.id === id ? { ...s, ...changes } : s)));
  };

  // Eliminar una secretaria también da de baja su cuenta.
  const removeSecretary = (id) => {
    const removed = allSecretaries.find((s) => s.id === id);
    if (!removed) return;
    setAllSecretaries((prev) => prev.filter((s) => s.id !== id));
    deactivate(removed.email);
  };

  // --- Administración de VitaDev ------------------------------------------

  // Médicos particulares. Al quitar uno sale de la agenda de sus secretarias y se da de baja su cuenta.
  const addParticularDoctor = (data) => {
    setParticularDoctors((prev) => [...prev, { ...data, id: createId() }]);
  };

  const updateParticularDoctor = (id, changes) => {
    setParticularDoctors((prev) => prev.map((d) => (d.id === id ? { ...d, ...changes } : d)));
  };

  const removeParticularDoctor = (id) => {
    const removed = particularDoctors.find((d) => d.id === id);
    if (!removed) return;
    setParticularDoctors((prev) => prev.filter((d) => d.id !== id));
    setAllSecretaries((prev) =>
      prev.map((s) => (s.institutionId === null ? { ...s, doctorIds: s.doctorIds.filter((docId) => docId !== id) } : s))
    );
    deactivate(removed.email);
  };

  // Secretarias de médicos particulares: no tienen institución ni área (editar y eliminar
  // usan updateSecretary y removeSecretary, que sirven para cualquier secretaria).
  const addParticularSecretary = (data) => {
    setAllSecretaries((prev) => [...prev, { ...data, id: createId(), institutionId: null, area: null }]);
  };

  // Datos de una clínica u hospital (nombre, dirección, teléfono, email).
  const updateInstitution = (id, changes) => {
    setInstitutions((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  };

  // Asocia una clínica (`kind` 'clinic') u hospital ('hospital') nueva, con su administrador.
  // Arranca sin áreas ni sectores; `institution.id` lo genera quien llama.
  const addInstitution = (kind, institution, admin) => {
    const units = kind === 'hospital' ? { sectors: [] } : { areas: [] };
    setInstitutions((prev) => [...prev, { ...institution, ...units }]);
    setInstitutionAdmins((prev) => [...prev, { ...admin, id: createId(), institutionId: institution.id }]);
  };

  // Corrige los datos de un administrador de institución (el email es su usuario y no cambia).
  const updateInstitutionAdmin = (id, changes) => {
    setInstitutionAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));
  };

  // Crea un área (clínica) o sector (hospital). Aparece en Personal y en los formularios
  // de médicos y secretarias de esa institución, que leen `units`.
  const addUnit = (institutionId, name) => {
    setInstitutions((prev) =>
      prev.map((i) => {
        if (i.id !== institutionId) return i;
        return i.sectors ? { ...i, sectors: [...i.sectors, name] } : { ...i, areas: [...i.areas, name] };
      })
    );
  };

  // --- Solicitudes de cambio de horario -----------------------------------

  // Aceptar: el médico pasa a tener el horario pedido y la solicitud queda en el historial.
  // Solo cambia la vinculación con ESA institución: un médico puede tener otras
  // (por ejemplo, mateo-cruz también atiende en el hospital) y esas no se tocan.
  const acceptRequest = (requestId) => {
    const request = allRequests.find((r) => r.id === requestId);
    if (!request) return;
    setAllAssignments((prev) =>
      prev.map((a) =>
        a.doctorId === request.doctorId && a.institutionId === request.institutionId
          ? { ...a, ...request.requestedSchedule }
          : a
      )
    );
    setAllRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'aceptada', resolvedAt: todayISO() } : r))
    );
  };

  // Un médico pide cambiar su horario en una institución (desde su perfil).
  // Se guarda su horario actual como "antes" para que la clínica pueda comparar.
  // Solo puede haber una solicitud pendiente por médico e institución.
  const addRequest = ({ doctorId, institutionId, requestedSchedule, reason }) => {
    const assignment = allAssignments.find((a) => a.doctorId === doctorId && a.institutionId === institutionId);
    const alreadyPending = allRequests.some(
      (r) => r.doctorId === doctorId && r.institutionId === institutionId && r.status === 'pendiente'
    );
    if (!assignment || alreadyPending) return;
    setAllRequests((prev) => [
      ...prev,
      {
        id: createId(),
        doctorId,
        institutionId,
        currentSchedule: { days: assignment.days, startTime: assignment.startTime, endTime: assignment.endTime },
        requestedSchedule,
        reason,
        date: todayISO(),
        status: 'pendiente',
      },
    ]);
  };

  const rejectRequest = (requestId) => {
    setAllRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rechazada', resolvedAt: todayISO() } : r))
    );
  };

  // Todo lo que las pantallas (y el Navbar) pueden leer o usar.
  // - Pantallas de clínica: `clinic`, `assignments`, `secretaries`, `requests` (ya filtrados).
  // - Pantallas de VitaDev: `institutions`, `particularDoctors`, `allSecretaries`, `allAssignments`...
  // - Resto de la app: `allAssignments`, `allRequests`, `addRequest` (perfil del médico,
  //   reserva de turnos, listado de profesionales) y `allSecretaries` (panel de la secretaria).
  const value = {
    clinic, units, terms, basePath,
    allAssignments, allRequests, addRequest, allSecretaries,
    assignments, addAssignment, updateAssignment, removeAssignment, updateDocument,
    secretaries, addSecretary, updateSecretary, removeSecretary,
    requests, acceptRequest, rejectRequest,
    // VitaDev: todo el sistema, sin filtrar por institución.
    institutions, institutionAdmins, addInstitution, updateInstitution, updateInstitutionAdmin, addUnit,
    particularDoctors, addParticularDoctor, updateParticularDoctor, removeParticularDoctor,
    addParticularSecretary, deactivatedEmails, disabledEmails, deactivate, disable, enable,
  };

  return (
    <ClinicDataContext.Provider value={value}>
      {children}
    </ClinicDataContext.Provider>
  );
};

export default ClinicDataProvider;
