# Edición del Perfil Profesional del médico (`feature/edicion-perfil-medico`)

La pantalla **Perfil Profesional** del médico (`/doctor/profile`, en el menú del usuario y en el menú móvil) ahora funciona como "Mi cuenta" de los demás perfiles: el médico edita su nombre, contacto, foto y contraseña, con la ventana naranja de confirmación y la ventana verde de salida.

Antes, `/doctor/profile` reutilizaba el perfil público (`DoctorProfile.jsx`) con un panel oscuro de "Gestión de Perfil". Desde ese panel se podía cambiar la especialidad, pero no el nombre, el teléfono, el correo ni la contraseña. Además, lo que se guardaba quedaba solo en la sesión.

## Decisiones tomadas con el usuario

- **Pantalla:** se rediseña con el estilo de "Mi cuenta" de secretaría: cabecera con degradé y foto, tarjetas blancas `rounded-3xl`, Seguridad a la derecha en desktop. El perfil público que ven los pacientes (`/professionals/:id`) se ve igual que antes.
- **Especialidad y matrícula:** solo lectura, con candado. Las gestiona la institución (o VitaDev, si el médico es particular). Si hay un error, se contacta a soporte.
- **Correo (usuario):** tiene que terminar en `@samsa.med`, igual que en la secretaría. Para cambiarlo se pide la contraseña actual.

## Qué se implementó

- **Nueva pantalla `DoctorAccount.jsx`** en `/doctor/profile`:
  - **Cabecera:** foto (al pasar el mouse o enfocar con teclado aparecen cámara y papelera; solo imágenes, máximo 2 MB), "Dr./Dra." + nombre, especialidad, correo y el botón **Ver mi perfil público**.
  - **Información personal:** "Editar datos" → nombre y apellido (`validateName`, sin el título, que se mantiene), teléfono (`validatePhone`) y correo (usuario) → "Guardar" → `EditConfirmModal` → `SuccessModal`. Si cambia el correo, se pide la contraseña actual y el aviso dice que el usuario anterior deja de funcionar.
  - **Datos profesionales:** especialidad y matrícula de solo lectura ("No registrada" si la ficha no la tiene) y **biografía** editable (máximo 400 caracteres, con contador). Si el médico es **particular**, además edita la dirección del consultorio (`validateAddress`), los días y horario (`validateSchedule`) y las obras sociales que acepta.
  - **Dónde atendés:** sus vinculaciones con clínicas u hospitales, con la solicitud de cambio de horario que ya existía (pendiente, última resuelta y "Solicitar cambio de horario"). Ahora el pedido se confirma con la ventana naranja y termina con la verde. Si es particular, muestra su consultorio, horario y obras sociales.
  - **Reseñas de pacientes** (`DoctorReviews.jsx`, solo lectura): puntaje promedio con estrellas (admite decimales, por ejemplo 4.6 llena el 60 % de la quinta), cantidad total de reseñas y la lista de reseñas con comentario: inicial, nombre, fecha, estrellas y texto. Los textos largos se cortan con "Leer completa". Se ordenan por "Más recientes", "Mejor puntaje" o "Menor puntaje" y se cargan de a 3 con "Ver más reseñas (n)" / "Ver menos". En la cabecera, un chip "★ 4.9 · 342 reseñas" lleva hasta la sección. Los datos salen del perfil público (`rating`, `reviewsCount` y `reviews` de `src/data/doctors.js`), así que el médico ve lo mismo que los pacientes. No puede responder, editar ni borrar reseñas.
  - **Mi documentación** (solo particulares): igual que antes.
  - **Seguridad:** cambio de contraseña con la actual (`verifyPassword`), la nueva (mínimo 8 caracteres, letras y números, distinta de la actual) y su repetición, con confirmación y salida (`setOwnPassword`). Debajo está **Cerrar sesión**.
- **Sincronización de los datos:** al guardar se actualizan:
  - la cuenta de acceso (`updateAccount`), así que el nuevo correo y la nueva contraseña sirven para volver a entrar;
  - la sesión (`updateUser`), y el Navbar muestra enseguida el nuevo apellido ("Dr. Ruiz") y la foto;
  - la ficha del médico en el estado compartido, con el mismo criterio que la edición desde VitaDev: `updateParticularDoctor` si es particular y `updateDoctorContact` si atiende en una institución. Así VitaDev, su institución y esta pantalla lo siguen encontrando por el correo nuevo. Como en VitaDev, el nombre editado no cambia el perfil público de `doctors.js`.
