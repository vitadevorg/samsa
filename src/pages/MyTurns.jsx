import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, XCircle, CheckCircle, AlertCircle, Search, Star, MessageSquare, Send, X, Heart, Activity, Stethoscope, Timer, Download, HeartPulse } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
const PrintReceipt = ({ appointmentData }) => {
    const { doctorName, patientName, dni, insurance, date, time, email, location, bookingDate } = appointmentData;
    const transactionId = Math.random().toString(36).substring(2, 12).toUpperCase();
    return (
        <div id="print-area" className="hidden print:flex flex-col p-8 font-serif text-slate-900 bg-white w-full max-w-none box-border absolute top-0 left-0 right-0 z-[99999] min-h-[100vh]">
            <div className="border-b-[3px] border-slate-900 pb-6 mb-10 flex justify-between items-end">
                <div className="flex items-center gap-4">
                    <HeartPulse className="w-14 h-14 text-slate-900" strokeWidth={1.2} />
                    <div>
                        <h1 className="text-4xl tracking-[0.3em] font-medium text-slate-900 ml-1">SAMSA</h1>
                        <p className="text-xs text-slate-500 tracking-[0.2em] uppercase mt-1">Sistema de Salud Integral</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-widest mb-1">Comprobante</h2>
                    <p className="text-sm text-slate-500 font-sans">TX: #{transactionId}</p>
                    <p className="text-sm text-slate-500 font-sans">Reservado: {bookingDate || new Date().toLocaleDateString('es-AR')}</p>
                    <p className="text-sm text-slate-500 font-sans">Impreso: {new Date().toLocaleDateString('es-AR')}</p>
                </div>
            </div>
            <div className="flex-1">
                <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl mb-8">
                    <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-widest border-b border-slate-200 pb-3 text-sm">Información de la Reserva</h3>
                    <div className="grid grid-cols-2 gap-y-6 text-lg font-sans">
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Profesional Asignado</span> <span className="font-medium text-slate-800">{doctorName}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Ubicación</span> <span className="font-medium text-slate-800">{location || 'Sede Central'}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Fecha</span> <span className="font-medium text-slate-800">{date}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Horario</span> <span className="font-medium text-slate-800">{time} hs</span></p>
                    </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl mb-8">
                    <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-widest border-b border-slate-200 pb-3 text-sm">Datos del Paciente</h3>
                    <div className="grid grid-cols-2 gap-y-6 text-lg font-sans">
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Nombre Completo</span> <span className="font-medium text-slate-800">{patientName}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Documento (DNI)</span> <span className="font-medium text-slate-800">{dni}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Cobertura Médica</span> <span className="font-medium text-slate-800 capitalize">{insurance || 'Atención Particular'}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Correo Electrónico</span> <span className="font-medium text-slate-800">{email}</span></p>
                    </div>
                </div>
                <div className="border-l-[3px] border-slate-900 pl-6 py-2 mt-12">
                    <p className="text-sm text-slate-700 italic font-sans leading-relaxed">
                        <strong>Aviso Importante:</strong> El paciente deberá anunciarse en recepción con al menos 15 minutos de antelación al horario pactado, 
                        presentando obligatoriamente su Documento Nacional de Identidad y la credencial física o virtual de su cobertura médica. 
                        Toda demora superior a 10 minutos podrá implicar la reasignación o cancelación del turno sin previo aviso.
                    </p>
                </div>
            </div>
            <div className="border-t border-slate-300 pt-6 text-justify text-[10px] text-slate-400 mt-auto font-sans">
                <p className="mb-3 leading-relaxed">
                    Este documento constituye un comprobante formal y válido de reserva de turno emitido por el Sistema de Atención Médica y Salud Argentina (SAMSA). 
                    Generado de manera electrónica y automatizada bajo el ID único mencionado. La institución se reserva el derecho de modificar o reprogramar el turno 
                    por razones de fuerza mayor, notificando previamente al paciente mediante los canales de contacto declarados. 
                </p>
                <p className="text-center font-bold tracking-[0.3em] uppercase mt-6 text-xs text-slate-800">
                    SAMSA - Excelencia en Salud Institucional
                </p>
            </div>
        </div>
    );
};
const ReviewModal = ({ isOpen, onClose, onSubmit, doctorName, initialRating = 0, initialComment = "" }) => {
    const [rating, setRating] = useState(initialRating);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState(initialComment);
    const [viewState, setViewState] = useState("form");
    useEffect(() => {
        if (isOpen) {
            setRating(initialRating);
            setComment(initialComment);
            setViewState("form");
        }
    }, [isOpen, initialRating, initialComment]);
    if (!isOpen) return null;
    const handleSubmit = () => {
        if (rating === 0) {
            alert("Por favor, seleccioná una calificación de estrellas.");
            return;
        }
        onSubmit(rating, comment);
        setViewState("success");
    };
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fadeIn p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-slideUp relative">
          {viewState === 'form' && (
            <>
                <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition z-10"><X className="w-6 h-6" /></button>
                <div className="bg-indigo-600 p-6 pt-8">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-200"/> Calificar Atención
                    </h3>
                    <p className="text-indigo-100 text-sm mt-1">Profesional: <strong>{doctorName}</strong></p>
                </div>
                <div className="p-8">
                    <p className="text-gray-600 text-center mb-6 font-medium">¿Cómo calificarías tu experiencia?</p>
                    <div className="flex justify-center gap-3 mb-8">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110 duration-200"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(rating)}
                            >
                                <Star className={`w-10 h-10 transition-colors ${star <= (hover || rating) ? "text-yellow-400 fill-yellow-400 drop-shadow-sm" : "text-gray-200"}`} />
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <textarea
                            className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none bg-gray-50 text-gray-700 text-sm transition-all"
                            rows="4"
                            placeholder="Escribí tu opinión aquí..."
                            value={comment}
                            maxLength={2000}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <div className={`text-right text-xs mt-1 font-medium ${comment.length >= 1900 ? 'text-red-500' : 'text-gray-400'}`}>{comment.length}/2000</div>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition">Cancelar</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition flex items-center gap-2">
                        <Send className="w-4 h-4" /> Enviar
                    </button>
                </div>
            </>
          )}
          {viewState === 'success' && (
            <div className="p-10 text-center flex flex-col items-center justify-center animate-fadeIn">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-green-50 rounded-full w-24 h-24 flex items-center justify-center shadow-inner">
                        <Heart className="w-12 h-12 text-green-600 fill-green-600 animate-bounce-slow" />
                    </div>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">¡Gracias por tu aporte!</h3>
                <p className="text-gray-600 mb-8 leading-relaxed text-sm">Tus comentarios ayudan a mejorar la calidad de atención de S.A.M.S.A.</p>
                <button onClick={onClose} className="px-8 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 shadow-lg transition w-full">Volver a Mis Turnos</button>
            </div>
          )}
        </div>
      </div>
    );
};
const MyTurns = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all"); 
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedTurnForReview, setSelectedTurnForReview] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTurnForCancel, setSelectedTurnForCancel] = useState(null);
  const [showCancelSuccessToast, setShowCancelSuccessToast] = useState(false);
  const [printAppointmentData, setPrintAppointmentData] = useState(null);
  const [appointments, setAppointments] = useState([
    { 
      id: 6, 
      specialty: "Dermatología", 
      doctor: "Dra. Emilse Romano", 
      doctorId: "laura-quiroga",
      date: "2025-11-20", 
      time: "10:00", 
      status: "finished", 
      location: "Consultorio 5",
      review: null 
    },
    { 
      id: 1, 
      specialty: "Clínica Médica", 
      doctor: "Dr. Rocha", 
      doctorId: "carlos-rodriguez",
      date: "2025-11-25", 
      time: "14:30", 
      status: "pending",
      location: "Consultorio 1 - Planta Baja",
      review: null 
    },
    { 
      id: 2, 
      specialty: "Cardiología", 
      doctor: "Dr. Jesús Zelarayan", 
      doctorId: "juan-perez",
      date: "2025-11-23", 
      time: "09:15", 
      status: "waiting",
      location: "Consultorio 4 - Piso 1",
      review: null 
    },
    { 
      id: 4, 
      specialty: "Nutrición", 
      doctor: "Lic. Paulina Quinteros", 
      doctorId: "agustina-vega",
      date: "2025-11-10", 
      time: "16:45", 
      status: "finished", 
      location: "Consultorio 8",
      review: { rating: 5, comment: "Excelente atención." } 
    },
    { 
        id: 5, 
        specialty: "Pediatría", 
        doctor: "Dra. Etna Herrera", 
        doctorId: "sofia-bermudez",
        date: "2025-08-01", 
        time: "10:00", 
        status: "cancelled",
        location: "Consultorio 3",
        review: null 
    },
  ]);
  const openReview = (appt) => {
      setSelectedTurnForReview(appt);
      setIsReviewModalOpen(true);
  };
  const handleSubmitReview = (rating, comment) => {
      setAppointments(prev => prev.map(app => 
          app.id === selectedTurnForReview.id ? { ...app, review: { rating, comment } } : app
      ));
  };
  const handleCancelTurnClick = (id) => {
      setSelectedTurnForCancel(id);
      setShowCancelModal(true);
  };
  const confirmCancelTurn = () => {
      if (selectedTurnForCancel) {
          setAppointments(prev => prev.map(app => 
              app.id === selectedTurnForCancel ? { ...app, status: 'cancelled' } : app
          ));
          setShowCancelModal(false);
          setSelectedTurnForCancel(null);
          setShowCancelSuccessToast(true);
          setTimeout(() => setShowCancelSuccessToast(false), 3000);
      }
  };
  const handlePrintReceipt = (app) => {
      const appDateObj = new Date(app.date + "T12:00:00");
      appDateObj.setDate(appDateObj.getDate() - 3);
      const fakeBookingDate = appDateObj.toLocaleDateString('es-AR');
      setPrintAppointmentData({
          doctorName: app.doctor,
          patientName: user ? `${user.name} ${user.lastname}` : "Paciente",
          dni: user?.dni || "No especificado",
          insurance: user?.insurance || "Particular",
          date: app.date,
          time: app.time,
          email: user?.email || "No especificado",
          location: app.location,
          bookingDate: fakeBookingDate
      });
      setTimeout(() => {
          const originalTitle = document.title;
          document.title = `samsa_turno_${app.date.replace(/-/g, '')}_${app.time.replace(':', '')}`;
          window.print();
          document.title = originalTitle;
          setTimeout(() => setPrintAppointmentData(null), 500);
      }, 100);
  };
  const filteredAppointments = appointments.filter(app => {
    if (filter === "upcoming") return ['pending', 'waiting', 'attending'].includes(app.status);
    if (filter === "history") return ['finished', 'cancelled'].includes(app.status);
    return true;
  });
  return (
    <div className="font-sans text-slate-800 bg-gray-50 min-h-screen print:bg-white">
      <div className="print:hidden">
        <Navbar />
      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleSubmitReview}
        doctorName={selectedTurnForReview?.doctor}
        initialRating={selectedTurnForReview?.review?.rating || 0}
        initialComment={selectedTurnForReview?.review?.comment || ""}
      />
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-blue-600" /> Mis Turnos
                </h1>
                <p className="mt-2 text-gray-500">Gestioná tus citas y revisá tu historial médico.</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-center">
                {['all', 'upcoming', 'history'].map((f) => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition capitalize ${filter === f ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {f === 'all' ? 'Todos' : f === 'upcoming' ? 'Próximos' : 'Historial'}
                    </button>
                ))}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-6">
            {filteredAppointments.map((app) => {
                const statusStyles = {
                    pending:   { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock, label: 'Pendiente' },
                    waiting:   { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Timer, label: 'En Espera' },
                    attending: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Stethoscope, label: 'En Proceso' },
                    finished:  { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Finalizado' },
                    cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Cancelado' },
                };
                const currentStatus = statusStyles[app.status] || statusStyles.pending;
                const StatusIcon = currentStatus.icon;
                return (
                    <div key={app.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all ${app.status === 'attending' ? 'ring-2 ring-indigo-400' : ''}`}>
                        <div className="p-6 flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex gap-5">
                                <div className={`flex flex-col items-center justify-center rounded-xl w-16 h-16 border flex-shrink-0 ${app.status === 'finished' || app.status === 'cancelled' ? 'bg-gray-50 border-gray-200 text-gray-400' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                    <span className="text-xs font-bold uppercase">{new Date(app.date).toLocaleString('es-ES', { month: 'short' })}</span>
                                    <span className="text-2xl font-extrabold">{new Date(app.date).getDate() + 1}</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{app.specialty}</h3>
                                    <p className="text-blue-600 font-medium text-sm flex items-center gap-1 mt-1">
                                        <User className="w-4 h-4" /> 
                                        <Link to={`/professionals/${app.doctorId}`} className="hover:underline hover:text-blue-800 transition-all">
                                            {app.doctor}
                                        </Link>
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm mt-3">
                                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100"><Clock className="w-3.5 h-3.5" /> {app.time} hs</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {app.location}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-start md:items-end justify-between gap-2 min-w-[160px]">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${currentStatus.color}`}>
                                        <StatusIcon className="w-3 h-3 mr-1.5" /> {currentStatus.label}
                                    </span>
                                    {app.status !== 'cancelled' && (
                                        <button onClick={() => handlePrintReceipt(app)} className="text-gray-400 hover:text-blue-600 transition p-1.5 rounded-full hover:bg-blue-50" title="Descargar comprobante">
                                            <Download className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                                <div className="mt-2">
                                    {app.status === 'pending' && (
                                        <button onClick={() => handleCancelTurnClick(app.id)} className="text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition">
                                            Cancelar Turno
                                        </button>
                                    )}
                                    {app.status === 'waiting' && <span className="text-orange-600 text-xs font-bold animate-pulse">¡Estás próximo a pasar!</span>}
                                    {app.status === 'attending' && <span className="text-indigo-600 text-xs font-bold">Siendo atendido...</span>}
                                    {app.status === 'finished' && (
                                        !app.review ? (
                                            <button onClick={() => openReview(app)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-sm">
                                                <MessageSquare className="w-4 h-4"/> Opinar
                                            </button>
                                        ) : (
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < app.review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Opinión guardada</span>
                                                    <button onClick={() => openReview(app)} className="text-xs text-yellow-600 font-bold hover:text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200 transition">Modificar</button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={`h-1.5 w-full ${
                            app.status === 'pending' ? 'bg-blue-400' : 
                            app.status === 'waiting' ? 'bg-orange-400' :
                            app.status === 'attending' ? 'bg-indigo-500' :
                            app.status === 'finished' ? 'bg-green-500' : 'bg-red-400'
                        }`}></div>
                    </div>
                );
            })}
        </div>
      </div>
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <button onClick={() => setShowCancelModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">¿Cancelar Turno?</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                ¿Estás seguro de que deseas cancelar este turno? Esta acción no se puede deshacer y perderás tu lugar.
              </p>
              <div className="flex flex-col gap-3">
                 <button onClick={confirmCancelTurn} className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all transform active:scale-95">
                    Sí, cancelar turno
                 </button>
                <button onClick={() => setShowCancelModal(false)} className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                  No, mantener turno
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCancelSuccessToast && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in duration-300 flex items-center gap-4 max-w-sm w-full">
            <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
            <div className="bg-green-100 rounded-full p-2 ml-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-bold text-lg">Turno cancelado</p>
              <p className="text-gray-500 text-sm mt-1">El turno se canceló correctamente.</p>
            </div>
            <button onClick={() => setShowCancelSuccessToast(false)} className="text-gray-400 hover:text-gray-600 absolute top-4 right-4">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      </div>
      {printAppointmentData && (
          <PrintReceipt appointmentData={printAppointmentData} />
      )}
    </div>
  );
};
export default MyTurns;