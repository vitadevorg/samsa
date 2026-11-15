import React, { useId, useRef, useState } from 'react';
import { X, PenSquare, ImagePlus, Trash2, Send, Save, AlertCircle } from 'lucide-react';
import {
  FORUM_CATEGORIES, TITLE_MAX, BODY_MAX, MAX_IMAGE_BYTES, EMPTY_POST, validatePost,
} from './forumPosts';

// Formulario para publicar una nota nueva o editar una propia.
// No se cierra con click afuera ni con Escape: así un click accidental no borra el borrador.
const ForumPostModal = ({ post, onCancel, onSubmit }) => {
  const fieldId = useId();
  const fileInputRef = useRef(null);
  const isEditing = Boolean(post);
  const [form, setForm] = useState(() => (post
    ? { title: post.title, category: post.category, body: post.body, image: post.image }
    : EMPTY_POST));
  const [errors, setErrors] = useState({});

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'El archivo tiene que ser una imagen (JPG, PNG o WebP).' }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((prev) => ({ ...prev, image: 'La imagen no puede pesar más de 2 MB.' }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => update('image', reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validatePost(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit({ title: form.title.trim(), category: form.category, body: form.body.trim(), image: form.image });
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl border bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-gray-800 shadow-sm transition-all';
  const errorClass = 'border-red-400 bg-red-50 focus:ring-red-100';
  const labelClass = 'text-sm font-semibold text-gray-600 mb-1 block';
  const errorText = (name) => errors[name] && (
    <p id={`${fieldId}-${name}-error`} role="alert" className="text-xs text-red-600 font-medium mt-1">{errors[name]}</p>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${fieldId}-title`}
      className="fixed inset-0 z-[100] flex justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-fadeIn"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl border border-gray-100 w-full max-w-2xl my-auto overflow-hidden animate-slideUp"
      >
        <div className="px-5 py-4 sm:px-8 sm:py-6 flex justify-between items-start gap-4 border-b border-gray-100">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
              <PenSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 id={`${fieldId}-title`} className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                {isEditing ? 'Editar publicación' : 'Nueva publicación'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Se publica en el Foro de Novedades con tu nombre.</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} aria-label="Cerrar" className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-8 sm:py-6 space-y-5">
          <div>
            <label htmlFor={`${fieldId}-titulo`} className={labelClass}>Título</label>
            <input
              id={`${fieldId}-titulo`}
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              maxLength={TITLE_MAX}
              placeholder="Ej.: Cómo prevenir golpes de calor"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={`${fieldId}-title-error`}
              className={`${inputClass} ${errors.title ? errorClass : ''}`}
            />
            {errorText('title')}
          </div>

          <div>
            <label htmlFor={`${fieldId}-categoria`} className={labelClass}>Categoría</label>
            <select
              id={`${fieldId}-categoria`}
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              aria-invalid={Boolean(errors.category)}
              aria-describedby={`${fieldId}-category-error`}
              className={`${inputClass} cursor-pointer ${errors.category ? errorClass : ''}`}
            >
              <option value="" disabled>Elegí una categoría</option>
              {FORUM_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            {errorText('category')}
          </div>

          <div>
            <span className={labelClass}>Imagen de portada <span className="font-normal text-gray-400">(opcional)</span></span>
            {form.image ? (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200">
                <img src={form.image} alt="Portada de la publicación" className="w-full h-40 sm:h-48 object-cover" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button type="button" onClick={() => fileInputRef.current.click()} className="px-3 py-2 bg-white/90 backdrop-blur-md text-gray-700 text-sm font-bold rounded-xl hover:bg-white shadow-sm transition">
                    Cambiar
                  </button>
                  <button type="button" onClick={() => update('image', null)} aria-label="Quitar imagen" title="Quitar imagen" className="p-2 bg-white/90 backdrop-blur-md text-gray-700 rounded-xl hover:text-red-600 hover:bg-white shadow-sm transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="w-full h-28 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 transition flex flex-col items-center justify-center gap-1.5 font-semibold text-sm"
              >
                <ImagePlus className="w-6 h-6" />
                Subir imagen (JPG, PNG o WebP, hasta 2 MB)
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImage} accept="image/*" className="hidden" />
            {errors.image && (
              <p role="alert" className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.image}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={`${fieldId}-contenido`} className={labelClass}>Contenido</label>
            <textarea
              id={`${fieldId}-contenido`}
              value={form.body}
              onChange={(e) => update('body', e.target.value)}
              maxLength={BODY_MAX}
              rows={8}
              placeholder="Escribí la nota. Dejá una línea en blanco para separar párrafos."
              aria-invalid={Boolean(errors.body)}
              aria-describedby={`${fieldId}-body-error`}
              className={`${inputClass} resize-y min-h-[10rem] leading-relaxed ${errors.body ? errorClass : ''}`}
            />
            <div className="flex justify-between gap-3">
              <div>{errorText('body')}</div>
              <p className="text-xs text-gray-400 mt-1 shrink-0">{form.body.trim().length} / {BODY_MAX}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 sm:px-8 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button type="button" onClick={onCancel} className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition">
            Cancelar
          </button>
          <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition">
            {isEditing ? <><Save className="w-4 h-4" /> Guardar cambios</> : <><Send className="w-4 h-4" /> Publicar</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForumPostModal;
