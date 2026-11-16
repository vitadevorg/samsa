# Panel de secretaría: obra social en el turno manual, modales y estilo unificado

**Rama:** `feature/secretaria-turno-manual`

---

## Objetivo

1. Cuando la secretaria registra un turno a mano (modal **Registrar Turno Manual**), pedir y validar los datos de afiliación a la obra social **de la misma forma que en el turno sin registro del paciente** (ver [`validacion-obra-social.md`](./validacion-obra-social.md)). Cierra el punto que había quedado fuera de alcance: "Carga de afiliación desde `NewTurnModal.jsx`".
2. Que todos los modales del panel se puedan cerrar con **click afuera**.
3. Que todo el panel de secretaría (agenda y directorio de pacientes) use **las mismas tonalidades y estilos que las pantallas principales** (reserva de turno, profesionales, preguntas frecuentes), y que sea **responsive** en mobile, tablet y desktop.
4. Evitar errores de las secretarias que manejan **varias agendas**: el modal aclara de qué médico es el turno.
5. Mostrar una **pantalla de salida** al registrar el turno, con el mismo estilo que el resto.

---

## Qué se implementó

### 1. Obra social en el turno manual — `NewTurnModal.jsx`
- Debajo de **Obra Social / CUIT** se muestra el componente reutilizable `AffiliationFields`. Solo aparece si la obra social requiere afiliación: con "Ninguna (particular)" no se piden datos.
- Las reglas son las mismas que en el turno de invitado (`validateAffiliation`):
  - **Nº de afiliado:** obligatorio, solo dígitos, entre 6 y 15. Las letras no se pueden escribir.
  - **Adherente:** el nombre y el DNI del titular son obligatorios. El DNI debe tener 7 u 8 dígitos y no puede ser igual al DNI del paciente cargado en el formulario.
  - El formato inválido se avisa en línea mientras se escribe. Al tocar **Registrar Turno**, se marcan además los campos vacíos, aparece el aviso *"Revisá los datos de afiliación de la obra social antes de registrar el turno."* y el turno **no** se registra.
- **Cambio de obra social:** igual que en el turno de invitado, al elegir otra obra social se limpian el nº de afiliado, el plan, la condición titular/adherente, los datos del titular y sus errores. Lo mismo pasa cuando el DNI autocompleta (o borra) la obra social de un paciente registrado.
- El selector muestra "Ninguna (particular)", igual que en la reserva del paciente.
- Los datos viajan en `onSubmit({ ...turno, affiliation })`. Si la obra social no requiere afiliación, `affiliation` es `null`. `handleCreateTurn` (`SecretaryDashboard.jsx`) guarda `obraSocial` y `affiliation` en el turno.
- **Textos para la secretaria:** nueva prop `audience` (`'patient'` por defecto, o `'staff'`) en `AffiliationFields.jsx` y opción `audience` en `validateAffiliation`. Solo cambia la redacción ("¿El paciente es el titular?", "Es adherente (familiar)", "Ingresá el número de afiliado"…), no las reglas. El registro, la reserva y el perfil del paciente no cambian.

### 1b. Médico de la agenda y pantalla de salida
- **Etiqueta del médico** (`DoctorTag` en `SecretaryModal.jsx`): debajo del título de **Registrar Turno Manual** y de **Reprogramación de Turno** aparece, en chico, *"Agenda de Dr. X · Especialidad"*. Se toma del profesional dueño de la agenda: el elegido en el selector, o el de la columna desde la que se tocó **Asignar Turno**.
- **Pantalla de salida** (`TurnCreatedView` en `NewTurnModal.jsx`): al registrar, el modal no se cierra de golpe. Muestra:
  - Check verde animado y el título "Turno **registrado**" (o "reasignado" si viene de la bolsa de suspenso), con la palabra destacada en el degradado de marca. Las animaciones de entrada son las mismas que en la confirmación de la reserva del paciente y se desactivan con `prefers-reduced-motion`.
  - Frase de confirmación con paciente, fecha y hora.
  - Resumen: paciente (y DNI), profesional (y especialidad), fecha y hora, cobertura (obra social y Nº de afiliado, o "Atención particular") y canal de origen.
  - Botones **Cargar otro turno** (abre un formulario limpio para el mismo médico) y **Listo, volver a la agenda** (primario azul).
  - Click afuera, Escape y la X también cierran la salida.
- `SecretaryDashboard.jsx`: `handleCreateTurn` ya no cierra el modal. Cada apertura de **Nuevo Turno** recibe un `key` nuevo, para que "Cargar otro turno" monte un formulario vacío sin arrastrar datos del turno anterior (ni el turno de suspenso de origen).

