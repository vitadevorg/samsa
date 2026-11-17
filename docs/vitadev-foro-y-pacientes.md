# VitaDev: foro con moderación, gestión de usuarios y panel general (`feature/moderar-foro-pacientes-instituciones-medicos`)

Nuevas funciones para el administrador de VitaDev (`admin.samsa@samsa.med`): publicar y moderar el foro, gestionar y editar todas las cuentas (pacientes incluidos) y ver cantidades de secretarias y pacientes en el panel general.

## Qué se implementó

### Cabecera de VitaDev

- Se quitó **Resumen**. El panel (`/vitadev/dashboard`) sigue siendo la pantalla de inicio de VitaDev y se abre con el logo.
- **Médicos** pasó a llamarse **Particulares** (misma ruta `/vitadev/doctors`).

### Particulares

- La pantalla se titula **Particulares** (sin texto descriptivo debajo); el botón para sumar un médico dice **Asociar médico**. Muestra solo los médicos particulares y las secretarias de médicos particulares. Se quitó la lista de médicos de clínicas y hospitales (`InstitutionDoctorsList`), que siguen visibles en Gestión de Usuarios y en cada institución.
- Las dos tablas usan las mismas acciones con íconos que Gestión de Usuarios: **lápiz** (abre el formulario de edición que ya tenía la pantalla), **llave** (resetear contraseña, con la ventana de Copiar) y **círculo** (inhabilitar). Columna Acciones centrada.
- **Primero se inhabilita, después se elimina:** con la cuenta activa no hay papelera. Al inhabilitarla aparecen **habilitar** y la **papelera** (eliminar de la lista, que además da de baja la cuenta).
- Las acciones de cuenta viven en un hook reutilizable (`useAccountActions`), con sus confirmaciones y la ventana de contraseña temporal.
- En la tabla de médicos, la columna **Trabaja en** pasó a llamarse **Dirección de consultorio** y ya no repite "Atención particular": muestra solo la dirección.
- **Días, horario y obras sociales:** el formulario del médico particular (alta y edición) tiene una sección **Atención** con los días (mismo selector que usa la clínica al vincular a un médico), la franja horaria (validada con `validateSchedule`) y las **obras sociales que acepta**, opcionales, en un **panel desplegable**. El botón muestra lo elegido y un contador, y al abrirlo aparece la lista para marcar, con "Quitar todas" y "Listo". Sin obras sociales marcadas atiende solo de forma particular. La tabla suma la columna **Atención** (días y horario, y obras sociales o "Solo particular").
- El **perfil del médico particular** muestra ese horario en "Dónde atiende" y esas obras sociales en "Acepta".

### Clínicas y Hospitales: inhabilitar, dar de baja y nuevos administradores

- Cada institución tiene íconos: **lápiz** (editar datos) e **inhabilitar**. Inhabilitada, muestra la etiqueta "Inhabilitada" y los íconos **habilitar** y **dar de baja** (papelera, definitivo, con confirmación en rojo). Dada de baja queda con la etiqueta "Dada de baja" y sin acciones. Primero se inhabilita; recién después se puede dar de baja. **Doble verificación:** inhabilitar y dar de baja piden escribir el nombre de la institución (`TypeToConfirmModal`); el botón se habilita solo cuando coincide (sin importar mayúsculas ni espacios de más). Habilitar mantiene la confirmación simple.
- **Efecto (decisión del usuario):** ningún personal de la institución puede usar el sistema en lo referido a ella. Se inhabilitan (o se dan de baja) las cuentas de sus administradores, de sus secretarias y de los médicos que **solo** trabajan ahí. Un médico que también atiende en otra institución conserva su acceso, pero no se le pueden reservar turnos en la inhabilitada: la cartilla, el perfil del médico y la reserva usan `bookableAssignments` (solo instituciones activas). Al volver a habilitarla, ese personal recupera el acceso. Lógica en `setInstitutionStatus` / `institutionStatus` de `ClinicDataProvider`.
- **Agregar administrador:** en una institución activa, "Agregar administrador" abre un formulario (nombre y apellido, email y teléfono, con las validaciones de siempre y email único). Al confirmar se crea la cuenta y se muestra la contraseña temporal con el botón Copiar.
- Verificado: al inhabilitar Clínica del Norte quedaron inhabilitados Carolina Medina, sus secretarias (Ana Paula Díaz, Florencia Juárez, María González) y sus médicos exclusivos (Zelarayan, Rocha, Quinteros); Mateo Cruz (también en Hospital Central) siguió activo, y la clínica dejó de aparecer en la cartilla. Al habilitarla todos volvieron a "Activo". Se agregó a "Laura Benítez" como administradora. En 375 px los íconos y el formulario entran sin desborde.

