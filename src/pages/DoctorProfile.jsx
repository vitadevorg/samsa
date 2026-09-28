import React, { useState, useId } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { 
  MapPin, Clock, Star, ShieldCheck, Award, User, MessageSquare, 
  Edit3, Save, Plus, X, Wallet, Info, Trash2, ChevronDown, 
  ChevronUp, CheckCircle, AlertTriangle, Building2, Stethoscope, Send
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/useAuth';
import { doctorsData } from '../data/doctors';
import { createId } from '../utils/ids';
import { SPECIALTIES, INSURANCE_OPTIONS, WEEK_DAYS } from '../constants/catalog';
import { useClinicData } from './clinic/clinicDataContext';
import { getInstitutionById, getInstitutionType, formatSchedule, schedulesOverlap } from '../data/institutions';
import { formatDate } from './clinic/clinicDates';
// En la vista propia (/doctor/profile) el usuario de prueba es el Dr. Zelarayan,
// cuyo id en doctors.js es 'juan-perez'.
const SELF_DOCTOR_ID = 'juan-perez';
// `title` y `message` son opcionales: por defecto, los textos de guardar el perfil.
const SuccessModal = ({
  isOpen, onClose,
  title = '¡Datos Actualizados!',
  message = 'Tu perfil profesional ha sido modificado exitosamente. Los pacientes ahora verán tu nueva información.',
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4 animate-slideUp transform transition-all">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{title}</h3>
        <p className="text-gray-500 text-center mb-6 text-sm leading-relaxed">
          {message}
        </p>
        <button 
          onClick={onClose} 
          className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition w-full shadow-lg shadow-green-200 hover:shadow-green-300 transform hover:-translate-y-0.5"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};
// `title`, `message` y `confirmLabel` son opcionales: por defecto, los textos de guardar el perfil.
const ConfirmModal = ({
  isOpen, onClose, onConfirm,
  title = '¿Guardar cambios?',
  message = 'Estás por modificar tu perfil público. Asegúrate de que la información sea correcta antes de confirmar.',
  confirmLabel = 'Sí, Guardar',
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4 animate-slideUp transform transition-all">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{title}</h3>
        <p className="text-gray-500 text-center mb-6 text-sm leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3 w-full">
          <button 
            onClick={onClose} 
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 bg-yellow-500 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-yellow-600 transition shadow-lg shadow-yellow-200"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
// Formulario para que el médico le pida a una institución cambiar su horario.
// No guarda nada: valida el pedido y se lo pasa a la página con `onSubmit`,
// que pide confirmación y lo envía a la clínica (addRequest del estado compartido).
// - `assignment`: su vinculación actual con esa institución (días y horario).
// - `otherAssignments`: sus vinculaciones con OTRAS instituciones (para no superponerse).
const ScheduleRequestModal = ({ institutionName, assignment, otherAssignments, onCancel, onSubmit }) => {
  const fieldId = useId();
  // El formulario arranca con el horario actual, así el médico solo cambia lo que necesita.
  const [days, setDays] = useState(assignment.days);
  const [startTime, setStartTime] = useState(assignment.startTime);
  const [endTime, setEndTime] = useState(assignment.endTime);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // Marca o desmarca un día, manteniendo el orden de la semana.
  const toggleDay = (day) => {
    setDays(prev => {
      const next = prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day];
      return WEEK_DAYS.filter(d => next.includes(d));
    });
    setError('');
  };

  // Devuelve el problema del pedido, o '' si está todo bien.
  const validate = (requested) => {
    if (requested.days.length === 0) return 'Elegí al menos un día.';
    if (requested.startTime >= requested.endTime) return 'La hora de fin tiene que ser posterior a la de inicio.';
    const isSameAsNow = requested.days.join() === assignment.days.join()
      && requested.startTime === assignment.startTime
      && requested.endTime === assignment.endTime;
    if (isSameAsNow) return 'El horario pedido es igual al que ya tenés.';
    const conflict = otherAssignments.find(other => schedulesOverlap(other, requested));
    if (conflict) {
      return `Se superpone con tu horario en ${getInstitutionById(conflict.institutionId)?.name} (${formatSchedule(conflict)}).`;
    }
    if (!reason.trim()) return 'Contá brevemente el motivo del cambio.';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // evita que el navegador recargue la página al enviar el form
    const requested = { days, startTime, endTime };
    const problem = validate(requested);
    if (problem) {
      setError(problem);
      return;
    }
    onSubmit({ requestedSchedule: requested, reason: reason.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
        <div className="bg-blue-600 p-5 flex justify-between items-center text-white">
          <div>
            <h3 className="font-bold text-lg">Solicitar cambio de horario</h3>
            <p className="text-blue-100 text-sm">{institutionName} · actual: {formatSchedule(assignment)}</p>
          </div>
          <button type="button" onClick={onCancel} className="hover:bg-blue-700 p-1.5 rounded-full transition" title="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <p id={`${fieldId}-dias`} className="block text-sm font-bold text-gray-700 uppercase">Días pedidos</p>
            <div role="group" aria-labelledby={`${fieldId}-dias`} className="flex justify-between gap-1">
              {WEEK_DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  aria-pressed={days.includes(day)}
                  onClick={() => toggleDay(day)}
                  className={`w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition ${
                    days.includes(day) ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label htmlFor={`${fieldId}-desde`} className="block text-sm font-bold text-gray-700 uppercase mb-1">Desde</label>
              <input id={`${fieldId}-desde`} type="time" required value={startTime} onChange={(e) => { setStartTime(e.target.value); setError(''); }} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label htmlFor={`${fieldId}-hasta`} className="block text-sm font-bold text-gray-700 uppercase mb-1">Hasta</label>
              <input id={`${fieldId}-hasta`} type="time" required value={endTime} onChange={(e) => { setEndTime(e.target.value); setError(''); }} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label htmlFor={`${fieldId}-motivo`} className="block text-sm font-bold text-gray-700 uppercase mb-1">Motivo</label>
            <textarea
              id={`${fieldId}-motivo`}
              rows={3}
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(''); }}
              placeholder="Ej: empiezo una residencia por las mañanas."
              className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          {error && (
            <p role="alert" className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </p>
          )}
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition">Cancelar</button>
          <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2">
            <Send className="w-4 h-4" /> Enviar solicitud
          </button>
        </div>
      </form>
    </div>
  );
};
const ReviewCard = ({ review }) => {
    const [expanded, setExpanded] = useState(false);
    const isLong = review.text.length > 120;
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shadow-inner">
                        {review.user.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{review.user}</div>
                        <div className="flex items-center gap-2">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_,i)=><Star key={i} className={`w-3 h-3 ${i < review.stars ? 'fill-current' : 'text-gray-200'}`}/>)}
                            </div>
                            <span className="text-xs text-gray-400">• {new Date(review.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <p className={`text-gray-600 text-sm leading-relaxed ${!expanded && isLong ? 'line-clamp-2' : ''}`}>
                    {review.text}
                </p>
                {isLong && (
                    <button 
                        onClick={() => setExpanded(!expanded)} 
                        className="text-blue-600 text-xs font-bold mt-2 hover:underline flex items-center gap-1"
                    >
                        {expanded ? <>Ver menos <ChevronUp className="w-3 h-3"/></> : <>Ver más <ChevronDown className="w-3 h-3"/></>}
                    </button>
                )}
            </div>
        </div>
    );
};
// Cada franja horaria editable necesita un id estable para usarlo como key.
const withRangeIds = (data) => ({
  ...data,
  hours: data.hours.map(range => ({ ...range, id: range.id ?? createId() })),
});
const DoctorProfile = () => {
  const fieldId = useId();
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const isSelfView = location.pathname === '/doctor/profile';
  const publicDoctor = doctorsData.find(d => d.id === id) || doctorsData[0];
  const initialData = isSelfView ? {
      name: user?.name || "Dr. Jesús Zelarayan",
      specialty: user?.specialty || "Cardiología",
      img: user?.img || "/img/UTN-Jesus.jpg",
      location: user?.location || "Planta Baja - Consultorio 4",
      attentionType: user?.attentionType || "Particular",
      insurance: user?.insurance || ["Prensa", "Subsidio"],
      days: user?.days ? (Array.isArray(user?.days) ? user.days : ["Lun", "Mié", "Vie"]) : ["Lun", "Mié", "Vie"],
      hours: user?.hours ? (Array.isArray(user?.hours) ? user.hours : [{start: "08:00", end: "13:00"}]) : [{start: "08:00", end: "13:00"}],
      bio: user?.bio || "Especialista en cardiología clínica e intervencionista.",
      rating: 4.9,
      reviewsCount: 15,
      reviews: [
        { id: 1, user: "Priscila", date: "2025-10-12", text: "Excelente atención del Dr. Jesús, muy humano y claro en sus explicaciones. Se tomó todo el tiempo necesario para revisar mis estudios previos.", stars: 5 },
        { id: 2, user: "Claudio Moya", date: "2025-09-05", text: "Un poco de demora pero valió la pena, gran profesional.", stars: 4 },
        { id: 3, user: "Luis Coronel", date: "2025-11-01", text: "Me salvó la vida, literalmente. Eternamente agradecida por su diagnóstico rápido.", stars: 5 }
      ]
  } : publicDoctor;
  const [profileData, setProfileData] = useState(() => withRangeIds(initialData));

  // Instituciones donde atiende el médico. Se leen del estado compartido
  // (ClinicDataProvider): si una clínica lo dio de baja, esa vinculación ya no está.
  const { allAssignments, allRequests, addRequest } = useClinicData();
  const doctorId = isSelfView ? SELF_DOCTOR_ID : publicDoctor.id;
  const doctorAssignments = allAssignments.filter(a => a.doctorId === doctorId);
  // Si pertenece a alguna institución, sus días y horarios los gestiona la institución.
  const isManagedByInstitution = doctorAssignments.length > 0;
  // Texto del aviso, por ejemplo "Tus horarios en Clínica del Norte los administra la clínica."
  const institutionNames = doctorAssignments.map(a => getInstitutionById(a.institutionId)?.name);
  const scheduleManager = doctorAssignments.length > 1
      ? 'cada institución'
      : getInstitutionType(doctorAssignments[0]?.institutionId) === 'Hospital' ? 'el hospital' : 'la clínica';
  const managedScheduleNotice = `Tus horarios en ${institutionNames.join(' y ')} los administra ${scheduleManager}.`;

  // --- Solicitud de cambio de horario (solo en la vista propia) ---
  const [requestingFor, setRequestingFor] = useState(null);       // vinculación para la que se pide el cambio
  const [requestDraft, setRequestDraft] = useState(null);         // pedido validado, esperando confirmación
  const [requestSentTo, setRequestSentTo] = useState(null);       // nombre de la institución (ventana de éxito)
  const requestInstitutionName = getInstitutionById(requestingFor?.institutionId)?.name;

  // Solicitudes del médico en una institución: la pendiente (si hay) y la última resuelta.
  // Como solo puede haber una pendiente a la vez, la última pedida es también la última
  // resuelta: nos quedamos con la de fecha más nueva y, si empatan (mismo día), con la
  // que está más atrás en la lista, que es la que se creó después.
  const getRequestStatus = (institutionId) => {
    const mine = allRequests.filter(r => r.doctorId === doctorId && r.institutionId === institutionId);
    const pending = mine.find(r => r.status === 'pendiente');
    const lastResolved = mine
      .filter(r => r.status !== 'pendiente')
      .reduce((latest, r) => (!latest || r.date >= latest.date ? r : latest), undefined);
    return { pending, lastResolved };
  };

  // El médico confirmó en la ventana amarilla: se envía a la institución.
  const handleConfirmRequest = () => {
    addRequest({ doctorId, institutionId: requestingFor.institutionId, ...requestDraft });
    setRequestSentTo(requestInstitutionName);
    setRequestDraft(null);
    setRequestingFor(null);
  };
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const toggleDay = (day) => {
      setProfileData(prev => {
          const newDays = prev.days.includes(day) 
              ? prev.days.filter(d => d !== day)
              : [...prev.days, day];
          return { ...prev, days: WEEK_DAYS.filter(d => newDays.includes(d)) };
      });
  };
  const addTimeRange = () => {
      setProfileData(prev => ({ ...prev, hours: [...prev.hours, { id: createId(), start: "", end: "" }] }));
  };
  const removeTimeRange = (rangeId) => {
      setProfileData(prev => ({ ...prev, hours: prev.hours.filter(range => range.id !== rangeId) }));
  };
  // Actualización inmutable: antes se mutaba el objeto, que es el mismo que guarda el contexto de sesión.
  const updateTimeRange = (rangeId, field, value) => {
      setProfileData(prev => ({
          ...prev,
          hours: prev.hours.map(range => range.id === rangeId ? { ...range, [field]: value } : range),
      }));
  };
  const toggleInsurance = (ins) => {
      setProfileData(prev => {
          let newInsurance;
          if (ins === "Ninguna") {
              newInsurance = ["Ninguna"];
          } else {
              const withoutNinguna = prev.insurance.filter(i => i !== "Ninguna");
              if (withoutNinguna.includes(ins)) {
                  newInsurance = withoutNinguna.filter(i => i !== ins);
              } else {
                  newInsurance = [...withoutNinguna, ins];
              }
          }
          return { ...prev, insurance: newInsurance };
      });
  };
  const handleSaveClick = () => {
      setShowConfirmModal(true);
  };
  const handleConfirmSave = () => {
      setShowConfirmModal(false);
      if (isSelfView) updateUser(profileData);
      setIsEditing(false);
      setShowSuccessModal(true);
  };
  const formatHours = (hours) => {
      if (!hours || hours.length === 0) return "Sin horarios";
      return hours.map(h => `${h.start} - ${h.end}`).join(" / ");
  };
  const formatDays = (days) => Array.isArray(days) ? days.join(", ") : days;
  const sortedReviews = [...profileData.reviews].sort((a, b) => new Date(b.date) - new Date(a.date));
  const renderStars = (rating) => [...Array(5)].map((_, i) => (
      <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
  ));
  return (
    <div className="font-sans text-slate-800 bg-gray-50 min-h-screen">
      <Navbar />
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
      <ConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={handleConfirmSave} />
      {requestingFor && (
        <ScheduleRequestModal
          institutionName={requestInstitutionName}
          assignment={requestingFor}
          otherAssignments={doctorAssignments.filter(a => a.institutionId !== requestingFor.institutionId)}
          onCancel={() => setRequestingFor(null)}
          onSubmit={setRequestDraft}
        />
      )}
      <ConfirmModal
        isOpen={requestDraft !== null}
        onClose={() => setRequestDraft(null)}
        onConfirm={handleConfirmRequest}
        title="¿Enviar solicitud?"
        message={requestDraft ? `Vas a pedirle a ${requestInstitutionName} atender ${formatSchedule(requestDraft.requestedSchedule)}. Tu horario no cambia hasta que la acepten.` : ''}
        confirmLabel="Sí, Enviar"
      />
      <SuccessModal
        isOpen={requestSentTo !== null}
        onClose={() => setRequestSentTo(null)}
        title="¡Solicitud enviada!"
        message={`${requestSentTo} va a revisar tu pedido. Vas a ver la respuesta en "Dónde atiende".`}
      />
      <div className="max-w-5xl mx-auto px-4 py-12">
        {isSelfView && (
            <div className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg"><User className="w-6 h-6" /></div>
                    <div>
                        <h2 className="font-bold text-lg">Tu Perfil Público</h2>
                        <p className="text-indigo-100 text-sm">Vista previa en tiempo real para pacientes.</p>
                    </div>
                </div>
                {!isEditing && (
                    <button 
                        onClick={() => { setIsEditing(true); window.scrollTo({ top: 500, behavior: 'smooth' }); }}
                        className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition shadow-sm flex items-center gap-2"
                    >
                        <Edit3 className="w-4 h-4"/> Editar Datos
                    </button>
                )}
            </div>
        )}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-12">
            <div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-50"></div>
            <div className="px-8 pb-8 relative">
                <div className="relative -mt-16 mb-6 flex justify-center">
                    <div className="p-2 bg-white rounded-2xl shadow-md">
                        <img src={profileData.img} alt={profileData.name} className="w-32 h-32 object-cover rounded-xl" />
                    </div>
                </div>
                <div className="text-center border-b border-gray-100 pb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{profileData.name}</h1>
                    <p className="text-blue-600 font-medium text-lg uppercase tracking-wide mt-1">{profileData.specialty}</p>
                    <div className="flex justify-center items-center gap-2 mt-3">
                        <div className="flex">{renderStars(profileData.rating)}</div>
                        <span className="text-gray-500 font-bold text-lg">{profileData.rating}/5.0</span>
                        <span className="text-gray-400 text-sm">({profileData.reviewsCount} reseñas)</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="bg-blue-50 p-2 rounded-lg"><User className="w-5 h-5 text-blue-600"/></div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Atención</p>
                                <p className="font-medium">{profileData.attentionType}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="bg-blue-50 p-2 rounded-lg"><ShieldCheck className="w-5 h-5 text-blue-600"/></div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Acepta</p>
                                <p className="font-medium truncate max-w-xs">
                                    {profileData.attentionType === 'Pública' 
                                        ? 'Atención Hospitalaria (Gratuita)' 
                                        : (profileData.insurance && profileData.insurance.length > 0 
                                            ? profileData.insurance.join(", ") 
                                            : 'Solo Particular')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Dónde atiende: una tarjeta por institución, o "Atención particular" si no tiene ninguna */}
                <div className="border-t border-gray-100 pt-8 pb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600"/> Dónde atiende
                    </h2>
                    {isSelfView && isManagedByInstitution && (
                        <p className="text-sm text-indigo-700 bg-indigo-50 rounded-xl p-3 mb-4 flex items-start gap-2">
                            <Info className="w-4 h-4 shrink-0 mt-0.5"/> {managedScheduleNotice}
                        </p>
                    )}
                    {isManagedByInstitution ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {doctorAssignments.map(assignment => {
                                const institution = getInstitutionById(assignment.institutionId);
                                const institutionType = getInstitutionType(assignment.institutionId);
                                const { pending, lastResolved } = getRequestStatus(assignment.institutionId);
                                return (
                                    <div key={assignment.id} className="p-5 rounded-2xl border border-blue-100 bg-blue-50/40 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="font-bold text-gray-900">{institution?.name}</p>
                                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 shrink-0">{institutionType}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5"/> {institution?.address}
                                        </p>
                                        <p className="text-sm text-gray-600 flex items-start gap-2">
                                            <Stethoscope className="w-4 h-4 text-blue-600 shrink-0 mt-0.5"/>
                                            {institutionType === 'Hospital' ? 'Sector' : 'Área'}: {assignment.area} · {assignment.office}
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 flex items-start gap-2">
                                            <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5"/> {formatSchedule(assignment)}
                                        </p>
                                        {/* Solo el propio médico ve sus solicitudes y puede pedir un cambio */}
                                        {isSelfView && (pending ? (
                                            <div className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3">
                                                <p className="font-bold">Solicitud pendiente</p>
                                                <p>Pediste {formatSchedule(pending.requestedSchedule)} el {formatDate(pending.date)}. La institución todavía no respondió.</p>
                                            </div>
                                        ) : (
                                            <div className="pt-1 space-y-2">
                                                {lastResolved && (
                                                    <p className="text-xs text-gray-500">
                                                        Última solicitud ({formatDate(lastResolved.resolvedAt ?? lastResolved.date)}):{' '}
                                                        <span className={`font-bold ${lastResolved.status === 'aceptada' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {lastResolved.status === 'aceptada' ? 'Aceptada' : 'Rechazada'}
                                                        </span>
                                                    </p>
                                                )}
                                                <button
                                                    onClick={() => setRequestingFor(assignment)}
                                                    className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                                                >
                                                    <Send className="w-4 h-4"/> Solicitar cambio de horario
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        // Sin instituciones: los datos particulares que ya tenía el perfil.
                        <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50 space-y-3 md:max-w-md">
                            <p className="font-bold text-gray-900">Atención particular</p>
                            <p className="text-sm text-gray-600 flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5"/> {profileData.location}
                            </p>
                            <p className="text-sm font-medium text-gray-800 flex items-start gap-2">
                                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5"/>
                                {formatDays(profileData.days)} · {formatHours(profileData.hours)}
                            </p>
                        </div>
                    )}
                </div>
                {!isSelfView && (
                  <div className="mt-4 bg-indigo-50 rounded-xl p-6 text-center">
                    <p className="text-indigo-900 font-medium mb-4">
                      Solo falta que elijas el horario, ¡Y listo!
                    </p>
                    <Link to={`/book-appointment/${id}`}>
                      <button
                        className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg"
                      >
                        Agendar Turno
                      </button>
                    </Link>
                  </div>
                )}
                 <div className="mt-8 pt-8 border-t border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-600"/> {isSelfView ? "Acerca de mí" : `Acerca de ${profileData.name.split(' ')[1]}`}
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-sm">{profileData.bio}</p>
                </div>
            </div>
        </div>
        {isSelfView && (
            <div className={`bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-500 mb-12 ${isEditing ? 'opacity-100 translate-y-0' : 'opacity-50 grayscale pointer-events-none'}`}>
                <div className="bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-blue-400"/> Gestión de Perfil
                    </h2>
                    {isEditing && (
                        <div className="flex gap-3">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-300 hover:text-white text-sm font-bold transition">Cancelar</button>
                            <button onClick={handleSaveClick} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg transition flex items-center gap-2">
                                <Save className="w-4 h-4"/> Guardar
                            </button>
                        </div>
                    )}
                </div>
                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <label htmlFor={`${fieldId}-especialidad`} className="block text-sm font-bold text-gray-700 uppercase">Especialidad</label>
                            <select id={`${fieldId}-especialidad`} 
                                value={profileData.specialty}
                                onChange={(e) => setProfileData({...profileData, specialty: e.target.value})}
                                className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                            >
                                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label htmlFor={`${fieldId}-ubicacion`} className="block text-sm font-bold text-gray-700 uppercase">Ubicación</label>
                            <input id={`${fieldId}-ubicacion`} 
                                value={profileData.location}
                                onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                         <div className="space-y-4">
                             <label htmlFor={`${fieldId}-biografia`} className="block text-sm font-bold text-gray-700 uppercase">Biografía</label>
                             <textarea id={`${fieldId}-biografia`} 
                                value={profileData.bio}
                                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                rows={4}
                                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                             />
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <p className="block text-sm font-bold text-gray-700 uppercase">Tipo de Atención</p>
                            <div className="flex gap-2">
                                {['Particular', 'Pública'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setProfileData(prev => ({ ...prev, attentionType: type }))}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition ${
                                            profileData.attentionType === type 
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {profileData.attentionType === 'Particular' && (
                            <div className="space-y-2 animate-fadeIn">
                                <p className="block text-sm font-bold text-gray-700 uppercase">Obras Sociales</p>
                                <div className="flex flex-wrap gap-2">
                                    {INSURANCE_OPTIONS.map(ins => (
                                        <button
                                            key={ins}
                                            onClick={() => toggleInsurance(ins)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                                profileData.insurance.includes(ins)
                                                ? 'bg-green-50 border-green-500 text-green-700'
                                                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                            }`}
                                        >
                                            {ins}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Si pertenece a una institución, los horarios los gestiona ella: no se editan acá */}
                        {isManagedByInstitution ? (
                            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-800 flex items-start gap-2">
                                <Info className="w-4 h-4 shrink-0 mt-0.5"/>
                                <span>{managedScheduleNotice} Para cambiarlos, usá "Solicitar cambio de horario" en la sección "Dónde atiende".</span>
                            </div>
                        ) : (<>
                        <div className="space-y-2">
                            <p className="block text-sm font-bold text-gray-700 uppercase">Días de Atención</p>
                            <div className="flex justify-between gap-1">
                                {WEEK_DAYS.map(day => (
                                    <button
                                        key={day}
                                        onClick={() => toggleDay(day)}
                                        className={`w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition ${
                                            profileData.days.includes(day)
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                        }`}
                                    >
                                        {day.charAt(0)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <p className="block text-sm font-bold text-gray-700 uppercase">Rangos Horarios</p>
                                <button onClick={addTimeRange} className="text-blue-600 text-xs font-bold hover:underline flex items-center"><Plus className="w-3 h-3"/> Agregar Turno</button>
                            </div>
                            <div className="space-y-2">
                                {profileData.hours.map((range) => (
                                    <div key={range.id} className="flex gap-2 items-center">
                                        <input type="time" value={range.start} onChange={(e) => updateTimeRange(range.id, 'start', e.target.value)} className="p-2 border rounded-lg text-sm bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500" />
                                        <span className="text-gray-400">-</span>
                                        <input type="time" value={range.end} onChange={(e) => updateTimeRange(range.id, 'end', e.target.value)} className="p-2 border rounded-lg text-sm bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500" />
                                        {profileData.hours.length > 1 && (
                                            <button onClick={() => removeTimeRange(range.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        </>)}
                    </div>
                </div>
            </div>
        )}
        <div className="mt-12 mb-20">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-blue-600"/>
                    Opiniones de Pacientes ({profileData.reviews.length})
                </h2>
            </div>
            <div className="flex flex-col gap-4">
                {sortedReviews.length > 0 ? (
                    sortedReviews.map((rev) => (
                        <ReviewCard key={rev.id} review={rev} />
                    ))
                ) : (
                    <div className="p-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500 italic">Aún no hay reseñas registradas.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default DoctorProfile;