- **Perfil público limpio:** `DoctorProfile.jsx` queda solo como perfil público. Se quitaron la vista propia, el panel "Gestión de Perfil" y sus modales. Lo que ve el paciente es lo mismo de antes.
- **`ScheduleRequestModal.jsx`:** el formulario de solicitud de cambio de horario se movió a su propio archivo, sin cambios de lógica. Ahora tiene esquinas `rounded-3xl` y altura máxima con scroll en pantallas bajas.
- Raíz de la pantalla con `overflow-x-clip` (Navbar sticky) y aparición escalonada con `FadeIn`.
- Los datos viven en el servicio simulado en memoria: se conservan al cerrar sesión y volver a entrar mientras la página no se recargue.

## Archivos clave tocados

- `src/pages/doctor/DoctorAccount.jsx` (nuevo)
- `src/pages/doctor/DoctorReviews.jsx` (nuevo: reseñas y puntaje)
- `src/pages/doctor/ScheduleRequestModal.jsx` (nuevo, movido desde `DoctorProfile.jsx`)
- `src/pages/DoctorProfile.jsx` (solo perfil público)
- `src/App.jsx` (`/doctor/profile` → `DoctorAccount`)
- `docs/arquitectura-y-roles.md` (mapa de rutas)
- `docs/edicion-perfil-medico.md` y `docs/INDEX.md`

## Validación

Automática:

- `npm run lint` → sin errores.
- `npm run build` → compila limpio (solo el aviso de tamaño de chunk que ya existía).

Manual local (`npm run dev`):

Con el médico de institución `jesus.zelarayan@samsa.med`:

1. Menú del usuario → **Perfil Profesional** abre `/doctor/profile` con la nueva pantalla.
2. Editar datos → nombre "Jesús Alberto Zelarayan" y teléfono `381 555-1234` → Guardar → ventana naranja "¿Guardar cambios?" → "Sí, Guardar" → ventana verde "¡Cambios guardados!". El encabezado se actualiza.
3. Correo `jesus.z@gmail.com` sin contraseña → errores de dominio `@samsa.med` y "Ingresá tu contraseña actual…". Con `luis.coronel@samsa.med` y una contraseña incorrecta → "Ya hay otra persona registrada…" y "La contraseña actual no es correcta.". Con `jesus.z@samsa.med` y la contraseña correcta → la confirmación avisa el cambio de usuario → "Desde ahora iniciás sesión con jesus.z@samsa.med.". "Dónde atendés" sigue mostrando Clínica del Norte y su solicitud pendiente.
4. Contraseña: una nueva corta y una repetición distinta muestran los dos errores. Con datos válidos → "¿Cambiar contraseña?" → "¡Contraseña actualizada!".
5. Cerrar sesión e iniciar con `jesus.z@samsa.med` y la contraseña nueva → entra bien y conserva nombre y teléfono.
6. Cambiar el nombre a "Jesús Zelarayan Ruiz" → el Navbar pasa a "Dr. Ruiz".
7. Biografía editada → "¿Guardar datos profesionales?" → "¡Datos profesionales guardados!".

Con el médico particular `luis.coronel@samsa.med`:

8. Se ven "La especialidad y la matrícula las registra VitaDev", el consultorio, el horario, las obras sociales y "Mi documentación".
9. Horario 14:00 a 13:00 → "La hora de fin tiene que ser posterior a la de inicio.". Con 14:00 a 18:00, sumando Sáb y Galeno → al guardar, "Dónde atendés" muestra "Lun, Mié, Vie, Sáb · 14:00 a 18:00" y "OSDE, Swiss Medical, Galeno".

Reseñas:

10. Con Zelarayan, la sección muestra "4.9/5", cinco estrellas (la quinta llena al 90 %), "342 reseñas" y "Mostrando 3 de 6 con comentario", de la más reciente a la más vieja (Héctor Solís, María Fernanda Gómez, Carlos Varela).
11. "Ver más reseñas (3)" muestra las 6 y cambia a "Ver menos". "Menor puntaje" pone primero las de 4 estrellas (Héctor Solís, Claudio Moya) y vuelve a mostrar 3.
12. El chip "★ 4.9 · 342 reseñas" de la cabecera baja hasta la sección.

Perfil público:

13. `/professionals/juan-perez` se ve como antes: especialidad, "Acepta", "Dónde atiende", "Agendar Turno", "Acerca de" y opiniones. No aparece nada de la vista del médico.

Sin errores en la consola.

Responsive (sin scroll horizontal en ninguno; `scrollWidth` igual al ancho visible):

| Ancho | Resultado |
|-------|-----------|
| 375 px (mobile) | Una columna (la tarjeta de reseñas ocupa de 16 a 359 px, sin desbordes), cabecera centrada, botones Cancelar/Guardar a lo ancho, días en dos filas y obras sociales que pasan de línea. |
| 768 px (tablet) | Una columna, campos en dos columnas, especialidad y matrícula lado a lado. |
| 1280 px (desktop) | Información personal, datos profesionales y "Dónde atendés" (2/3) a la izquierda; Seguridad y Cerrar sesión (1/3) a la derecha. |
