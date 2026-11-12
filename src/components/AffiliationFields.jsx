import React, { useId } from 'react';
import { Hash, ClipboardList, UserCheck, Users, User, FileText, AlertTriangle } from 'lucide-react';
import { HOLDER_TYPES, requiresAffiliation, validateAffiliation } from '../utils/insuranceValidation';

const inputClass = (hasError, disabled) =>
  `w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition ${
    disabled
      ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
      : hasError
        ? 'bg-slate-50 border-red-300 ring-1 ring-red-100 focus:bg-white'
        : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500'
  }`;

const FieldError = ({ id, message }) =>
  message ? (
    <p id={id} className="text-red-500 text-xs mt-1 ml-1 flex items-start gap-1">
      <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /> {message}
    </p>
  ) : null;

const Field = ({ id, label, icon: Icon, error, children }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="text-sm font-bold text-gray-700 ml-1">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-3.5 text-gray-400 w-4 h-4 pointer-events-none" />
      {children}
    </div>
    <FieldError id={`${id}-error`} message={error} />
  </div>
);

const onlyDigits = (value) => value.replace(/\D/g, '');

/**
 * Campos de afiliación a obra social: número de afiliado, plan y si la persona
 * es titular o adherente (en ese caso, nombre y DNI del titular).
 * Solo se muestran si la obra social elegida requiere afiliación.
 *
 * - `value`: { affiliateNumber, plan, holderType, holderName, holderDni }
 * - `onChange(campo, valor)`
 * - `errors`: errores calculados al enviar el formulario (incluyen campos vacíos).
 *   Mientras se tipea, el formato inválido se avisa igual aunque no se haya enviado.
 */
const AffiliationFields = ({ insurance, value, onChange, errors = {}, patientDni, disabled = false }) => {
  const id = useId();
  if (!requiresAffiliation(insurance)) return null;

  const liveErrors = disabled
    ? {}
    : validateAffiliation({ insurance, ...value, patientDni }, { requireFilled: false });
  const errorFor = (field) => errors[field] || liveErrors[field];
  const isAdherente = value.holderType === HOLDER_TYPES.ADHERENTE;

  const holderOptions = [
    { type: HOLDER_TYPES.TITULAR, label: 'Soy el titular', icon: UserCheck },
    { type: HOLDER_TYPES.ADHERENTE, label: 'Soy adherente (familiar)', icon: Users },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5">
      <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Datos de afiliación · {insurance}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id={`${id}-affiliate`} label="Nº de afiliado *" icon={Hash} error={errorFor('affiliateNumber')}>
          <input
            id={`${id}-affiliate`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Solo números"
            value={value.affiliateNumber}
            disabled={disabled}
            aria-invalid={Boolean(errorFor('affiliateNumber'))}
            aria-describedby={`${id}-affiliate-error`}
            onChange={(e) => onChange('affiliateNumber', onlyDigits(e.target.value))}
            className={inputClass(errorFor('affiliateNumber'), disabled)}
          />
        </Field>
        <Field id={`${id}-plan`} label="Plan (opcional)" icon={ClipboardList}>
          <input
            id={`${id}-plan`}
            type="text"
            placeholder="Ej: 210"
            value={value.plan}
            disabled={disabled}
            onChange={(e) => onChange('plan', e.target.value)}
            className={inputClass(false, disabled)}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="text-sm font-bold text-gray-700 ml-1 mb-2">¿Sos el titular de la obra social?</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {holderOptions.map(({ type, label, icon: Icon }) => {
            const selected = value.holderType === type;
            return (
              <label
                key={type}
                className={`flex items-center gap-3 p-3 min-h-[48px] rounded-xl border transition ${
                  disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                } ${selected ? 'border-blue-500 bg-white ring-2 ring-blue-100' : 'border-slate-200 bg-white/70 hover:border-blue-300'}`}
              >
                <input
                  type="radio"
                  name={`${id}-holder`}
                  value={type}
                  checked={selected}
                  disabled={disabled}
                  onChange={() => onChange('holderType', type)}
                  className="sr-only"
                />
                <Icon className={`w-5 h-5 shrink-0 ${selected ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`text-sm font-semibold ${selected ? 'text-slate-900' : 'text-slate-600'}`}>{label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {isAdherente && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
          <Field id={`${id}-holder-name`} label="Nombre del titular *" icon={User} error={errorFor('holderName')}>
            <input
              id={`${id}-holder-name`}
              type="text"
              placeholder="Nombre y apellido"
              value={value.holderName}
              disabled={disabled}
              aria-invalid={Boolean(errorFor('holderName'))}
              aria-describedby={`${id}-holder-name-error`}
              onChange={(e) => onChange('holderName', e.target.value)}
              className={inputClass(errorFor('holderName'), disabled)}
            />
          </Field>
          <Field id={`${id}-holder-dni`} label="DNI del titular *" icon={FileText} error={errorFor('holderDni')}>
            <input
              id={`${id}-holder-dni`}
              type="text"
              inputMode="numeric"
              placeholder="Sin puntos"
              maxLength={8}
              value={value.holderDni}
              disabled={disabled}
              aria-invalid={Boolean(errorFor('holderDni'))}
              aria-describedby={`${id}-holder-dni-error`}
              onChange={(e) => onChange('holderDni', onlyDigits(e.target.value))}
              className={inputClass(errorFor('holderDni'), disabled)}
            />
          </Field>
        </div>
      )}
    </div>
  );
};

export default AffiliationFields;