### 1c. Calendarios desplegables y motivo del turno
- **Calendarios que se guardan solos** (`SecretaryCalendar.jsx`): el calendario desplegable (fecha del turno, fecha de nacimiento y el de la tira de fechas de la agenda) se cierra al hacer click, tocar o pasar el foco a cualquier otro lugar. Por ejemplo, al abrir el calendario del turno con el de nacimiento abierto, este último se guarda. Navegar meses o años dentro del calendario no lo cierra, y su botón sigue funcionando para abrirlo y cerrarlo. El calendario fijo de la reprogramación no cambia.
- **Se quitó el motivo de consulta** del turno manual: el campo del formulario, la línea del resumen de salida, el dato guardado en el turno y la línea "Motivo" de la ficha del paciente.

### 1d. CUIT/CUIL coherente con el DNI
- El CUIT/CUIL sigue siendo **opcional**, pero si se completa tiene que corresponder al paciente (`validateOptionalCuil` y `cuilMatchesDni` en `src/utils/cuil.js`):
  - Se formatea solo mientras se escribe (`XX-XXXXXXXX-X`) y no acepta letras.
  - Los **8 dígitos del medio deben coincidir con el DNI**. Un DNI de 7 dígitos se compara con un 0 adelante. Si no coinciden: *"Los datos del CUIT/CUIL no coinciden con el DNI"*.
  - También se controla el tipo (20, 23, 24, 27 o 30, 33, 34) y el dígito verificador, con la misma regla que ya usa la solicitud de adhesión profesional.
  - El aviso aparece en el momento, en cuanto el CUIL tiene los 11 dígitos, y se recalcula si cambia el DNI. Al tocar **Registrar Turno** también se marca un CUIL incompleto, y el turno no se registra hasta corregirlo o borrarlo.
- El aviso rojo del formulario pasó a decir *"Revisá los datos marcados en rojo (CUIT/CUIL o afiliación a la obra social) antes de registrar el turno."*

### 2. Modales: click afuera, Escape y scroll — `dashboard/SecretaryModal.jsx` (nuevo)
- `SecretaryModalOverlay`: fondo compartido por **todos** los modales del panel (turno manual, reprogramación, confirmar llegada o cancelación, aviso, chat, ficha del paciente, bolsa de suspenso con su confirmación, y alta y edición de pacientes).
  - Se cierra con **click en el fondo**. Solo cuenta si el click empieza y termina afuera, así que arrastrar una selección de texto desde un campo hacia afuera no lo cierra.
  - También se cierra con **Escape**.
  - Con **modales apilados** (por ejemplo, la confirmación de eliminar encima de la bolsa de suspenso), el click afuera y Escape cierran **solo el de arriba**.
  - Usa `my-auto` en lugar de `items-center`: se centra si entra en pantalla y, si es más alto, se puede scrollear completo sin que se corte la parte de arriba (antes pasaba en el turno manual y en la reprogramación).
  - `role="dialog"`, `aria-modal` y `aria-labelledby` con el título.
- `SecretaryModalHeader` y `SecretaryModalCard`: encabezado claro (ícono en `bg-blue-50`, título `text-gray-900`, botón cerrar redondo `bg-gray-100`) y tarjeta blanca `rounded-3xl` con borde `gray-100`, como la tarjeta de *Reserva de Turno*.

### 3. Estilo unificado con las pantallas principales
Se reemplazó el tema oscuro (`slate-900`) y los acentos rosados (`pink-600`) por el tema claro clínico de `docs/design-system.md`: fondo `bg-gray-50/50`, tarjetas blancas con borde `gray-100`, primario `blue-600` con hover `blue-700` y sombra `shadow-blue-500/30`, y títulos `text-gray-900` con la palabra destacada en el degradado de marca (`from-blue-600 to-indigo-600`).

