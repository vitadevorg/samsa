import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { EditConfirmModal, SuccessModal, RejectConfirmModal } from './ClinicModals';
import { useClinicData } from './clinicDataContext';
import { useTimeouts } from '../../hooks/useTimeouts';
import { doctorsData } from '../../data/doctors';
import { schedulesOverlap, formatSchedule } from '../../data/institutions';
import { findOfficeConflict } from './clinicValidation';
import { WEEK_DAYS } from '../../constants/catalog';
import { formatDate } from './clinicDates';
import { Inbox, ArrowRight, Clock, Check, X, AlertTriangle, MapPin, History } from 'lucide-react';

// Cuánto tiempo (en milisegundos) queda visible la ventana verde de éxito.
const SUCCESS_DURATION_MS = 2500;

const findDoctor = (doctorId) => doctorsData.find((doctor) => doctor.id === doctorId);

// Colores del badge según el estado de la solicitud.
const STATUS_STYLES = {
  pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
  aceptada: 'bg-green-100 text-green-700 border-green-200',
  rechazada: 'bg-red-100 text-red-700 border-red-200',
};

// Un horario dibujado como la fila de días de la semana (los que atiende, en azul)
// y la franja horaria debajo. Se usa para comparar "actual" contra "pedido".
const ScheduleView = ({ label, schedule, highlight = false }) => (
  <div className={`flex-1 p-4 rounded-xl border ${highlight ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 bg-gray-50'}`}>
    <p className="text-xs font-bold text-gray-500 uppercase mb-2">{label}</p>
    <div className="flex gap-1 flex-wrap mb-2">
      {WEEK_DAYS.map((day) => (
        <span
          key={day}
          className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center ${
            schedule.days.includes(day) ? 'bg-blue-600 text-white' : 'bg-white text-gray-300 border border-gray-200'
          }`}
        >
          {day}
        </span>
      ))}
    </div>
    <p className="text-sm font-bold text-gray-700 flex items-center gap-1">
      <Clock className="w-4 h-4 text-gray-400"/> {schedule.startTime} a {schedule.endTime}
    </p>
  </div>
);

// Pantalla del administrador de institución (clínica u hospital): pedidos de cambio de horario de sus médicos.
// Arriba las solicitudes pendientes (para aceptar o rechazar) y abajo el historial.
const ClinicRequests = () => {
  const { clinic, terms, assignments, requests, acceptRequest, rejectRequest } = useClinicData();

  // Qué solicitud se está confirmando y en qué ventana (naranja = aceptar, roja = rechazar).
  const [acceptingId, setAcceptingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [success, setSuccess] = useState(null); // null = cerrada; { title, message } = abierta
  const { schedule } = useTimeouts();

  const showSuccess = (title, message) => {
    setSuccess({ title, message });
    schedule(() => setSuccess(null), SUCCESS_DURATION_MS);
  };

  if (!clinic) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-10 text-center text-gray-500">
          Tu usuario no tiene una institución asignada.
        </div>
      </div>
    );
  }

  // Pendientes (las más viejas primero: son las que esperan hace más tiempo)
  // e historial (las resueltas más recientes primero).
  const pending = requests
    .filter((r) => r.status === 'pendiente')
    .sort((a, b) => a.date.localeCompare(b.date));
  const history = requests
    .filter((r) => r.status !== 'pendiente')
    .sort((a, b) => (b.resolvedAt ?? b.date).localeCompare(a.resolvedAt ?? a.date));

  // Vinculación actual del médico en esta clínica (puede no existir si lo quitaron).
  const findAssignment = (doctorId) => assignments.find((a) => a.doctorId === doctorId);

  const requestBeingAccepted = requests.find((r) => r.id === acceptingId);
  const requestBeingRejected = requests.find((r) => r.id === rejectingId);

  const handleConfirmAccept = () => {
    const doctorName = findDoctor(requestBeingAccepted.doctorId)?.name;
    acceptRequest(acceptingId);
    setAcceptingId(null);
    showSuccess('¡Solicitud aceptada!', `El nuevo horario de ${doctorName} ya se ve en la pantalla Médicos.`);
  };

  const handleConfirmReject = () => {
    rejectRequest(rejectingId);
    setRejectingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <EditConfirmModal
        isOpen={requestBeingAccepted !== undefined}
        title="¿Aceptar solicitud?"
        message={requestBeingAccepted
          ? `${findDoctor(requestBeingAccepted.doctorId)?.name} pasará a atender ${formatSchedule(requestBeingAccepted.requestedSchedule)}.`
          : ''}
        confirmLabel="Sí, Aceptar"
        onCancel={() => setAcceptingId(null)}
        onConfirm={handleConfirmAccept}
      />
      <RejectConfirmModal
        isOpen={requestBeingRejected !== undefined}
        title="Rechazar solicitud"
        message={requestBeingRejected
          ? `¿Confirma que desea rechazar el cambio de horario pedido por ${findDoctor(requestBeingRejected.doctorId)?.name}? Mantendrá su horario actual.`
          : ''}
        onCancel={() => setRejectingId(null)}
        onConfirm={handleConfirmReject}
      />
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg"><Inbox className="text-blue-600 w-8 h-8"/></div>
            Solicitudes de cambio de horario
          </h1>
          <p className="text-gray-500 mt-2 flex items-center gap-1 text-sm">
            <MapPin className="w-4 h-4"/> {clinic.name}
          </p>
        </div>

        {/* ---------------- Pendientes ---------------- */}
        <h2 className="font-bold text-xl text-gray-800 mb-4">Pendientes ({pending.length})</h2>
        {pending.length === 0 && (
          <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center text-gray-400 mb-10">
            No hay solicitudes pendientes.
          </div>
        )}
        <div className="space-y-6 mb-12">
          {pending.map((request) => {
            const doctor = findDoctor(request.doctorId);
            const assignment = findAssignment(request.doctorId);
            // No se puede aceptar si el médico ya no está en la clínica, o si en el
            // horario pedido su consultorio lo usa otro médico. (Si choca con otra
            // institución, lo coordina el médico con la administración.)
            const officeTaken = assignment && findOfficeConflict(
              { doctorId: request.doctorId, institutionId: clinic.id, office: assignment.office, schedule: request.requestedSchedule },
              assignments,
              schedulesOverlap
            );
            const blockReason = !assignment
              ? `El médico ya no está vinculado a ${terms.place}.`
              : officeTaken
                ? `En ese horario ${officeTaken.office} lo usa ${findDoctor(officeTaken.doctorId)?.name} (${formatSchedule(officeTaken)}). Cambiale el consultorio desde Médicos o rechazá la solicitud.`
                : '';

            return (
              <div key={request.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img src={doctor?.img} alt="" className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                    <div>
                      <p className="font-bold text-gray-900">{doctor?.name}</p>
                      <p className="text-xs text-gray-500">{assignment?.area ?? doctor?.specialty} · pedido el {formatDate(request.date)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_STYLES.pendiente}`}>Pendiente</span>
                </div>

                <p className="text-sm text-gray-600 italic mb-4">“{request.reason}”</p>

                {/* Comparación: horario actual -> horario pedido */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-4">
                  <ScheduleView label="Horario actual" schedule={assignment ?? request.currentSchedule} />
                  <ArrowRight className="w-6 h-6 text-gray-300 self-center rotate-90 md:rotate-0 shrink-0" />
                  <ScheduleView label="Horario pedido" schedule={request.requestedSchedule} highlight />
                </div>

                {blockReason && (
                  <div role="alert" className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100 font-medium mb-4">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"/>
                    <span>No se puede aceptar: {blockReason}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setRejectingId(request.id)}
                    className="px-5 py-2.5 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition flex items-center gap-2"
                  >
                    <X className="w-4 h-4"/> Rechazar
                  </button>
                  <button
                    onClick={() => setAcceptingId(request.id)}
                    disabled={Boolean(blockReason)}
                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <Check className="w-4 h-4"/> Aceptar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ---------------- Historial ---------------- */}
        <h2 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-gray-400"/> Historial
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Profesional</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Cambio pedido</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Pedido</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Resuelto</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map((request) => (
                <tr key={request.id} className="hover:bg-blue-50/50 transition">
                  <td className="p-5 font-bold text-gray-900">{findDoctor(request.doctorId)?.name}</td>
                  <td className="p-5 text-sm text-gray-500">
                    <span className="line-through">{formatSchedule(request.currentSchedule)}</span>
                    <br />
                    <span className="text-gray-800 font-medium">{formatSchedule(request.requestedSchedule)}</span>
                  </td>
                  <td className="p-5 text-sm text-gray-500">{formatDate(request.date)}</td>
                  <td className="p-5 text-sm text-gray-500">{request.resolvedAt ? formatDate(request.resolvedAt) : '—'}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${STATUS_STYLES[request.status]}`}>
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && (
            <div className="p-10 text-center text-gray-400">Todavía no hay solicitudes resueltas.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicRequests;
