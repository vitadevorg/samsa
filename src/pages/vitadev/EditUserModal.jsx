import React, { useId, useState } from 'react';
import { Pencil, X, Save } from 'lucide-react';
import { validateName, validateEmail, validatePhone, validateRequired, errorBorder } from '../clinic/clinicValidation';
import { stripTitle } from '../../utils/doctorName';
import { USER_GROUPS } from './userDirectory';

// Edición de los datos de contacto de una cuenta desde Gestión de Usuarios: nombre, email y teléfono.
// Los pacientes guardan nombre y apellido por separado, así que se piden en dos campos.
// `takenEmails`: emails de otras cuentas (en minúsculas) para no repetirlos.
// No se cierra con click afuera, para no perder lo escrito; sí con Cancelar o la X.
const EditUserModal = ({ person, takenEmails, onCancel, onSubmit }) => {
  const fieldId = useId();
  const isPatient = person.group === 'patient';
  const [form, setForm] = useState({
    name: isPatient ? person.firstName : person.name,
    lastName: isPatient ? person.lastName : '',
    email: person.email,
    phone: person.phone ?? '',
  });
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = (text) => text.trim().replace(/\s+/g, ' ');
    const found = Object.fromEntries(Object.entries({
      name: isPatient
        // Mismas reglas de caracteres que el resto de los nombres, aplicadas al nombre completo.
        ? validateRequired(form.name, 'Ingresá el nombre.') || (clean(form.lastName) ? validateName(`${clean(form.name)} ${clean(form.lastName)}`) : '')
        : validateName(stripTitle(clean(form.name))),
      lastName: isPatient ? validateRequired(form.lastName, 'Ingresá el apellido.') : '',
      email: validateEmail(form.email, takenEmails),
      phone: validatePhone(form.phone),
    }).filter(([, message]) => message));
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit({
      name: clean(form.name),
      lastName: clean(form.lastName),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
    });
  };

  const inputClass = 'w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white';
  const labelClass = 'text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block';
  const field = (name, label, props = {}) => (
    <div>
      <label htmlFor={`${fieldId}-${name}`} className={labelClass}>{label}</label>
      <input
        id={`${fieldId}-${name}`}
        value={form[name]}
        onChange={(e) => update(name, e.target.value)}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={`${fieldId}-${name}-error`}
        className={`${inputClass} ${errorBorder(errors[name])}`}
        {...props}
      />
      {errors[name] && <p id={`${fieldId}-${name}-error`} role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={`${fieldId}-title`} className="fixed inset-0 z-50 flex justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-3xl w-full max-w-lg my-auto overflow-hidden shadow-2xl animate-slideUp">
        <div className="px-6 py-5 flex items-start gap-4 border-b border-gray-100">
          <div className="bg-blue-100 p-2.5 rounded-xl shrink-0"><Pencil className="w-5 h-5 text-blue-600" /></div>
          <div className="flex-1 min-w-0">
            <h2 id={`${fieldId}-title`} className="text-lg font-bold text-gray-900">Editar datos</h2>
            <p className="text-sm text-gray-500 truncate">{USER_GROUPS[person.group].single} · {person.name}</p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Cerrar" className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-300 outline-none flex items-center justify-center transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {isPatient ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field('name', 'Nombre', { maxLength: 40, autoComplete: 'off' })}
              {field('lastName', 'Apellido', { maxLength: 40, autoComplete: 'off' })}
            </div>
          ) : (
            field('name', 'Nombre y apellido', { maxLength: 60, autoComplete: 'off' })
          )}
          {field('email', 'Email (usuario)', { type: 'email', maxLength: 80, autoComplete: 'off' })}
          {field('phone', 'Teléfono', { type: 'tel', inputMode: 'tel', maxLength: 20, placeholder: '381 400-0000', autoComplete: 'off' })}
          <p className="text-xs text-gray-400 ml-1">Si cambiás el email, la persona va a iniciar sesión con el nuevo.</p>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition">
            Cancelar
          </button>
          <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition">
            <Save className="w-4 h-4" /> Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserModal;