| Pantalla / componente | Antes | Ahora |
|---|---|---|
| Encabezado de la agenda (`AgendaHeader`) | Tarjeta oscura | Encabezado claro como Preguntas Frecuentes: insignia azul, "Agenda **Diaria**" con degradado, selector de profesional blanco y selector de vista segmentado (activo en azul, como el filtro de Profesionales). |
| Tira de fechas (`DateStrip`) | Seleccionado en `slate-800` | Seleccionado en `blue-600`, "Hoy" en `blue-50`. |
| Lista diaria (`AgendaTable`) | Encabezado oscuro, buscador oscuro, botón rosa | Encabezado blanco, buscador como el de Profesionales y **Nuevo Turno** con el botón primario azul. |
| Vista en columnas (`AgendaColumns`) | Encabezados oscuros | Encabezados blancos con la especialidad como etiqueta azul (como las tarjetas de Profesionales). |
| Estados (`StatusBadge`) | Colores sueltos | Colores semánticos del design system (`amber`, `emerald`, `red`, `blue`). |
| Calendario (`SecretaryCalendar`) | Selección en `slate-800` | Selección en `blue-600`, hoy en `blue-50`. |
| Modales | Encabezados oscuros o en degradado rosa | Encabezado claro común y botones primarios azules. |
| Directorio de pacientes (`SecretaryPatients`) | Rosa (botón, búsqueda, tarjetas, modal) | Encabezado como la agenda, tarjetas como las de Profesionales (barra azul al hacer hover y botón "Editar Contacto" como "Ver Disponibilidad"). |
| Navbar (rol secretaria) | Avatar y etiqueta "Modo Operativo" en rosa | Avatar `blue-600` y etiqueta en `blue-50`. |

### 4. Responsive
- **Lista diaria:** antes era una tabla con `min-w-[800px]` que obligaba a scrollear de costado en mobile y tablet. Ahora, en mobile y tablet (`< lg`), cada turno es una tarjeta (horario, paciente, origen, estado y acciones). La tabla se muestra desde `lg`.
- **Encabezado de la agenda:** en tablet los controles bajan debajo del título (antes se apretaban a su lado). Pasan a la misma fila desde `lg`.
- **Acciones que solo aparecían con hover** (WhatsApp en la lista y reprogramar o cancelar en las columnas): ahora se ven siempre en pantallas táctiles. En desktop siguen apareciendo al pasar el mouse o con foco de teclado.
- **Modales:** padding reducido en mobile, botones apilados (`flex-col-reverse`) en pantallas chicas, grillas de email y teléfono en una columna en mobile, y el chat con alto limitado al de la pantalla.
- **Directorio de pacientes:** los datos de la tarjeta quedan en una columna en mobile (antes el email se cortaba).

### Fuera de alcance
- **Declaración jurada:** en el turno de invitado la declara el propio paciente. En el turno manual no se agregó, porque quien carga los datos es la secretaria. `[CONFIRMAR]` si se quiere un check del tipo "El paciente declaró que los datos son verídicos".
- Mostrar el nº de afiliado en la ficha del paciente o en la agenda de la secretaria.
- Autocompletar la afiliación de pacientes registrados (los datos de ejemplo de `mockData.js` no la tienen).
- `docs/design-system.md` todavía describe un "tema oscuro ejecutivo" para los paneles B2B. El panel de secretaría ahora usa el tema claro. `[CONFIRMAR]` si se actualiza el design system para el resto de los paneles internos.

---

## Archivos clave tocados

| Archivo | Cambio |
|---------|--------|
| `src/pages/secretary/dashboard/SecretaryModal.jsx` | **Nuevo.** Fondo (click afuera, Escape, modales apilados, scroll), encabezado, tarjeta y etiqueta del médico (`DoctorTag`). |
| `src/pages/secretary/dashboard/NewTurnModal.jsx` | Afiliación y validación, limpieza al cambiar de obra social, aviso al enviar, etiqueta del médico, pantalla de salida, modal común y estilo claro. |
| `src/components/AffiliationFields.jsx` | Prop `audience` para los textos de la secretaria. |
| `src/utils/insuranceValidation.js` | Opción `audience` en `validateAffiliation` para los mensajes. |
| `src/utils/cuil.js` | `cuilMatchesDni` y `validateOptionalCuil`: el CUIL opcional debe coincidir con el DNI. |
| `src/pages/secretary/SecretaryDashboard.jsx` | El turno creado guarda `obraSocial` y `affiliation`. Pasa el médico a los modales, mantiene abierta la salida y arma "Cargar otro turno". Fondo y espaciado del design system. |
| `src/pages/secretary/dashboard/AgendaHeader.jsx`, `DateStrip.jsx`, `AgendaTable.jsx`, `AgendaColumns.jsx`, `StatusBadge.jsx` | Estilo claro y responsive (tarjetas en mobile y tablet). |
| `src/pages/secretary/dashboard/SecretaryCalendar.jsx` | Estilo claro. El desplegable se cierra al tocar o enfocar otro lugar. |
| `src/pages/secretary/dashboard/RescheduleModal.jsx`, `ConfirmActionModal.jsx`, `NotificationModal.jsx`, `ChatModal.jsx`, `PatientProfileModal.jsx`, `SuspendedDrawer.jsx` | Modal común (click afuera) y estilo claro. |
| `src/pages/secretary/SecretaryPatients.jsx` | Estilo claro, modales comunes y tarjetas responsive. |
| `src/components/Navbar.jsx` | Avatar y etiqueta de la secretaria en azul. |