### Documentación de los médicos particulares

VitaDev administra a los médicos particulares como una clínica administra a los suyos (decisión confirmada por el usuario):

- **En Particulares:** cada médico tiene el ícono **Documentación**, con un aviso rojo que cuenta los documentos vencidos o pendientes. Abre la misma ventana que usa la clínica (`ClinicDocumentsModal`), con los mismos documentos: Contrato, Matrícula, Seguro de mala praxis y Título. VitaDev los marca como recibidos con su vencimiento.
- **En el perfil del médico** (`/doctor/profile`): el médico particular ve la sección **Mi documentación**, de solo lectura, con el estado de cada documento (vigente, vencido o pendiente) y un resumen ("Al día" o "N por regularizar").
- **Al asociar un médico nuevo** (botón "Asociar médico") el formulario incluye una sección **Documentación**, **obligatoria para crear la cuenta** (cada documento usa el mismo casillero que el panel de obras sociales): los cuatro documentos tienen que estar marcados como recibidos y los que vencen (Contrato, Matrícula y Seguro), con una fecha válida, igual que en la clínica. Si falta alguno, el formulario no avanza y lo indica en cada documento. Después se actualizan con el ícono Documentación de la tabla. El formulario, la confirmación y el aviso final dicen "Asociar" / "asociado".
- Los datos de demostración traen a Luis Coronel con el seguro pendiente.
- **Corrección relacionada:** el perfil propio usaba siempre a un médico de clínica de demostración, así que a un particular le mostraba "Clínica del Norte" en "Dónde atiende". Ahora el particular ve "Atención particular" con la dirección de su consultorio. Los demás médicos no cambian.

### Clínicas y Hospitales: administradores

- Cada administrador de institución tiene las mismas acciones con íconos: **lápiz** (editar, como antes), **llave** (resetear, con Copiar) e **inhabilitar**.
- Con la cuenta inhabilitada aparecen **habilitar** y **dar de baja definitivamente**. Con la baja queda la etiqueta "Baja" y "Sin acciones". La pantalla nunca tuvo papelera, y la institución en sí no se inhabilita ni se elimina.

### Panel general

- El panel pasó a llamarse **Panel general**.
- Nuevas tarjetas **Secretarias** y **Pacientes** con sus cantidades. Cada una abre Gestión de Usuarios ya filtrada (`/vitadev/users?tipo=secretary` y `?tipo=patient`).
- La tarjeta **Médicos** cuenta todos los médicos (de institución y particulares), así que ahora abre Gestión de Usuarios filtrada por Médicos (`?tipo=doctor`) en lugar de la pantalla Particulares.
- Desde tablet en adelante, las 5 tarjetas de personas e instituciones (Médicos, Secretarias, Pacientes, Clínicas y Hospitales) van en una fila, e **Inhabilitados** y **Bajas** en una segunda fila debajo. En mobile van en 2 columnas o en 1.
- **Inhabilitados** y **Bajas** abren Gestión de Usuarios filtrada por estado (`?estado=disabled` y `?estado=deactivated`). Sus números cuentan a las personas del directorio, los mismos que lista Usuarios con ese filtro.
- Se agregó **Foro** (`/news`) en desktop y en el menú hamburguesa. Los enlaces mobile de VitaDev cierran el menú al navegar.
- Los pacientes no tienen botón propio: se gestionan desde **Usuarios** (ver abajo).

### Foro

