import React from 'react';
import { useAuth } from '../../context/useAuth';
import { useSupport, useCanReportSupport } from '../../context/support-context';
import SupportModal from './SupportModal';

// Monta la ventana de soporte cuando alguien la abre (openSupport). Con sesión la usa cualquiera
// salvo el admin SAMSA; sin sesión, solo la versión de invitado (Preguntas Frecuentes).
const SupportModalHost = () => {
  const { user } = useAuth();
  const { modal, closeSupport } = useSupport();
  const canReport = useCanReportSupport();
  if (!modal || (modal.guest ? user : !canReport)) return null;
  return <SupportModal initialTicketId={modal.ticketId} guest={modal.guest} onClose={closeSupport} />;
};

export default SupportModalHost;
