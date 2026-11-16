import React from 'react';
import FadeIn from './FadeIn';

// Encabezado de página con el estilo de las pestañas principales de SAMSA (Foro, Profesionales...):
// etiqueta chica con ícono arriba y título grande, con la misma aparición suave (FadeIn). `actions` va a la derecha en pantallas grandes.
const PageHeader = ({ icon: Icon, eyebrow, title, description, actions }) => (
  <FadeIn className="relative z-10 mb-8 sm:mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-blue-100 p-2 rounded-xl">
          <Icon className="w-6 h-6 text-blue-700" />
        </div>
        <span className="font-black tracking-widest uppercase text-sm text-blue-700">{eyebrow}</span>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight">{title}</h1>
      {description && <p className="text-slate-500 mt-4 text-base sm:text-lg max-w-2xl">{description}</p>}
    </div>
    {actions}
  </FadeIn>
);

export default PageHeader;