- **Publicar, editar y borrar lo propio:** VitaDev usa las mismas vistas que el médico (botón **Publicar**, formulario, filtro "Mis publicaciones", Editar/Borrar). Sus notas se firman como **Equipo VitaDev**. Para VitaDev el foro no muestra texto debajo del título.
- **Borrar solo desde la publicación abierta:** las tarjetas ya no tienen botones de borrar ni de eliminar (las propias conservan **Editar**). Hay que abrir la publicación y, dentro, aparecen **Borrar** (propias) o **Eliminar** (VitaDev). El detalle ya no tiene el botón inferior "Cerrar y volver al foro": se cierra con la X de arriba o tocando afuera.
- **VitaDev puede eliminar cualquier publicación:** en las notas de médicos, **Eliminar** abre una ventana que muestra la nota y pide una **aclaración para el autor** (10 a 300 caracteres, obligatoria; no se cierra con un click afuera). Las **notas institucionales fijas** también se pueden eliminar: como no tienen autor a quien avisar, piden solo confirmación (`hiddenNoteIds` / `removeFixedNote` en `ForumProvider`).
- **Aviso al autor:** el médico cuya nota fue eliminada ve en el foro un aviso con el título de la nota y el motivo ("VitaDev eliminó tu publicación … Motivo: …"), que puede descartar.
- **Permisos:** solo VitaDev modera (`canModerate`). El `ForumProvider` rechaza la moderación si el usuario no es VitaDev o si la nota es propia (las propias se borran con Borrar). Los médicos siguen sin poder tocar notas ajenas, incluidas las de VitaDev.

### Gestión de Usuarios

- **Pacientes en Usuarios:** nuevo tipo **Pacientes** con las mismas acciones que el resto (resetear contraseña, inhabilitar, habilitar y dar de baja). Solo se muestran nombre, email y teléfono, nunca datos clínicos ni de afiliación (`getPatientAccounts` en `authService.js`). Con el filtro Pacientes se oculta la columna **Institución**, porque los pacientes no pertenecen a una.
- **Filtro "Atención" para médicos y secretarias:** al elegir Médicos o Secretarias aparece un segundo filtro **Todos / Particulares / De institución**, con su cantidad. Se reinicia al cambiar de tipo.
- La pantalla pasó a llamarse **Gestión de Usuarios**.
- **Sublistas dentro del panel:** **Rol** (antes "Tipo") y **Estado** son sublistas plegadas: la fila muestra el nombre y la opción elegida, y al tocarla aparecen las opciones; al elegir una (en cualquier sublista, también en Atención) se cierran la sublista y el panel de Filtros, y lo elegido queda a la vista en los chips. **Atención** no se pliega: aparece abierta cuando el rol es Médicos o Secretarias. Los botones de opción ya no muestran contadores. Los chips con el panel cerrado dicen "Rol: …".
- **Filtros plegables:** la búsqueda queda siempre visible y, a su lado, el botón **Filtros** (con la cantidad de filtros aplicados) despliega o pliega el panel de Tipo/Atención/Estado, que arranca cerrado para no ocupar lugar. Con el panel cerrado, los filtros aplicados se muestran como chips ("Tipo: Médicos ×") que se quitan con un toque. Quitar el Tipo también quita Atención, que depende de él. Altura del bloque: 136 px cerrado frente a 265 px abierto en desktop, y 269 px frente a 657 px en mobile.
- **Filtros ordenados en una tarjeta:** arriba la búsqueda y debajo una fila por filtro (**Tipo**, **Atención** solo con Médicos o Secretarias, y **Estado**), con la etiqueta en una columna fija desde tablet y arriba de los botones en mobile. Cada botón muestra su cantidad en un contador. Tipo, el filtro principal, usa azul sólido al estar activo; Atención y Estado, azul suave. Al pie: "Mostrando N de M usuarios" y **Limpiar filtros** cuando hay alguno aplicado. Botones de al menos 36 px de alto.
- **Filtro "Estado":** Todos / Activos / Inhabilitados / Dados de baja, con su cantidad según el tipo elegido. Se combina con el tipo y con el filtro de atención, y se puede abrir ya aplicado desde el panel general.
- **Acciones solo con íconos** (`IconAction`), centradas: lápiz (editar datos), llave (resetear contraseña) y círculo tachado (inhabilitar). En cuentas inhabilitadas: habilitar y dar de baja. Al pasar el mouse, o al enfocar con el teclado, aparece un globo con la descripción, que además es el nombre accesible del botón. El globo se alinea a la derecha para no salirse de la tabla.
- **Editar datos (lápiz):** abre una ventana con nombre, email y teléfono (los pacientes tienen nombre y apellido por separado). Valida formato, que el email no esté usado por otra cuenta y el teléfono; pide confirmación y avisa si cambia el usuario de acceso. Guarda en la cuenta de acceso (`updateAccount`) y en el estado compartido según el tipo: médicos particulares, médicos y secretarias de clínicas u hospitales, administradores de institución y pacientes.
- **Médicos de clínica u hospital:** VitaDev edita solo sus datos básicos (nombre, email y teléfono). Se guardan como datos de contacto (`doctorContacts` / `updateDoctorContact` en `ClinicDataProvider`) que pisan a los de `doctors.js` en su cuenta y en Gestión de Usuarios. Su perfil público (cartilla, especialidad, foto, biografía) no cambia y lo sigue editando el médico. Si una clínica lo desvincula, la baja usa el email actualizado.
- El lápiz aparece solo en cuentas activas, igual que resetear la contraseña.

