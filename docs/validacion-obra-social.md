# Datos de afiliación a obra social en registro y turno

**Tarjeta Trello:** `samsa_feature. Datos de afiliación a obra social en registro y turno`
**Rama:** `feature/validacion-obra-social`

---

## Objetivo

Pedir al paciente los datos que acreditan su cobertura (número de afiliado, plan y si es titular o adherente) para que la secretaria pueda verificar, en la consulta, que quien solicita el turno es el dueño de la obra social o un familiar a su cargo.

La validación es **solo de formato y en frontend**. La verificación real (credencial + DNI) la hace la secretaria en la atención. La consulta al padrón de cada obra social queda para cuando exista backend.

---

## Qué se implementó

### Utilidad de validación — `src/utils/insuranceValidation.js`
- `requiresAffiliation(insurance)`: indica si la obra social pide afiliación. `"Ninguna"`, `"particular"` y vacío no la piden.
- `validateAffiliation(datos, { requireFilled })`: devuelve `{ campo: mensaje }`.
  - **Nº de afiliado:** obligatorio, solo dígitos, entre 6 y 15 (regla genérica). Se pueden agregar reglas por obra social en `AFFILIATE_RULES`.
  - **Adherente:** el nombre y el DNI del titular son obligatorios. El DNI debe tener 7 u 8 dígitos y **no puede coincidir con el DNI del paciente**.
  - `requireFilled: false` solo marca el formato inválido de los campos ya escritos (aviso mientras se tipea). `true` marca además los vacíos (al enviar).
- `emptyAffiliation()`, `pickAffiliation(user)`, `isValidDni(dni)` y `HOLDER_TYPES`.

### Componente reutilizable — `src/components/AffiliationFields.jsx`
- Se muestra solo si la obra social elegida requiere afiliación.
- Campos: **Nº de afiliado** (solo números), **Plan** (opcional) y el selector **"Soy el titular" / "Soy adherente (familiar)"**. Si se elige adherente, aparecen **Nombre** y **DNI del titular**.
- **Formato inválido:** el error se muestra en línea apenas se escribe un valor incorrecto, sin esperar al envío (decisión confirmada por el usuario).
- Accesible: `label`/`htmlFor`, `aria-invalid`, `aria-describedby`, `fieldset`/`legend` en el selector y áreas táctiles de 48px como mínimo.
- Soporta `disabled` para el modo lectura del perfil.

### Pantallas
- **`Register.jsx`:** incluye los campos de afiliación debajo de la obra social. El envío se bloquea si faltan datos o el formato es inválido (el avatar muestra "Revisar datos").
- **`BookAppointment.jsx`:**
  - El selector de obra social usa `INSURANCE_OPTIONS` del catálogo, en lugar de la lista escrita a mano con valores distintos (`osde`, `swiss`…).
  - **Invitado (paso 2):** carga los datos de afiliación y no puede continuar si son inválidos.
  - **Usuario logueado:** la cobertura y la afiliación se toman del perfil. Antes quedaba siempre "particular".
  - **Paso 3 (confirmación):** resumen de la cobertura, más el checkbox obligatorio de **declaración jurada** ("Declaro que los datos de cobertura son verídicos y presentaré mi credencial y DNI en la consulta"). Si los datos del perfil faltan o son inválidos, aparece un aviso ámbar con un link a *Mi Perfil* (o "Corregir datos" para el invitado) y **Confirmar Turno** queda deshabilitado.
  - Los datos de afiliación viajan en `appointmentData.affiliation`.
- **`UserProfile.jsx`:** se pueden editar los datos de afiliación. Se validan al tocar *Guardar*. *Cancelar* restaura los valores guardados. Si se elige "Ninguna", se limpian los datos de afiliación anteriores.
- **`PrintReceipt.jsx`:** muestra el Nº de afiliado y la condición (titular o adherente) debajo de la cobertura.

### Fuera de alcance (tarjetas siguientes)
- Estado de verificación del turno (pendiente / verificado / rechazado) y acciones de la secretaria.
- Insignias en el panel de secretaría y aviso en *Mis turnos*.
- Carga de afiliación desde `NewTurnModal.jsx` (turno creado por la secretaria).
- Validación contra el padrón real de la obra social (requiere backend).

### Pendiente de confirmar
- `[CONFIRMAR]` Largo y formato real del Nº de afiliado de cada obra social de `INSURANCES` (`src/constants/catalog.js`). Hasta entonces rige la regla genérica de 6 a 15 dígitos.

---

## Archivos clave tocados

| Archivo | Cambio |
|---------|--------|
| `src/utils/insuranceValidation.js` | **Nuevo.** Reglas y validación de afiliación. |
| `src/components/AffiliationFields.jsx` | **Nuevo.** Campos de afiliación reutilizables. |
| `src/pages/Register.jsx` | Campos y validación de afiliación en el registro. |
| `src/pages/BookAppointment.jsx` | Catálogo unificado, afiliación en el paso 2, resumen y declaración jurada en el paso 3. |
| `src/pages/UserProfile.jsx` | Edición y validación de la afiliación en el perfil. |
| `src/components/PrintReceipt.jsx` | Nº de afiliado y condición en el comprobante. |

---

## Validación

### Automática
```bash
npm run lint    # sin errores
npm run build   # compila OK (el aviso de tamaño de chunk ya existía)
```

### Manual local (`npm run dev`)
Verificar en **Mobile (360–414px)**, **Tablet (712–768px)** y **Desktop (1280px+)**:

1. **Registro** — `http://localhost:5173/register`
   - Con la obra social en "Ninguna", no aparecen los campos de afiliación.
   - Elegir "OSDE": aparece el bloque *Datos de afiliación*.
   - Escribir `123` en Nº de afiliado: aparece en el momento el aviso "Número de afiliado inválido: debe tener entre 6 y 15 dígitos". Las letras no se pueden escribir.
   - Elegir "Soy adherente": aparecen nombre y DNI del titular. Poner el mismo DNI que el del paciente muestra un error.
   - Enviar con campos vacíos marca los obligatorios y el avatar muestra "Revisar datos".
2. **Turno como invitado** — `http://localhost:5173/professionals` → un profesional → *Solicitar turno*
   - Paso 2: con obra social y afiliación inválida no deja continuar.
   - Paso 3: muestra el resumen de cobertura. *Confirmar Turno* queda deshabilitado hasta tildar la declaración jurada.
   - Con "Ninguna (particular)" no se pide declaración y se muestra "Atención particular".
   - *Imprimir comprobante* muestra el Nº de afiliado.
3. **Turno logueado como paciente**
   - Sin Nº de afiliado en el perfil y con obra social cargada: el paso 3 muestra el aviso ámbar con el link a *Mi Perfil*.
4. **Perfil** — `http://localhost:5173/user-profile`
   - En modo lectura, los campos de afiliación se ven deshabilitados.
   - *Editar datos*, con un Nº inválido y *Guardar*: no abre el modal y marca el error.
   - *Cancelar* restaura los valores anteriores.
