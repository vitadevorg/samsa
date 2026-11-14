# Aceptación de Términos y Condiciones

Rama: `feature/aceptacion-de-terminos`

## Qué se implementó

* Un **texto legal propio por pantalla** (Términos y Condiciones + Política de Privacidad). Los textos viven en `src/data/legalTexts.js` y se muestran en una **ventana flotante** (`src/components/LegalModal.jsx`), sin salir de la pantalla ni perder lo cargado en el formulario.
* `LegalModal`: usa los mismos estilos de los modales de la app (fondo `bg-slate-900/60` con `backdrop-blur-sm`, panel `rounded-3xl` con `shadow-2xl`, animaciones `fadeIn`/`scaleIn`). Variante clara y oscura (`dark`, igual que la solicitud de adhesión profesional). Se monta en `<body>` por encima de otros modales, bloquea el scroll de fondo y se cierra con la X, un clic afuera o la tecla Esc.
* Componente reutilizable `TermsCheckbox`: check **siempre desmarcado al abrir** la pantalla, con **un único link** a "los Términos y Condiciones y la Política de Privacidad" que abre la ventana flotante.
* En cada pantalla donde la persona carga sus propios datos personales, el botón para avanzar queda **deshabilitado hasta marcar el check** (y el handler además ignora el envío si no está marcado).
* En el turno sin registro se agrega, debajo de los botones, el aviso: "Tus datos se usan únicamente para gestionar este turno. No creamos una cuenta. Podés pedir su eliminación en vitadev.org@gmail.com."

### Pantallas con el check

| Pantalla | Ruta / origen | Texto legal (clave en `legalTexts.js`) | Qué bloquea |
|----------|---------------|----------------------------------------|-------------|
| Registro de usuario | `/register` (`Register.jsx`) | `registro` | Botón "Crear Cuenta" |
| Reserva de turno sin registro (paso 2 "Datos del Paciente") | `/book-appointment/:id` (`BookAppointment.jsx`) | `turno-invitado` | Botón "Continuar" |
| Solicitud de adhesión profesional (paso 1 "Datos Personales y Contacto") | Modal `ProfessionalApplicationModal.jsx`, desde la sección B2B de la Home | `profesional` | Botón "Siguiente" |

### Pantallas revisadas y no modificadas

* **Reserva de turno logueado**: usa los datos del perfil, que ya se aceptaron al registrarse.
* **Mi Perfil (`UserProfile`)**: edición de una cuenta ya aceptada.
* **Login, recuperar y resetear contraseña**: no cargan datos personales nuevos.
* **Altas de pacientes/médicos/secretarias por personal** (`DoctorPatients`, `SecretaryPatients`, `NewTurnModal`, paneles de Clínica, Admin y VitaDev): el dato lo carga un tercero, no el titular.

## Decisiones de contenido

* Contacto de privacidad y de baja: `vitadev.org@gmail.com`.
* Turno confirmado por correo electrónico; cancelación o reprogramación hasta 24 hs antes; jurisdicción: tribunales ordinarios de la Provincia de Tucumán.
* Conservación: cuenta 30 días tras la baja; turno de invitado 6 meses; registros de seguridad 6 meses; facturación 10 años (si corresponde); profesional rechazado 6 meses y aprobado 5 años tras la baja (estos dos últimos son una propuesta a validar).
* Los textos son un **borrador sujeto a revisión legal** antes de publicar.
* Por ahora la aceptación no se persiste (no hay backend): solo se exige marcarla para avanzar.

## Cambio de enfoque: ventana flotante en lugar de pestaña nueva

Antes el link abría `/terms/:slug` en otra pestaña. Eso fallaba con "la página no existe" en Vercel (carga directa de una ruta de la SPA sin regla de reescritura). Se reemplazó por una ventana flotante: no depende de rutas, no se pierde el formulario y no requiere configuración extra, por lo que se eliminaron la página `LegalDocument.jsx`, la ruta `/terms/:slug` y `vercel.json`.

## Archivos clave tocados

* `src/data/legalTexts.js` (nuevo)
* `src/components/LegalModal.jsx` (nuevo)
* `src/components/TermsCheckbox.jsx` (nuevo)
* `src/pages/Register.jsx`
* `src/pages/BookAppointment.jsx`
* `src/components/ProfessionalApplicationModal.jsx`

## Validación

Automática:
* `npm run lint`
* `npm run build`

Manual (`npm run dev`, Desktop, Tablet y Mobile):
1. `/register`: "Crear Cuenta" deshabilitado con el check desmarcado; marcarlo lo habilita y desmarcarlo lo vuelve a bloquear.
2. En `/register`, el link abre la ventana flotante con el texto de registro; se cierra con la X, un clic afuera y Esc; el formulario conserva lo cargado y el check no cambia al abrir o cerrar la ventana.
3. Sin sesión, `/book-appointment/<id>` → elegir fecha y hora → "Siguiente Paso": "Continuar" deshabilitado hasta marcar el check; se ve el aviso de datos debajo de los botones; el link abre el texto del turno sin registro.
4. Con sesión iniciada, la reserva no muestra el check.
5. Home → sección profesionales → solicitud de adhesión: "Siguiente" del paso 1 deshabilitado hasta marcar el check; el link abre la ventana (variante oscura) por encima de la solicitud, y al cerrarla la solicitud sigue abierta con sus datos.
6. La ventana tiene scroll interno cuando el texto es largo y no genera scroll horizontal.
