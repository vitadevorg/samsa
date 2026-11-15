# Nuevo logo de SAMSA (`style/nuevo-logo`)

Reemplazo del logo de corazón (ícono `HeartPulse` / `Heart` de lucide) por el nuevo símbolo de marca de SAMSA en SVG.

## Qué se implementó

- **Componente `SamsaLogo`** (`src/components/SamsaLogo.jsx`): dibuja el símbolo como SVG en línea, así que se ve nítido en cualquier tamaño y densidad de pantalla.
  - Proporción fija 128 × 103: se usa con alto (`h-*`) y `w-auto`.
  - `variant="color"` (por defecto): degradé azul de marca (`#2563EB` → `#1D4ED8` → `#4338CA`), alineado con la paleta del design system (`blue-600`, `blue-700`, `indigo-700`).
  - `variant="mono"`: toma el color del texto (`currentColor`), para los encabezados de impresión en blanco y negro.
  - Cada instancia genera un id de degradé único (`useId`). Así, si dos logos conviven en la página y uno está oculto (por ejemplo, en un bloque solo de impresión), el otro no pierde el color.
  - Es decorativo por defecto (`aria-hidden`), porque siempre va junto al nombre "SAMSA". Con la prop `title` se anuncia a lectores de pantalla.
- **Dónde se reemplazó el logo:**
  - **Navbar:** el cuadrado celeste con el corazón pasa a ser el símbolo (36 px de alto) junto a "S.A.M.S.A". Se mantiene el efecto de escala al pasar el mouse.
  - **Footer:** en el tema oscuro el símbolo va sobre una placa blanca para conservar el contraste; en el tema claro va directo.
  - **Intro de la Home:** el símbolo grande conserva la animación `animate-heartbeat-intro`.
  - **Encabezados de impresión** (comprobantes `PrintReceipt`, informe de estudios, protocolos impresos): símbolo monocromo `slate-900`, igual que el estilo serif del membrete.
  - **Visor de protocolos del médico** ("Biblioteca Médica SAMSA") y **ficha impresa del paciente**: símbolo a color.
  - **Favicon** (`public/favicon.svg`): se reemplazó por el SVG del nuevo símbolo. El README ya lo usa como logo de portada, así que también se actualiza. En `index.html` el enlace pasó a `/favicon.svg?v=2`: los navegadores guardan el favicon en caché por su URL, y sin el cambio seguían mostrando el corazón viejo.
- **Sin cambios de funcionalidad:** no se tocaron rutas, lógica ni otros íconos. Los usos de `HeartPulse` que no son el logo (especialidad Cardiología en Estudios, ícono del rol paciente en el perfil, decoraciones del registro y de la sección B2B) siguen igual.

## Archivos clave tocados

| Archivo | Cambio |
| --- | --- |
| `src/components/SamsaLogo.jsx` (nuevo) | Componente del símbolo. |
| `public/favicon.svg`, `index.html` | Nuevo favicon y versión en su URL para saltear la caché. |
| `src/components/Navbar.jsx`, `src/components/Footer.jsx` | Logo de la cabecera y del pie. |
| `src/pages/Home.jsx` | Logo de la intro animada. |
| `src/components/PrintReceipt.jsx`, `src/pages/Studies.jsx`, `src/pages/doctor/DoctorProtocols.jsx`, `src/pages/doctor/DoctorPatients.jsx` | Logo de los membretes y del visor de protocolos. |

## Validación

Automática:

- `npm run lint` → sin errores.
- `npm run build` → compila limpio.

Manual local (`npm run dev`):

1. Home con la intro: el nuevo símbolo aparece con la animación de entrada y luego queda en la Navbar.
2. Navbar: el símbolo se ve nítido junto a "S.A.M.S.A" (45 × 36 px) y escala al pasar el mouse.
3. Footer oscuro: el símbolo se lee sobre la placa blanca.
4. Pestaña del navegador: muestra el nuevo favicon.
5. Paciente demo (`paciente@samsa.med`) → Estudios → vista previa de un informe: el membrete muestra el símbolo monocromo (60 × 48 px).
6. Con varios logos en la misma página, cada degradé tiene un id distinto.

Responsive (sin scroll horizontal):

| Ancho | Resultado |
| --- | --- |
| 375 px (mobile) | El logo y el nombre terminan en 183 px; el menú hamburguesa empieza en 319 px, sin solaparse. |
| 768 px (tablet) | Navbar y Footer correctos. |
| 1440 px (desktop) | Navbar, Footer e intro correctos. |

No probado: la impresión real a papel o PDF de comprobantes y protocolos (solo se revisó la vista previa del informe de estudios).
