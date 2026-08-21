import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Star, MessageSquare, Edit2, Trash2, Calendar, MapPin, Search, AlertCircle, X, AlertTriangle, CheckCircle } from 'lucide-react';

const mockReviews = [
  {
    id: 1,
    doctor: "Dr. Carlos San Martín",
    specialty: "Cardiología",
    location: "Sede Central",
    date: "15/07/2026",
    rating: 5,
    comment: "Excelente atención. Muy claro al explicar los estudios y el tratamiento a seguir. Me sentí muy contenido.",
  },
  {
    id: 2,
    doctor: "Dra. Lucía Fernández",
    specialty: "Dermatología",
    location: "Sucursal Norte",
    date: "03/05/2026",
    rating: 4,
    comment: "La atención de la doctora fue muy buena, aunque tuve que esperar 20 minutos en la sala de espera.",
  },
  {
    id: 3,
    doctor: "Dr. Marcelo Quirós",
    specialty: "Traumatología",
    location: "Sede Central",
    date: "10/01/2026",
    rating: 5,
    comment: "Un profesional impecable. Diagnóstico rápido y certero para mi esguince de tobillo.",
  }
];

const MyReviews = () => {
  const [reviews, setReviews] = useState(mockReviews);
  const [searchTerm, setSearchTerm] = useState('');

  const [editingReview, setEditingReview] = useState(null);
  const [confirmingEdit, setConfirmingEdit] = useState(false);
  const [deletingReview, setDeletingReview] = useState(null);
  const [editFormData, setEditFormData] = useState({ rating: 0, comment: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const filteredReviews = reviews.filter(r => 
    r.doctor.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    setDeletingReview(reviews.find(r => r.id === id));
  };

  const confirmDelete = () => {
    setReviews(reviews.filter(r => r.id !== deletingReview.id));
    setDeletingReview(null);
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setEditFormData({ rating: review.rating, comment: review.comment });
  };

  const handleSaveClick = () => {
    setConfirmingEdit(true);
  };

  const executeSaveEdit = () => {
    setReviews(reviews.map(r => r.id === editingReview.id ? { ...r, ...editFormData } : r));
    setEditingReview(null);
    setConfirmingEdit(false);
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 2500);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`w-5 h-5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} 
      />
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            <div className="relative z-10 w-full md:w-auto text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 text-amber-600 mb-3">
                    <div className="bg-amber-100 p-2 rounded-xl">
                        <MessageSquare className="w-5 h-5 text-amber-700" />
                    </div>
                    <span className="font-black tracking-widest uppercase text-xs text-amber-700/80">Historial de Calificaciones</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Mis Reseñas</h1>
                <p className="text-slate-500 mt-2 font-medium">Gestioná las calificaciones y comentarios que dejaste a nuestros profesionales.</p>
            </div>

            <div className="relative w-full md:w-96 z-10 mt-4 md:mt-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                    type="text"
                    placeholder="Buscar por médico o especialidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium text-slate-700"
                />
            </div>
        </div>

        <div className="space-y-6">
          {filteredReviews.map(review => (
            <div key={review.id} className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">

              <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">

                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-blue-50 text-blue-700 p-3 rounded-2xl">
                            <Star className="w-6 h-6 fill-current" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{review.doctor}</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{review.specialty}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {review.date}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {review.location}</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                        <div className="flex gap-1 mb-3">
                            {renderStars(review.rating)}
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium italic">"{review.comment}"</p>
                    </div>
                </div>

                <div className="flex md:flex-col gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                    <button 
                        onClick={() => handleEdit(review)} 
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl transition-colors"
                    >
                        <Edit2 className="w-4 h-4" /> Editar
                    </button>
                    <button 
                        onClick={() => handleDelete(review.id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors"
                    >
                        <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm mt-6">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-slate-100 shadow-inner">
              <AlertCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">No se encontraron reseñas</h3>
            <p className="text-slate-500 font-medium">No tenés reseñas con esos criterios de búsqueda.</p>
          </div>
        )}

      </main>

      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-slideUp">
            <div className="bg-orange-500 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <Edit2 className="w-6 h-6" />
                <h3 className="font-bold text-lg">Editar Reseña</h3>
              </div>
              <button onClick={() => setEditingReview(null)} className="hover:bg-orange-600 p-1.5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 md:p-8 space-y-6">
              <div className="mb-4">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{editingReview.specialty}</p>
                <p className="text-lg font-bold text-slate-800">{editingReview.doctor}</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Calificación</label>
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setEditFormData({...editFormData, rating: i + 1})}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star className={`w-8 h-8 ${i < editFormData.rating ? 'text-orange-400 fill-orange-400' : 'text-slate-200 fill-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Comentario</label>
                <textarea 
                  value={editFormData.comment}
                  onChange={(e) => setEditFormData({...editFormData, comment: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none h-32"
                  placeholder="Escribí tu experiencia..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => setEditingReview(null)} className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-xl transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSaveClick} className="flex-1 py-3 px-4 bg-orange-500 text-white hover:bg-orange-600 font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/30">
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmingEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-slideUp text-center p-8">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">¿Modificar reseña?</h3>
            <p className="text-slate-500 font-medium mb-8">
              Estás a punto de alterar tu calificación pública para <strong>{editingReview?.doctor}</strong>. ¿Estás seguro de guardar estos cambios?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmingEdit(false)} className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-xl transition-colors">
                Revisar
              </button>
              <button onClick={executeSaveEdit} className="flex-1 py-3 px-4 bg-amber-500 text-white hover:bg-amber-600 font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/30">
                Sí, Modificar
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-slideUp text-center p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">¿Eliminar reseña?</h3>
            <p className="text-slate-500 font-medium mb-8">
              Estás a punto de eliminar tu calificación para <strong>{deletingReview.doctor}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingReview(null)} className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="flex-1 py-3 px-4 bg-red-600 text-white hover:bg-red-700 font-bold rounded-xl transition-colors shadow-lg shadow-red-600/30">
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-slideUp text-center p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">¡Cambios Guardados!</h3>
            <p className="text-slate-500 font-medium">Tu reseña fue actualizada con éxito.</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyReviews;
