# Índice General de Documentación — SAMSA

Punto de entrada a toda la documentación técnica, estándares de diseño, flujo de trabajo e historial de implementaciones por Pull Request del repositorio **SAMSA**.

---

## 1. Guías Base del Equipo (Lectura Obligatoria)

| Documento | Descripción |
|-----------|-------------|
| [`docs/flujo-codigo-trello.md`](./flujo-codigo-trello.md) | **Flujo de trabajo oficial:** Reglas duras de Git, convención de tarjetas de Trello, nombres de ramas, Conventional Commits, prueba manual local y checklist de calidad antes del PR. |
| [`docs/design-system.md`](./design-system.md) | **Design System y UI/UX:** Paleta de colores, jerarquía tipográfica, estilos de botones, tarjetas *glassmorphism*, animaciones y reglas de responsiveness (Mobile, Tablet y Desktop). |
| [`docs/arquitectura-y-roles.md`](./arquitectura-y-roles.md) | **Arquitectura y Roles:** Stack tecnológico, los 7 roles del sistema (`ROLES`), mapa completo de rutas públicas y protegidas, y contextos globales (`AuthContext`, `ClinicDataProvider`). |
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
| **`feature`** | [`docs/validacion-obra-social.md`](./validacion-obra-social.md) | Datos de afiliación (Nº de afiliado, plan, titular/adherente) con validación de formato en registro, reserva de turno y perfil, más declaración jurada al confirmar el turno. |
