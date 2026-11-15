# Cuenta de la secretaria (`feature/cuenta-secretaria`)

Pantalla **Mi cuenta** para el rol secretaria, basada en el perfil del paciente (`UserProfile.jsx`): encabezado con degradé y foto, tarjetas blancas `rounded-3xl`, edición con confirmación y avisos de éxito.

## Qué se implementó

- **Acceso desde el menú:** opción **Mi cuenta** en el desplegable del usuario (desktop) y en el menú hamburguesa (mobile/tablet) de la secretaria. Lleva a `/secretary/account`.
- **Campos editables:**
  - **Nombre y apellido** (validación `validateName`) y **teléfono** (opcional, `validatePhone`, formato argentino de 10 dígitos). Se editan con "Editar datos" → "Guardar" → modal de confirmación.
  - **Correo (usuario):** editable junto con los demás datos. Debe terminar en `@samsa.med` (además del formato de email y de no estar usado por otra cuenta). Al cambiarlo se pide la **contraseña actual**, y el modal de confirmación avisa que el usuario anterior deja de funcionar. Se actualiza la cuenta de acceso (`updateAccount`) y la ficha de la secretaria en la institución (`updateSecretary`), para que la Agenda Diaria siga encontrando sus médicos.
  - **Foto:** misma interacción que el perfil del paciente: al pasar el mouse (o enfocar con teclado) sobre la foto aparecen los botones de cámara (subir/cambiar) y papelera (eliminar). Se guarda al instante. Solo imágenes, máximo 2 MB; los errores se muestran junto a la foto.
  - **Contraseña:** pide la actual (`verifyPassword`), valida la nueva (mínimo 8 caracteres, letras y números, distinta de la actual) y su repetición, y confirma antes de guardar (`setOwnPassword`).
- **Solo lectura (no editables):**
  - **DNI** (`user.dni`; si la cuenta no lo tiene muestra "No registrado"). Mientras se editan los datos aparece el aviso "El DNI es gestionado por administración. Contactá a soporte en caso de error."; fuera del modo edición no se muestra. Se agregó un DNI ficticio a las cuentas demo `secretaria@samsa.med` y `ana.diaz@samsa.med` en `authService.js`.
  - **Médicos de tu agenda:** tarjeta con nombre, especialidad y consultorio de los médicos que le asignó el administrador de su institución. Usa `buildSecretaryDoctors`, el mismo cálculo de la Agenda Diaria, así que ambas pantallas siempre coinciden. Sin médicos asignados muestra un mensaje.
- **Pantalla separada:** solo lee y escribe la cuenta de la persona con sesión iniciada (`updateUser` + `updateAccount` sobre su propio email). No toca las cuentas de otros perfiles ni los componentes del paciente.
- Los cambios persisten en el servicio de autenticación simulado (en memoria), por lo que se conservan al cerrar sesión y volver a entrar mientras la página no se recargue.
- Reutiliza `SecretaryModal*` (cierre con click afuera o Escape) y las validaciones de `clinicValidation.js`.

## Corrección incluida: "Hoy" en la Agenda Diaria

La tira de fechas marcaba "Hoy" en el día en que se abrió la página: la tira se armaba una sola vez y nada volvía a calcular la fecha, así que con la pantalla abierta pasada la medianoche (o con la PC suspendida) seguía mostrando el día anterior como "Hoy".

- Nuevo hook `useToday` (`dashboard/useToday.js`): recalcula la fecha a medianoche y cuando la pestaña vuelve a estar visible o enfocada.
- `SecretaryDashboard.jsx`: la tira de fechas se rearma con el nuevo "hoy"; si la secretaria estaba mirando el día que dejó de ser hoy, la vista pasa al nuevo hoy.
- `dates.js`: `buildDateCarousel` recibe la fecha de hoy y `formatDateToLocale` fija `timeZone: 'UTC'` para que el nombre del día no se corra por huso horario.

## Archivos clave tocados

