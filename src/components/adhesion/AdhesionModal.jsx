import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft, Printer, Building2, Stethoscope, ArrowRight, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { generateTransactionId } from '../../utils/ids';
import { formatCuil } from '../../utils/cuil';
import { todayISO } from '../../pages/clinic/clinicDates';
import DoctorAdhesionSteps from './DoctorAdhesionSteps';
import InstitutionAdhesionSteps from './InstitutionAdhesionSteps';
import AdhesionReceipt from './AdhesionReceipt';
import AnimatedStepper from '../AnimatedStepper';
import {
  EMPTY_DOCTOR, EMPTY_INSTITUTION, DOCTOR_STEPS, INSTITUTION_STEPS, INSTITUTION_KINDS,
  buildDoctorPayload, buildInstitutionPayload,
} from './adhesionForms';

// Los dos caminos de la solicitud. `bullets` resume lo que se pide en cada uno.
const PATHS = {
  institution: {
    label: 'Institución',
    title: 'Adherir institución',
    description: 'Clínicas y hospitales que quieren gestionar sus médicos, secretarias y turnos en SAMSA.',
    bullets: ['Datos legales: razón social, REFES y CUIT', 'Contacto, obras sociales y estudios', 'Persona que administrará la cuenta'],
    Icon: Building2,
    accent: 'from-indigo-500/20 to-purple-500/10 text-indigo-300 border-indigo-500/30',
    steps: INSTITUTION_STEPS,
    empty: EMPTY_INSTITUTION,
  },
  doctor: {
    label: 'Médico particular',
    title: 'Adherir médico particular',
    description: 'Profesionales con consultorio propio que no dependen de una clínica u hospital.',
    bullets: ['Datos personales y CUIT/CUIL', 'Especialidad, matrícula y consultorio', 'Horario, obras sociales y documentación'],
    Icon: Stethoscope,
    accent: 'from-blue-500/20 to-cyan-500/10 text-blue-300 border-blue-500/30',
    steps: DOCTOR_STEPS,
    empty: EMPTY_DOCTOR,
  },
};

const PATH_ORDER = ['institution', 'doctor'];

// Datos que se muestran en el comprobante impreso.
const receiptFor = (path, form) => {
  if (path === 'doctor') {
    const name = `${form.firstName.trim()} ${form.lastName.trim()}`;
    return {
      greeting: form.firstName.trim(),
      subject: `el/la profesional ${name}`,
      email: form.email.trim(),
      rows: [
        ['Nombre completo', name],
        ['CUIT / CUIL', formatCuil(form.cuit)],
        ['Especialidad', form.specialty],
        ['Matrícula', form.licenseNumber.trim()],
        ['Correo electrónico', form.email.trim()],
        ['Teléfono', form.phone.trim()],
      ],
    };
  }
  const kind = INSTITUTION_KINDS[form.kind];
  return {
    greeting: form.name.trim(),
    subject: `la institución ${form.name.trim()} (${kind.label.toLowerCase()})`,
    email: form.email.trim(),
    rows: [
      [kind.label, form.name.trim()],
      ['Razón social', form.legalName.trim()],
      ['CUIT', form.cuit],
      ['Código REFES', form.refes],
      ['Correo de contacto', form.email.trim()],
      ['Administrador', `${form.adminName.trim()} (${form.adminEmail.trim()})`],
    ],
  };
};

