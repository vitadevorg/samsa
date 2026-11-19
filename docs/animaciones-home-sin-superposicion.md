# Animaciones de la Home sin superposición

Rama: `style/responsive-general`

## Qué se implementó

Se corrigieron animaciones que se pisaban en la pantalla de inicio de un usuario no logueado (`/`):

- **Intro vs. hero:** las apariciones (`Reveal`) del hero se disparaban mientras la intro cubría la pantalla, por lo que terminaban antes de verse. Ahora se pausan con `RevealGateContext` hasta que la intro termina. La intro se desmonta a los 3,9 s, para que su fundido de 1 s no se corte.
- **Imagen del hero en mobile/tablet:** aparecía de golpe con el texto en pleno efecto. Ahora entra con `Reveal` (delay 300 ms), entre el título y la bajada.
- **`Reveal`:** la transición pasó de `all` a `opacity` y `transform`, para no interferir con otras propiedades animadas de los hijos.
- **Sección profesionales (B2B):** la tarjeta flotante "Nuevos Pacientes" combinaba `-translate-y-1/2` con `animate-float`, y la animación pisaba el desplazamiento, así que se descentraba y tapaba contenido. Ahora el desplazamiento está en un contenedor y solo se muestra desde `xl`. "Nuevo turno reservado" se oculta en mobile, donde tapaba el botón "Reservar Turno".
- **Tarjetas de gráficos de la sección profesionales:** tenían altura fija (`h-72`) y en mobile el contenido ocupaba más, por lo que el porcentaje "85%" de "Origen de los turnos" se pisaba con el título. Ahora usan `min-h-[18rem]`, padding reducido en mobile, etiquetas centradas y el encabezado de "Ocupación de Consultorios" puede envolver.
- **Botón "Reservar Turno"** de la tarjeta de ejemplo de la sección profesionales: era un `<button>` sin acción. Ahora es un enlace a `/turns`.

## Archivos clave tocados

- `src/components/Reveal.jsx`
- `src/context/reveal-gate-context.js` (nuevo)
- `src/pages/Home.jsx`
- `src/components/ProfessionalB2BSection.jsx`

## Validación

Automática:
- `npm run lint`: sin errores.
- `npm run build`: compila limpio.

Manual (`npm run dev`, sesión sin login, `sessionStorage` vacío para ver la intro):
1. Recargar `/`: durante la intro el hero permanece oculto y aparece escalonado al terminar.
2. Bajar a "Para Profesionales de la Salud": las tarjetas flotantes no tapan el texto de la tarjeta principal.

Anchos revisados: mobile 360 y 375 px (sin scroll horizontal ni contenido fuera de las tarjetas) y desktop. **Pendiente: tablet (~768 px).**
