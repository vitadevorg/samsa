import React from 'react';
import { useCatalog } from '../../context/catalog-context';
import { formatCuil, dniFromCuil, formatDni } from '../../utils/cuil';
import { addYearsISO, MAX_EXPIRY_YEARS } from '../../pages/clinic/clinicValidation';
import CheckboxDropdown from '../CheckboxDropdown';
import TermsCheckbox from '../TermsCheckbox';
import { DOCTOR_FILES, DOCTOR_STEPS, validateFile, licenseDigits } from './adhesionForms';
import { Field, StepTitle, DaysPicker, FileDrop, ErrorText } from './AdhesionFields';
import { labelClass } from './adhesionStyles';

// Pasos de la solicitud del médico particular. `update(campo, valor)` cambia un dato y limpia su error.
const DoctorAdhesionSteps = ({ step, form, errors, update, setFieldError, today }) => {
  const { specialties, insurances } = useCatalog();
  const dni = dniFromCuil(form.cuit);
  const title = <StepTitle number={step}>{DOCTOR_STEPS[step - 1].title}</StepTitle>;

  if (step === 1) {
    return (
      <>
        {title}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <Field label="Nombres" error={errors.firstName}>
            {(props) => <input {...props} type="text" autoComplete="given-name" maxLength={40} value={form.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="Ej. Juan Martín" />}
          </Field>
          <Field label="Apellidos" error={errors.lastName}>
            {(props) => <input {...props} type="text" autoComplete="family-name" maxLength={40} value={form.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Ej. Pérez" />}
          </Field>
          <Field label="CUIT / CUIL" error={errors.cuit} hint={dni ? `DNI: ${formatDni(dni)}` : 'Tu DNI se obtiene automáticamente del CUIL.'} className="sm:col-span-2">
            {(props) => <input {...props} type="text" inputMode="numeric" maxLength={13} value={form.cuit} onChange={(e) => update('cuit', formatCuil(e.target.value))} placeholder="Ej. 20-12345678-6" />}
          </Field>
          <Field label="Correo electrónico" error={errors.email} hint="Va a ser tu usuario si te aprueban.">
            {(props) => <input {...props} type="email" autoComplete="email" maxLength={80} value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="tu@email.com" />}
          </Field>
          <Field label="Teléfono celular" error={errors.phone}>
            {(props) => <input {...props} type="tel" inputMode="tel" autoComplete="tel" maxLength={20} value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="Ej. 381 400-1001" />}
          </Field>
        </div>
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        {title}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <Field label="Especialidad principal" error={errors.specialty}>
            {(props) => (
              <select {...props} className={`${props.className} cursor-pointer`} value={form.specialty} onChange={(e) => update('specialty', e.target.value)}>
                <option value="" className="bg-slate-900 text-slate-400">Seleccioná una especialidad</option>
                {specialties.map((s) => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
              </select>
            )}
          </Field>
          <Field label="Número de matrícula" error={errors.licenseNumber} hint="Provincial o nacional, solo números.">
            {(props) => <input {...props} type="text" inputMode="numeric" pattern="[0-9]*" maxLength={10} value={form.licenseNumber} onChange={(e) => update('licenseNumber', licenseDigits(e.target.value))} placeholder="Ej. 12345" />}
          </Field>
          <Field label="Dirección del consultorio" error={errors.address} className="sm:col-span-2">
            {(props) => <input {...props} type="text" autoComplete="street-address" maxLength={100} value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Ej. Av. Sarmiento 450, San Miguel de Tucumán" />}
          </Field>
        </div>
      </>
    );
  }

  if (step === 3) {
    return (
      <>
        {title}
        <div className="space-y-5">
          <DaysPicker value={form.days} onChange={(days) => update('days', days, 'schedule')} hasError={Boolean(errors.schedule)} />
          <div className="grid grid-cols-2 gap-4 sm:max-w-sm">
            <Field label="Desde">
              {(props) => <input {...props} className={`${props.className} ${errors.schedule ? '!border-red-500' : ''}`} type="time" value={form.startTime} onChange={(e) => update('startTime', e.target.value, 'schedule')} />}
            </Field>
            <Field label="Hasta">
              {(props) => <input {...props} className={`${props.className} ${errors.schedule ? '!border-red-500' : ''}`} type="time" value={form.endTime} onChange={(e) => update('endTime', e.target.value, 'schedule')} />}
            </Field>
          </div>
          <ErrorText>{errors.schedule}</ErrorText>
          <CheckboxDropdown
            dark
            labelClass={labelClass}
            label="Obras sociales que aceptás (opcional)"
            options={insurances}
            selected={form.insurances}
            onChange={(value) => update('insurances', value)}
            placeholder="Solo particular (sin obras sociales)"
          />
        </div>
      </>
    );
  }

  return (
    <>
      {title}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCTOR_FILES.map((spec) => (
          <div key={spec.key} className="space-y-3 min-w-0">
            <FileDrop
              spec={spec}
              file={form.files[spec.key]}
              error={errors[spec.key]}
              onSelect={(file) => {
                const message = validateFile(file, spec);
                if (message) setFieldError(spec.key, message);
                else update('files', { ...form.files, [spec.key]: file }, [spec.key, 'files']);
              }}
              onRemove={() => update('files', { ...form.files, [spec.key]: null }, [spec.key, 'files'])}
            />
            {spec.expires && form.files[spec.key] && (
              <Field label={spec.label === 'Matrícula' ? 'Vencimiento de la matrícula' : 'Vencimiento del seguro'} error={errors[`${spec.key}Expiry`]}>
                {(props) => (
                  <input
                    {...props}
                    type="date"
                    min={today}
                    max={addYearsISO(today, MAX_EXPIRY_YEARS)}
                    value={form.expiry[spec.key]}
                    onChange={(e) => update('expiry', { ...form.expiry, [spec.key]: e.target.value }, `${spec.key}Expiry`)}
                  />
                )}
              </Field>
            )}
          </div>
        ))}
      </div>
      <ErrorText>{errors.files}</ErrorText>
      <p className="text-xs text-slate-500 mt-4">Todos los archivos son obligatorios. El contrato se firma cuando se aprueba la solicitud.</p>
      <div className="mt-5 space-y-1">
        <TermsCheckbox doc="profesional" dark checked={form.acceptedTerms} onChange={(value) => update('acceptedTerms', value)} />
        <ErrorText>{errors.acceptedTerms}</ErrorText>
      </div>
    </>
  );
};

export default DoctorAdhesionSteps;
