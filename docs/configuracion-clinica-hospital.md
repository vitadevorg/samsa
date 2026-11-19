# Configuración de clínica y hospital

## Qué se implementó

Los administradores de clínica (`admin.clinica@samsa.med`) y de hospital (`admin.hospital@samsa.med`) ahora tienen las mismas acciones que el administrador SAMSA (`admin.samsa@samsa.med`), pero limitadas a su propia institución.

### Médicos (`/clinic/doctors`, `/hospital/doctors`)

- **Cargar médico:** alta de un médico nuevo con los mismos datos que un médico particular de VitaDev, salvo la dirección, que es la de la institución. Pide nombre, email (usuario), teléfono, especialidad, área o sector, consultorio, días y horario, obras sociales y la documentación obligatoria. Crea su cuenta con una contraseña temporal.
  - Las obras sociales disponibles son las que acepta la clínica. En el hospital ese campo no aparece.
- **Vincular existente:** para un médico que ya atiende en otra institución o de forma particular (por ejemplo, el Dr. Mateo Cruz, que atiende en la clínica y en el hospital). Pide:
  - **Médico:** buscador por nombre, especialidad o email, con la ficha del médico elegido (especialidad, contacto y dónde y cuándo atiende hoy) para confirmar que es la persona correcta.
  - **Área o sector**, sugerido según su especialidad si la institución lo tiene, y **consultorio**.
  - **Días y horario.** No puede superponerse con su atención en otra institución, porque no puede estar en dos lugares a la vez.
  - **Obras sociales que atiende en esta institución** (solo clínicas): se eligen entre las que acepta la clínica y vienen preseleccionadas las que el médico ya acepta.
  - **Documentación obligatoria de la institución:** contrato, matrícula, seguro y título, igual que en el alta, porque cada institución lleva la suya.
- **Editar:** de un médico propio se pueden cambiar sus datos y su atención. De uno vinculado, el área o sector, el consultorio, el horario y las obras sociales que atiende ahí: sus datos personales los administra quien lo dio de alta.
- **Documentación** y **resetear contraseña**, con los mismos íconos y ventanas que VitaDev. La contraseña solo se resetea a los médicos propios.
- **Inhabilitar / habilitar en la institución:** el médico deja de recibir turnos en esa institución (sale de la cartilla, de la reserva y de la agenda de la secretaria). Su cuenta se inhabilita solo si no atiende habilitado en ninguna otra institución.
- **Eliminar:** como en VitaDev, primero se inhabilita y recién después se puede eliminar. Si no trabaja en otra institución, se da de baja su cuenta.

### Secretarias (`/clinic/secretaries`, `/hospital/secretaries`)

- El formulario queda oculto hasta pedirlo con "Agregar secretaria". El alta y la edición piden confirmación.
- El alta crea la cuenta con una contraseña temporal. El email (usuario) no se repite con ninguna cuenta del sistema y no se cambia al editar.
- Acciones: editar, resetear contraseña, inhabilitar, habilitar y eliminar (eliminar solo con la cuenta inhabilitada).
- Las agendas solo se pueden asignar a médicos habilitados en la institución.

### Módulo Personal quitado

- A pedido, se eliminó la pantalla Personal (`/clinic/staff`, `/hospital/staff`) de los administradores de clínica y hospital: su enlace en el Navbar, sus rutas y `ClinicStaff.jsx`. Médicos y secretarias se administran desde sus propias pantallas.

### Foro (`/news`)

- Nuevo enlace "Foro" en la barra de los administradores de institución.
- Pueden publicar, editar y borrar sus notas, firmadas con el nombre de la institución.
- Pueden eliminar notas de **sus propios médicos**, con un motivo obligatorio que ve el autor ("Clínica del Norte eliminó tu publicación..."). Las notas de otros médicos y las notas fijas del foro solo las modera VitaDev.
- Se agregó una nota de demostración del Dr. Jesús Zelarayan (Clínica del Norte) para probar la moderación.

