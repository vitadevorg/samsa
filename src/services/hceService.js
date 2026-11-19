// Servicio de la Historia Clínica Electrónica (HCE).
// Todas las pantallas acceden a la HCE solo a través de estas funciones: para pasar a la API
// real alcanza con reemplazar la implementación de este archivo, manteniendo las firmas.
//
// Implementación actual: MOCK en memoria con datos sintéticos (src/data/hceMock.js) y latencia
// simulada. Los cambios duran mientras la pestaña esté abierta (se pierden al recargar) y nunca
// se guardan en localStorage, porque son datos clínicos.
//
// TODO(api): la inalterabilidad, la firma digital, el control de acceso y la trazabilidad tienen que
// garantizarse en el servidor. Que la interfaz no ofrezca "editar" o "borrar" es solo comodidad.

import { mockAccessLog, mockEntries, mockFollowups, mockPatients, mockProfessionals } from '../data/hceMock';
import { COPY_DEADLINE_HOURS, ENTRY_TYPES, RETENTION_YEARS, VITAL_SIGNS } from '../constants/hce';
import { createId, stableCode, stableHash } from '../utils/ids';
import { stripTitle } from '../utils/doctorName';

const LATENCY_MS = 350;
const wait = (ms = LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (value) => structuredClone(value);

// Estado en memoria (copia de los datos sintéticos).
const store = {
  patients: clone(mockPatients),
  entries: clone(mockEntries),
  followups: clone(mockFollowups),
  accessLog: clone(mockAccessLog),
  copyRequests: [],
};

// ---------- Profesional y firma ----------

// Sello del profesional que firma: nombre, matrícula y especialidad.
// TODO(api): la matrícula y la especialidad tienen que venir del perfil profesional verificado.
export const getProfessionalStamp = (user) => {
  const plainName = stripTitle(user?.name ?? '').trim();
  const known = Object.values(mockProfessionals).find((p) => stripTitle(p.name) === plainName);
  if (known) return known;
  return {
    name: `${user?.title ?? 'Dr.'} ${plainName}`.trim(),
    license: `M.P. ${1000 + (stableHash(plainName) % 9000)}`,
    specialty: user?.specialty ?? 'Medicina General',
  };
};

// Firma electrónica simulada: código derivado del contenido, el profesional y la marca temporal.
// TODO(api): reemplazar por firma digital real (certificado del profesional) emitida por el servidor.
const signEntry = (entry) =>
  stableCode(JSON.stringify([entry.historyId, entry.type, entry.data, entry.professional.license, entry.createdAt]), 12);

// Los registros de ejemplo llegan sin sello: se firman al iniciar, igual que los nuevos.
store.entries.forEach((entry) => { entry.signature ??= signEntry(entry); });

// ---------- Cálculos de dominio ----------

export const computeAge = (birthDate) => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday = today.getMonth() < birth.getMonth()
    || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// Una tarea pendiente cuya fecha ya pasó se muestra como vencida (no se guarda ese estado).
export const effectiveFollowupStatus = (task) =>
  task.status === 'pending' && new Date(task.dueDate) < startOfToday() ? 'overdue' : task.status;

const lastActivityOf = (historyId) => {
  const dates = store.entries.filter((e) => e.historyId === historyId).map((e) => e.createdAt);
  const patient = store.patients.find((p) => p.historyId === historyId);
  return dates.sort().at(-1) ?? patient?.startedAt ?? null;
};

// Fecha mínima de conservación: 10 años desde la última actuación.
const retentionUntil = (lastActivity) => {
  if (!lastActivity) return null;
  const d = new Date(lastActivity);
  d.setFullYear(d.getFullYear() + RETENTION_YEARS);
  return d.toISOString();
};

const withDerived = (patient) => {
  const lastActivity = lastActivityOf(patient.historyId);
  const tasks = store.followups.filter((t) => t.historyId === patient.historyId);
  return {
    ...clone(patient),
    age: computeAge(patient.birthDate),
    lastActivity,
    retentionUntil: retentionUntil(lastActivity),
    pendingTasks: tasks.filter((t) => effectiveFollowupStatus(t) === 'pending').length,
    overdueTasks: tasks.filter((t) => effectiveFollowupStatus(t) === 'overdue').length,
  };
};

const requirePatient = (historyId) => {
  const patient = store.patients.find((p) => p.historyId === historyId);
  if (!patient) throw new Error('No encontramos la historia clínica solicitada.');
  return patient;
};

const logAccess = (historyId, action, user, detail = '') => {
  store.accessLog.unshift({
    id: createId(),
    historyId,
    action,
    at: new Date().toISOString(),
    by: getProfessionalStamp(user).name,
    detail,
  });
};

// Signos vitales: todos opcionales, pero si se cargan tienen que ser valores plausibles.
// Devuelve { clave: mensaje } o null.
const validateVitals = (vitals = {}) => {
  const errors = {};
  VITAL_SIGNS.forEach((v) => {
    const raw = String(vitals?.[v.key] ?? '').trim();
    if (!raw) return;
    if (v.pattern && !v.pattern.test(raw)) errors[v.key] = `Formato ${v.placeholder}`;
    if (v.min != null) {
      const n = Number(raw.replace(',', '.'));
      if (Number.isNaN(n) || n < v.min || n > v.max) errors[v.key] = `Entre ${v.min} y ${v.max}`;
    }
  });
  return Object.keys(errors).length ? errors : null;
};

// Valida los campos obligatorios del tipo de registro. Devuelve { campo: mensaje }.
export const validateEntryData = (type, data) => {
  const config = ENTRY_TYPES[type];
  if (!config) return { type: 'Elegí un tipo de registro.' };
  const errors = {};
  config.fields.forEach((field) => {
    if (field.kind === 'vitals') {
      const vitalErrors = validateVitals(data[field.name]);
      if (vitalErrors) errors[field.name] = vitalErrors;
      return;
    }
    if (field.required && !String(data[field.name] ?? '').trim()) {
      errors[field.name] = 'Este dato es obligatorio.';
    }
  });
  if (data.code && !/^[A-Z]\d{2}(\.\d{1,2})?$/i.test(data.code.trim())) {
    errors.code = 'Usá el formato CIE-10, por ejemplo I10 o E11.9.';
  }
  return errors;
};

// Vista rápida de la historia a partir de los registros vigentes (los enmendados no cuentan).
// Medicación vigente: prescripciones de los últimos 90 días.
export const summarizeRecord = (entries, tasks) => {
  const current = entries.filter((e) => !e.amendedBy);
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const backgroundsBy = (kind) => current.filter((e) => e.type === 'background' && e.data.backgroundKind === kind);
  return {
    backgrounds: {
      genetic: backgroundsBy('genetic'),
      physiological: backgroundsBy('physiological'),
      pathological: backgroundsBy('pathological'),
    },
    medication: current.filter((e) => e.type === 'prescription' && new Date(e.createdAt) >= since),
    evolutions: current.filter((e) => e.type === 'evolution').slice(0, 3),
    // Últimos signos vitales registrados (evolución o enfermería).
    lastVitals: current.find((e) => e.data.vitals && Object.values(e.data.vitals).some((v) => String(v ?? '').trim())) ?? null,
    studies: current.filter((e) => e.type === 'study').slice(0, 3),
    openTasks: tasks
      .map((t) => ({ ...t, effectiveStatus: effectiveFollowupStatus(t) }))
      .filter((t) => t.effectiveStatus === 'pending' || t.effectiveStatus === 'overdue')
      .slice(0, 4),
  };
};

// ---------- Pacientes ----------

// El listado solo devuelve lo necesario para identificar al paciente y priorizar la atención:
// nada de contenido clínico, contacto ni núcleo familiar (minimización de datos).
export const listPatients = async () => {
  await wait();
  return store.patients.map((p) => {
    const full = withDerived(p);
    return {
      historyId: full.historyId,
      name: full.name,
      dni: full.dni,
      age: full.age,
      img: full.img,
      lastActivity: full.lastActivity,
      pendingTasks: full.pendingTasks,
      overdueTasks: full.overdueTasks,
    };
  });
};

// Abrir la ficha queda registrado en la trazabilidad.
export const getPatient = async (historyId, user) => {
  await wait();
  const patient = requirePatient(historyId);
  logAccess(historyId, 'view', user);
  return withDerived(patient);
};

// Alta de historia: la clave uniforme (Nº de HC) se genera una sola vez y no cambia.
export const createPatient = async (data, user) => {
  await wait();
  const historyId = `HC-${String(stableHash(`${data.dni}-${Date.now()}`) % 100000).padStart(5, '0')}`;
  const patient = {
    historyId,
    name: data.name.trim(),
    dni: data.dni.trim(),
    birthDate: data.birthDate || '',
    sex: data.sex || '',
    phone: data.phone?.trim() ?? '',
    email: data.email?.trim() ?? '',
    address: '',
    img: '',
    insurance: { name: data.insuranceName?.trim() || 'Particular', plan: '', memberNumber: data.memberNumber?.trim() ?? '' },
    startedAt: new Date().toISOString(),
    allergies: [],
    activeProblems: [],
    family: [],
  };
  store.patients.unshift(patient);
  logAccess(historyId, 'create', user, 'Apertura de la historia clínica');
  return withDerived(patient);
};

// ---------- Registros ----------

export const getEntries = async (historyId) => {
  await wait();
  requirePatient(historyId);
  return clone(
    store.entries
      .filter((e) => e.historyId === historyId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
};

// Agrega un registro firmado. Nunca se modifica ni se borra uno existente.
export const createEntry = async (historyId, type, data, user) => {
  await wait();
  requirePatient(historyId);
  const errors = validateEntryData(type, data);
  if (Object.keys(errors).length) throw Object.assign(new Error('Revisá los datos del registro.'), { fields: errors });
  const entry = {
    id: createId(),
    historyId,
    type,
    createdAt: new Date().toISOString(),
    professional: getProfessionalStamp(user),
    data: clone(data),
  };
  entry.signature = signEntry(entry);
  store.entries.push(entry);
  logAccess(historyId, 'create', user, ENTRY_TYPES[type].label);
  return clone(entry);
};

// Enmienda: crea un registro nuevo que corrige al original. El original queda visible y enlazado.
export const amendEntry = async (originalId, data, reason, user) => {
  await wait();
  const original = store.entries.find((e) => e.id === originalId);
  if (!original) throw new Error('No encontramos el registro a enmendar.');
  if (original.amendedBy) throw new Error('Este registro ya fue enmendado. Enmendá la versión vigente.');
  if (!reason?.trim()) throw Object.assign(new Error('Indicá el motivo de la enmienda.'), { fields: { reason: 'El motivo es obligatorio.' } });
  const errors = validateEntryData(original.type, data);
  if (Object.keys(errors).length) throw Object.assign(new Error('Revisá los datos del registro.'), { fields: errors });
  const entry = {
    id: createId(),
    historyId: original.historyId,
    type: original.type,
    createdAt: new Date().toISOString(),
    professional: getProfessionalStamp(user),
    data: clone(data),
    amends: original.id,
    amendReason: reason.trim(),
  };
  entry.signature = signEntry(entry);
  store.entries.push(entry);
  original.amendedBy = entry.id;
  logAccess(original.historyId, 'amend', user, `${ENTRY_TYPES[original.type].label} · ${reason.trim()}`);
  return clone(entry);
};

// ---------- Seguimiento ----------

export const listFollowups = async (historyId) => {
  await wait();
  requirePatient(historyId);
  return clone(
    store.followups
      .filter((t) => t.historyId === historyId)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  );
};

export const createFollowup = async (historyId, data, user) => {
  await wait();
  requirePatient(historyId);
  if (!data.title?.trim() || !data.dueDate || !data.kind) {
    throw new Error('Completá el tipo, la descripción y la fecha de la tarea.');
  }
  const task = {
    id: createId(),
    historyId,
    kind: data.kind,
    title: data.title.trim(),
    dueDate: new Date(`${data.dueDate}T10:00:00`).toISOString(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    createdBy: getProfessionalStamp(user).name,
    history: [],
  };
  store.followups.push(task);
  logAccess(historyId, 'followup_create', user, task.title);
  return clone(task);
};

// Cada cambio de estado deja constancia de quién y cuándo.
export const updateFollowupStatus = async (taskId, status, user) => {
  await wait();
  const task = store.followups.find((t) => t.id === taskId);
  if (!task) throw new Error('No encontramos la tarea.');
  task.status = status;
  const change = { status, at: new Date().toISOString(), by: getProfessionalStamp(user).name };
  task.history.push(change);
  logAccess(task.historyId, 'followup_status', user, task.title);
  return clone(task);
};

// ---------- Copia autenticada y trazabilidad ----------

export const listCopyRequests = async (historyId) => {
  await wait(150);
  return clone(store.copyRequests.filter((r) => r.historyId === historyId));
};

// El paciente es titular de su historia: la copia autenticada se entrega dentro de las 48 h.
export const requestCopy = async (historyId, requester, user) => {
  await wait();
  requirePatient(historyId);
  const requestedAt = new Date();
  const request = {
    id: createId(),
    historyId,
    requester,
    requestedAt: requestedAt.toISOString(),
    deadline: new Date(requestedAt.getTime() + COPY_DEADLINE_HOURS * 3600 * 1000).toISOString(),
    status: 'pending',
    deliveredAt: null,
  };
  store.copyRequests.unshift(request);
  logAccess(historyId, 'copy_request', user, `Solicitante: ${requester}`);
  return clone(request);
};

export const markCopyDelivered = async (requestId, user) => {
  await wait();
  const request = store.copyRequests.find((r) => r.id === requestId);
  if (!request) throw new Error('No encontramos el pedido de copia.');
  request.status = 'delivered';
  request.deliveredAt = new Date().toISOString();
  logAccess(request.historyId, 'copy_delivered', user, `Solicitante: ${request.requester}`);
  return clone(request);
};

export const listAccessLog = async (historyId) => {
  await wait(150);
  return clone(store.accessLog.filter((a) => a.historyId === historyId));
};
