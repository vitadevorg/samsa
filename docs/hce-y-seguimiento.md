# Historia Clínica Electrónica (HCE) y seguimiento del paciente

Rama: `feature/hce-y-seguimiento`

## Qué se implementó

Reorganización del panel del médico para ver y cargar la historia clínica y el seguimiento de cada paciente. Sigue la Ley 26.529 y el Decreto 1089/2012 (datos obligatorios, documentos que integran la HC, inalterabilidad, conservación y copia al titular) y la estructura clínica habitual.

### Flujo

- **Mis pacientes** (`/doctor/patients`): búsqueda por nombre, DNI o Nº de HC, y filtros "Con seguimiento vencido" y "Con tareas pendientes". Cada tarjeta muestra lo justo para identificar al paciente y priorizar: nombre, DNI, edad, Nº de HC, tareas vencidas o pendientes y última actuación. Tiene accesos a "Abrir historia clínica" y "Nueva evolución".
- **Ficha del paciente** (`/doctor/patients/:historyId`):
  - **Columna de datos filiatorios** (arriba en mobile): alergias destacadas, problemas activos, DNI, nacimiento y cobertura. El contacto y el núcleo familiar quedan plegados. También muestra apertura de la HC, última actuación y conservación mínima (10 años).
  - **Pestañas** (la activa queda en la URL `?tab=`):
    - **Resumen clínico:** últimos signos vitales, últimas evoluciones (A y P), medicación vigente con posología y vía, seguimiento pendiente, antecedentes heredofamiliares y personales fisiológicos y patológicos, y estudios complementarios recientes.
    - **Registros clínicos:** línea de tiempo cronológica, con lo más reciente arriba. Filtros por sección (Evoluciones, Indicaciones y medicación, Enfermería, Estudios complementarios, Procedimientos y consentimientos, Antecedentes) con cantidades, buscador y rango de fechas. Carga progresiva de a 8 registros.
    - **Plan de seguimiento:** controles clínicos, estudios pendientes, interconsultas y medicación, con estados pendiente, realizada, vencida y cancelada. Las vencidas se resaltan en rojo y tienen contador en la pestaña. Cada cambio deja constancia de quién y cuándo.
    - **Copia y accesos:** pedido de copia autenticada con plazo de 48 h (vencido en rojo), "Marcar entregada" e impresión. También el registro de accesos (quién accedió y qué hizo).
- **Turnos Asignados:**
  - Cada turno tiene acceso a la historia clínica del paciente.
  - Al finalizar una consulta, el cierre se firma en la HC como evolución en formato SOAP (el texto va como Subjetivo y las indicaciones como Plan) y, si hay, como Indicaciones médicas.

### Registros clínicos (terminología)

| Sección | Tipos y campos |
|---|---|
| Evoluciones | **Evolución médica** en formato SOAP: motivo de consulta, S (anamnesis y enfermedad actual), signos vitales (TA, FC, FR, T, SatO₂, peso), O (examen físico), A (impresión diagnóstica + CIE-10) y P (conducta). **Registro odontológico**: piezas en notación FDI, diagnóstico y tratamiento. |
| Indicaciones y medicación | **Prescripción médica**: fármaco genérico y concentración, posología, vía, duración. **Administración de medicación**. **Indicaciones médicas**: indicaciones y pautas de alarma. **Prescripción dietoterápica**: tipo de dieta y VCT. |
| Enfermería | **Registro de enfermería**: control de signos vitales, procedimientos y observaciones. |
| Estudios complementarios | Categoría, estudio, estado (realizado, rechazado o abandonado), informe y conclusión diagnóstica con CIE-10. |
| Procedimientos y consentimientos | **Consentimiento informado**: procedimiento, decisión, riesgos y alternativas. **Protocolo quirúrgico**: diagnósticos pre y posoperatorio, anestesia, equipo, técnica y complicaciones. |
| Antecedentes | Heredofamiliares, personales fisiológicos y personales patológicos. |

### Reglas de la historia

- **Inalterable:** los registros no se editan ni se borran. La única corrección es **Enmendar**: se crea un registro nuevo con motivo obligatorio, y el original queda visible, tachado, marcado "Enmendado" y enlazado con su corrección.
- **Firma y sello:** cada registro guarda fecha y hora, profesional (nombre, matrícula y especialidad) y un sello de firma electrónica simulado.
- **Validación:** campos obligatorios por tipo, signos vitales con valores plausibles (TA en formato 120/80, rangos de FC, FR, temperatura, SatO₂ y peso) y código CIE-10 con formato válido (opcional).
- **Salidas del sistema:** todas las acciones siguen el mismo patrón que el resto de SAMSA. Son: firmar un registro o una enmienda, crear una tarea o cambiar su estado, pedir o entregar una copia, y dar de alta un paciente. Cada una pide confirmación (ventana naranja `EditConfirmModal`) y termina con la ventana verde `SuccessModal` (`useSuccessModal`).
- **Minimización de datos:**
  - El listado de pacientes no recibe contenido clínico, contacto ni núcleo familiar.
  - En la ficha, el contacto y el núcleo familiar están plegados.
  - Nada clínico se guarda en `localStorage` ni se muestra en consola.

