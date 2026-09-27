import React from 'react';
import { X, User, Hash, Phone, Mail, Calendar, ShieldCheck, Clock, Activity, FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { calculateAge, formatDateToLocale } from './dates';

const PatientProfileModal = ({ profile, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-white/10 flex flex-col max-h-[90vh]">
          <div className="bg-gradient-to-b from-blue-900 to-slate-900 p-6 text-white text-center relative shrink-0">
              <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20"><X className="w-5 h-5"/></button>
              <div className="w-20 h-20 bg-blue-500/20 rounded-full mx-auto flex items-center justify-center border-4 border-white/10 shadow-lg mb-4">
                  <User className="w-10 h-10 text-blue-300" />
              </div>
              <h2 className="text-2xl font-black">{profile.patient}</h2>
          </div>
          <div className="flex-1 bg-slate-50 p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm shrink-0">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Información de Contacto</h3>
                  <div className="space-y-3">
                      {profile.dni && (
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center shrink-0"><Hash className="w-4 h-4"/></div>
                              <div>
                                  <p className="text-xs text-slate-400 font-bold">DNI</p>
                                  <p className="text-sm font-bold text-slate-700 font-mono">{profile.dni}</p>
                              </div>
                          </div>
                      )}
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0"><Phone className="w-4 h-4"/></div>
                          <div>
                              <p className="text-xs text-slate-400 font-bold">Teléfono</p>
                              <p className="text-sm font-bold text-slate-700">{profile.phone || 'No registrado'}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0"><Mail className="w-4 h-4"/></div>
                          <div>
                              <p className="text-xs text-slate-400 font-bold">Email</p>
                              <p className="text-sm font-bold text-slate-700">{profile.email || 'No registrado'}</p>
                          </div>
                      </div>
                      {profile.dob && (
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center shrink-0"><Calendar className="w-4 h-4"/></div>
                              <div>
                                  <p className="text-xs text-slate-400 font-bold">Fecha de Nacimiento</p>
                                  <p className="text-sm font-bold text-slate-700">
                                      {profile.dob ? profile.dob.split('-').reverse().join('/') : ''}
                                      <span className="text-slate-400 font-medium ml-2">({calculateAge(profile.dob)} años)</span>
                                  </p>
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              {(profile.obraSocial || profile.cuit) && (
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Cobertura y Facturación</h3>
                  <div className="space-y-3">
                      {profile.obraSocial && (
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0"><ShieldCheck className="w-4 h-4"/></div>
                              <div>
                                  <p className="text-xs text-slate-400 font-bold">Obra Social</p>
                                  <p className="text-sm font-bold text-slate-700">{profile.obraSocial}</p>
                              </div>
                          </div>
                      )}
                      {profile.cuit && (
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0"><Hash className="w-4 h-4"/></div>
                              <div>
                                  <p className="text-xs text-slate-400 font-bold">CUIT / CUIL</p>
                                  <p className="text-sm font-bold text-slate-700 font-mono">{profile.cuit}</p>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
              )}

              {profile.nextTurn && (
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm shrink-0">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Turno Relacionado</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-slate-800 text-sm flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400"/> {profile.nextTurn.time}hs</p>
                          <StatusBadge status={profile.nextTurn.status} />
                      </div>
                      <p className="text-xs text-slate-500 font-medium mb-1"><Calendar className="w-3 h-3 inline mr-1"/> {formatDateToLocale(profile.nextTurn.date)}</p>
                      <p className="text-xs text-slate-500 font-medium"><Activity className="w-3 h-3 inline mr-1"/> Canal: {profile.nextTurn.type}</p>
                      {profile.nextTurn.motivoConsulta && (
                          <p className="text-xs text-slate-500 font-medium mt-1 pt-1 border-t border-slate-200"><FileText className="w-3 h-3 inline mr-1"/> Motivo: {profile.nextTurn.motivoConsulta}</p>
                      )}
                  </div>
              </div>
              )}
          </div>
      </div>
  </div>
);

export default PatientProfileModal;