### Datos de la institución (`/clinic/settings`, `/hospital/settings`)

- Pantalla nueva, a la que se entra desde el menú de la cuenta ("Datos de la clínica" o "Datos del hospital"), con una sola tarjeta como "Mi cuenta":
  - **Datos legales** (razón social, CUIT, REFES): solo lectura, los registra VitaDev.
  - Cada sección (Contacto y Servicios) se muestra **en modo lectura** y se edita solo al tocar su **lápiz**. En edición aparecen los campos con Cancelar y Guardar; guardar pide confirmación, muestra la ventana de salida y vuelve al modo lectura.
  - **Contacto:** dirección, teléfono y correo, con validación.
  - **Servicios:** obras sociales que acepta (solo clínica) y estudios que se realizan, con las mismas casillas del catálogo de VitaDev. Si la clínica deja de aceptar una obra social, se quita también de los médicos que dio de alta.

### Ventana de salida en todas las acciones

- Toda acción de administración termina con la ventana de salida del sistema (la verde de éxito o la de contraseña temporal). Se sumó donde faltaba:
  - Eliminar médico y eliminar secretaria, en clínica u hospital y en Particulares de VitaDev.
  - Rechazar una solicitud de cambio de horario.

### Mi cuenta (`/clinic/account`, `/hospital/account`)

- Reutiliza la pantalla "Mi cuenta" de VitaDev: cambiar el usuario (email), la contraseña y los datos de recuperación. Muestra el nombre del administrador y su institución.
- Si cambia el usuario, también se actualiza en la lista de administradores de la institución que ve VitaDev.

### Hospital sin obras sociales (en todo el sistema)

- Se quitaron las obras sociales del Hospital Central en `src/data/institutions.js`.
- El formulario y el detalle de hospitales de VitaDev ya no las muestran, y al guardar un hospital se guardan vacías.
- Los médicos del hospital no tienen campo de obras sociales.

### Decisiones tomadas (confirmadas por el usuario)

1. Se mantienen las dos opciones: cargar médicos nuevos y vincular existentes.
2. Inhabilitar a un médico afecta solo a esa institución. La cuenta se bloquea únicamente si no atiende en otra.
3. La moderación del foro de la clínica u hospital alcanza solo a las notas de sus médicos.
4. Las obras sociales del hospital se quitan en todo el sistema.

### Cambios técnicos

- `ClinicDataProvider` guarda los médicos dados de alta por cada institución (`institutionDoctors`) y expone:
  - `findDoctor`: busca en `doctors.js`, en los médicos de institución y en las correcciones de VitaDev, y lo usan todas las pantallas de clínica, la agenda de secretaría y Gestión de Usuarios.
  - `addInstitutionDoctor`, `updateInstitutionDoctor`, `disableAssignment`, `enableAssignment` y `updateInstitutionOffer`.
- Las vinculaciones inhabilitadas (`status: 'disabled'`) quedan fuera de `bookableAssignments`.
- La lista de documentación del alta se extrajo a `DocumentsChecklist.jsx` + `documentsForm.js`. La usan VitaDev y las instituciones, así no se duplica.

### Limitación conocida

- Igual que los médicos particulares que crea VitaDev, los médicos nuevos de una institución no tienen todavía un perfil público en la cartilla (la cartilla se arma con `doctors.js`). Sí tienen cuenta, agenda para sus secretarias y figuran en Gestión de Usuarios.

## Archivos clave tocados

- Nuevos:
  - `src/pages/clinic/ClinicSettings.jsx`
  - `src/pages/clinic/DocumentsChecklist.jsx`
  - `src/pages/clinic/documentsForm.js`
- Pantallas de institución:
  - `src/pages/clinic/ClinicDoctors.jsx` (reescrito)
  - `ClinicSecretaries.jsx`, `ClinicRequests.jsx`, `ClinicSettings.jsx` (lápiz de edición)
  - `ClinicStaff.jsx` (eliminado) y `docs/assets/readme/hospital-personal.webp` (eliminado del README)
  - `ClinicDataProvider.jsx`
