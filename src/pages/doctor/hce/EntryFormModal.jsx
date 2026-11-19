import React, { useId, useState } from 'react';
import { BadgeCheck, FilePenLine, FilePlus2 } from 'lucide-react';
import { ENTRY_TYPES, RECORD_SECTIONS, SELECT_OPTIONS, VITAL_SIGNS } from '../../../constants/hce';
import { getProfessionalStamp, validateEntryData } from '../../../services/hceService';
import { formatDateTimeAR } from '../../../utils/dates';
import { SecretaryModalCard, SecretaryModalHeader, SecretaryModalOverlay } from '../../secretary/dashboard/SecretaryModal';
import { EditConfirmModal } from '../../clinic/ClinicModals';
import { errorInputClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './hceUi';

const emptyDataFor = (type) =>
  Object.fromEntries([
    ...ENTRY_TYPES[type].fields.map((f) => [f.name, f.kind === 'vitals' ? {} : '']),
    ['code', ''],
  ]);

// Quita campos vacíos antes de guardar (incluidos los signos vitales sin cargar).
const cleanData = (data) =>
  Object.fromEntries(
    Object.entries(data)
      .map(([k, v]) => [k, v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).filter(([, x]) => String(x ?? '').trim())) : v])
      .filter(([, v]) => (v && typeof v === 'object' ? Object.keys(v).length > 0 : String(v ?? '').trim()))
  );

