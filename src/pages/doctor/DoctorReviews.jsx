import React, { useId, useState } from 'react';
import { Star, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

const PAGE_SIZE = 3;
const LONG_REVIEW_CHARS = 160;
const SORTS = {
  recent: { label: 'Más recientes', compare: (a, b) => b.date.localeCompare(a.date) },
  best: { label: 'Mejor puntaje', compare: (a, b) => b.stars - a.stars || b.date.localeCompare(a.date) },
  worst: { label: 'Menor puntaje', compare: (a, b) => a.stars - b.stars || b.date.localeCompare(a.date) },
};

// "2026-07-22" -> "22/07/2026" (sin pasar por Date para que el huso horario no corra el día).
const formatReviewDate = (iso) => iso.split('-').reverse().join('/');

// Cinco estrellas; `value` puede ser decimal (4.6 llena 4 y el 60 % de la quinta).
const Stars = ({ value, size = 'w-5 h-5', label }) => (
  <span className="inline-flex items-center gap-0.5" role="img" aria-label={label ?? `${value} de 5 estrellas`}>
    {Array.from({ length: 5 }, (_, i) => {
      const fill = Math.max(0, Math.min(1, value - i));
      return (
        <span key={i} className={`relative inline-block ${size}`} aria-hidden="true">
          <Star className={`absolute inset-0 ${size} text-slate-200 fill-slate-200`} />
          <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
            <Star className={`${size} text-amber-400 fill-amber-400`} />
          </span>
        </span>
      );
    })}
  </span>
);

const ReviewItem = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.text.length > LONG_REVIEW_CHARS;
  return (
    <li className="p-4 sm:p-5 rounded-2xl border border-gray-100 bg-gray-50/60 min-w-0 animate-fadeIn">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0" aria-hidden="true">
          {review.user.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="font-bold text-gray-900 break-words">{review.user}</p>
            <p className="text-xs text-gray-400 shrink-0">{formatReviewDate(review.date)}</p>
          </div>
          <Stars value={review.stars} size="w-4 h-4" label={`${review.stars} de 5 estrellas`} />
          <p className={`mt-2 text-sm text-gray-600 leading-relaxed break-words ${!expanded && isLong ? 'line-clamp-3' : ''}`}>{review.text}</p>
          {isLong && (
            <button type="button" onClick={() => setExpanded((v) => !v)} className="mt-1 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 py-1">
              {expanded ? <>Ver menos <ChevronUp className="w-3 h-3" /></> : <>Leer completa <ChevronDown className="w-3 h-3" /></>}
            </button>
          )}
        </div>
      </div>
    </li>
  );
};

// Reseñas que los pacientes le dejaron al médico, con su puntaje promedio. Solo lectura:
// el médico no puede responder, editar ni borrar reseñas.
// - `rating`: promedio total (sobre todas las reseñas, `reviewsCount`).
// - `reviews`: las reseñas con texto que tiene cargadas el perfil.
const DoctorReviews = ({ rating, reviewsCount, reviews = [], className = '' }) => {
  const fieldId = useId();
  const [sort, setSort] = useState('recent');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const total = reviewsCount ?? reviews.length;
  const average = rating ?? (reviews.length ? reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length : 0);
  const sorted = [...reviews].sort(SORTS[sort].compare);
  const shown = sorted.slice(0, visible);
  const remaining = sorted.length - shown.length;

  return (
    <section className={className} aria-labelledby={`${fieldId}-titulo`}>
      <h2 id={`${fieldId}-titulo`} className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-600" /> Reseñas de pacientes
      </h2>
      <p className="text-sm text-gray-500 mt-1 mb-5">Lo que opinan los pacientes que atendiste. Las ven también en tu perfil público.</p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/80 to-white border border-amber-100 mb-5">
        <p className="font-mono tracking-tighter font-bold text-4xl sm:text-5xl text-gray-900 leading-none">
          {average.toFixed(1)}<span className="text-lg sm:text-xl text-gray-400 font-sans tracking-normal">/5</span>
        </p>
        <div className="space-y-1">
          <Stars value={average} size="w-6 h-6" label={`Puntaje promedio: ${average.toFixed(1)} de 5 estrellas`} />
          <p className="text-sm font-semibold text-gray-600">
            {total === 0 ? 'Todavía no tenés reseñas' : `${total.toLocaleString('es-AR')} ${total === 1 ? 'reseña' : 'reseñas'}`}
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center">
          Cuando tus pacientes te dejen reseñas, las vas a ver acá.
        </p>
      ) : (<>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-sm text-gray-500">Mostrando {shown.length} de {sorted.length} con comentario</p>
          <label htmlFor={`${fieldId}-orden`} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            Ordenar
            <select
              id={`${fieldId}-orden`}
              value={sort}
              onChange={(e) => { setSort(e.target.value); setVisible(PAGE_SIZE); }}
              className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none"
            >
              {Object.entries(SORTS).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
        </div>
        <ul className="space-y-3">
          {shown.map((review) => <ReviewItem key={review.id} review={review} />)}
        </ul>
        {(remaining > 0 || visible > PAGE_SIZE) && (
          <div className="mt-4 flex justify-center">
            {remaining > 0 ? (
              <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 font-semibold transition-colors w-full sm:w-auto">
                <ChevronDown className="w-4 h-4" /> Ver más reseñas ({remaining})
              </button>
            ) : (
              <button type="button" onClick={() => setVisible(PAGE_SIZE)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-semibold transition-colors w-full sm:w-auto">
                <ChevronUp className="w-4 h-4" /> Ver menos
              </button>
            )}
          </div>
        )}
      </>)}
    </section>
  );
};

export default DoctorReviews;