### Contraseña temporal con botón Copiar

- Al resetear una contraseña, o al dar de alta un médico particular, una secretaria particular o una institución, la contraseña temporal se muestra en su propia ventana (`TemporaryPasswordModal`), en lugar del aviso verde que se cerraba solo a los 12 segundos.
- La ventana tiene un botón **Copiar**. Al copiar cambia a **"Copiada"** y confirma "Contraseña copiada al portapapeles". Si el navegador no permite copiar, deja la contraseña seleccionada y avisa que se puede copiar con Ctrl + C.
- No se cierra sola ni con un click afuera: se cierra con **Listo** o la X, porque la contraseña se ve una sola vez.

### Decisiones tomadas (confirmadas por el usuario)

- Pacientes: directorio con acciones, solo con datos de contacto.
- Aclaración del borrado: se muestra como aviso al autor en el foro.

### Estilo alineado con las pestañas principales

Particulares y Gestión de Usuarios usan el mismo patrón que el Foro, Profesionales y Solicitar turno: fondo `slate-50`, contenedor `max-w-7xl`, encabezado con etiqueta chica en mayúsculas ("Administración SAMSA") y título grande `font-black` (componente nuevo `src/components/PageHeader.jsx`), y tarjetas y tablas `rounded-3xl` con borde `gray-100`. El Foro ya usaba ese estilo.

### Responsive de todo el módulo

- Clínicas, Hospitales y el Panel general usan el mismo encabezado (`PageHeader`, "Administración SAMSA"), fondo, ancho y tarjetas `rounded-3xl` que el resto.
- **Tablas como tarjetas en mobile y tablet:** en Gestión de Usuarios y en las dos tablas de Particulares, por debajo de 1024 px cada fila se muestra como una tarjeta apilada (sin encabezado de tabla ni scroll lateral) con las acciones visibles a la izquierda. Desde 1024 px vuelven a ser tablas.
- **Globos de los íconos:** se muestran solo desde 1024 px (pantallas con mouse). En mobile y tablet no se dibujan, porque las descripciones largas no entran y el `aria-label` ya las anuncia.
- Revisión automática de las 7 pantallas de VitaDev (Panel general, Particulares, Clínicas, Hospitales, Usuarios, Foro y Mi cuenta) en 375, 768 y 1280 px: sin scroll horizontal de página, sin elementos fuera de pantalla, sin botones de menos de 32 px, sin tablas con scroll lateral ni acciones fuera de la vista, y con los globos dentro de la pantalla en desktop.

### Animaciones de aparición

Las pantallas de administración usan la misma aparición suave que las pantallas principales (`FadeIn`, que sube y hace visible cada bloque al entrar en pantalla):

- **Encabezado** (`PageHeader`) en todas las pantallas.
- **Panel general:** las 7 tarjetas, escalonadas cada 80 ms.
- **Gestión de Usuarios:** filtros (100 ms) y tabla (200 ms).
- **Particulares:** las tablas de médicos y secretarias (150 ms).
- **Clínicas y Hospitales:** cada institución, escalonada (hasta 400 ms).
- **Mi cuenta:** las tres tarjetas (100, 200 y 300 ms).
- **Foro:** encabezado, filtro "Todas / Mis publicaciones" (100 ms) y cada tarjeta, escalonadas por columna (0, 100 y 200 ms). Las tarjetas mantienen la misma altura dentro de la grilla.