- `src/pages/secretary/SecretaryAccount.jsx` (nuevo)
- `src/App.jsx` (ruta `/secretary/account` protegida con `ROLES.SECRETARY`)
- `src/components/Navbar.jsx` (opción "Mi cuenta" en menú desktop y mobile)
- `src/services/authService.js` (DNI ficticio en dos cuentas demo de secretaria)
- `src/pages/secretary/SecretaryDashboard.jsx`, `src/pages/secretary/dashboard/dates.js`, `src/pages/secretary/dashboard/useToday.js` (nuevo) (corrección de "Hoy")
- `docs/cuenta-secretaria.md` y `docs/INDEX.md`

## Validación

Automática:

- `npm run lint` → sin errores.
- `npm run build` → compila limpio.

Manual local (`npm run dev`, cuenta demo `secretaria@samsa.med`):

1. Iniciar sesión como secretaria → menú del usuario → **Mi cuenta** abre `/secretary/account`.
2. Editar datos: un teléfono inválido (`123`) muestra el error; con `381 400-1001` y confirmación, se guarda y aparece el aviso de éxito.
3. Cambiar contraseña: con actual incorrecta, nueva corta y confirmación distinta se muestran los tres errores; con datos válidos se confirma y se guarda.
4. Foto: subir/cambiar/eliminar actualiza también el avatar del Navbar.
5. Correo: `maria@gmail.com` muestra el error de dominio `@samsa.med`; con `maria.gonzalez@samsa.med` y la contraseña actual se guarda, el encabezado muestra el correo nuevo y la lista de médicos sigue completa.
7. "Hoy": con la Agenda Diaria abierta se simuló el cambio de día (reloj adelantado 24 h + evento de foco) y la marca "Hoy" pasó de 14 nov a 15 nov con la tira recentrada.
6. DNI aparece deshabilitado aun en modo edición; "Médicos de tu agenda" lista los mismos médicos que la Agenda Diaria (con `secretaria@samsa.med`: Dr. Jesús Zelarayan, Dr. Rocha y Lic. Paulina Quinteros).

Responsive (sin scroll horizontal en ninguno):

| Ancho | Resultado |
|-------|-----------|
| 375 px (mobile) | Una columna, botones de ancho completo, toast legible. |
| 768 px (tablet) | Una columna, campos y tarjetas de médicos en dos columnas. |
| 1440 px (desktop) | Datos personales y médicos (2/3) y Seguridad (1/3) lado a lado. |

Pendiente de la persona responsable: prueba manual propia antes de abrir el PR (en particular la subida de una foto real, que no se probó con un archivo).

## Correcciones de revisión del PR

Comentario de revisión de `lglucasgabriel` en el PR #18, resuelto en la misma rama:

- **Espacio en blanco en pantallas grandes:** *Información personal* y *Médicos de tu agenda* eran hijas directas del grid `lg:grid-cols-3` en filas distintas, así que al abrir "Cambiar contraseña" la columna Seguridad estiraba la fila 1 y empujaba hacia abajo a Médicos. Ahora ambas tarjetas están dentro de un mismo contenedor `lg:col-span-2 space-y-6 sm:space-y-8` (igual que `UserProfile.jsx`); con el formulario de contraseña abierto la separación queda en 32 px a 1440 px.
- **Mensaje al cambiar el correo:** distingue entre contraseña vacía ("Ingresá tu contraseña actual para cambiar el correo.") y contraseña incorrecta ("La contraseña actual no es correcta."), como en Seguridad.
- **Menú mobile (`Navbar.jsx`):** los tres enlaces de secretaria (Agenda Diaria, Directorio Pacientes y Mi cuenta) cierran el menú hamburguesa al navegar.

Verificado con `npm run lint`, `npm run build` y prueba local a 1440 px (separación entre tarjetas con el formulario abierto y ambos mensajes de contraseña), 375 px (el menú se cierra al navegar) y 768 px, sin scroll horizontal.
