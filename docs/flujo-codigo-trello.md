# 🚀 Flujo de Trabajo y Estándar de Código — VitaDev / SAMSA

Guía oficial para todos los integrantes del equipo (desarrolladores y asistentes de IA).
**Una tarjeta de Trello = Una rama = Un Pull Request hacia `development`.**

---

## 📌 Reglas de Oro (No Negociables)

1. **PROHIBIDO commitear directo en `main` o `development`.**
   * GitHub rechazará automáticamente cualquier `git push` directo a estas ramas. Todo cambio entra exclusivamente por **Pull Request (PR)**.
2. **Toda rama nace SIEMPRE desde `development` actualizada.**
   * Jamás crear una rama a partir de `main` ni de otra rama desactualizada.
3. **Verificar la rama antes de commitear:**
   ```bash
   git branch --show-current
   ```
   Si dice `main` o `development`: **frená**, creá tu rama y recién ahí guardá cambios.
4. **Calidad antes de abrir el PR:**
   * Es obligatorio correr y verificar localmente que pasen el linter y el build:
     ```bash
     npm run lint
     npm run build
     ```
   * Si rompe el build o hay errores de ESLint, no abras el PR; corregilo antes.
5. **Revisión de pares:**
   * Todo PR necesita la **aprobación de al menos un compañero** para poder mergearse.
6. **Cero Secretos en el Repositorio:**
   * Prohibido subir claves privadas, tokens, contraseñas o API keys. Usá `.env` local (ignorado en git) y declará variables ficticias en `.env.example`.

---

## 📋 Convención de Tarjetas en Trello

Cada tarjeta de Trello debe seguir la estructura:
```text
[sistema]_[tipo]. [nombre corto y descriptivo]
```

### Prefijos de Sistema:
* `samsa_...` (App principal de turnos y profesionales)
* `vitadev-website_...` (Sitio institucional de VitaDev)
* `vitadev-gestion_...` (Sistema interno de gestión)

### Tipos de Tarea:
* **`feature`**: Mejora o funcionalidad nueva (calidad, nuevas pantallas, lógica de negocio).
* **`hotfix`**: Corrección urgente de un error crítico.
* **`bugfix`**: Corrección de un error o defecto reportado.
* **`style`**: Cambios de formato, estilos visuales (CSS/Tailwind) o limpieza estética de código sin cambio de lógica.

> **Ejemplos en Trello:**
> * `samsa_feature. Selección y reserva de turnos por especialista`
> * `samsa_hotfix. Error al confirmar turno en mobile`
> * `samsa_bugfix. Desalineación en tabla de pacientes`
> * `samsa_style. Ajuste de espaciados y colores en modal de adhesión`

---

## 🏷️ Convención de Ramas en Git

El CI de GitHub Actions valida automáticamente el nombre de tu rama al abrir un PR:

```text
[tipo]/[nombre-descriptivo]
```

Donde `[tipo]` coincide con la tarjeta:
* `feature/[nombre]` (ej. `feature/seleccion-turnos-especialista`)
* `hotfix/[nombre]` (ej. `hotfix/error-confirmar-turno-mobile`)
* `bugfix/[nombre]` (ej. `bugfix/desalineacion-tabla-pacientes`)
* `style/[nombre]` (ej. `style/ajuste-colores-modal-adhesion`)
* `docs/[nombre]` (ej. `docs/actualizar-guia-trello`)
* `chore/[nombre]` (ej. `chore/actualizar-dependencias`)

---

## 💬 Mensajes de Commit (Conventional Commits)

Los commits deben reflejar el tipo de cambio y describir qué se hizo:

* `feat: [descripcion]` para nuevas features
* `hotfix: [descripcion]` para arreglos urgentes
* `fix: [descripcion]` para bugfixes
* `style: [descripcion]` para estilos o formato
* `docs: [descripcion]` para documentación
* `chore: [descripcion]` para mantenimiento/configuración

*Ejemplo:*  
`git commit -m "feat: implementar filtro de médicos por obra social"`

---

## 🔄 El Ciclo de Desarrollo Paso a Paso

### 1. Tomar la tarjeta en Trello
* Elegí la tarjeta (ej. `samsa_feature. Selección de turnos`) y movela a **En Progreso**.
* Asignate como miembro de la tarjeta.

### 2. Preparar tu entorno local
```bash
# Asegurate de tener lo último de development
git checkout development
git pull origin development

# Crear tu rama de trabajo
git checkout -b feature/seleccion-turnos
```

### 3. Desarrollar y verificar localmente
* Desarrollá tu solución.
* Antes de commitear, comprobá que no rompa el proyecto:
  ```bash
  npm run lint
  npm run build
  ```

### 4. Guardar tus cambios
```bash
# Confirmá que NO estás en main ni development
git branch --show-current

# Guardar cambios
git add .
git commit -m "feat: agregar selector interactivo de fechas y horarios"
```

### 5. Subir tu rama y abrir el Pull Request
```bash
git push -u origin feature/seleccion-turnos
```
1. Entrá a GitHub: [github.com/vitadevorg/samsa](https://github.com/vitadevorg/samsa).
2. Abrí el PR asegurándote de que la rama base destino sea **`development`** (no `main`).
3. En la descripción del PR incluí:
   * **Tarjeta Trello:** Link a la tarjeta.
   * **Resumen:** Breve detalle de lo implementado.
   * **Prueba:** Cómo probarlo en local o preview.
4. Mové la tarjeta de Trello a **QA / En Revisión** y pegá el link del PR como comentario.

---

## 👥 Code Review y Merge

1. **Revisión obligatoria:** Un compañero debe revisar los cambios y dar el **Approve**.
2. **Checks en verde:** El CI correrá automáticamente el build, lint, validación de rama y escaneo de secretos.
3. **Merge:** Una vez aprobado y con checks en verde, se hace clic en **Merge pull request**.
4. GitHub **borrará la rama automáticamente** para mantener limpio el repositorio.
5. Mové la tarjeta en Trello a **Hecho / Done**.