---

## Validación

### Automática
```bash
npm run lint    # sin errores
npm run build   # compila OK (el aviso de tamaño de chunk ya existía)
```

### Manual local (`npm run dev`)
Ingresar como secretaria (`secretaria@samsa.med`) → `http://localhost:5173/secretary/dashboard`.

**Obra social en el turno manual** (**Nuevo Turno**):
1. Con "Ninguna (particular)" no aparecen los datos de afiliación.
2. Elegir "OSDE": aparece *Datos de afiliación · OSDE*. Escribir `12ab3` en Nº de afiliado: queda `123` y aparece en el momento "Número de afiliado inválido: debe tener entre 6 y 15 dígitos".
3. Cambiar el DNI por uno no registrado: la obra social vuelve a "Ninguna" y desaparecen los datos. Elegir OSDE de nuevo: los campos están vacíos y en "Es el titular".
4. Completar paciente, fecha y horario con el Nº de afiliado vacío, y tocar **Registrar Turno**: no se registra, se marca "Ingresá el número de afiliado" y aparece el aviso rojo.
5. Elegir "Es adherente (familiar)" y poner como DNI del titular el mismo DNI del paciente: aparece "El DNI del titular no puede ser el del paciente…".
6. Corregir el DNI del titular y registrar: aparece la pantalla **Turno registrado** con el resumen (paciente, profesional, fecha y hora, cobertura con Nº de afiliado y canal). El turno ya figura en la agenda.

**Médico de la agenda y salida:**
- Debajo del título del modal se lee *"Agenda de Dr. Jesús Zelarayan · Cardiología"*. En la vista en columnas, **Asignar Turno** de otra columna muestra el médico de esa columna (por ejemplo, *"Agenda de Dr. Rocha · Clínica Médica"*). **Reprogramar** muestra la misma etiqueta.
- En la salida, **Cargar otro turno** abre el formulario vacío para el mismo médico, con el horario recién tomado ya ocupado. **Listo, volver a la agenda**, la X, Escape o un click afuera la cierran.

**CUIT/CUIL:**
- Poner DNI `30111222` y escribir `20301112239` en CUIT/CUIL: queda `20-30111223-9` y aparece *"Los datos del CUIT/CUIL no coinciden con el DNI"*.
- Cambiarlo por `20-30111222-0`: el aviso desaparece. Cambiar el DNI a `30111223`: el aviso vuelve.
- Con el CUIL que no coincide (o incompleto), completar el turno y tocar **Registrar Turno**: no se registra y aparece el aviso rojo. Con el CUIL corregido o vacío, se registra.

**Calendarios y motivo:**
- Abrir el calendario de la tira de fechas y hacer click en el título de la agenda: se cierra.
- En **Nuevo Turno**, abrir *Fecha de Nacimiento* y tocar *Nombre Completo*: se cierra. Abrirlo de nuevo y abrir *Fecha del Turno*: queda abierto solo el del turno. Pasar de mes dentro del calendario no lo cierra.
- El formulario ya no tiene *Motivo de Consulta* y la salida no muestra motivo.

**Cerrar modales con click afuera:**
7. Abrir **Nuevo Turno** y hacer click en el fondo oscuro: se cierra. Hacer click dentro del modal: no se cierra. Escape lo cierra.
8. Probar lo mismo con **Reprogramar**, **Cancelar** (confirmación), el **chat**, la **ficha del paciente** (click en un nombre), **Suspenso** y, en `/secretary/patients`, **Nuevo Paciente** y **Editar Contacto**. Todos se cierran.
9. Cancelar un turno tildando *Enviar a Bolsa de Suspenso*, abrir **Suspenso** y tocar la X de un paciente. Con la confirmación abierta, un click afuera o Escape cierran **solo la confirmación**. Un segundo click afuera cierra el panel.

**Estilo y responsive** (probado en el navegador):
- **Mobile (375px):** agenda con tarjetas de turno y acciones visibles, encabezado apilado, modales completos desde su encabezado y directorio de pacientes en una columna. Sin scroll horizontal.
- **Tablet (768px):** controles del encabezado debajo del título, turnos como tarjetas en una fila (datos a la izquierda y acciones a la derecha) y vista en columnas con las acciones visibles. Sin scroll horizontal.
- **Desktop (1280px):** encabezado en una fila, tabla completa sin scroll y modales centrados.
- Sin errores en la consola.
