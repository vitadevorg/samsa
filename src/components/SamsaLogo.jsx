import React, { useId } from 'react';

// Símbolo de SAMSA (vectorial: se ve nítido en cualquier tamaño y densidad de pantalla).
// - Proporción fija de 128 × 103: dale solo el alto (h-*) y `w-auto`, o solo el ancho.
// - `variant="color"` usa el degradé azul de marca; `variant="mono"` toma el color del texto
//   (`currentColor`), útil para los encabezados de impresión en blanco y negro.
// - Es decorativo por defecto (al lado siempre va el nombre "SAMSA"); si se usa solo,
//   pasar `title` para que los lectores de pantalla lo anuncien.
const SamsaLogo = ({ className = '', variant = 'color', title, style }) => {
  // Id único por instancia: si dos logos comparten el id del degradé y el primero está
  // oculto (por ejemplo, en un bloque solo de impresión), el segundo se vería sin color.
  const gradientId = `samsa-logo-${useId().replace(/:/g, '')}`;
  const fill = variant === 'mono' ? 'currentColor' : `url(#${gradientId})`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="23 4 128 103"
      className={className}
      style={style}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {variant !== 'mono' && (
        <defs>
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="25" y1="7" x2="149" y2="106">
            <stop offset="0" stopColor="#2563EB" />
            <stop offset=".58" stopColor="#1D4ED8" />
            <stop offset="1" stopColor="#4338CA" />
          </linearGradient>
        </defs>
      )}
      <path fill={fill} d="M148 7H89C63 7 42 20 37 40c-5 17 6 30 24 30h12c-9-5-14-12-14-20 0-12 10-22 24-22h45c2 0 4-1 5-3Z" />
      <path fill={fill} d="M102 38h9c22 0 37 15 33 34-4 20-25 32-49 32H26l15-18c2-3 5-4 8-4h44c14 0 24-10 24-22 0-9-6-17-15-22Z" />
      <path fill={fill} d="M86 39h7a3 3 0 0 1 3 3v7h8a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-8v7a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3v-7h-8a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3h8v-7a3 3 0 0 1 3-3Z" />
    </svg>
  );
};

export default SamsaLogo;
