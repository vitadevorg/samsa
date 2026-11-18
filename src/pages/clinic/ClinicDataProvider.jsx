import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { createId } from '../../utils/ids';
import { deactivateAccount, disableAccount, enableAccount, getDeactivatedEmails, getDisabledEmails } from '../../services/authService';
import { INSTITUTION_ADMIN_PATHS } from '../../constants/roles';
import {
  CLINICS, HOSPITALS, PARTICULAR_DOCTORS, INSTITUTION_ADMINS,
  getAllDoctorAssignments, SECRETARIES, SCHEDULE_REQUESTS,
  getInstitutionUnits, getInstitutionTerms,
  pendingDocuments, getDoctorEmail, getParticularDoctorDocuments,
} from '../../data/institutions';
import { doctorsData } from '../../data/doctors';
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
  const [particularDoctors, setParticularDoctors] = useState(() =>
    PARTICULAR_DOCTORS.map((doctor) => ({ ...doctor, documents: getParticularDoctorDocuments(doctor.id) })));
  const [institutionAdmins, setInstitutionAdmins] = useState(() => [...INSTITUTION_ADMINS]);
  // Datos de contacto de médicos de clínicas y hospitales editados por VitaDev: { [doctorId]: { name, email, phone } }.
  // Pisan al nombre y email de doctors.js solo en su cuenta y en Gestión de Usuarios (no en el perfil público).
  const [doctorContacts, setDoctorContacts] = useState({});
  // Médicos que dio de alta una clínica u hospital (no están en doctors.js): { id, name, email, phone,
  // specialty, insurances, institutionId }. Su vinculación con la institución va en `allAssignments`.
  const [institutionDoctors, setInstitutionDoctors] = useState([]);
  const [deactivatedEmails, setDeactivatedEmails] = useState(() => new Set(getDeactivatedEmails()));
  const [disabledEmails, setDisabledEmails] = useState(() => new Set(getDisabledEmails()));

  // Lo que ven las pantallas de clínica: solo los datos de la clínica del admin.
  // Se recalculan en cada render a partir del estado completo.
  const assignments = allAssignments.filter((a) => a.institutionId === clinic?.id);
  // Vinculaciones donde se pueden reservar turnos: las de instituciones activas. Las pantallas de
  // pacientes (cartilla, perfil del médico, reserva) usan esta lista en lugar de `allAssignments`.
  // Tampoco cuentan las vinculaciones que la institución inhabilitó (`status: 'disabled'`).
  const bookableAssignments = allAssignments.filter((a) =>
    a.status !== 'disabled' && (institutions.find((i) => i.id === a.institutionId)?.status ?? 'active') === 'active');
  const secretaries = allSecretaries.filter((s) => s.institutionId === clinic?.id);
  const requests = allRequests.filter((r) => r.institutionId === clinic?.id);

  // Datos de un médico de clínica u hospital: los de doctors.js o los del alta que hizo la institución,
  // con los datos de contacto que haya corregido VitaDev por encima. `undefined` si no existe.
  const findDoctor = (doctorId) => {
    const own = institutionDoctors.find((d) => d.id === doctorId);
    const base = own ?? doctorsData.find((d) => d.id === doctorId);
    if (!base) return undefined;
    const contact = doctorContacts[doctorId] ?? {};
    return {
      ...base,
      name: contact.name ?? base.name,
      email: contact.email ?? base.email ?? getDoctorEmail(doctorId),
      phone: contact.phone ?? base.phone ?? '',
    };
  };
  const doctorEmailOf = (doctorId) => findDoctor(doctorId)?.email ?? getDoctorEmail(doctorId);

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

  // Vincula a un médico existente: trae la documentación que la institución cargó al vincularlo
  // (cada institución lleva la suya); si no viene, arranca toda pendiente.
  const addAssignment = (data) => {
    setAllAssignments((prev) => [
      ...prev,
      { ...data, id: createId(), institutionId: clinic.id, documents: data.documents ?? pendingDocuments() },
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
      deactivate(doctorEmailOf(removed.doctorId));
    }
  };

  // Alta de un médico nuevo por la institución (no existía en SAMSA): se guardan sus datos y su
  // vinculación, con la documentación cargada en el alta. Devuelve el id del médico.
  const addInstitutionDoctor = (doctor, assignment, documents) => {
    const doctorId = createId();
    setInstitutionDoctors((prev) => [...prev, { ...doctor, id: doctorId, institutionId: clinic.id }]);
    setAllAssignments((prev) => [
      ...prev,
      { ...assignment, id: createId(), doctorId, institutionId: clinic.id, documents: documents ?? pendingDocuments() },
    ]);
    return doctorId;
  };

  // La institución corrige los datos de un médico que ella misma dio de alta.
  const updateInstitutionDoctor = (doctorId, changes) => {
    setInstitutionDoctors((prev) => prev.map((d) => (d.id === doctorId ? { ...d, ...changes } : d)));
  };

  // Inhabilitar a un médico en UNA institución: deja de recibir turnos ahí (ver `bookableAssignments`).
  // Su cuenta se inhabilita solo si no atiende en ninguna otra institución; si atiende en otra, sigue
  // entrando normalmente. Habilitar deshace lo mismo.
  const activeElsewhere = (assignment) => allAssignments.some(
    (a) => a.doctorId === assignment.doctorId && a.id !== assignment.id && a.status !== 'disabled'
  );
  const setAssignmentStatus = (id, status) => {
    const target = allAssignments.find((a) => a.id === id);
    if (!target) return;
    setAllAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    if (!activeElsewhere(target)) {
      (status === 'disabled' ? disable : enable)(doctorEmailOf(target.doctorId));
    }
  };
  const disableAssignment = (id) => setAssignmentStatus(id, 'disabled');
  const enableAssignment = (id) => setAssignmentStatus(id, 'active');

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
  // Un médico particular nuevo trae la documentación cargada en el alta; si no, arranca toda pendiente.
  const addParticularDoctor = (data) => {
    setParticularDoctors((prev) => [...prev, { ...data, id: createId(), documents: data.documents ?? pendingDocuments() }]);
  };

  // VitaDev edita el nombre, email o teléfono de un médico de clínica u hospital.
  const updateDoctorContact = (doctorId, changes) => {
    setDoctorContacts((prev) => ({ ...prev, [doctorId]: { ...prev[doctorId], ...changes } }));
  };

  // Marca un documento de un médico particular como recibido (lo hace VitaDev).
  const updateParticularDocument = (doctorId, type, expiresAt) => {
    setParticularDoctors((prev) =>
      prev.map((d) =>
        d.id !== doctorId
          ? d
          : { ...d, documents: d.documents.map((doc) => (doc.type === type ? { ...doc, status: 'vigente', expiresAt: expiresAt || null } : doc)) }
      )
    );
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

  // La institución elige las obras sociales que acepta y los estudios que realiza. Si deja de aceptar
  // una obra social, se quita también de los médicos que dio de alta (no pueden aceptar una que ella no recibe).
  const updateInstitutionOffer = (id, { insurances, studies }) => {
    updateInstitution(id, { insurances, studies });
    setInstitutionDoctors((prev) => prev.map((d) => (d.institutionId === id
      ? { ...d, insurances: (d.insurances ?? []).filter((name) => insurances.includes(name)) }
      : d)));
  };

  // Asocia una clínica (`kind` 'clinic') u hospital ('hospital') nueva, con su administrador.
  // Arranca sin áreas ni sectores; `institution.id` lo genera quien llama.
  const addInstitution = (kind, institution, admin) => {
    const units = kind === 'hospital' ? { sectors: [] } : { areas: [] };
    setInstitutions((prev) => [...prev, { ...institution, ...units }]);
    setInstitutionAdmins((prev) => [...prev, { ...admin, id: createId(), institutionId: institution.id }]);
  };

  // Suma un administrador a una institución existente (su acceso lo crea quien llama).
  const addInstitutionAdmin = (institutionId, admin) => {
    setInstitutionAdmins((prev) => [...prev, { ...admin, id: createId(), institutionId }]);
  };

  // Estado de una institución: 'active' (por defecto), 'disabled' (inhabilitada, reversible)
  // o 'deactivated' (dada de baja, definitivo).
  const institutionStatus = (institutionId) => institutions.find((i) => i.id === institutionId)?.status ?? 'active';

  // Personal que pierde el acceso con la institución: sus administradores, sus secretarias y los
  // médicos que SOLO trabajan ahí. Un médico que también atiende en otra institución conserva su
  // cuenta; solo deja de poder recibir turnos en esta (ver `bookableAssignments`).
  const institutionStaffEmails = (institutionId) => {
    const doctorIds = [...new Set(allAssignments.filter((a) => a.institutionId === institutionId).map((a) => a.doctorId))];
    const onlyHere = doctorIds.filter((doctorId) => !allAssignments.some((a) => a.doctorId === doctorId && a.institutionId !== institutionId));
    return [
      ...institutionAdmins.filter((a) => a.institutionId === institutionId).map((a) => a.email),
      ...allSecretaries.filter((s) => s.institutionId === institutionId).map((s) => s.email),
      ...onlyHere.map(doctorEmailOf),
    ];
  };

  // Inhabilita ('disabled'), vuelve a habilitar ('active') o da de baja ('deactivated') una institución
  // y aplica lo mismo a las cuentas de su personal.
  const setInstitutionStatus = (institutionId, status) => {
    setInstitutions((prev) => prev.map((i) => (i.id === institutionId ? { ...i, status } : i)));
    const apply = status === 'disabled' ? disable : status === 'deactivated' ? deactivate : enable;
    institutionStaffEmails(institutionId).forEach(apply);
  };

  // Corrige los datos de un administrador de institución (el email es su usuario y no cambia).
  const updateInstitutionAdmin = (id, changes) => {
    setInstitutionAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));
  };

  // Crea un área (clínica) o sector (hospital). Aparece en los formularios
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
    findDoctor, institutionDoctors, addInstitutionDoctor, updateInstitutionDoctor,
    disableAssignment, enableAssignment, updateInstitutionOffer,
    secretaries, addSecretary, updateSecretary, removeSecretary,
    requests, acceptRequest, rejectRequest,
    // VitaDev: todo el sistema, sin filtrar por institución.
    institutions, institutionAdmins, addInstitution, updateInstitution, updateInstitutionAdmin, addUnit,
    addInstitutionAdmin, institutionStatus, setInstitutionStatus, bookableAssignments,
    particularDoctors, addParticularDoctor, updateParticularDoctor, removeParticularDoctor, updateParticularDocument,
    doctorContacts, updateDoctorContact,
    addParticularSecretary, deactivatedEmails, disabledEmails, deactivate, disable, enable,
  };

  return (
    <ClinicDataContext.Provider value={value}>
      {children}
    </ClinicDataContext.Provider>
  );
};

export default ClinicDataProvider;
