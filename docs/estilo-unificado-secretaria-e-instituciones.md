# Estilo unificado en Secretaría, Admin de Clínica y Admin de Hospital

## Qué se implementó

Las pantallas de secretaría y de administración de clínica y hospital adoptan el mismo lenguaje visual y las mismas animaciones que los módulos principales (Turnos, Profesionales, Foro) y que el administrador general `admin.samsa@samsa.med` (VitaDev):

- **Encabezado común (`PageHeader`):** etiqueta con ícono arriba, título grande y bajada, con aparición suave (`FadeIn`). Reemplaza los títulos propios de cada pantalla.
- **Animación de entrada escalonada (`FadeIn`):** encabezado, formulario o filtros, y tabla o tarjetas aparecen en cascada (`delay` 100 y 200 ms).
- **Superficies:** fondo `bg-slate-50 overflow-x-hidden`, tarjetas `rounded-3xl border-gray-100`, ancho `max-w-7xl` y márgenes `px-4 sm:px-6 lg:px-8 py-8 sm:py-12`.
- **Tablas responsive:** hasta `lg` cada fila se apila como tarjeta (sin scroll lateral); desde `lg` vuelve a tabla.
- **Acciones con ícono (`IconAction`):** editar, quitar o eliminar y documentación usan los botones con globo de ayuda de VitaDev; la documentación conserva el contador rojo de pendientes.
- **Sin emojis** en los títulos de los formularios ("Editando Profesional", "Vincular Profesional", etc.).

### Pantallas

| Módulo | Pantallas |
|--------|-----------|
| Admin de Clínica / Hospital | `ClinicDoctors`, `ClinicSecretaries`, `ClinicStaff`, `ClinicRequests` (rutas `/clinic/...` y `/hospital/...`) |
| Secretaría | `SecretaryDashboard` (agenda diaria), `SecretaryPatients`, `SecretaryAccount` |

Decisiones tomadas:

- `PageHeader` recibe una prop opcional `layer` (z-index, por defecto `z-10`). La agenda la sube a `z-30` para que el desplegable de profesionales quede sobre la tira de fechas y la tabla, que también se animan.
- En la agenda, el encabezado usa `PageHeader` y sus controles (profesional, vista y chat) pasan a `actions`; la tira de fechas sube a `z-20` para que el calendario flotante no quede tapado.
- `SecretaryAccount` conserva su portada azul, como el perfil del paciente; solo gana el fondo unificado y las animaciones de entrada.

## Modales: el fondo ya no se mueve con las flechas

Con un modal abierto, las flechas del teclado desplazaban la página de atrás en lugar del contenido del modal (la mayoría de los ~45 modales no bloqueaba el scroll del fondo). Se agregó `src/components/ModalScrollManager.jsx`, montado una sola vez en `App.jsx`:

- Detecta cualquier capa `fixed inset-0` con `backdrop-blur` (el patrón común de todos los modales) y, mientras haya una abierta, bloquea el scroll del fondo (compensando el ancho de la barra para que la página no salte).
- Si el foco quedó fuera del modal (por ejemplo, tras hacer click en el botón que lo abrió), redirige flechas, RePág/AvPág, Inicio/Fin y Espacio al contenido scrolleable del modal. Los campos de texto, listas y sliders conservan su comportamiento.
- Al cerrar el último modal, restaura el scroll.

## Archivos clave tocados

- `src/components/PageHeader.jsx` (prop `layer`)
- `src/pages/clinic/ClinicDoctors.jsx`, `ClinicSecretaries.jsx`, `ClinicStaff.jsx`, `ClinicRequests.jsx`
- `src/pages/secretary/SecretaryDashboard.jsx`, `SecretaryPatients.jsx`, `SecretaryAccount.jsx`
- `src/pages/secretary/dashboard/AgendaHeader.jsx`
- `src/components/ModalScrollManager.jsx` (nuevo) y `src/App.jsx`

## Validación

Automática:
- `npm run lint`: sin errores.
- `npm run build`: compila limpio.

Manual local (`npm run dev`, cuentas de demo del proyecto):
- Admin de clínica: `/clinic/doctors`, `/clinic/secretaries`, `/clinic/staff`, `/clinic/requests`.
- Admin de hospital: las mismas pantallas bajo `/hospital/...` (comparten componentes con clínica).
- Secretaría: `/secretary/dashboard`, `/secretary/patients`, `/secretary/account`.
- Qué mirar: encabezado igual al del Foro y VitaDev, aparición escalonada, globos de ayuda en los íconos, desplegable de profesionales sobre el contenido y filas apiladas en mobile.

Responsive (verificado en el navegador integrado):
- **Mobile (375px):** sin scroll horizontal en las 4 pantallas de clínica y las 3 de secretaría; filas de tabla apiladas como tarjetas.
- **Tablet (768px):** sin scroll horizontal en las 3 pantallas de secretaría.
- **Desktop (1280px):** agenda y médicos de clínica revisados; el desplegable de profesionales queda sobre la tabla.
- Modal "Nuevo Turno" (375x600): con el modal abierto el fondo no se desplaza y la flecha abajo mueve el contenido del modal; al cerrarlo se restaura el scroll.
- Pendiente de confirmación del responsable: probar con el teclado real otros modales (perfil de usuario, foro, estudios, términos legales); tablet en las pantallas de clínica y recorrido completo con la cuenta de hospital.
