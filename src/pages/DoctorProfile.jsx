import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { 
  MapPin, Clock, Star, ShieldCheck, Award, User, MessageSquare, 
  Edit3, Save, Plus, X, Wallet, Info, Trash2, ChevronDown, 
  ChevronUp, CheckCircle, AlertTriangle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { doctorsData } from '../data/doctors';
const SPECIALTIES = [
  "Cardiología", "Clínica Médica", "Pediatría", "Nutrición", 
  "Neurología", "Dermatología", "Traumatología", "Ginecología", 
  "Oftalmología", "Psiquiatría"
];
const INSURANCES = [
  "Ninguna", "Prensa", "Subsidio de Salud", "OSDE", "Swiss Medical", 
  "Galeno", "PAMI", "IOS", "OSECAC"
];
const DAYS_OF_WEEK = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4 animate-slideUp transform transition-all">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">¡Datos Actualizados!</h3>
        <p className="text-gray-500 text-center mb-6 text-sm leading-relaxed">
          Tu perfil profesional ha sido modificado exitosamente. Los pacientes ahora verán tu nueva información.
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
const ConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4 animate-slideUp transform transition-all">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">¿Guardar cambios?</h3>
        <p className="text-gray-500 text-center mb-6 text-sm leading-relaxed">
          Estás por modificar tu perfil público. Asegúrate de que la información sea correcta antes de confirmar.
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
            Sí, Guardar
          </button>
        </div>
      </div>
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
const DoctorProfile = () => {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const isSelfView = location.pathname === '/doctor/profile';
  const publicDoctor = doctorsData.find(d => d.id === id) || doctorsData[0];
  const initialData = isSelfView ? {
      name: user?.name || "Dr. Jesús Zelarayan",
      specialty: user?.specialty || "Cardiología",
      img: user?.img || "../../public/img/UTN-Jesus.jpg",
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
  const [profileData, setProfileData] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const toggleDay = (day) => {
      setProfileData(prev => {
          const newDays = prev.days.includes(day) 
              ? prev.days.filter(d => d !== day)
              : [...prev.days, day];
          return { ...prev, days: DAYS_OF_WEEK.filter(d => newDays.includes(d)) };
      });
  };
  const addTimeRange = () => {
      setProfileData(prev => ({ ...prev, hours: [...prev.hours, {start: "", end: ""}] }));
  };
  const removeTimeRange = (index) => {
      setProfileData(prev => ({ ...prev, hours: prev.hours.filter((_, i) => i !== index) }));
  };
  const updateTimeRange = (index, field, value) => {
      const newHours = [...profileData.hours];
      newHours[index][field] = value;
      setProfileData({ ...profileData, hours: newHours });
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
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="bg-blue-50 p-2 rounded-lg"><MapPin className="w-5 h-5 text-blue-600"/></div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Ubicación</p>
                                <p className="font-medium">{profileData.location}</p>
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
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="bg-blue-50 p-2 rounded-lg"><Clock className="w-5 h-5 text-blue-600"/></div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Días y Horarios</p>
                                <p className="font-medium text-sm">
                                    {formatDays(profileData.days)} <br/> 
                                    <span className="text-gray-500">{formatHours(profileData.hours)}</span>
                                </p>
                            </div>
                        </div>
                    </div>
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
                            <label className="block text-sm font-bold text-gray-700 uppercase">Especialidad</label>
                            <select 
                                value={profileData.specialty}
                                onChange={(e) => setProfileData({...profileData, specialty: e.target.value})}
                                className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                            >
                                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700 uppercase">Ubicación</label>
                            <input 
                                value={profileData.location}
                                onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                         <div className="space-y-4">
                             <label className="block text-sm font-bold text-gray-700 uppercase">Biografía</label>
                             <textarea 
                                value={profileData.bio}
                                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                rows={4}
                                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                             />
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase">Tipo de Atención</label>
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
                                <label className="block text-sm font-bold text-gray-700 uppercase">Obras Sociales</label>
                                <div className="flex flex-wrap gap-2">
                                    {INSURANCES.map(ins => (
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
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase">Días de Atención</label>
                            <div className="flex justify-between gap-1">
                                {DAYS_OF_WEEK.map(day => (
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
                                <label className="block text-sm font-bold text-gray-700 uppercase">Rangos Horarios</label>
                                <button onClick={addTimeRange} className="text-blue-600 text-xs font-bold hover:underline flex items-center"><Plus className="w-3 h-3"/> Agregar Turno</button>
                            </div>
                            <div className="space-y-2">
                                {profileData.hours.map((range, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input type="time" value={range.start} onChange={(e) => updateTimeRange(idx, 'start', e.target.value)} className="p-2 border rounded-lg text-sm bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500" />
                                        <span className="text-gray-400">-</span>
                                        <input type="time" value={range.end} onChange={(e) => updateTimeRange(idx, 'end', e.target.value)} className="p-2 border rounded-lg text-sm bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500" />
                                        {profileData.hours.length > 1 && (
                                            <button onClick={() => removeTimeRange(idx)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
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