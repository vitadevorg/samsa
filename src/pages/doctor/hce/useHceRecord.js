import { useCallback, useEffect, useState } from 'react';
import {
  amendEntry, createEntry, createFollowup, getEntries, getPatient, listAccessLog,
  listCopyRequests, listFollowups, markCopyDelivered, requestCopy, updateFollowupStatus,
} from '../../../services/hceService';

// Carga la historia clínica de un paciente y expone las acciones sobre ella.
// Los componentes no llaman al servicio directamente: todo pasa por este hook.
export const useHceRecord = (historyId, user) => {
  const [state, setState] = useState({ status: 'loading', error: '', patient: null });
  const [entries, setEntries] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [copyRequests, setCopyRequests] = useState([]);
  const [accessLog, setAccessLog] = useState([]);

  // Vuelve a leer lo que cambia con las acciones (sin registrar otra "consulta" de la historia).
  const refresh = useCallback(async () => {
    const [nextEntries, nextTasks, nextCopies, nextLog] = await Promise.all([
      getEntries(historyId), listFollowups(historyId), listCopyRequests(historyId), listAccessLog(historyId),
    ]);
    setEntries(nextEntries);
    setFollowups(nextTasks);
    setCopyRequests(nextCopies);
    setAccessLog(nextLog);
  }, [historyId]);

  const load = useCallback(async () => {
    setState({ status: 'loading', error: '', patient: null });
    try {
      const patient = await getPatient(historyId, user);
      await refresh();
      setState({ status: 'ready', error: '', patient });
    } catch (err) {
      setState({ status: 'error', error: err.message || 'No pudimos cargar la historia clínica.', patient: null });
    }
    // `user` se lee solo al abrir la ficha: no hace falta recargar si cambia su referencia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyId, refresh]);

  useEffect(() => {
    // Carga inicial de datos externos (servicio): el estado se actualiza cuando responde.
    load();
  }, [load]);

  const withRefresh = (fn) => async (...args) => {
    const result = await fn(...args);
    await refresh();
    return result;
  };

  return {
    ...state,
    entries,
    followups,
    copyRequests,
    accessLog,
    reload: load,
    addEntry: withRefresh((type, data) => createEntry(historyId, type, data, user)),
    amend: withRefresh((originalId, data, reason) => amendEntry(originalId, data, reason, user)),
    addFollowup: withRefresh((data) => createFollowup(historyId, data, user)),
    setFollowupStatus: withRefresh((taskId, status) => updateFollowupStatus(taskId, status, user)),
    requestCopy: withRefresh((requester) => requestCopy(historyId, requester, user)),
    deliverCopy: withRefresh((requestId) => markCopyDelivered(requestId, user)),
  };
};
