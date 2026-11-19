# Índice General de Documentación — SAMSA

Punto de entrada a toda la documentación técnica, estándares de diseño, flujo de trabajo e historial de implementaciones por Pull Request del repositorio **SAMSA**.

---

## 1. Guías Base del Equipo (Lectura Obligatoria)

| Documento | Descripción |
|-----------|-------------|
| [`docs/flujo-codigo-trello.md`](./flujo-codigo-trello.md) | **Flujo de trabajo oficial:** Reglas duras de Git, convención de tarjetas de Trello, nombres de ramas, Conventional Commits, prueba manual local y checklist de calidad antes del PR. |
| [`docs/design-system.md`](./design-system.md) | **Design System y UI/UX:** Paleta de colores, jerarquía tipográfica, estilos de botones, tarjetas *glassmorphism*, animaciones y reglas de responsiveness (Mobile, Tablet y Desktop). |
| [`docs/arquitectura-y-roles.md`](./arquitectura-y-roles.md) | **Arquitectura y Roles:** Stack tecnológico, los 6 roles del sistema (`ROLES`), mapa completo de rutas públicas y protegidas, y contextos globales (`AuthContext`, `ClinicDataProvider`). |
| [`docs/tareas/INDEX.md`](./tareas/INDEX.md) | **Índice de Tareas e Historias de Usuario:** Registro de tarjetas, estado, criterios de aceptación y decisiones pendientes. |

---

## 2. Documentación de Entregas y Pull Requests

Cada Pull Request que incorpora una funcionalidad, módulo o rediseño relevante documenta acá qué se implementó, qué archivos se tocaron y cómo se validó:

| PR / Historia | Documento | Resumen |
|---------------|-----------|---------|
| **PR #6 (`US-00`)** | [`docs/modulo-admin-vitadev.md`](./modulo-admin-vitadev.md) | Módulo superadministrador VitaDev: red neuronal en el panel, gestión de clínicas, hospitales, médicos/secretarias particulares, directorio de usuarios, inhabilitación/baja y recuperación de contraseña. |
| **PR #7 (`style`)** | [`docs/flujo-atencion-pacientes.md`](./flujo-atencion-pacientes.md) | Rediseño interactivo y animaciones de *"Flujo de atención simplificado"* (`CareFlowSection`) y mejoras integrales de responsiveness (Mobile, Tablet y Desktop) en `AboutUs.jsx`. |
| **PR #8 (`style`)** | [`docs/redundancia-preguntas-frecuentes.md`](./redundancia-preguntas-frecuentes.md) | Corrección de textos y redundancias en Preguntas Frecuentes (`FAQ.jsx`), alineación con formulario de registro y recuperación por mail, y mejoras responsive en `FAQ.jsx` y `Navbar.jsx`. |
| **`style`** | [`docs/footer-correo-e-instagram.md`](./footer-correo-e-instagram.md) | Footer: correo `vitadev.org@gmail.com` visible antes del teléfono, ícono de Instagram vinculado al perfil oficial en "Síguenos" y eliminación de íconos vacíos. |
| **`style`** | [`docs/reducir-cantidad-tarjetas.md`](./reducir-cantidad-tarjetas.md) | Panel Profesionales: la grilla de tarjetas pasa de 3 a 2 columnas máximo, manteniendo 1 columna en mobile. |
| **`feature`** | [`docs/aceptacion-de-terminos.md`](./aceptacion-de-terminos.md) | Textos legales por pantalla en ventana flotante y check obligatorio (desmarcado) de Términos y Política de Privacidad en registro, reserva de turno sin registro y solicitud de adhesión profesional. |
| **`style`** | [`docs/inicio-paciente-logueado.md`](./inicio-paciente-logueado.md) | El paciente con sesión iniciada deja de ver la landing pública y entra directo a la pantalla Turnos (`/turns`). |
| **`feature`** | [`docs/validacion-obra-social.md`](./validacion-obra-social.md) | Datos de afiliación (Nº de afiliado, plan, titular/adherente) con validación de formato en registro, reserva de turno y perfil, más declaración jurada al confirmar el turno. |
| **`feature`** | [`docs/cuenta-secretaria.md`](./cuenta-secretaria.md) | Panel de secretaría: pantalla "Mi cuenta" (`/secretary/account`) accesible desde el menú, con edición de nombre, teléfono, foto y contraseña, siguiendo el estilo del perfil del paciente. |
| **`feature`** | [`docs/secretaria-turno-manual.md`](./secretaria-turno-manual.md) | Panel de secretaría: afiliación a la obra social en el turno manual (misma validación que el turno sin registro), etiqueta del médico y pantalla de salida al registrar, modales que se cierran con click afuera o Escape, estilo claro unificado con las pantallas principales y agenda responsive. |
| **`feature`** | [`docs/medico-publicar-en-foro.md`](./medico-publicar-en-foro.md) | Foro: el médico accede desde su cabecera, publica notas (título, categoría, imagen opcional y contenido) y edita o borra solo las propias, con filtro "Mis publicaciones". |
| **`style`** | [`docs/nuevo-logo.md`](./nuevo-logo.md) | Nuevo símbolo de marca en SVG (componente `SamsaLogo`) en Navbar, Footer, intro de la Home, membretes de impresión y favicon, reemplazando el logo de corazón. |
| **`feature`** | [`docs/vitadev-foro-y-pacientes.md`](./vitadev-foro-y-pacientes.md) | VitaDev: cabecera sin Resumen, con Foro y con "Particulares" (solo médicos y secretarias particulares, con acciones de cuenta y documentación de los médicos, visible también en su perfil); publica y modera el foro (borrado de notas ajenas con aclaración que ve el autor); Gestión de Usuarios con pacientes, filtro particular/institución, acciones con íconos y edición de datos; contraseña temporal con botón Copiar; Panel general con secretarias y pacientes. |
| **`docs`** | [`docs/readme-visual.md`](./readme-visual.md) | Portada del repositorio con capturas de los roles, diagramas de arquitectura y guía de ejecución local. |
| **`style`** | [`docs/eliminar-admin-general.md`](./eliminar-admin-general.md) | Limpieza del rol `admin` anterior: se eliminan sus seis pantallas (`/admin/...`), su rol, accesos en Navbar y Footer y el hook `useCrudList`. El administrador general queda en VitaDev. |
| **`style`** | [`docs/estilo-unificado-secretaria-e-instituciones.md`](./estilo-unificado-secretaria-e-instituciones.md) | Secretaría, Admin de Clínica y Admin de Hospital con el mismo estilo y animaciones que Turnos, Profesionales, Foro y VitaDev: `PageHeader`, `FadeIn` escalonado, tarjetas `rounded-3xl`, tablas apiladas en mobile e `IconAction`. |
| **`feature`** | [`docs/configuracion-clinica-hospital.md`](./configuracion-clinica-hospital.md) | Admins de clínica y hospital con las acciones del admin SAMSA en su institución: cargar médicos o vincular existentes (búsqueda, ficha, documentación y sin choques de horario), editar, inhabilitar por institución y eliminar; secretarias con cuenta e inhabilitación; moderación del foro sobre sus médicos; Datos de la institución con lápiz de edición y Mi cuenta; ventana de salida en todas las acciones; sin módulo Personal. El hospital deja de tener obras sociales. |
| **`feature`** | [`docs/notificaciones-y-soporte.md`](./notificaciones-y-soporte.md) | Campana de notificaciones en la cabecera de todos los perfiles con sesión, contacto con soporte en el pie de todos los módulos (ventana con tickets e hilo de conversación) y nuevo módulo Soporte del admin SAMSA (`/vitadev/support`) para gestionar los tickets. |
| **`bugfix`** | [`docs/mejoras-responsive-navegacion.md`](./mejoras-responsive-navegacion.md) | Ajustes visuales y responsive en Inicio, Turnos, menú móvil de Navbar (animación y estilos) y pantalla de Registro. |
| **`style`** | [`docs/animaciones-home-sin-superposicion.md`](./animaciones-home-sin-superposicion.md) | Home sin sesión: las animaciones del hero esperan a que termine la intro, la imagen mobile entra con `Reveal` y las tarjetas flotantes de la sección profesionales dejan de pisarse y de tapar contenido. |
| **`style`** | [`docs/medico-responsive-turnos.md`](./medico-responsive-turnos.md) | Módulo médico: pantalla principal `/doctor/turns` responsive en cabecera, tarjetas de turnos (fila desde `lg`) y modal de cierre de consulta. |
| **`feature`** | [`docs/hce-y-seguimiento.md`](./hce-y-seguimiento.md) | Panel médico: Historia Clínica Electrónica por paciente (Ley 26.529) con resumen clínico, registros por sección y evolución SOAP, firma y enmiendas, plan de seguimiento, copia autenticada impresa (48 h) y registro de accesos. |
