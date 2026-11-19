import React, { useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import { EditConfirmModal, SuccessModal } from '../clinic/ClinicModals';
import { useClinicData } from '../clinic/clinicDataContext';
import { resetPassword } from '../../services/authService';
import { useSuccessModal } from './useSuccessModal';
import TemporaryPasswordModal from './TemporaryPasswordModal';

// Acciones sobre la cuenta de una persona (resetear contraseña, inhabilitar, volver a habilitar y dar
// de baja definitiva). La baja solo se ofrece con la cuenta ya inhabilitada: primero se inhabilita.
// Incluye sus ventanas de confirmación y la de la contraseña temporal. Las usan Particulares y los
// administradores de Clínicas y Hospitales; Gestión de Usuarios hace lo mismo para todas las cuentas.
// `person`: { name, email, profile } — `profile` crea la cuenta si todavía no existía (ver resetPassword).
export const useAccountActions = () => {
  const { deactivatedEmails, disabledEmails, disable, enable, deactivate } = useClinicData();
  const [toReset, setToReset] = useState(null);
  const [toDisable, setToDisable] = useState(null);
  const [toEnable, setToEnable] = useState(null);
  const [toDeactivate, setToDeactivate] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const { success, showSuccess } = useSuccessModal();

  // 'deactivated' (baja definitiva), 'disabled' (inhabilitada) o 'active'.
  const statusOf = (email) => {
    const key = email.toLowerCase();
    if (deactivatedEmails.has(key)) return 'deactivated';
    return disabledEmails.has(key) ? 'disabled' : 'active';
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

  const modals = (
    <>
      <EditConfirmModal
        isOpen={toReset !== null}
        title="¿Resetear contraseña?"
        message={`Se asignará una contraseña temporal a ${toReset?.name}. La contraseña actual dejará de funcionar y tendrá que elegir una nueva al iniciar sesión.`}
        confirmLabel="Sí, Resetear"
        onCancel={() => setToReset(null)}
        onConfirm={handleConfirmReset}
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
      <ConfirmModal
        isOpen={toDeactivate !== null}
        onClose={() => setToDeactivate(null)}
        onConfirm={handleConfirmDeactivate}
        title="Dar de baja definitivamente"
        message={`¿Confirma que desea dar de baja definitivamente a ${toDeactivate?.name}? Ya no podrá iniciar sesión ni volver a habilitarse.`}
        confirmLabel="Sí, Dar de baja"
      />
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />
      <TemporaryPasswordModal credentials={credentials} onClose={() => setCredentials(null)} />
    </>
  );

  return {
    statusOf, modals,
    requestReset: setToReset, requestDisable: setToDisable, requestEnable: setToEnable, requestDeactivate: setToDeactivate,
  };
};