// Solicitud de adhesión de la Home (sin sesión). Primero se elige el camino: institución o
// médico particular; cada uno pide los mismos datos que el admin SAMSA carga al asociarlos.
// Se monta solo mientras está abierto, así cada apertura arranca vacía.
const AdhesionModal = ({ onClose }) => {
  const titleId = useId();
  const bodyRef = useRef(null);
  const today = todayISO();
  const [path, setPath] = useState(null);           // null = pantalla de elección
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [forms, setForms] = useState({ doctor: EMPTY_DOCTOR, institution: EMPTY_INSTITUTION });
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);         // hay datos cargados que se perderían al salir
  const [confirmExit, setConfirmExit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(null);      // { receiptNumber, ...receiptFor }

  const config = path && PATHS[path];
  const form = path && forms[path];
  const totalSteps = config?.steps.length ?? 0;
  const isLastStep = step === totalSteps;
  const progress = path ? (step / totalSteps) * 100 : 0;

  // Bloquea el scroll de fondo mientras el modal está montado.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  // Al imprimir el comprobante se oculta la app y solo queda el certificado.
  useEffect(() => {
    if (!success) return undefined;
    document.body.classList.add('hide-root-for-print');
    return () => document.body.classList.remove('hide-root-for-print');
  }, [success]);

  const requestClose = () => {
    if (dirty && !success) setConfirmExit(true);
    else onClose();
  };

  // Escape: cierra la ventana de salida o pide salir. Va en `window` para que la ventana de
  // Términos (que escucha en `document` y frena la propagación) se cierre primero sola.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (confirmExit) setConfirmExit(false);
      else if (dirty && !success) setConfirmExit(true);
      else onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmExit, dirty, success, onClose]);

  const scrollBodyTop = () => bodyRef.current?.scrollTo({ top: 0 });

  // Cambia un dato del camino actual y limpia su error (o los de `errorKeys`).
  const update = (field, value, errorKeys = field) => {
    setForms((prev) => ({ ...prev, [path]: { ...prev[path], [field]: value } }));
    setDirty(true);
    setSubmitError('');
    const keys = Array.isArray(errorKeys) ? errorKeys : [errorKeys];
    setErrors((prev) => {
      if (!keys.some((key) => prev[key])) return prev;
      const next = { ...prev };
      keys.forEach((key) => delete next[key]);
      return next;
    });
  };
  const setFieldError = (field, message) => setErrors((prev) => ({ ...prev, [field]: message }));

  const choosePath = (next) => {
    setPath(next);
    setStep(1);
    setDirection(1);
    setErrors({});
    scrollBodyTop();
  };

  // Lleva la vista al primer campo con error (o al primer mensaje, si no es un campo).
  const focusFirstError = () => requestAnimationFrame(() => {
    const body = bodyRef.current;
    const target = body?.querySelector('[aria-invalid="true"]') ?? body?.querySelector('[role="alert"]');
    if (!target) return;
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (target.matches('input, select, textarea, button')) target.focus({ preventScroll: true });
  });

  const submit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const payload = path === 'doctor' ? await buildDoctorPayload(form) : buildInstitutionPayload(form);
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      // En `npm run dev` no existe /api (responde 404): se toma como enviado para poder probar el flujo.
      if (!response.ok && !(import.meta.env.DEV && response.status === 404)) throw new Error(`HTTP ${response.status}`);
      setSuccess({ receiptNumber: generateTransactionId(), ...receiptFor(path, form) });
    } catch {
      setSubmitError('No pudimos enviar la solicitud. Revisá tu conexión e intentá de nuevo en unos minutos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = () => {
    const found = config.steps[step - 1].validate(form, today);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstError();
      return;
    }
    if (isLastStep) {
      submit();
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
    scrollBodyTop();
  };

  const goBack = () => {
    setErrors({});
    setSubmitError('');
    setDirection(-1);
    if (step === 1) setPath(null);
    else setStep((s) => s - 1);
    scrollBodyTop();
  };

  if (success) {
    return createPortal(
      <>
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B1120] p-4 sm:p-6 overflow-y-auto animate-circle-reveal print:hidden">
          <div className="max-w-xl w-full text-center flex flex-col items-center relative z-10 py-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 sm:mb-8 shadow-[0_0_40px_rgba(16,185,129,0.4)] opacity-0 animate-scale-in-bounce" style={{ animationFillMode: 'both' }}>
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" viewBox="0 0 52 52" aria-hidden="true">
                <path fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="48" strokeDashoffset="48" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8" style={{ animation: 'check-draw 0.4s ease-out 0.4s forwards' }} />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-white font-serif mb-5 opacity-0 animate-fade-in-up tracking-tight" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              Solicitud enviada
            </h2>
            <p className="text-lg sm:text-xl text-slate-200 mb-2 opacity-0 animate-fade-in-up font-light break-words max-w-full" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              Todo listo, <span className="font-bold text-white">{success.greeting}</span>.
            </p>
            <p className="text-slate-400 text-sm sm:text-base mb-10 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              Nuestro equipo evaluará la solicitud en 48 a 72 horas hábiles y te contactará a <strong className="text-slate-300 whitespace-nowrap [overflow-wrap:anywhere] sm:whitespace-normal">{success.email}</strong>.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
              <button type="button" onClick={() => window.print()} className="w-full sm:w-auto justify-center bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-colors text-base sm:text-lg shadow-lg shadow-emerald-500/20">
                <Printer className="w-5 h-5 sm:w-6 sm:h-6" /> Imprimir comprobante
              </button>
              <button type="button" onClick={onClose} className="w-full sm:w-auto justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 px-8 py-4 rounded-xl font-bold transition-colors text-base sm:text-lg">
                Volver al inicio
              </button>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-10 opacity-0 animate-fade-in-up font-mono" style={{ animationDelay: '900ms', animationFillMode: 'both' }}>
              Comprobante N° {success.receiptNumber}
            </p>
          </div>
        </div>
        <AdhesionReceipt receiptNumber={success.receiptNumber} subject={success.subject} rows={success.rows} />
      </>,
      document.body,
    );
  }

  const Steps = path === 'doctor' ? DoctorAdhesionSteps : InstitutionAdhesionSteps;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-0 sm:p-6 animate-in fade-in duration-300 motion-reduce:animate-none"
      onMouseDown={(e) => { if (e.target === e.currentTarget) requestClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-3xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300 motion-reduce:animate-none"
      >
        {/* Cabecera */}
        <div className="flex justify-between items-start gap-4 p-5 sm:p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
              <h2 id={titleId} className="text-xl sm:text-2xl font-black text-white">Solicitud de Adhesión</h2>
              {path && (
                <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap">
                  {config.label} · Paso {step} de {totalSteps}
                </span>
              )}
            </div>
            <p key={`${path}-${step}`} className="text-blue-400 font-bold text-sm animate-in fade-in duration-500 motion-reduce:animate-none">
              {path ? config.steps[step - 1].message : '¿Qué querés adherir a SAMSA?'}
            </p>
          </div>
          <button type="button" onClick={requestClose} aria-label="Cerrar solicitud" className="p-2 shrink-0 bg-slate-800 text-slate-400 rounded-full hover:text-white hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progreso */}
        <div className="h-1.5 bg-slate-800 w-full relative overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${progress}%` }} />
        </div>

        {/* Contenido */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar p-5 sm:p-8">
          {!path ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300 motion-reduce:animate-none">
              {PATH_ORDER.map((key, index) => {
                const option = PATHS[key];
                const { Icon } = option;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => choosePath(key)}
                    className="group text-left bg-slate-950/60 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col transition-all duration-300 hover:border-blue-500/60 hover:bg-slate-950 hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_rgba(37,99,235,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both motion-reduce:animate-none"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <span className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br border flex items-center justify-center mb-4 sm:mb-5 ${option.accent}`}>
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </span>
                    <span className="text-white font-bold text-lg sm:text-xl mb-1.5">{option.title}</span>
                    <span className="text-slate-400 text-sm leading-relaxed mb-4">{option.description}</span>
                    <ul className="space-y-1.5 mb-5 text-sm text-slate-300">
                      {option.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-auto inline-flex items-center gap-2 text-blue-400 font-bold text-sm group-hover:text-blue-300">
                      Comenzar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <AnimatedStepper steps={config.steps.map((s) => s.short)} currentStep={step} direction={direction}>
              <Steps step={step} form={form} errors={errors} update={update} setFieldError={setFieldError} today={today} />
            </AnimatedStepper>
          )}
        </div>

        {/* Pie con navegación */}
        {path && (
          <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/50 space-y-3">
            {submitError && (
              <p role="alert" className="flex items-start gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5 animate-in fade-in duration-300">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {submitError}
              </p>
            )}
            <div className="flex justify-between gap-3">
              <button type="button" onClick={goBack} disabled={isSubmitting} className="shrink-0 min-h-[48px] px-4 sm:px-6 py-3 rounded-xl font-bold whitespace-nowrap flex items-center justify-center gap-2 transition-colors bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                <ChevronLeft className="w-4 h-4" /> {step === 1 ? 'Cambiar tipo' : 'Anterior'}
              </button>
              {isLastStep ? (
                <button type="button" onClick={goNext} disabled={isSubmitting} className="flex-1 sm:flex-none min-h-[48px] px-5 sm:px-8 py-3 whitespace-nowrap bg-blue-600 text-white hover:bg-blue-500 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50 transition-all disabled:opacity-70 disabled:cursor-wait focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <>Enviar solicitud <Send className="w-4 h-4" /></>}
                </button>
              ) : (
                <button type="button" onClick={goNext} className="flex-1 sm:flex-none min-h-[48px] px-5 sm:px-6 py-3 whitespace-nowrap bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Ventana de salida: avisa antes de perder lo cargado */}
        {confirmExit && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 motion-reduce:animate-none">
            <div role="alertdialog" aria-modal="true" aria-labelledby={`${titleId}-salir`} className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 id={`${titleId}-salir`} className="text-lg font-bold text-white mb-2">¿Salir sin enviar?</h3>
              <p className="text-sm text-slate-400 mb-6">Los datos que cargaste en la solicitud se van a perder.</p>
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button type="button" autoFocus onClick={() => setConfirmExit(false)} className="flex-1 min-h-[48px] px-4 py-3 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors">Seguir completando</button>
                <button type="button" onClick={onClose} className="flex-1 min-h-[48px] px-4 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-500 transition-colors">Salir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default AdhesionModal;