Las ventanas emergentes (confirmaciones, edición, contraseña temporal, documentación) quedan fuera de los bloques animados: el `transform` de la animación rompería su posición fija. Verificado: la edición y la confirmación de reseteo siguen cubriendo toda la pantalla.

### Persistencia

Como el resto de los datos de demostración, las notas y los avisos de moderación viven en memoria: se conservan al navegar y se pierden al recargar la página.

### Datos fiscales de clínicas y hospitales

- Al asociar o editar una institución se piden **Razón social** (3 a 120 caracteres), **Código REFES** (14 dígitos, único) y **CUIT** (formato `XX-XXXXXXXX-X`, prefijo 30/33/34, dígito verificador válido y único).
- Check obligatorio **"Verifiqué en ARCA que el CUIT está inscripto y corresponde a la razón social"**: sin marcarlo no se guarda. La tarjeta muestra la razón social, REFES, CUIT y la marca "Verificado en ARCA".
- Las tres instituciones de ejemplo tienen razón social, REFES, CUIT y **obras sociales ficticias**, que se muestran en su tarjeta.
- **Obras sociales que acepta y estudios que se realizan**: cada institución tiene ambas listas (catálogos `INSURANCES` y `STUDIES` de `src/constants/catalog.js`). Se eligen al asociarla o editarla con el componente reutilizable `src/components/CheckboxDropdown.jsx` (lista desplegable con checkboxes) y se muestran como etiquetas en el detalle de la tarjeta, con su cantidad.
- **Estudios**: catálogo `STUDY_GROUPS` agrupado por tipo (Laboratorio, Imágenes, Cardiología, Otros); la lista desplegable los muestra por secciones.
- **Áreas / sectores**: solo se agregan **editando la institución** (botón lápiz), desde una lista con checkboxes con las especialidades que todavía no tiene. La tarjeta solo las muestra; al asociar una institución nueva no se cargan.
- **Documentación de ejemplo completa**: todos los médicos vinculados y particulares tienen Contrato, Matrícula, Seguro y Título vigentes, así no aparece el aviso rojo de documentación faltante.

## Archivos clave tocados

| Archivo | Cambio |
| --- | --- |
| `src/components/Navbar.jsx` | Cabecera de VitaDev: sin Resumen, con Foro. |
| `src/context/ForumContext.jsx`, `src/context/forum-context.js` | `moderatePost`, avisos de moderación (`noticesFor`, `dismissNotice`) y `canModerate`. |
| `src/pages/forum/ModeratePostModal.jsx` (nuevo) | Ventana para eliminar una nota ajena con aclaración. |
| `src/pages/forum/forumPosts.js` | Validación del motivo. |
| `src/pages/NewsForum.jsx` | VitaDev publica y modera; aviso al autor. |
| `src/services/authService.js` | `getPatientAccounts` (identidad y contacto de pacientes). |
| `src/pages/vitadev/userDirectory.js` | Tipo Pacientes, marca `particular`, `sourceId` para editar cada cuenta y datos de contacto editados de los médicos de institución. |
| `src/pages/vitadev/VitadevUsers.jsx` | Título "Gestión de Usuarios", acciones con íconos, edición de datos, filtro Atención, columna Institución oculta para pacientes y filtro inicial desde la URL. |
| `src/pages/vitadev/IconAction.jsx` (nuevo) | Botón de ícono con globo de descripción. |
| `src/pages/vitadev/EditUserModal.jsx` (nuevo) | Ventana para editar nombre, email y teléfono de una cuenta. |
| `src/pages/vitadev/VitadevDashboard.jsx` | "Panel general" y tarjetas de Secretarias y Pacientes. |
| `src/pages/vitadev/TemporaryPasswordModal.jsx` (nuevo) | Ventana de contraseña temporal con botón Copiar. |
| `src/pages/vitadev/useAccountActions.jsx` (nuevo) | Resetear, inhabilitar, habilitar y dar de baja cuentas, con sus ventanas. |
| `src/pages/vitadev/VitadevInstitutions.jsx` | Acciones con íconos en los administradores de cada clínica u hospital. |
| `src/data/institutions.js`, `src/pages/clinic/ClinicDataProvider.jsx` | Documentos de los médicos particulares y `updateParticularDocument`. |
| `src/pages/clinic/documentStatus.js` (nuevo), `ClinicDocumentsModal.jsx` | Estados de los documentos compartidos entre la ventana y el perfil. |
| `src/pages/DoctorProfile.jsx` | Sección "Mi documentación" y "Dónde atiende" correcto para particulares. |
| `src/pages/vitadev/VitadevDoctors.jsx`, `ParticularDoctorsPanel.jsx`, `ParticularSecretariesPanel.jsx` | Pantalla "Particulares": título, acciones con íconos y sin médicos de instituciones. |
| `src/pages/vitadev/InstitutionDoctorsList.jsx` (eliminado) | Lista de médicos de instituciones que ya no se usa. |
| `src/pages/vitadev/VitadevUsers.jsx`, `ParticularDoctorsPanel.jsx`, `ParticularSecretariesPanel.jsx`, `VitadevInstitutions.jsx`, `useSuccessModal.js` | Usan la ventana nueva para las contraseñas temporales; se quitó la duración larga del aviso verde. |