### Copia impresa (copia autenticada)

Formato de historia clínica en papel, con tipografía serif y tablas con bordes:

1. Encabezado institucional con Nº de HC y fecha y hora de emisión.
2. Datos filiatorios.
3. Alertas clínicas (alergias y problemas activos).
4. Antecedentes.
5. Medicación vigente (fármaco, posología, vía, duración y prescripción).
6. Registros clínicos en orden cronológico, numerados, con campos SOAP, CIE-10 y bloque de firma y sello de cada profesional.
7. Certificación de copia fiel con solicitante y firma del profesional que emite.
8. Leyenda de confidencialidad.

### Capa de datos (sin backend)

- `src/services/hceService.js` es la única puerta de acceso. Expone `listPatients`, `getPatient`, `createPatient`, `getEntries`, `createEntry`, `amendEntry`, `listFollowups`, `createFollowup`, `updateFollowupStatus`, `requestCopy`, `markCopyDelivered`, `listAccessLog` y `summarizeRecord`. Para pasar a la API real se reemplaza este archivo manteniendo las firmas.
- Es un mock en memoria con latencia simulada y datos **sintéticos** (`src/data/hceMock.js`). Los cambios se pierden al recargar la página.
- `TODO(api)`: inalterabilidad, firma digital, control de acceso y trazabilidad deben garantizarse en el servidor. Ocultar acciones en la interfaz no es seguridad. La matrícula y la especialidad deben salir del perfil profesional verificado.

### Otros ajustes

- `Navbar`: el link activo también se marca en las subrutas (por ejemplo, "Pacientes" dentro de la ficha).
- En la ficha, la `Navbar` queda fija al recorrer la página: su contenedor de impresión usa `contents print:hidden` para no anular el `sticky`.

## Archivos clave tocados

- `src/constants/hce.js` (nuevo): tipos de registro, secciones, signos vitales, opciones, estados y plazos.
- `src/data/hceMock.js` (nuevo): pacientes y registros sintéticos.
- `src/services/hceService.js` (nuevo): servicio mock, validaciones, firma simulada, resumen y trazabilidad.
- `src/utils/hceFormat.js` (nuevo): formato de lectura de registros y signos vitales.
- `src/utils/dates.js`: `formatDateAR`, `formatDateTimeAR` (dd/mm/aaaa, hora de Argentina) y `dateInputValue`.
- `src/pages/doctor/hce/` (nuevo): `PatientRecord`, `PatientIdentityCard`, `SummaryPanel`, `RecordTimeline`, `EntryCard`, `EntryFormModal`, `FollowupPanel`, `LegalPanel`, `RecordPrint`, `HceStates`, `useHceRecord`, `hceUi`.
- `src/pages/doctor/DoctorPatients.jsx`: listado nuevo, alta de paciente con confirmación y salida.
- `src/pages/doctor/DoctorTurns.jsx`: acceso a la HC y cierre de consulta guardado en la HC.
- `src/App.jsx`: ruta `/doctor/patients/:historyId`.
- `src/components/Navbar.jsx`: estado activo en subrutas.

## Validación

Automática:
- `npm run lint`: sin errores.
- `npm run build`: compila limpio.

Manual (`npm run dev`, login con un médico del seed local):
1. `/doctor/patients`: buscar, filtrar por seguimiento vencido y abrir la historia de Lucas Gabriel Lazarte.
2. **Resumen clínico:** últimos signos vitales, evoluciones, medicación vigente, antecedentes y estudios.
3. **Registros clínicos:** filtrar por sección. Cargar una evolución con TA "150-95" y sin Plan: se marcan ambos errores. Corregir, firmar, confirmar en la ventana naranja y ver la salida verde.
4. **Enmendar** un registro: sin motivo no deja avanzar. Con motivo, el original queda "Enmendado" y enlazado.
5. **Plan de seguimiento:** crear una tarea y marcar como realizada una vencida, en ambos casos con confirmación, salida verde y constancia de quién y cuándo.
6. **Copia y accesos:** registrar un pedido de copia (plazo de 48 h), marcarla entregada y revisar el registro de accesos.
7. "Imprimir": revisar la copia autenticada en la vista previa de impresión.
8. Recorrer la ficha: la cabecera (`Navbar`) queda fija.

Anchos revisados: mobile 375 px, tablet 768 px y desktop 1024 y 1280 px. Sin scroll horizontal, pestañas sin texto cortado y modales centrados.
