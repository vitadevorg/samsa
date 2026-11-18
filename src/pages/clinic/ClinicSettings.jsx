import React, { useId, useState } from 'react';
import Navbar from '../../components/Navbar';
import PageHeader from '../../components/PageHeader';
import FadeIn from '../../components/FadeIn';
import CheckboxDropdown from '../../components/CheckboxDropdown';
import IconAction from '../vitadev/IconAction';
import { EditConfirmModal, SuccessModal } from './ClinicModals';
import { useClinicData } from './clinicDataContext';
import { useSuccessModal } from '../vitadev/useSuccessModal';
import { validateAddress, validateEmail, validatePhone, errorBorder } from './clinicValidation';
import { useCatalog } from '../../context/catalog-context';
import { Building2, Hospital, Lock, MapPin, Phone, Mail, ClipboardList, Pencil, Save, X } from 'lucide-react';

const contactOf = (institution) => ({
  address: institution?.address ?? '',
  phone: institution?.phone ?? '',
  email: institution?.email ?? '',
});
const offerOf = (institution) => ({ insurances: institution?.insurances ?? [], studies: institution?.studies ?? [] });

// Datos de la institución que administra su propio administrador (clínica u hospital):
// - Contacto: dirección, teléfono y correo (por si se mudan o cambian sus datos).
// - Servicios: obras sociales que acepta (solo clínicas: el hospital es público y no trabaja con
//   obras sociales) y estudios que realiza, con las mismas listas del catálogo que usa VitaDev.
// Cada sección se muestra en modo lectura y se edita solo al tocar su lápiz, para evitar cambios por error.
// Los datos legales (razón social, CUIT, REFES) los registra VitaDev: acá solo se muestran.
const ClinicSettings = () => {
  const fieldId = useId();
  const { clinic, terms, updateInstitution, updateInstitutionOffer } = useClinicData();
  const { insurances: INSURANCES, studyGroups: STUDY_GROUPS } = useCatalog();
  const isHospital = Boolean(clinic?.sectors);

  const [editing, setEditing] = useState(null); // sección en edición: 'contact' | 'offer' | null
  const [contact, setContact] = useState(() => contactOf(clinic));
  const [contactErrors, setContactErrors] = useState({});
  const [offer, setOffer] = useState(() => offerOf(clinic));
  const [confirming, setConfirming] = useState(null); // 'contact' | 'offer' | null
  const { success, showSuccess } = useSuccessModal();

  if (!clinic) {
    return (
      <div className="min-h-screen bg-slate-50 overflow-x-clip">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-10 text-center text-gray-500">
          Tu usuario no tiene una institución asignada.
        </div>
      </div>
    );
  }

  // Abrir una sección parte siempre de los datos guardados (y cierra la otra, sin guardar sus cambios).
  const startEdit = (section) => {
    setContact(contactOf(clinic));
    setContactErrors({});
    setOffer(offerOf(clinic));
    setEditing(section);
  };
  const cancelEdit = () => startEdit(null);

  const updateContact = (field, value) => {
    setContact((prev) => ({ ...prev, [field]: value }));
    setContactErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const cleanContact = () => ({
    address: contact.address.trim().replace(/\s+/g, ' '),
    phone: contact.phone.trim(),
    email: contact.email.trim().toLowerCase(),
  });

  const handleSubmitContact = (e) => {
    e.preventDefault();
    const found = Object.fromEntries(Object.entries({
      address: validateAddress(contact.address),
      phone: validatePhone(contact.phone, { required: true }),
      email: validateEmail(contact.email),
    }).filter(([, message]) => message));
    setContactErrors(found);
    if (Object.keys(found).length === 0) setConfirming('contact');
  };

  const handleSubmitOffer = (e) => {
    e.preventDefault();
    setConfirming('offer');
  };

  const handleConfirm = () => {
    if (confirming === 'contact') {
      updateInstitution(clinic.id, cleanContact());
      showSuccess('¡Datos de contacto guardados!', `Los pacientes y SAMSA verán los nuevos datos de ${clinic.name}.`);
    } else {
      // El hospital no trabaja con obras sociales.
      updateInstitutionOffer(clinic.id, { insurances: isHospital ? [] : offer.insurances, studies: offer.studies });
      showSuccess('¡Servicios actualizados!', isHospital ? 'Los estudios del hospital se actualizaron.' : 'Las obras sociales y los estudios de la clínica se actualizaron.');
    }
    setConfirming(null);
    setEditing(null);
  };

  const InstitutionIcon = isHospital ? Hospital : Building2;
  const placeLabel = isHospital ? 'del hospital' : 'de la clínica';
  const inputClass = 'w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white';
  const labelClass = 'text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block';
  const field = (name, id, label, props = {}) => (
    <div>
      <label htmlFor={`${fieldId}-${id}`} className={labelClass}>{label}</label>
      <input id={`${fieldId}-${id}`} autoComplete="off" aria-invalid={Boolean(contactErrors[name])} aria-describedby={`${fieldId}-${id}-error`} className={`${inputClass} ${errorBorder(contactErrors[name])}`} value={contact[name]} onChange={(e) => updateContact(name, e.target.value)} {...props} />
      {contactErrors[name] && <p id={`${fieldId}-${id}-error`} role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{contactErrors[name]}</p>}
    </div>
  );
  // Encabezado de sección: ícono, título y bajada; a la derecha, el lápiz (solo en modo lectura).
  const sectionHeader = (section, Icon, id, title, text) => (
    <div className="flex items-start gap-3 mb-6">
      <div className={`p-2 rounded-xl shrink-0 ${editing === section ? 'bg-orange-100' : 'bg-blue-100'}`}><Icon className={`w-5 h-5 ${editing === section ? 'text-orange-600' : 'text-blue-700'}`}/></div>
      <div className="flex-1 min-w-0">
        <h2 id={id} className={`text-lg sm:text-xl font-bold ${editing === section ? 'text-orange-600' : 'text-gray-900'}`}>{editing === section ? `Editando ${title.toLowerCase()}` : title}</h2>
        <p className="text-gray-500 text-sm">{text}</p>
      </div>
      {editing !== section && <IconAction icon={Pencil} tone="blue" onClick={() => startEdit(section)} label={`Editar ${title.toLowerCase()}`} />}
    </div>
  );
  // Botones al pie de una sección en edición.
  const editButtons = (label) => (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
      <button type="button" onClick={cancelEdit} className="w-full sm:w-auto py-3 px-6 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition flex justify-center gap-2 items-center"><X className="w-5 h-5"/> Cancelar</button>
      <button type="submit" className="w-full sm:w-auto py-3 px-8 rounded-xl font-bold text-white transition shadow-md flex justify-center gap-2 items-center bg-orange-500 hover:bg-orange-600 shadow-orange-200"><Save className="w-5 h-5"/> {label}</button>
    </div>
  );
  const chips = (items, empty) => (items.length === 0 ? <p className="text-sm text-gray-400">{empty}</p> : (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => <li key={item} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">{item}</li>)}
    </ul>
  ));
  const legalData = [
    ['Razón social', clinic.legalName],
    ['CUIT', clinic.cuit],
    ['Código REFES', clinic.refes],
  ];
  const contactData = [
    [MapPin, 'Dirección', clinic.address],
    [Phone, 'Teléfono', clinic.phone],
    [Mail, 'Correo de contacto', clinic.email],
  ];
  const sectionClass = (section) => `p-5 sm:p-8 transition-colors ${editing === section ? 'bg-orange-50/30' : ''}`;

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-clip">
      <Navbar />
      <EditConfirmModal
        isOpen={confirming !== null}
        title={confirming === 'contact' ? '¿Guardar datos de contacto?' : '¿Guardar servicios?'}
        message={confirming === 'contact'
          ? `La dirección de ${clinic.name} será ${cleanContact().address}, su teléfono ${cleanContact().phone} y su correo ${cleanContact().email}. ¿Confirmar?`
          : `${isHospital ? '' : `${clinic.name} aceptará ${offer.insurances.length} obra(s) social(es) y `}realizará ${offer.studies.length} estudio(s). ${isHospital ? '' : 'Los médicos que diste de alta dejarán de aceptar las obras sociales que quites. '}¿Confirmar?`}
        confirmLabel="Sí, Guardar"
        onCancel={() => setConfirming(null)}
        onConfirm={handleConfirm}
      />
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <PageHeader
          icon={InstitutionIcon}
          eyebrow={`Administración ${terms.fromPlace}`}
          title={`Datos ${placeLabel}`}
        />

        <FadeIn delay={100}><div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {/* Cabecera: nombre y datos legales (los registra VitaDev) */}
          <div className="p-5 sm:p-8 bg-gradient-to-r from-blue-50/60 to-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0"><InstitutionIcon className="w-7 h-7" /></div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl font-bold text-gray-900 break-words">{clinic.name}</p>
                <p className="text-gray-500 text-sm">{isHospital ? 'Hospital' : 'Clínica'}</p>
              </div>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
              {legalData.map(([label, value]) => (
                <div key={label} className="min-w-0 p-3 rounded-xl bg-white border border-gray-100">
                  <dt className="text-xs font-bold text-gray-500 uppercase">{label}</dt>
                  <dd className="text-sm font-semibold text-gray-800 break-words mt-0.5">{value || '—'}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 flex items-start gap-1.5 text-xs text-gray-400"><Lock className="w-3.5 h-3.5 shrink-0 mt-px" /> Los datos legales los registra SAMSA. Si hay un error, contactá a soporte.</p>
          </div>

          {/* Contacto */}
          <section className={sectionClass('contact')} aria-labelledby={`${fieldId}-contacto`}>
            {sectionHeader('contact', MapPin, `${fieldId}-contacto`, 'Contacto', `Dirección, teléfono y correo ${placeLabel}.`)}
            {editing === 'contact' ? (
              <form onSubmit={handleSubmitContact} noValidate className="space-y-5 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    {field('address', 'direccion', 'Dirección', { maxLength: 100, placeholder: 'Ej: Av. Aconquija 1200, Yerba Buena, Tucumán' })}
                  </div>
                  {field('phone', 'telefono', 'Teléfono', { type: 'tel', inputMode: 'tel', maxLength: 20, placeholder: '381 400-0000' })}
                  {field('email', 'correo', 'Correo de contacto', { type: 'email', maxLength: 80, placeholder: 'contacto@institucion.com' })}
                </div>
                {editButtons('Guardar contacto')}
              </form>
            ) : (
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contactData.map(([Icon, label, value], index) => (
                  <div key={label} className={`min-w-0 flex items-start gap-3 ${index === 0 ? 'md:col-span-2' : ''}`}>
                    <Icon className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                    <div className="min-w-0">
                      <dt className="text-xs font-bold text-gray-500 uppercase">{label}</dt>
                      <dd className="text-gray-800 font-medium break-words">{value || '—'}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            )}
          </section>

          {/* Servicios: obras sociales (solo clínica) y estudios */}
          <section className={sectionClass('offer')} aria-labelledby={`${fieldId}-servicios`}>
            {sectionHeader('offer', ClipboardList, `${fieldId}-servicios`, 'Servicios', isHospital ? 'Estudios que se realizan en el hospital.' : 'Obras sociales que acepta la clínica y estudios que se realizan.')}
            {editing === 'offer' ? (
              <form onSubmit={handleSubmitOffer} noValidate className="space-y-5 animate-fadeIn">
                {!isHospital && (
                  <CheckboxDropdown labelClass={labelClass} label="Obras sociales que acepta" options={INSURANCES} selected={offer.insurances} onChange={(value) => setOffer((prev) => ({ ...prev, insurances: value }))} placeholder="Solo atención particular" />
                )}
                <CheckboxDropdown labelClass={labelClass} label="Estudios que se realizan" groups={STUDY_GROUPS} selected={offer.studies} onChange={(value) => setOffer((prev) => ({ ...prev, studies: value }))} placeholder="Elegí los estudios de la lista" />
                {editButtons('Guardar servicios')}
              </form>
            ) : (
              <div className="space-y-5">
                {isHospital ? (
                  <p className="text-sm text-gray-500 bg-slate-50 border border-slate-100 rounded-2xl p-4">El hospital es público: no trabaja con obras sociales.</p>
                ) : (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Obras sociales que acepta ({clinic.insurances?.length ?? 0})</h3>
                    {chips(clinic.insurances ?? [], 'Solo atención particular')}
                  </div>
                )}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Estudios que se realizan ({clinic.studies?.length ?? 0})</h3>
                  {chips(clinic.studies ?? [], 'Sin estudios cargados')}
                </div>
              </div>
            )}
          </section>
        </div></FadeIn>
      </div>
    </div>
  );
};

export default ClinicSettings;
