# Solicitud de adhesión: institución o médico particular

Rama: `feature/solicitud-de-adhesion`

## Qué se implementó

El botón **"Enviar Solicitud de Adhesión"** de la sección para profesionales de la Home (usuario sin sesión) abre una solicitud nueva que primero pregunta **qué se quiere adherir**:

* **Adherir institución** (clínica u hospital).
* **Adherir médico particular** (consultorio propio, sin clínica ni hospital).

Cada camino pide **los mismos datos que el admin SAMSA carga al asociarlos** desde su panel, así la solicitud llega completa para darla de alta:

| Camino | Pasos | Datos (origen en el admin SAMSA) |
|--------|-------|----------------------------------|
| Institución (3 pasos) | 1. Datos de la institución · 2. Contacto y servicios · 3. Administrador | Tipo (clínica u hospital), nombre, razón social, código REFES (14 dígitos), CUIT de persona jurídica (30, 33 o 34), declaración de inscripción en ARCA, dirección, teléfono, email de contacto, obras sociales (solo clínicas), estudios y la persona administradora (nombre, email que será su usuario y teléfono opcional). Igual que `VitadevInstitutions.jsx`. |
| Médico particular (4 pasos) | 1. Datos personales y contacto · 2. Datos profesionales · 3. Atención · 4. Documentación | Nombres, apellidos, CUIT/CUIL personal (de ahí se obtiene el DNI), email, teléfono, especialidad, matrícula, dirección del consultorio, días y horario de atención (mínimo 30 minutos), obras sociales (opcional) y documentación. Igual que `ParticularDoctorsPanel.jsx`. |

### Documentación del médico particular

Decisión del usuario: se adjuntan **Matrícula, Seguro de mala praxis y Título** (obligatorios, PDF, JPG o PNG) más **foto y CV** (opcionales). Matrícula y Seguro piden su fecha de vencimiento (posterior a hoy y como mucho a 10 años, la misma regla del admin). El **Contrato** no se pide: se firma cuando se aprueba la solicitud.

Para no superar el límite del envío por mail, cada archivo puede pesar **hasta 1 MB** y todos juntos **hasta 3 MB**. Los archivos de otro formato o más pesados se rechazan en cuanto se eligen, con un mensaje debajo.

### Comportamiento

* **Validación por paso:** "Siguiente" revisa el paso actual, marca los campos con error (borde rojo y mensaje) y lleva la vista y el foco al primero. Los mensajes son los mismos del admin SAMSA (validadores compartidos).
* **Navegación:** "Anterior" vuelve un paso; en el primer paso, "Cambiar tipo" vuelve a la elección. Los datos se conservan al ir y volver.
* **Clínica / Hospital:** al elegir Hospital se ocultan y vacían las obras sociales (los hospitales no trabajan con obras sociales).
* **Términos:** el check (siempre desmarcado) está en el último paso de cada camino. El médico usa el texto `profesional` (actualizado con la nueva documentación) y la institución un texto nuevo, `institucion`, en `legalTexts.js`.
* **Ventana de salida:** si hay datos cargados, cerrar con la X, la tecla Esc o un clic afuera pregunta "¿Salir sin enviar?". Sin datos, cierra directo. Esc dentro de la ventana de Términos cierra solo esa ventana.
* **Envío:** si falla, aparece un aviso en el pie del modal (antes era un `alert`). Si sale bien, se muestra la pantalla "Solicitud enviada" con la animación de siempre y el botón para **imprimir el comprobante**, que ahora detalla los datos de cada tipo de solicitud y usa el logo `SamsaLogo`.
* **Endpoint `api/submit-form.js`:** arma el mail según `applicantType` (`doctor` o `institution`), adjunta cada archivo con su etiqueta delante del nombre (ej. "Matrícula - archivo.pdf") y **escapa los datos** antes de armar el HTML. Rechaza solicitudes sin tipo válido.

### Estilo, transiciones y responsive

* Tema oscuro ejecutivo de la sección B2B (`bg-slate-900`, bordes `slate-800`, acento `blue-600`), tarjetas `rounded-3xl` y botones del modal anterior.
* Transiciones con `tailwindcss-animate` (`animate-in fade-in`, deslizamiento hacia la derecha al avanzar y hacia la izquierda al volver, entrada escalonada de las tarjetas de elección), con `motion-reduce:animate-none`. El modal anterior usaba `animate-fadeIn`, una clase que no existe en el proyecto y no animaba.
* **Mobile:** el modal se abre como panel inferior (`rounded-t-3xl`, `max-h-[92dvh]`), tarjetas de elección apiladas, campos en una columna, botones de 48 px de alto y textos sin cortes. **Tablet y desktop:** ventana centrada de hasta `max-w-3xl`, campos en dos columnas.
* `CheckboxDropdown` suma la prop `dark` para usarse en superficies oscuras (obras sociales y estudios); en los paneles claros no cambia.

