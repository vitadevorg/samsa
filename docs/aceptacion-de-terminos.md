# Aceptación de Términos y Condiciones

Rama: `feature/aceptacion-de-terminos`

## Qué se implementó

* Un **texto legal propio por pantalla** (Términos y Condiciones + Política de Privacidad), publicado en una página independiente: `/terms/:slug`. Los textos viven en `src/data/legalTexts.js` y se renderizan con `src/pages/LegalDocument.jsx`.
* Componente reutilizable `TermsCheckbox`: check **siempre desmarcado al abrir** la pantalla, con **un único link** a "los Términos y Condiciones y la Política de Privacidad" (abre en **pestaña nueva** para no perder lo cargado). Variante clara y oscura (`dark`).
* En cada pantalla donde la persona carga sus propios datos personales, el botón para avanzar queda **deshabilitado hasta marcar el check** (y el handler además ignora el envío si no está marcado).
* En el turno sin registro se agrega, debajo de los botones, el aviso: "Tus datos se usan únicamente para gestionar este turno. No creamos una cuenta. Podés pedir su eliminación en vitadev.org@gmail.com."

### Pantallas con el check

| Pantalla | Ruta / origen | Texto legal | Qué bloquea |
|----------|---------------|-------------|-------------|
| Registro de usuario | `/register` (`Register.jsx`) | `/terms/registro` | Botón "Crear Cuenta" |
| Reserva de turno sin registro (paso 2 "Datos del Paciente") | `/book-appointment/:id` (`BookAppointment.jsx`) | `/terms/turno-invitado` | Botón "Continuar" |
| Solicitud de adhesión profesional (paso 1 "Datos Personales y Contacto") | Modal `ProfessionalApplicationModal.jsx`, desde la sección B2B de la Home | `/terms/profesional` | Botón "Siguiente" |

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

## Archivos clave tocados

* `src/data/legalTexts.js` (nuevo)
* `src/pages/LegalDocument.jsx` (nuevo)
* `src/components/TermsCheckbox.jsx` (nuevo)
* `src/App.jsx` (ruta `/terms/:slug`)
* `src/pages/Register.jsx`
* `src/pages/BookAppointment.jsx`
* `src/components/ProfessionalApplicationModal.jsx`

## Validación

Automática:
* `npm run lint`
* `npm run build`

Manual (`npm run dev`, Desktop, Tablet y Mobile):
1. `/register`: "Crear Cuenta" deshabilitado con el check desmarcado; marcarlo lo habilita y desmarcarlo lo vuelve a bloquear.
2. En `/register`, el link abre `/terms/registro` en otra pestaña y el formulario conserva lo cargado.
3. Sin sesión, `/book-appointment/<id>` → elegir fecha y hora → "Siguiente Paso": "Continuar" deshabilitado hasta marcar el check; se ve el aviso de datos debajo de los botones; el link abre `/terms/turno-invitado`.
4. Con sesión iniciada, la reserva no muestra el check.
5. Home → sección profesionales → solicitud de adhesión: "Siguiente" del paso 1 deshabilitado hasta marcar el check; el link abre `/terms/profesional`.
6. `/terms/registro`, `/terms/turno-invitado` y `/terms/profesional` se ven bien, sin scroll horizontal; `/terms/otra-cosa` redirige a `/`.