// Formulario de registro clínico. Con `original` es una enmienda: el tipo queda fijo, los datos
// arrancan con los del original y el motivo es obligatorio. Antes de firmar pide confirmación
// (ventana naranja del sistema); al guardar, la página muestra la ventana verde de salida.
const EntryFormModal = ({ patient, user, original, initialType = 'evolution', onSubmit, onDone, onClose }) => {
  const fieldId = useId();
  const titleId = `${fieldId}-titulo`;
  const isAmend = Boolean(original);
  const [type, setType] = useState(original?.type ?? initialType);
  const [data, setData] = useState(() => (original ? { ...emptyDataFor(original.type), ...structuredClone(original.data) } : emptyDataFor(initialType)));
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const config = ENTRY_TYPES[type];
  const stamp = getProfessionalStamp(user);

  const changeType = (next) => { setType(next); setData(emptyDataFor(next)); setErrors({}); };
  const setField = (name, value) => {
    setData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };
  const setVital = (fieldName, key, value) => {
    setData((prev) => ({ ...prev, [fieldName]: { ...prev[fieldName], [key]: value } }));
    if (errors[fieldName]?.[key]) setErrors((prev) => ({ ...prev, [fieldName]: { ...prev[fieldName], [key]: undefined } }));
  };

  const handleReview = (e) => {
    e.preventDefault();
    const nextErrors = validateEntryData(type, data);
    if (isAmend && !reason.trim()) nextErrors.reason = 'El motivo de la enmienda es obligatorio.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitError('');
    setConfirming(true);
  };

  const handleSign = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSubmit({ type, data: cleanData(data), reason: reason.trim() });
      onDone(isAmend);
    } catch (err) {
      setErrors(err.fields ?? {});
      setSubmitError(err.message || 'No pudimos guardar el registro.');
      setConfirming(false);
      setSaving(false);
    }
  };

  const errorText = (id, message) => message && <p id={id} className="mt-1 ml-1 text-xs font-semibold text-red-600">{message}</p>;

  const renderVitals = (field) => {
    const fieldErrors = errors[field.name] ?? {};
    return (
      <fieldset key={field.name} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
        <legend className="px-1 text-sm font-bold text-gray-700">{field.label} <span className="font-medium text-gray-400">(opcional)</span></legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {VITAL_SIGNS.map((v) => {
            const id = `${fieldId}-${field.name}-${v.key}`;
            const error = fieldErrors[v.key];
            return (
              <div key={v.key}>
                <label htmlFor={id} className="text-xs font-bold text-gray-600 mb-1 ml-1 block" title={v.label}>
                  {v.short} <span className="font-medium text-gray-400">({v.unit})</span>
                </label>
                <input
                  id={id}
                  inputMode={v.key === 'bp' ? 'text' : 'decimal'}
                  value={data[field.name]?.[v.key] ?? ''}
                  onChange={(e) => setVital(field.name, v.key, e.target.value)}
                  placeholder={v.placeholder}
                  aria-label={`${v.label} en ${v.unit}`}
                  aria-invalid={Boolean(error) || undefined}
                  aria-describedby={error ? `${id}-error` : undefined}
                  className={`${inputClass} py-2.5 font-mono bg-white ${error ? errorInputClass : ''}`}
                />
                {errorText(`${id}-error`, error)}
              </div>
            );
          })}
        </div>
      </fieldset>
    );
  };

  const renderField = (field) => {
    if (field.kind === 'vitals') return renderVitals(field);
    const id = `${fieldId}-${field.name}`;
    const error = errors[field.name];
    const common = {
      id,
      value: data[field.name] ?? '',
      onChange: (e) => setField(field.name, e.target.value),
      'aria-invalid': Boolean(error) || undefined,
      'aria-describedby': error ? `${id}-error` : undefined,
      className: `${inputClass} ${error ? errorInputClass : ''}`,
    };
    const isCoded = config.codedField === field.name;
    return (
      <div key={field.name} className={field.soap ? 'flex gap-3' : ''}>
        {field.soap && (
          <span aria-hidden="true" className="mt-7 w-7 h-7 shrink-0 rounded-lg bg-blue-600 text-white text-sm font-black flex items-center justify-center">{field.soap}</span>
        )}
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className={labelClass}>
            {field.label}{field.hint && <span className="font-medium text-gray-400"> · {field.hint}</span>}
            {field.required && <span className="text-red-500" aria-hidden="true"> *</span>}
          </label>
          {field.kind === 'textarea' && <textarea {...common} rows={3} placeholder={field.placeholder} className={`${common.className} resize-y min-h-[96px]`} />}
          {field.kind === 'text' && <input {...common} type="text" placeholder={field.placeholder} />}
          {field.kind === 'select' && (
            <select {...common}>
              <option value="">Elegí una opción</option>
              {SELECT_OPTIONS[field.options].map((o) => <option key={o.value} value={o.value}>{o.label}{o.hint ? ` (${o.hint})` : ''}</option>)}
            </select>
          )}
          {errorText(`${id}-error`, error)}
          {isCoded && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label htmlFor={`${fieldId}-code`} className="text-xs font-bold text-gray-500">Código CIE-10 (opcional)</label>
              <input
                id={`${fieldId}-code`}
                type="text"
                value={data.code ?? ''}
                onChange={(e) => setField('code', e.target.value.toUpperCase())}
                placeholder="Ej: I10"
                maxLength={6}
                aria-invalid={Boolean(errors.code) || undefined}
                aria-describedby={errors.code ? `${fieldId}-code-error` : undefined}
                className={`${inputClass} py-2 w-28 font-mono ${errors.code ? errorInputClass : ''}`}
              />
              {errorText(`${fieldId}-code-error`, errors.code)}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <SecretaryModalOverlay onClose={saving ? () => {} : onClose} labelledBy={titleId}>
        <SecretaryModalCard maxWidth="max-w-2xl">
          <SecretaryModalHeader
            icon={isAmend ? FilePenLine : FilePlus2}
            tone={isAmend ? 'amber' : 'blue'}
            titleId={titleId}
            title={isAmend ? `Enmendar: ${config.label.toLowerCase()}` : 'Nuevo registro clínico'}
            subtitle={`${patient.name} · ${patient.historyId}`}
            onClose={onClose}
          />
          <form onSubmit={handleReview} noValidate>
            <div className="p-5 sm:p-8 space-y-5 max-h-[65vh] overflow-y-auto">
              {submitError && <p role="alert" className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-700">{submitError}</p>}

              {isAmend ? (
                <>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-amber-900">
                    El registro original del <strong>{formatDateTimeAR(original.createdAt)}</strong> queda visible y marcado como enmendado.
                    La corrección se agrega como un registro nuevo, firmado por vos.
                  </div>
                  <div>
                    <label htmlFor={`${fieldId}-motivo`} className={labelClass}>Motivo de la enmienda<span className="text-red-500" aria-hidden="true"> *</span></label>
                    <textarea
                      id={`${fieldId}-motivo`}
                      value={reason}
                      onChange={(e) => { setReason(e.target.value); if (errors.reason) setErrors((p) => ({ ...p, reason: undefined })); }}
                      rows={2}
                      placeholder="Ej: Error en la posología consignada."
                      aria-invalid={Boolean(errors.reason) || undefined}
                      aria-describedby={errors.reason ? `${fieldId}-motivo-error` : undefined}
                      className={`${inputClass} resize-y ${errors.reason ? errorInputClass : ''}`}
                    />
                    {errorText(`${fieldId}-motivo-error`, errors.reason)}
                  </div>
                </>
              ) : (
                <div>
                  <label htmlFor={`${fieldId}-tipo`} className={labelClass}>Tipo de registro</label>
                  <select id={`${fieldId}-tipo`} value={type} onChange={(e) => changeType(e.target.value)} className={inputClass}>
                    {RECORD_SECTIONS.filter((s) => s.value !== 'all').map((section) => (
                      <optgroup key={section.value} label={section.label}>
                        {Object.entries(ENTRY_TYPES).filter(([, t]) => t.section === section.value).map(([value, t]) => (
                          <option key={value} value={value}>{t.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              )}

              {config.fields.map(renderField)}

              <p className="flex items-start gap-2 rounded-xl bg-emerald-50/60 border border-emerald-100 px-3 py-2 text-xs text-emerald-900">
                <BadgeCheck className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>Se firma como <strong>{stamp.name}</strong> · {stamp.license} · {stamp.specialty}, con fecha y hora del momento de guardar.</span>
              </p>
            </div>
            <div className="px-5 py-4 sm:px-8 sm:py-5 border-t border-gray-100 bg-gray-50/60 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button type="button" onClick={onClose} className={secondaryButtonClass}>Cancelar</button>
              <button type="submit" className={primaryButtonClass}>
                <BadgeCheck className="w-5 h-5" aria-hidden="true" /> Firmar y guardar
              </button>
            </div>
          </form>
        </SecretaryModalCard>
      </SecretaryModalOverlay>

      <EditConfirmModal
        isOpen={confirming}
        title={isAmend ? '¿Firmar la enmienda?' : '¿Firmar y guardar el registro?'}
        message={`${config.label} de ${patient.name}. Una vez firmado no se puede modificar ni borrar: si hay un error, solo podrás enmendarlo.`}
        confirmLabel={saving ? 'Firmando...' : 'Sí, Firmar'}
        onCancel={() => { if (!saving) setConfirming(false); }}
        onConfirm={handleSign}
      />
    </>
  );
};

export default EntryFormModal;
