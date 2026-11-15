# Médico: publicar en el foro (`feature/medico-publicar-en-foro`)

El médico puede ver el Foro de Novedades desde su menú, publicar notas y editar o borrar **solo las propias**.

## Qué se implementó

- **Acceso desde la cabecera:** el menú del médico suma **Foro** (`/news`) junto a "Turnos Asignados" y "Pacientes", en desktop y en el menú hamburguesa. Los enlaces mobile del médico ahora cierran el menú al navegar.
- **Bajada para el médico:** en lugar del texto informativo que ven los pacientes, el médico lee una invitación a compartir: "Compartí tu experiencia con la comunidad SAMSA. Cada nota que publicás contribuye a que te conozcan más pacientes."
- **Publicar:** en `/news`, el médico ve el botón primario **Publicar** (estilo Hero del design system). Abre un formulario con:
  - **Título** (10 a 120 caracteres), **categoría** (Salud Preventiva, Consejos de salud, Avances médicos, Novedades institucionales; tomadas de la bajada del foro), **imagen de portada opcional** (solo imágenes, máx. 2 MB, con vista previa, cambiar y quitar) y **contenido** (50 a 5000 caracteres, con contador; una línea en blanco separa párrafos).
  - El formulario no se cierra con click afuera ni con Escape, para no perder el borrador por un click accidental.
  - La nota se publica al instante, firmada con el título y nombre del médico (p. ej. "Dr. Jesús Zelarayan").
- **Editar y borrar las propias:** las tarjetas del médico autor muestran la etiqueta **Tu publicación** y los botones **Editar** y **Borrar** (también dentro del detalle de la nota). Editar reabre el formulario con los datos y marca la nota como "Editada". Borrar pide confirmación (`ConfirmModal`).
- **Filtro "Todas / Mis publicaciones (N)"** para el médico, con estado vacío y acceso directo a publicar.
- **Autoría protegida:** las notas de otros médicos no muestran acciones, y el `ForumProvider` también rechaza editar o borrar una nota cuyo autor no coincide con el email de la sesión. Pacientes y visitantes ven todas las notas sin acciones.
- **Notas sin imagen:** muestran una portada con degradé azul-índigo e ícono de estetoscopio.
- Se agregó una nota de demostración de la Dra. Priscila Gómez para comprobar que no se pueden editar notas ajenas.
- Corrección menor: el detalle de las notas fijas renderizaba su contenido dentro de un `<p>` (HTML inválido); ahora se usa un `<div>`.

### Decisiones tomadas

- **Moderación:** no hay aprobación previa; la nota sale publicada al instante (la tarea pide "ver y publicar").
- **Persistencia:** las publicaciones viven en memoria (`ForumProvider`), igual que el resto de los datos mock: se conservan al navegar y se pierden al recargar la página.

## Archivos clave tocados

| Archivo | Responsabilidad |
| --- | --- |
| `src/context/ForumContext.jsx`, `forum-context.js`, `useForum.js` (nuevos) | Estado compartido de publicaciones: alta, edición y borrado con verificación de autoría. |
| `src/pages/forum/ForumPostModal.jsx` (nuevo) | Formulario para publicar o editar una nota. |
| `src/pages/forum/forumPosts.js` (nuevo) | Categorías, límites, validación y formato de fecha. |
| `src/pages/NewsForum.jsx` | Botón Publicar, filtro, acciones sobre notas propias, detalle y confirmación de borrado. |
| `src/components/Navbar.jsx` | Enlace "Foro" para el médico (desktop y mobile). |
| `src/App.jsx` | Envuelve las rutas con `ForumProvider`. |

## Validación

Automática:

- `npm run lint` → sin errores.
- `npm run build` → compila limpio.

Manual local (`npm run dev`, cuenta demo `jesus.zelarayan@samsa.med`):

1. La cabecera del médico muestra **Foro** y lleva a `/news` con el enlace activo.
2. La nota de la Dra. Gómez no tiene Editar/Borrar.
3. **Publicar** vacío muestra los tres errores (título, categoría y contenido); con datos válidos se publica primera, con "Tu publicación", la firma "Por Dr. Jesús Zelarayan" y el aviso de éxito. "Mis publicaciones" pasa a (1).
4. **Editar** abre "Editar publicación" con los datos cargados; al guardar el título cambia y aparece "Editada".
5. El detalle muestra los párrafos separados y los botones Editar/Borrar. **Borrar** pide confirmación y, al confirmar, la nota desaparece y el contador vuelve a (0).
6. "Mis publicaciones" sin notas muestra el estado vacío con "Publicar mi primera nota".
7. Sin sesión, `/news` no muestra "Publicar", filtro ni acciones.

Responsive (sin scroll horizontal):

| Ancho | Resultado |
| --- | --- |
| 375 px (mobile) | Una columna; botón Publicar de ancho completo; formulario de 343 px con márgenes de 16 px; el menú hamburguesa incluye Foro y se cierra al navegar. |
| 768 px (tablet) | Dos columnas de tarjetas. |
| 1440 px (desktop) | Tres columnas; botón Publicar alineado a la derecha del título. |

No probado: la subida de una imagen real desde un archivo.