## Validación

Automática:

- `npm run lint` → sin errores.
- `npm run build` → compila limpio.

Manual local (`npm run dev`):

1. **VitaDev** (`admin.samsa@samsa.med`): la cabecera muestra Médicos, Clínicas, Hospitales, Usuarios y Foro, sin Resumen ni Pacientes.
2. **Usuarios:** aparece "Pacientes (3)" (Lucía Fernández, Martín Gómez, Sofía Luna) sin la columna Institución. Inhabilitar a un paciente cambia su estado y muestra Habilitar/Dar de baja.
3. **Filtro Atención:** con Médicos se ve Todos (11), Particulares (3) y De institución (8); con Secretarias, 2 particulares. Al cambiar de tipo vuelve a "Todos".
4. **Acciones** centrada sobre los botones, con y sin la columna Institución.
5. **Foro como VitaDev:** publicar una nota la firma "Equipo VitaDev" con Editar/Borrar. Al abrir la nota de la Dra. Gómez aparece "Eliminar"; sin motivo da error; con motivo se elimina y aparece "se avisó a Dra. Priscila Gómez".
6. **Panel general:** muestra "Panel general" con 11 médicos, 7 secretarias y 3 pacientes. La tarjeta Pacientes abre Gestión de Usuarios con el filtro Pacientes activo.
7. **Íconos:** las acciones son solo íconos y, al pasar el mouse sobre la llave, aparece "Resetear contraseña de …" sin generar scroll en la tabla.
8. **Editar:** con un email ya usado aparece "Ya hay otra persona registrada con ese email". Sofía Luna se editó a "Luna Pérez", `sofia.luna@gmail.com` y un teléfono nuevo; la confirmación avisa del cambio de usuario y la fila se actualiza. Florencia Juárez (secretaria) cambió de email y teléfono. Un médico de institución tiene el lápiz deshabilitado con su explicación.
9. **Copiar contraseña:** resetear la contraseña de Lucía Fernández abre la ventana con la contraseña y el botón Copiar. Con un click real cambia a "Copiada" y muestra la confirmación; si el navegador bloquea el portapapeles, muestra el aviso para copiarla con Ctrl + C. "Listo" la cierra. En 375 px la ventana entra con márgenes de 16 px.
10. **Particulares:** la cabecera dice "Particulares"; la pantalla muestra 3 médicos y 2 secretarias particulares, sin médicos de instituciones, cada uno con lápiz, llave, círculo y papelera. Con Noelia Ferreyra: el lápiz abre su formulario, la llave muestra la contraseña con Copiar, inhabilitar deja "Inhabilitado" con habilitar y papelera, y habilitar vuelve a las cuatro acciones. La tarjeta Médicos del panel general abre Usuarios filtrado por Médicos.
11. **Inhabilitar antes de eliminar:** Tomás Acuña (activo) muestra solo lápiz, llave e inhabilitar; al inhabilitarlo aparecen habilitar y la papelera, y eliminar lo quita de la lista. En Clínicas, Carolina Medina: resetear muestra la ventana de Copiar; inhabilitar deja "Inhabilitado" con habilitar y dar de baja; la baja deja "Baja" sin acciones. En 375 px los íconos entran en la fila del administrador.
12. **Documentación:** en Particulares, Luis Coronel muestra el aviso "1" y Priscila Gómez "4". Al registrar el Seguro de mala praxis de Coronel con vencimiento 30/11/2027, el aviso desaparece ("al día"). Al entrar como Coronel (sin recargar), su perfil muestra "Mi documentación · Al día" con los 4 documentos vigentes, y "Dónde atiende" muestra su consultorio particular. En 375 px las tarjetas de documentos entran sin desborde.
13. **Editar personal de instituciones:** en Usuarios, el Dr. Jesús Zelarayan (Clínica del Norte) tiene el lápiz habilitado; se cambió su email a `jesus.zelarayan@clinicadelnorte.med` y un teléfono, la fila se actualizó, y después inició sesión con el email nuevo. Ana Paula Díaz (secretaria de clínica) cambió su teléfono. Particulares ya no muestra el texto descriptivo.
14. **Panel general por estado:** con Martín Gómez inhabilitado y Sofía Luna dada de baja, el panel muestra Inhabilitados 1 y Bajas 1 en una segunda fila (en 1440 px y 768 px). Inhabilitados abre Usuarios con "Inhabilitados (1)" y solo Martín Gómez; Bajas abre "Dados de baja (1)" con Sofía Luna.
15. **Filtros:** a 800 px las filas Tipo y Estado se alinean bajo la columna de etiquetas; al elegir Médicos aparece Atención; con Médicos + Particulares el pie dice "Mostrando 3 de 24" y "Limpiar filtros" vuelve todo a "Todos" (24 de 24). Sin errores en consola. En 375 px las etiquetas van arriba de cada grupo, los botones entran en la tarjeta (16–359 px) y miden 36 px de alto; en 1440 px cada fila entra en una línea.
16. **Alta con atención y documentación obligatoria:** el alta vacía pide, entre otros, "Elegí al menos un día de atención" y "Marcalo como recibido: es obligatorio para crear la cuenta" en los cuatro documentos. Con Mar y Jue de 10:00 a 14:00, OSDE y PAMI, y los cuatro documentos con sus vencimientos, "Dra. Valeria Ríos" se crea con "Mar, Jue · 10:00 a 14:00 · OSDE, PAMI" y la documentación al día. Editar al Dr. Coronel sumando IOS actualiza la tabla, y su perfil muestra "Lun, Mié, Vie · 09:00 a 13:00" y "Acepta: OSDE, Swiss Medical, IOS". El desplegable de obras sociales se abre, marca y cierra con "Listo" (Priscila Gómez pasó a 4 obras sociales). En 375 px el panel va en una columna, dentro del formulario.
17. **Eliminar desde el detalle:** como VitaDev, ninguna tarjeta tiene botones de borrar. Al abrir "Neuroplasticidad y Ejercicio" (nota institucional) aparece "Eliminar", pide confirmación y la nota desaparece del foro. Al abrir la nota de la Dra. Gómez, el mismo botón abre la ventana de aclaración para el autor. En una nota propia, la tarjeta solo muestra "Editar" y el detalle "Editar" y "Borrar".
18. **Foro como la Dra. Gómez** (`priscila.gomez@samsa.med`, sin recargar la página): ve el aviso con el motivo, lo descarta, y la nota de VitaDev no tiene acciones para ella.

