import React from 'react';
import { Building2, Hospital } from 'lucide-react';
import { useCatalog } from '../../context/catalog-context';
import { formatCuil } from '../../utils/cuil';
import { refesDigits } from '../../pages/clinic/clinicValidation';
import CheckboxDropdown from '../CheckboxDropdown';
import TermsCheckbox from '../TermsCheckbox';
import { INSTITUTION_KINDS, INSTITUTION_STEPS } from './adhesionForms';
import { Field, StepTitle, SegmentedChoice, CheckField, ErrorText } from './AdhesionFields';
import { labelClass } from './adhesionStyles';

const KIND_OPTIONS = [
  { value: 'clinic', label: 'Clínica', Icon: Building2 },
  { value: 'hospital', label: 'Hospital', Icon: Hospital },
];

// Pasos de la solicitud de una clínica u hospital. Mismos datos que el alta del admin SAMSA.
const InstitutionAdhesionSteps = ({ step, form, errors, update }) => {
  const { insurances, studyGroups } = useCatalog();
  const kind = INSTITUTION_KINDS[form.kind];
  const title = <StepTitle number={step}>{INSTITUTION_STEPS[step - 1].title}</StepTitle>;

  if (step === 1) {
    return (
      <>
        {title}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="sm:col-span-2">
            <SegmentedChoice
              label="Tipo de institución"
              options={KIND_OPTIONS}
              value={form.kind}
              // Los hospitales no trabajan con obras sociales: se limpian al cambiar.
              onChange={(value) => { update('kind', value); if (value === 'hospital') update('insurances', []); }}
            />
          </div>
          <Field label="Nombre" error={errors.name}>
            {(props) => <input {...props} type="text" autoComplete="organization" maxLength={80} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder={form.kind === 'hospital' ? 'Ej. Hospital del Valle' : 'Ej. Clínica del Norte'} />}
          </Field>
          <Field label="Razón social" error={errors.legalName}>
            {(props) => <input {...props} type="text" maxLength={120} value={form.legalName} onChange={(e) => update('legalName', e.target.value)} placeholder="Ej. Clínica del Norte S.A." />}
          </Field>
          <Field label="Código REFES" error={errors.refes} hint="14 dígitos del Registro Federal de Establecimientos de Salud.">
            {(props) => <input {...props} type="text" inputMode="numeric" maxLength={14} value={form.refes} onChange={(e) => update('refes', refesDigits(e.target.value).slice(0, 14))} placeholder="Ej. 10900012345678" />}
          </Field>
          <Field label="CUIT" error={errors.cuit} hint="De persona jurídica: empieza con 30, 33 o 34.">
            {(props) => <input {...props} type="text" inputMode="numeric" maxLength={13} value={form.cuit} onChange={(e) => update('cuit', formatCuil(e.target.value))} placeholder="Ej. 30-12345678-9" />}
          </Field>
          <div className="sm:col-span-2">
            <CheckField checked={form.arcaVerified} onChange={(value) => update('arcaVerified', value)} error={errors.arcaVerified}>
              Declaro que la institución se encuentra inscripta en <span className="font-bold text-white">ARCA</span>.
            </CheckField>
          </div>
        </div>
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        {title}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <Field label="Dirección" error={errors.address} className="sm:col-span-2">
            {(props) => <input {...props} type="text" autoComplete="street-address" maxLength={100} value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Ej. Av. Mate de Luna 1200, San Miguel de Tucumán" />}
          </Field>
          <Field label="Teléfono" error={errors.phone}>
            {(props) => <input {...props} type="tel" inputMode="tel" maxLength={20} value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="Ej. 381 400-1001" />}
          </Field>
          <Field label="Email de contacto" error={errors.email}>
            {(props) => <input {...props} type="email" maxLength={80} value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="contacto@institucion.com" />}
          </Field>
          {form.kind === 'clinic' && (
            <div className="sm:col-span-2">
              <CheckboxDropdown dark labelClass={labelClass} label="Obras sociales que acepta (opcional)" options={insurances} selected={form.insurances} onChange={(value) => update('insurances', value)} placeholder="Solo atención particular" />
            </div>
          )}
          <div className="sm:col-span-2">
            <CheckboxDropdown dark labelClass={labelClass} label="Estudios que se realizan (opcional)" groups={studyGroups} selected={form.studies} onChange={(value) => update('studies', value)} placeholder="Elegí los estudios de la lista" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {title}
      <p className="text-sm text-slate-400 mb-5 -mt-2">Es la persona que va a recibir el acceso para administrar {kind.article} en SAMSA.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <Field label="Nombre y apellido" error={errors.adminName} className="sm:col-span-2">
          {(props) => <input {...props} type="text" autoComplete="name" maxLength={60} value={form.adminName} onChange={(e) => update('adminName', e.target.value)} placeholder="Ej. Laura Gómez" />}
        </Field>
        <Field label="Email (usuario)" error={errors.adminEmail}>
          {(props) => <input {...props} type="email" autoComplete="email" maxLength={80} value={form.adminEmail} onChange={(e) => update('adminEmail', e.target.value)} placeholder="admin@institucion.com" />}
        </Field>
        <Field label="Teléfono (opcional)" error={errors.adminPhone}>
          {(props) => <input {...props} type="tel" inputMode="tel" autoComplete="tel" maxLength={20} value={form.adminPhone} onChange={(e) => update('adminPhone', e.target.value)} placeholder="Ej. 381 400-1001" />}
        </Field>
      </div>
      <div className="mt-6 space-y-1">
        <TermsCheckbox doc="institucion" dark checked={form.acceptedTerms} onChange={(value) => update('acceptedTerms', value)} />
        <ErrorText>{errors.acceptedTerms}</ErrorText>
      </div>
    </>
  );
};

export default InstitutionAdhesionSteps;
