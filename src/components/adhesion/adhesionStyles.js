// Clases del formulario oscuro de la solicitud de adhesión (mismo estilo que la sección B2B de la Home).

export const labelClass = 'block text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider mb-2';

export const inputClass = (hasError) => `w-full min-h-[48px] bg-slate-950 border rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-colors [color-scheme:dark] ${hasError
  ? 'border-red-500 focus:border-red-400 focus:ring-red-500/20'
  : 'border-slate-800 hover:border-slate-700 focus:border-blue-500 focus:ring-blue-500/30'}`;
