import React, { useId, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ConfirmModal from '../../components/ConfirmModal';
import { EditConfirmModal, SuccessModal } from './ClinicModals';
import ClinicDocumentsModal from './ClinicDocumentsModal';
import { todayISO } from './clinicDates';
import { useClinicData } from './clinicDataContext';
import { useTimeouts } from '../../hooks/useTimeouts';
import { validateOffice, validateRequired, validateSchedule, findOfficeConflict, errorBorder } from './clinicValidation';
import { doctorsData } from '../../data/doctors';
import { schedulesOverlap, formatSchedule, getDocumentStatus } from '../../data/institutions';
import { WEEK_DAYS } from '../../constants/catalog';
import { Trash2, Edit2, UserPlus, Stethoscope, Save, X, MapPin, Clock, AlertTriangle, FileText } from 'lucide-react';

// Cuánto tiempo (en milisegundos) queda visible la ventana verde de éxito.
const SUCCESS_DURATION_MS = 2500;

// Busca los datos completos de un médico (nombre, foto, especialidad) por su id.
const findDoctor = (doctorId) => doctorsData.find((doctor) => doctor.id === doctorId);

// Convierte una vinculación en los valores del formulario de edición.
const toForm = (assignment) => ({
  doctorId: assignment.doctorId,
  area: assignment.area,
  office: assignment.office,
  days: assignment.days,
  startTime: assignment.startTime,
  endTime: assignment.endTime,
});

// Valida el horario. Devuelve un texto con el problema, o '' si está todo bien.
// Solo se controla dentro de ESTA institución: si el horario del médico choca con
// el de otra clínica u hospital, lo resuelve él con la administración.
// `assignments`: las vinculaciones de esta institución.
const validateAssignment = (form, clinicId, assignments) => {
  const scheduleError = validateSchedule(form);
  if (scheduleError) return scheduleError;
  // Dos médicos no pueden usar el mismo consultorio al mismo tiempo.
  const officeTaken = findOfficeConflict(
    { doctorId: form.doctorId, institutionId: clinicId, office: form.office, schedule: form },
    assignments,
    schedulesOverlap
  );
  if (officeTaken) {
    return `${officeTaken.office} ya lo usa ${findDoctor(officeTaken.doctorId)?.name} (${formatSchedule(officeTaken)}). Elegí otro consultorio u horario.`;
  }
  return '';
};

// Pantalla del administrador de institución (clínica u hospital): médicos vinculados
// a SU institución, con el área o sector, el consultorio y el horario en que atienden.
// Plantilla visual: src/pages/admin/AdminDoctors.jsx.
const ClinicDoctors = () => {
  // useId genera un prefijo único para los id de los inputs (para los <label htmlFor>).
  const fieldId = useId();

  // Datos compartidos con la pantalla de Secretarias (ver ClinicDataProvider.jsx).
  const { clinic, units, terms, assignments, secretaries, addAssignment, updateAssignment, removeAssignment, updateDocument } = useClinicData();

  // Si venimos de la pantalla Personal con "Editar", llega el id a editar en
  // location.state (ver ClinicStaff.jsx) y abrimos el formulario ya en modo edición.
  const location = useLocation();
  const assignmentToEdit = assignments.find((a) => a.id === location.state?.editId);

  // Formulario vacío. Si la institución tiene una sola área o sector, la dejamos elegida.
  const emptyForm = {
    doctorId: '',
    area: units.length === 1 ? units[0] : '',
    office: '',
    days: [],
    startTime: '08:00',
    endTime: '12:00',
  };

  // Estado propio de esta pantalla (la lista de médicos vive en el contexto).
  const [form, setForm] = useState(() => (assignmentToEdit ? toForm(assignmentToEdit) : emptyForm));
  const [editId, setEditId] = useState(assignmentToEdit?.id ?? null); // id de la vinculación que se edita (null = alta)
  const [documentsId, setDocumentsId] = useState(null); // vinculación cuya documentación se está viendo
  const [deleteId, setDeleteId] = useState(null); // id de la vinculación a quitar (null = ventana cerrada)
  const [formError, setFormError] = useState('');   // error del horario (se muestra debajo del formulario)
  const [errors, setErrors] = useState({});           // errores por campo: médico, área/sector, consultorio
  const [isConfirmingEdit, setIsConfirmingEdit] = useState(false);
  const [success, setSuccess] = useState(null);   // null = cerrada; { title, message } = abierta
  const { schedule } = useTimeouts();

  const isEditing = editId !== null;

  // Muestra la ventana verde y la cierra sola después de unos segundos.
  const showSuccess = (title, message) => {
    setSuccess({ title, message });
    schedule(() => setSuccess(null), SUCCESS_DURATION_MS);
  };

  // Actualiza un campo del formulario y borra el error anterior.
  // Usamos la forma `setForm(prev => ...)`: React nos pasa el valor más reciente,
  // así dos cambios seguidos no se pisan entre sí.
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError('');
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Revisa los campos del formulario. Devuelve solo los que tienen error: { campo: mensaje }.
  const validateFields = () => {
    const found = {
      doctorId: validateRequired(form.doctorId, 'Elegí el médico que querés vincular.'),
      area: validateRequired(form.area, `Elegí ${terms.unit === 'Sector' ? 'el sector' : 'el área'}.`),
      office: validateOffice(form.office),
    };
    return Object.fromEntries(Object.entries(found).filter(([, message]) => message));
  };

  // Marca o desmarca un día, manteniendo el orden de la semana (Lun, Mar, ...).
  const toggleDay = (day) => {
    setForm((prev) => {
      const selected = prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day];
      return { ...prev, days: WEEK_DAYS.filter((d) => selected.includes(d)) };
    });
    setFormError('');
  };

  const startEdit = (assignment) => {
    setEditId(assignment.id);
    setForm(toForm(assignment));
    setFormError('');
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormError('');
    setErrors({});
  };

  // Al enviar: validamos; si es edición pedimos confirmación (naranja), si es alta guardamos.
  const handleSubmit = (e) => {
    e.preventDefault(); // evita que el navegador recargue la página al enviar el form
    const found = validateFields();
    setErrors(found);
    if (Object.keys(found).length > 0) return; // hay campos con error: no se guarda
    const error = validateAssignment(form, clinic.id, assignments);
    if (error) {
      setFormError(error);
      return;
    }
    if (isEditing) {
      setIsConfirmingEdit(true);
      return;
    }
    addAssignment({ ...form, office: form.office.trim().replace(/\s+/g, ' ') });
    showSuccess('¡Médico vinculado!', `${findDoctor(form.doctorId)?.name} ahora forma parte de ${clinic.name}.`);
    setForm(emptyForm);
  };

  // El usuario confirmó la edición en la ventana naranja.
  const handleConfirmEdit = () => {
    updateAssignment(editId, { ...form, office: form.office.trim().replace(/\s+/g, ' ') });
    setIsConfirmingEdit(false);
    cancelEdit();
    showSuccess('¡Cambios guardados!', 'Los datos del médico fueron actualizados.');
  };

  const handleConfirmDelete = () => {
    removeAssignment(deleteId);
    if (deleteId === editId) cancelEdit();
    setDeleteId(null);
  };

  // Protección: si el usuario no tiene una clínica válida, no hay nada que mostrar.
  if (!clinic) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-10 text-center text-gray-500">
          Tu usuario no tiene una institución asignada.
        </div>
      </div>
    );
  }

  // Médicos que todavía no están en esta clínica (los únicos que se pueden vincular).
  const linkedIds = assignments.map((assignment) => assignment.doctorId);
  const availableDoctors = doctorsData.filter((doctor) => !linkedIds.includes(doctor.id));
  const editingDoctorName = findDoctor(form.doctorId)?.name;

  // Para el aviso de quitar: cuántas secretarias manejan la agenda de ese médico.
  const doctorToDelete = assignments.find((a) => a.id === deleteId);
  const affectedSecretaries = doctorToDelete
    ? secretaries.filter((s) => s.doctorIds.includes(doctorToDelete.doctorId)).length
    : 0;

  // Vinculación cuya documentación está abierta (se busca en la lista para ver siempre los datos al día).
  const assignmentWithDocuments = assignments.find((a) => a.id === documentsId);
  const today = todayISO();

  const inputClass = 'w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white';
  const labelClass = 'text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Quitar Profesional"
        message={`¿Confirma que desea quitar a ${findDoctor(doctorToDelete?.doctorId)?.name} de ${clinic.name}?${affectedSecretaries > 0 ? ` También se quitará de la agenda de ${affectedSecretaries} secretaria(s).` : ''} Si no trabaja en otra institución, se dará de baja su cuenta.`}
      />
      <EditConfirmModal
        isOpen={isConfirmingEdit}
        title="¿Modificar médico?"
        message={`Vas a actualizar el ${terms.unitLower}, el consultorio y el horario de ${editingDoctorName}. ¿Guardar los cambios?`}
        onCancel={() => setIsConfirmingEdit(false)}
        onConfirm={handleConfirmEdit}
      />
      <SuccessModal isOpen={success !== null} title={success?.title} message={success?.message} />
      {assignmentWithDocuments && (
        <ClinicDocumentsModal
          doctorName={findDoctor(assignmentWithDocuments.doctorId)?.name}
          assignment={assignmentWithDocuments}
          onUpdate={(type, expiresAt) => updateDocument(assignmentWithDocuments.id, type, expiresAt)}
          onClose={() => setDocumentsId(null)}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg"><Stethoscope className="text-blue-600 w-8 h-8"/></div>
              Médicos de {clinic.name}
            </h1>
            <p className="text-gray-500 mt-2 flex items-center gap-1 text-sm">
              <MapPin className="w-4 h-4"/> {clinic.address}
            </p>
          </div>
        </div>

        {/* Formulario: azul para vincular, naranja mientras se edita (igual que AdminDoctors) */}
        <div className={`bg-white p-8 rounded-2xl shadow-sm mb-10 border transition-all duration-300 ${isEditing ? 'border-orange-200 ring-4 ring-orange-50' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`font-bold text-xl ${isEditing ? 'text-orange-600' : 'text-gray-800'}`}>
              {isEditing ? '✏️ Editando Profesional' : '✨ Vincular Profesional'}
            </h3>
            {isEditing && (
              <button onClick={cancelEdit} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full transition">
                <X className="w-3 h-3"/> Cancelar Edición
              </button>
            )}
          </div>
          {/* noValidate: usamos nuestros propios mensajes en lugar de los del navegador */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Fila 1: quién, en qué área y dónde */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label htmlFor={`${fieldId}-medico`} className={labelClass}>Médico</label>
                {/* Al editar no se puede cambiar el médico: solo su área, consultorio y horario */}
                <select id={`${fieldId}-medico`} disabled={isEditing} aria-invalid={Boolean(errors.doctorId)} aria-describedby={`${fieldId}-medico-error`} className={`${inputClass} appearance-none disabled:text-gray-500 disabled:cursor-not-allowed ${errorBorder(errors.doctorId)}`} value={form.doctorId} onChange={e => updateField('doctorId', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {isEditing && <option value={form.doctorId}>{editingDoctorName}</option>}
                  {availableDoctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>{doctor.name} — {doctor.specialty}</option>
                  ))}
                </select>
                {errors.doctorId && <p id={`${fieldId}-medico-error`} role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.doctorId}</p>}
              </div>
              <div>
                <label htmlFor={`${fieldId}-area`} className={labelClass}>{terms.unit}</label>
                <select id={`${fieldId}-area`} aria-invalid={Boolean(errors.area)} aria-describedby={`${fieldId}-area-error`} className={`${inputClass} appearance-none ${errorBorder(errors.area)}`} value={form.area} onChange={e => updateField('area', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {units.map(area => <option key={area} value={area}>{area}</option>)}
                </select>
                {errors.area && <p id={`${fieldId}-area-error`} role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.area}</p>}
              </div>
              <div>
                <label htmlFor={`${fieldId}-consultorio`} className={labelClass}>Consultorio</label>
                <input id={`${fieldId}-consultorio`} maxLength={40} aria-invalid={Boolean(errors.office)} aria-describedby={`${fieldId}-consultorio-error`} placeholder="Ej: Consultorio 3" className={`${inputClass} ${errorBorder(errors.office)}`} value={form.office} onChange={e => updateField('office', e.target.value)} />
                {errors.office && <p id={`${fieldId}-consultorio-error`} role="alert" className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.office}</p>}
              </div>
            </div>

            {/* Fila 2: horario de atención en ESTA clínica */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-5 items-end">
              <div>
                <p id={`${fieldId}-dias`} className={labelClass}>Días de atención</p>
                <div role="group" aria-labelledby={`${fieldId}-dias`} className="flex gap-2 flex-wrap">
                  {WEEK_DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      aria-pressed={form.days.includes(day)}
                      onClick={() => toggleDay(day)}
                      className={`w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition ${
                        form.days.includes(day)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor={`${fieldId}-desde`} className={labelClass}>Desde</label>
                <input id={`${fieldId}-desde`} type="time" required className={inputClass} value={form.startTime} onChange={e => updateField('startTime', e.target.value)} />
              </div>
              <div>
                <label htmlFor={`${fieldId}-hasta`} className={labelClass}>Hasta</label>
                <input id={`${fieldId}-hasta`} type="time" required className={inputClass} value={form.endTime} onChange={e => updateField('endTime', e.target.value)} />
              </div>
              <div>
                <button type="submit" className={`w-full py-3 px-6 rounded-xl font-bold text-white transition shadow-md flex justify-center gap-2 items-center ${isEditing ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                  {isEditing ? <Save className="w-5 h-5"/> : <UserPlus className="w-5 h-5"/>}
                  {isEditing ? 'Actualizar' : 'Vincular'}
                </button>
              </div>
            </div>

            {/* Error de validación (por ejemplo, un consultorio ocupado en ese horario) */}
            {formError && (
              <div role="alert" className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"/>
                <span>{formError}</span>
              </div>
            )}
          </form>
        </div>

        {/* Tabla de médicos de la clínica */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Profesional</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">{terms.unit}</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Consultorio</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Horario</th>
                <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assignments.map(assignment => {
                const doctor = findDoctor(assignment.doctorId);
                // Documentos vencidos o pendientes: se muestran como aviso en el botón.
                const documentIssues = assignment.documents.filter((doc) => getDocumentStatus(doc, today) !== 'vigente').length;
                return (
                  <tr key={assignment.id} className={`hover:bg-blue-50/50 transition ${editId === assignment.id ? 'bg-orange-50' : ''}`}>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <img src={doctor?.img} alt="" className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                        <div>
                          <div className="font-bold text-gray-900">{doctor?.name}</div>
                          <div className="text-xs text-gray-500">{doctor?.specialty}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                        {assignment.area}
                      </span>
                    </td>
                    <td className="p-5 text-gray-500 font-medium">{assignment.office}</td>
                    <td className="p-5 text-gray-500 text-sm">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400"/> {formatSchedule(assignment)}</span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setDocumentsId(assignment.id)}
                          className="relative flex items-center gap-1 px-3 py-2 text-sm font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title={documentIssues > 0 ? `${documentIssues} documento(s) vencido(s) o pendiente(s)` : 'Documentación al día'}
                        >
                          <FileText className="w-5 h-5"/> Documentación
                          {documentIssues > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                              {documentIssues}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => startEdit(assignment)}
                          className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5"/>
                        </button>
                        <button
                          onClick={() => setDeleteId(assignment.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title={`Quitar ${terms.fromPlace}`}
                        >
                          <Trash2 className="w-5 h-5"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {assignments.length === 0 && (
            <div className="p-10 text-center text-gray-400">Todavía no hay médicos vinculados a {terms.thisPlace}.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicDoctors;
