import React, { useId } from 'react';
import { X, User, Hash, Phone, Mail, Calendar, ShieldCheck, Clock, Activity } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { SecretaryModalOverlay, SecretaryModalCard } from './SecretaryModal';
import { calculateAge, formatDateToLocale } from './dates';

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><Icon className="w-4 h-4"/></div>
      <div className="min-w-0">
          <p className="text-xs text-gray-400 font-bold">{label}</p>
          <div className="text-sm font-bold text-gray-800 break-words">{children}</div>
      </div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
      {children}
  </div>
);

const PatientProfileModal = ({ profile, onClose }) => {
  const titleId = useId();
  return (
    <SecretaryModalOverlay onClose={onClose} labelledBy={titleId}>
      <SecretaryModalCard maxWidth="max-w-md" className="flex flex-col max-h-[calc(100dvh-2rem)]">
          <div className="bg-white p-6 text-center relative shrink-0 border-b border-gray-100">
              <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors"><X className="w-5 h-5"/></button>
              <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto flex items-center justify-center border-4 border-white ring-2 ring-blue-100 shadow-sm mb-4">
                  <User className="w-10 h-10 text-blue-600" />
              </div>
              <h2 id={titleId} className="text-xl sm:text-2xl font-bold text-gray-900 px-8 break-words">{profile.patient}</h2>
          </div>
          <div className="flex-1 bg-gray-50/70 p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <Section title="Información de Contacto">
                  <div className="space-y-3">
                      {profile.dni && <InfoRow icon={Hash} label="DNI"><span className="font-mono">{profile.dni}</span></InfoRow>}
                      <InfoRow icon={Phone} label="Teléfono">{profile.phone || 'No registrado'}</InfoRow>
                      <InfoRow icon={Mail} label="Email">{profile.email || 'No registrado'}</InfoRow>
                      {profile.dob && (
                          <InfoRow icon={Calendar} label="Fecha de Nacimiento">
                              {profile.dob.split('-').reverse().join('/')}
                              <span className="text-gray-400 font-medium ml-2">({calculateAge(profile.dob)} años)</span>
                          </InfoRow>
                      )}
                  </div>
              </Section>

              {(profile.obraSocial || profile.cuit) && (
                  <Section title="Cobertura y Facturación">
                      <div className="space-y-3">
                          {profile.obraSocial && <InfoRow icon={ShieldCheck} label="Obra Social">{profile.obraSocial}</InfoRow>}
                          {profile.cuit && <InfoRow icon={Hash} label="CUIT / CUIL"><span className="font-mono">{profile.cuit}</span></InfoRow>}
                      </div>
                  </Section>
              )}

              {profile.nextTurn && (
                  <Section title="Turno Relacionado">
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                          <div className="flex justify-between items-start gap-2 mb-2">
                              <p className="font-bold text-gray-900 text-sm flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-500"/> {profile.nextTurn.time}hs</p>
                              <StatusBadge status={profile.nextTurn.status} />
                          </div>
                          <p className="text-xs text-gray-500 font-medium mb-1"><Calendar className="w-3 h-3 inline mr-1"/> {formatDateToLocale(profile.nextTurn.date)}</p>
                          <p className="text-xs text-gray-500 font-medium"><Activity className="w-3 h-3 inline mr-1"/> Canal: {profile.nextTurn.type}</p>
                      </div>
                  </Section>
              )}
          </div>
      </SecretaryModalCard>
    </SecretaryModalOverlay>
  );
};

export default PatientProfileModal;
