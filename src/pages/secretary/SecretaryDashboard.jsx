import React, { useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { createId } from '../../utils/ids';
import { useAgenda } from './dashboard/useAgenda';
import { ASSIGNED_DOCTORS, findPatientByName } from './dashboard/mockData';
import { filterAgenda } from './dashboard/agenda';
import { buildDateCarousel, formatDateToLocale, getToday } from './dashboard/dates';
import AgendaHeader from './dashboard/AgendaHeader';
import DateStrip from './dashboard/DateStrip';
import AgendaTable from './dashboard/AgendaTable';
import AgendaColumns from './dashboard/AgendaColumns';
import NewTurnModal from './dashboard/NewTurnModal';
import ConfirmActionModal from './dashboard/ConfirmActionModal';
import RescheduleModal from './dashboard/RescheduleModal';
import SuspendedDrawer from './dashboard/SuspendedDrawer';
import NotificationModal from './dashboard/NotificationModal';
import ChatModal from './dashboard/ChatModal';
import PatientProfileModal from './dashboard/PatientProfileModal';

// Página contenedora: coordina el estado de interfaz (filtros y modales abiertos)
// y delega los cambios de la agenda en useAgenda.
const SecretaryDashboard = () => {
  const {
    appointments, suspended,
    createAppointment, markArrived, moveAppointment, cancelAppointment, suspendAppointment, removeSuspended,
  } = useAgenda();

  const [selectedDoctorId, setSelectedDoctorId] = useState(ASSIGNED_DOCTORS[0].id);
  const [selectedDate, setSelectedDate] = useState(getToday);
  const [dateCarousel] = useState(buildDateCarousel);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('single');

  // Cada modal guarda solo "para qué" está abierto; su formulario vive dentro del modal.
  const [newTurnDraft, setNewTurnDraft] = useState(null);         // { doctorId, initialData, fromSuspendedId }
  const [pendingAction, setPendingAction] = useState(null);       // { type, doctorId, appointment }
  const [rescheduleTarget, setRescheduleTarget] = useState(null); // { doctorId, appointment }
  const [notification, setNotification] = useState(null);         // { message, title?, autoCloseMs? }
  const [patientProfile, setPatientProfile] = useState(null);
  const [showSuspended, setShowSuspended] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const currentDoctor = ASSIGNED_DOCTORS.find(d => d.id === selectedDoctorId);
  const currentAppointments = filterAgenda(appointments[selectedDoctorId], selectedDate, searchTerm);

  const notify = (message, options = {}) => setNotification({ message, ...options });
  const closeNotification = useCallback(() => setNotification(null), []);

  const openNewTurn = (doctorId = selectedDoctorId, initialData = {}, fromSuspendedId = null) => {
    setSelectedDoctorId(doctorId);
    setNewTurnDraft({ doctorId, initialData: { date: selectedDate, ...initialData }, fromSuspendedId });
  };

  const handleCreateTurn = (data) => {
    const { doctorId, fromSuspendedId } = newTurnDraft;
    createAppointment(doctorId, {
      id: createId(),
      date: data.date,
      time: data.time,
      patient: data.patient,
      phone: data.phone,
      status: 'pending',
      type: data.type,
      motivoConsulta: data.motivoConsulta,
    }, fromSuspendedId);
    setNewTurnDraft(null);
  };

  const handleAction = (type, doctorId, appointment) => {
    if (type === 'reschedule') setRescheduleTarget({ doctorId, appointment });
    else setPendingAction({ type, doctorId, appointment });
  };

  const handleConfirmAction = ({ sendToSuspend }) => {
    const { type, doctorId, appointment } = pendingAction;
    if (type === 'cancel') {
      const alreadyWaiting = suspended.length;
      cancelAppointment(doctorId, appointment.id, sendToSuspend);
      if (alreadyWaiting > 0) {
        const waiting = alreadyWaiting + (sendToSuspend ? 1 : 0);
        notify(`Horario liberado. Hay ${waiting} pacientes en lista de espera. ¿Desea asignar este turno ahora?`);
      }
    } else if (type === 'arrive') {
      markArrived(doctorId, appointment.id);
    }
    setPendingAction(null);
  };

  const handleReschedule = ({ hasDate, customDate, customTime, notify: notifyPatient }) => {
    const { doctorId, appointment } = rescheduleTarget;
    let message;
    if (hasDate === 'no') {
      suspendAppointment(doctorId, appointment.id);
      message = `Se ha reprogramado el turno de ${appointment.patient} a la bolsa de suspenso.`;
    } else {
      moveAppointment(doctorId, appointment.id, customDate, customTime);
      message = `Turno reprogramado para el ${formatDateToLocale(customDate)} a las ${customTime}hs.`;
    }
    notify(message, notifyPatient ? {} : { title: 'Cambios guardados' });
    setRescheduleTarget(null);
  };

  const handleScheduleSuspended = (patient) => {
    const patientData = findPatientByName(patient.patient) ?? { patient: patient.patient, phone: patient.phone };
    setShowSuspended(false);
    openNewTurn(
      patient.doctorId ?? selectedDoctorId,
      { ...patientData, type: patient.type || 'Presencial', isReschedule: true },
      patient.id
    );
  };

  const handleRemoveSuspended = (id) => {
    removeSuspended(id);
    notify('Paciente removido de la lista de reprogramación', { autoCloseMs: 3000 });
  };

  const handlePatientClick = (app) => {
    const registered = findPatientByName(app.patient);
    setPatientProfile(registered
      ? { ...registered, nextTurn: app }
      : { patient: app.patient, phone: app.phone, nextTurn: app });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <AgendaHeader
          doctors={ASSIGNED_DOCTORS}
          selectedDoctorId={selectedDoctorId}
          onSelectDoctor={setSelectedDoctorId}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenChat={() => setShowChat(true)}
        />

        <DateStrip dates={dateCarousel} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {viewMode === 'single' ? (
          <AgendaTable
            doctor={currentDoctor}
            date={selectedDate}
            appointments={currentAppointments}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            suspendedCount={suspended.length}
            onOpenSuspended={() => setShowSuspended(true)}
            onNewTurn={() => openNewTurn()}
            onAction={(type, app) => handleAction(type, selectedDoctorId, app)}
            onPatientClick={handlePatientClick}
          />
        ) : (
          <AgendaColumns
            doctors={ASSIGNED_DOCTORS}
            appointmentsByDoctor={appointments}
            date={selectedDate}
            searchTerm={searchTerm}
            onNewTurn={openNewTurn}
            onAction={handleAction}
            onPatientClick={handlePatientClick}
          />
        )}
      </main>
      <Footer />

      {newTurnDraft && (
        <NewTurnModal
          doctorAppointments={appointments[newTurnDraft.doctorId] || []}
          initialData={newTurnDraft.initialData}
          onSubmit={handleCreateTurn}
          onClose={() => setNewTurnDraft(null)}
        />
      )}

      {pendingAction && (
        <ConfirmActionModal
          action={pendingAction.type}
          onConfirm={handleConfirmAction}
          onClose={() => setPendingAction(null)}
        />
      )}

      {rescheduleTarget && (
        <RescheduleModal
          doctorAppointments={appointments[rescheduleTarget.doctorId] || []}
          appointmentId={rescheduleTarget.appointment.id}
          onSubmit={handleReschedule}
          onClose={() => setRescheduleTarget(null)}
        />
      )}

      {showSuspended && (
        <SuspendedDrawer
          patients={suspended}
          onSchedule={handleScheduleSuspended}
          onRemove={handleRemoveSuspended}
          onClose={() => setShowSuspended(false)}
        />
      )}

      {notification && <NotificationModal {...notification} onClose={closeNotification} />}

      {showChat && <ChatModal doctor={currentDoctor} onClose={() => setShowChat(false)} />}

      {patientProfile && <PatientProfileModal profile={patientProfile} onClose={() => setPatientProfile(null)} />}
    </div>
  );
};

export default SecretaryDashboard;
