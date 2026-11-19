# Notificaciones y soporte en todos los módulos

Rama: `feature/notificacion-y-soporte-todos-los-modulos`

## Qué se implementó

### Campana de notificaciones
- Todos los perfiles con sesión (paciente, médico, secretaría, admin de clínica, admin de hospital y admin SAMSA) tienen una campana en la cabecera, a la derecha del nombre de usuario (en mobile, junto al menú).
- Lista desplegable con insignia de no leídas, "Marcar leídas", "Borrar todas", quitar una a una y acceso directo a la pantalla relacionada.
- Estado en `NotificationsProvider` (mock en memoria, como el foro). Cada notificación se dirige a una persona (`{ email }`) o a un rol/institución (`{ roles, institutionId }`); leído y borrado se guardan por persona.
- Eventos que generan avisos:
  - Turno confirmado (paciente y médico), cancelado por el paciente (médico), cancelado o reprogramado por secretaría (médico y paciente con cuenta).
  - Solicitud de cambio de horario: nueva (admins de la institución) y aceptada o rechazada (médico).
  - Nota del foro retirada por moderación (autor).
  - Tickets de soporte: nuevo, mensaje, respuesta y cambio de estado.
  - Una bienvenida por rol.

### Contacto con soporte
- Pantallas con `Footer` completo: botón "Contactar soporte" en la columna Contacto.
- Pantallas sin pie completo (administración, perfiles, Mis Turnos, etc.): barra fina `SupportBar` al final. Se decide con `FooterPresence`, donde el `Footer` se registra mientras está en pantalla.
- Ventana de soporte (`SupportModal`): "Nuevo reporte" (tipo, asunto, descripción, con validación) y "Mis tickets" con el hilo de conversación. Se cierra con click afuera o Escape.
- El admin SAMSA no ve el botón: recibe los tickets.
- Preguntas Frecuentes (`FAQ.jsx`): "Contactar Soporte" funciona también sin sesión. El invitado carga nombre y correo, el ticket llega al admin marcado como "Invitado (sin cuenta)" y se le responde por correo, porque no ve "Mis tickets" ni la campana. Se quitó el botón "Ver más info" de ese panel.

### Módulo Soporte del admin SAMSA (`/vitadev/support`)
- Nuevo enlace "Soporte" en su cabecera, con contador de tickets sin resolver. La cabecera queda ordenada en dos grupos separados por una línea (gestión: Particulares, Clínicas, Hospitales y Usuarios; comunicación: Foro y Soporte) y, desde 1024px hasta antes de 1280px, el nombre del admin se reduce a su inicial para que entre todo.
- Tarjetas por estado (Abierto, En curso, Resuelto) que filtran, búsqueda y filtro por tipo, detalle con hilo, respuesta y cambio de estado.
- Al responder, un ticket abierto pasa a "En curso"; si el usuario escribe en uno resuelto, se reabre.
- Hay cuatro tickets de demostración, con casos que el admin puede resolver desde sus módulos (clave temporal, reactivar cuenta, catálogo y documentación).

### Header fijo en todos los módulos
- El `Navbar` ya era `sticky top-0`, pero en las pantallas de VitaDev, clínica y hospital, secretaría, Foro, Preguntas Frecuentes y Acerca de Nosotros dejaba de quedar fijo porque su contenedor raíz usaba `overflow-x-hidden` (crea una zona de scroll propia). Se reemplazó por `overflow-x-clip`, que recorta igual sin romper el header fijo (y `overflow-hidden` por `overflow-clip` en el panel de VitaDev). Regla actualizada en `docs/design-system.md`.
- Avatar del admin SAMSA: sin foto se fijaba `backgroundImage: 'none'`, que anulaba el degradado y dejaba la inicial blanca sobre fondo blanco; ahora solo se fija con foto.

### Botones de la cabecera: tono claro y contraste
- El botón de cuenta y la campana son blancos en todos los roles (antes los admins de clínica y hospital los tenían oscuros). Contraste medido: texto e ícono 10,35:1 y inicial del avatar blanca sobre azul `blue-600` 5,17:1 (mínimo AA: 4,5:1). Las insignias de contador pasaron a `red-600` para que el número blanco se lea bien.

### Revisión de estilo, animaciones y responsive
- Barrido de todas las pantallas de los seis roles (paciente, médico, secretaría, admin de clínica, admin de hospital y admin SAMSA) en 375, 768 y 1280px: ninguna tiene scroll horizontal; lo único que sobresale son halos decorativos recortados por `overflow-x-clip`.
- Corregido: en Mis Pacientes del médico (`DoctorPatients.jsx`) el buscador y el botón se salían de la tarjeta a 768px; el encabezado ahora se apila hasta `lg`.
- Animaciones: la ventana de soporte y la campana usan `tailwindcss-animate` (`animate-in fade-in slide-in-from-*`, con `motion-reduce:animate-none`) y el módulo Soporte usa `FadeIn` escalonado, como el resto de VitaDev. Las clases `animate-fadeIn` y `animate-slideUp` que usan otros modales no están definidas en el proyecto y no producen animación (pendiente aparte).

### Menú de cuenta
- El menú de cuenta de la cabecera (el mismo para todos los roles) se cierra al hacer click afuera o con Escape. Antes usaba una capa `fixed inset-0` que, por el desenfoque del `Navbar`, solo cubría la barra y no la página.

## Archivos clave
- Nuevos: `src/context/NotificationsContext.jsx`, `notifications-context.js`, `SupportContext.jsx`, `support-context.js`, `src/data/support.js`, `src/components/NotificationBell.jsx`, `src/components/support/*` (incluye `SupportModalHost.jsx`), `src/pages/vitadev/VitadevSupport.jsx`, y utilidades compartidas `src/utils/email.js` (`normalizeEmail`), `src/utils/dates.js` (`formatDateTime`, `timeAgo`) y `src/hooks/useDismissOnOutside.js` (cerrar menús al click afuera o Escape).
- Modificados: `App.jsx`, `Navbar.jsx`, `Footer.jsx`, `ClinicDataProvider.jsx`, `ForumContext.jsx`, `BookAppointment.jsx`, `MyTurns.jsx`, `SecretaryDashboard.jsx`.

## Validación
Automática:
- `npm run lint`: sin errores.
- `npm run build`: compila limpio.

Manual local (`npm run dev`):
1. Paciente (`paciente@samsa.med`): campana con la bienvenida; en Mis Turnos, "Contactar soporte" abre la ventana; el envío vacío muestra errores y uno válido crea el ticket.
2. Admin SAMSA: el enlace Soporte muestra el contador y el ticket nuevo; se responde y se marca como resuelto.
3. De nuevo paciente: la campana muestra la respuesta y el cambio de estado; al abrir el aviso se ve el hilo.

Responsive: se verificó que no hay scroll horizontal ni desbordes en mobile (375px, con la lista de la campana y la ventana de soporte como hoja inferior), tablet (768px) y desktop (1280px).

Pendiente de revisión manual por la persona responsable: los demás roles (médico, secretaría, admins de clínica y hospital) y el aviso de turnos.