- Foro:
  - `src/context/ForumContext.jsx`, `src/context/forum-context.js`
  - `src/pages/NewsForum.jsx`, `src/pages/forum/ModeratePostModal.jsx`
- VitaDev:
  - `src/pages/vitadev/VitadevAccount.jsx`, `VitadevInstitutions.jsx`
  - `ParticularDoctorsPanel.jsx`, `userDirectory.js`
- Secretaría:
  - `src/pages/secretary/SecretaryDashboard.jsx`, `SecretaryAccount.jsx`
  - `dashboard/mockData.js`
- Navegación y datos:
  - `src/App.jsx`, `src/components/Navbar.jsx`
  - `src/data/institutions.js`

## Validación

Automática:
- `npm run lint`: sin errores.
- `npm run build`: compila limpio.

Manual en el navegador integrado (cuentas de demo, clave `12345`):
- **Admin de clínica:**
  - Validación del alta vacía (todos los mensajes).
  - Alta de "Dra. Valeria Ruiz", con documentación, confirmación y contraseña temporal.
  - Inhabilitar al Dr. Mateo Cruz: el aviso indica que su cuenta sigue activa porque atiende en el hospital, y aparecen Habilitar y Eliminar.
- **Secretarias:** alta de "Laura Medina" con contraseña temporal. Al inhabilitarla, solo quedan Habilitar y Eliminar.
- **Foro:** la clínica puede eliminar la nota del Dr. Zelarayan, pero no la de la Dra. Gómez (particular).
- **Datos de la clínica:** el cambio de dirección se ve en el encabezado de Médicos sin recargar.
- **Mi cuenta:** muestra el nombre del administrador y su institución.
- **Admin de hospital:** Datos del hospital sin obras sociales ("El hospital es público..."). El alta de médico no tiene obras sociales y el campo dice "Sector".
- **VitaDev:**
  - "Asociar médico" sigue mostrando la documentación (componente compartido).
  - El formulario y el detalle de hospitales no tienen obras sociales; el de clínicas sí.
- **Secretaría:** la agenda sigue cargando sus médicos.
- Sin errores en la consola.

Responsive:
- **Mobile (375px), tablet (768px) y desktop (1280px):** sin scroll horizontal en Médicos (con los formularios de alta y de vinculación abiertos), Secretarias (con el formulario abierto), Solicitudes, Datos de la institución, Mi cuenta y Foro.
- **1024px:** el Navbar del admin (cinco enlaces más la cuenta) entra sin superponerse. Los botones del encabezado no se parten en dos líneas.
- **Revisión general de todos los módulos** (después de los cambios): barrido automático de scroll horizontal y contenido que se sale de pantalla en 375, 768 y 1280px de todas las pantallas de visitante, paciente, médico, secretaría, admin de clínica, admin de hospital y VitaDev. Sin desbordes. Los únicos avisos fueron íconos decorativos de las portadas de perfil, que recorta su contenedor.
- **Segunda tanda:**
  - Lápiz de Datos de la clínica: sin campos en modo lectura; el lápiz abre la sección, Cancelar la cierra, y Guardar confirma, muestra la salida y vuelve a lectura.
  - Ventanas de salida al rechazar una solicitud y al eliminar un médico.
  - Vincular a la Dra. Etna Herrera: búsqueda, ficha, área sugerida y documentación obligatoria. El choque con su horario del hospital (lunes) se bloquea con un mensaje claro; con los jueves se vincula y la obra social que ya aceptaba queda preseleccionada.
  - El formulario de vinculación en 375px no se desborda.
- Pendiente de confirmación del responsable: cambiar la contraseña desde Mi cuenta (no se probó para no modificar la cuenta de demo) y el recorrido completo en el navegador propio.