Responsive (sin scroll horizontal):

| Ancho | Resultado |
| --- | --- |
| 375 px (mobile) | Menú hamburguesa de VitaDev con Foro; filtros de Usuarios en varias líneas dentro del ancho; ventana de edición con márgenes de 16 px; panel general en una columna. |
| 768 px (tablet) | Usuarios y foro (2 columnas) correctos. |
| 1280–1440 px (desktop) | Cabecera de VitaDev entra completa; tabla y foro correctos; panel general con las 7 tarjetas en una fila. |

No probado en mobile: la ventana de moderación (sí en desktop).
- Clínicas: enviar el alta vacía muestra los errores de razón social, REFES, CUIT y del check de ARCA; el formulario no tiene scroll horizontal a 375 px.
- Hospitales: marcar Neurología y Urología en la lista de sectores, Agregar → Confirmar muestra "¡Sectores agregados!" y el contador pasa de 3 a 5.
- Clínicas: cada tarjeta muestra "Obras sociales que acepta" y "Estudios que se realizan"; en Editar se suma Mamografía desde la lista. Sin scroll horizontal a 375 y 1280 px.
- Clínicas: la tarjeta ya no tiene el formulario de áreas; en Editar se agrega Urología y el contador pasa de 4 a 5. Particulares: ningún botón de Documentación muestra el aviso rojo.
- Revisión general VitaDev (Panel general, Particulares, Clínicas, Hospitales, Gestión de Usuarios, Mi cuenta y Foro) a 375, 768 y 1280 px: sin scroll horizontal ni elementos desbordados. "Mi cuenta" se alineó al resto: `PageHeader` con aparición suave, fondo `bg-slate-50`, tarjetas `rounded-3xl` y padding responsive.
- Documentación de particulares: toda recibida y vigente, salvo el Seguro de mala praxis del Dr. Luis Coronel, que vence el 05/12/2026. Nuevo estado calculado **Por vencer** (vence dentro de 30 días): badge ámbar con ícono de peligro en la ventana y aviso ámbar "!" en el botón Documentación (no cuenta como faltante; el botón de la fila pasa a "Actualizar vencimiento").

