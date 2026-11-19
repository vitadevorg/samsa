import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Clock, Star, ShieldCheck, Award, User, MessageSquare,
  ChevronDown, ChevronUp, Building2, Stethoscope,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { doctorsData } from '../data/doctors';
import { useClinicData } from './clinic/clinicDataContext';
import { getInstitutionById, getInstitutionType, formatSchedule } from '../data/institutions';

// Perfil público de un profesional (/professionals/:id), el que ven los pacientes.
// La pantalla propia del médico (/doctor/profile) es src/pages/doctor/DoctorAccount.jsx.
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
  const profileData = doctorsData.find(d => d.id === id) || doctorsData[0];
  // Instituciones donde atiende el médico. Se leen del estado compartido
  // (ClinicDataProvider): si una clínica lo dio de baja, esa vinculación ya no está.
  // Solo instituciones activas: en una inhabilitada o dada de baja el médico no atiende ni recibe turnos.
  const { bookableAssignments: allAssignments } = useClinicData();
  const doctorAssignments = allAssignments.filter(a => a.doctorId === profileData.id);
  const isManagedByInstitution = doctorAssignments.length > 0;
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
      <div className="max-w-5xl mx-auto px-4 py-12">
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
                    {isManagedByInstitution ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {doctorAssignments.map(assignment => {
                                const institution = getInstitutionById(assignment.institutionId);
                                const institutionType = getInstitutionType(assignment.institutionId);
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
                                {`${formatDays(profileData.days)} · ${formatHours(profileData.hours)}`}
                            </p>
                        </div>
                    )}
                </div>
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
                 <div className="mt-8 pt-8 border-t border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-600"/> {`Acerca de ${profileData.name.split(' ')[1]}`}
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-sm">{profileData.bio}</p>
                </div>
            </div>
        </div>
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