## Archivos clave tocados

* `src/components/adhesion/AdhesionModal.jsx` (nuevo): elección del camino, pasos, ventana de salida, envío y pantalla de éxito.
* `src/components/adhesion/adhesionForms.js` (nuevo): datos vacíos, pasos y validaciones de cada camino, reglas de archivos y armado del envío.
* `src/components/adhesion/DoctorAdhesionSteps.jsx` y `InstitutionAdhesionSteps.jsx` (nuevos): campos de cada paso.
* `src/components/adhesion/AdhesionFields.jsx` y `adhesionStyles.js` (nuevos): campo, días, opción excluyente, casilla y carga de archivos en tema oscuro.
* `src/components/adhesion/AdhesionReceipt.jsx` (nuevo): comprobante imprimible.
* `src/components/ProfessionalApplicationModal.jsx` (eliminado): lo reemplaza `AdhesionModal`.
* `src/components/ProfessionalB2BSection.jsx`: abre `AdhesionModal`; el botón ocupa todo el ancho en mobile.
* `src/components/CheckboxDropdown.jsx`: variante `dark`.
* `src/pages/clinic/clinicValidation.js`: suma `validateLegalName`, `refesDigits`, `validateRefes` y `validateInstitutionCuit`, que antes estaban dentro de `VitadevInstitutions.jsx`.
* `src/pages/vitadev/VitadevInstitutions.jsx`: usa esos validadores compartidos (sin cambios de comportamiento).
* `src/data/legalTexts.js`: texto `profesional` actualizado y nuevo texto `institucion`.
* `api/submit-form.js`: mail por tipo de solicitud, adjuntos con etiqueta y datos escapados.
* `src/components/LegalModal.jsx`: comentario actualizado.
* `docs/aceptacion-de-terminos.md`: referencias al nuevo modal.

## Validación

Automática:

* `npm run lint`: sin errores en `src` y `api`.
* `npm run build`: compila (queda la advertencia de tamaño del bundle, que ya existía).

Manual (`npm run dev`, Home sin sesión → sección profesionales → "Enviar Solicitud de Adhesión"), probado en **Mobile 375 px, Tablet 768 px y Desktop 1280 px**:

1. Se abre la elección con las dos tarjetas: en mobile como panel inferior y apiladas, en tablet y desktop centradas y lado a lado. Sin scroll horizontal (`scrollWidth` = ancho de pantalla).
2. **Institución:** "Siguiente" con todo vacío marca nombre, razón social, REFES, CUIT y ARCA. El REFES descarta letras y se corta en 14 dígitos; un CUIT de persona (20-…) muestra "El CUIT de una institución empieza con 30, 33 o 34".
3. Con Hospital elegido, el paso 2 no muestra obras sociales; con Clínica sí. "Anterior" conserva los datos cargados.
4. Paso 2: teléfono sin código de área y email inválido muestran sus mensajes; el desplegable oscuro de obras sociales y estudios funciona y se cierra con "Listo".
5. Paso 3: sin administrador ni check, el envío marca los tres errores; el link abre los Términos de instituciones y Esc cierra solo esa ventana.
6. Con datos válidos, en local (sin `/api`) aparece "No pudimos enviar la solicitud…" en el pie. Simulando una respuesta correcta del servidor: pantalla "Solicitud enviada" con el nombre y el email, comprobante con los datos de la institución y el envío con todos los campos.
7. **Médico particular:** apellido con números y CUIT de empresa se rechazan; con un CUIL válido se muestra el DNI. Matrícula sin número, sin días de atención y horario de 15 minutos muestran sus mensajes.
8. Documentación: un `.docx` y un PDF de 1,5 MB se rechazan al elegirlos; sin Matrícula, Seguro, Título y check, el envío marca cada uno. Al subir Matrícula y Seguro aparece su vencimiento (una fecha pasada se rechaza); cuatro archivos de 0,9 MB marcan "pesan 3,6 MB: el máximo es 3 MB"; al quitar uno se puede enviar. El envío incluye los tres adjuntos con su etiqueta y vencimiento.
9. La X o Esc con datos cargados piden confirmación ("¿Salir sin enviar?"); "Seguir completando" vuelve, "Salir" cierra. Al reabrir arranca vacío y, sin datos, cierra directo. El scroll de la página se restaura al cerrar.
10. En mobile los botones del pie no se cortan ("Anterior" y "Enviar solicitud" en una línea, 48 px de alto).