## Correcciones de revisión del PR

1. **Particulares:** al tocar "Agregar secretaria" ya no se recarga la sección de médicos. El panel que estaba abierto cierra su formulario con `closeToken`, sin volver a montarse ni repetir la animación (`VitadevDoctors.jsx`, `ParticularDoctorsPanel.jsx`, `ParticularSecretariesPanel.jsx`).
2. Se quitó el ícono de estrellas (✨) de los títulos "Asociar clínica / hospital / médico".
3. El check de ARCA dice: "Es necesario que la institución se encuentre inscripta al ARCA."
4. Los formularios de alta y edición se cierran con una **X** en la esquina (mismo formato que el resto de SAMSA), en lugar del botón "Cancelar".
5. En las ventanas de confirmación, el botón "Revisar" ahora dice **"Cancelar"** (`ClinicModals.jsx`, compartido con clínica y hospital).
6. El usuario del administrador pasa a ser **`admin.samsa@samsa.med`** (contraseña `12345`), y se eliminó la cuenta vieja `admin@samsa.med`, que no estaba en uso.

Validación: `npm run lint` y `npm run build` sin errores. En el navegador:
- `vitadev@samsa.med` ya no entra y `admin.samsa@samsa.med` sí.
- En Particulares, abrir "Asociar médico" y después "Agregar secretaria" cierra el primer formulario sin recargar la tabla de médicos.
- La confirmación de edición de una clínica muestra "Cancelar / Sí, Modificar".
7. **Etiquetas al pasar el mouse (`IconAction.jsx`):**
   - Nunca se superponen: hay una sola visible a la vez y no queda abierta después de un click.
   - Se dibujan flotando sobre la página, así no las recorta la tabla ni quedan debajo de otra tarjeta, y se acomodan para no salirse de la pantalla.
   - Se ocultan al hacer scroll.
8. Se quitó el emoji ✏️ de los títulos "Editando…" (VitaDev), igual que las estrellas.

Validación adicional:
- Pantallas de VitaDev y Foro a 375, 768 y 1280 px, también con los formularios abiertos: sin scroll horizontal ni elementos desbordados.
- En Gestión de Usuarios, la etiqueta de la primera fila se ve completa, y al pasar a otro ícono queda una sola.
9. **Botón X de cierre:** X dentro de un círculo gris claro (`bg-slate-100`). Al pasar el mouse, el círculo se pone rojo suave (`bg-red-50`) y la X rojo intenso (`text-red-600`). Se usa en los formularios de alta/edición (médicos, secretarias, instituciones y administrador) y en las ventanas de VitaDev (editar usuario, contraseña temporal y confirmación escribiendo el nombre).
