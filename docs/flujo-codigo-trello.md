# Flujo de Trabajo y Estándar de Código — VitaDev / SAMSA

Guía oficial obligatoria para todos los integrantes del equipo.
**Una tarjeta de Trello = Una rama = Un Pull Request hacia `development` = Su documentación en `docs/`.**

---

## Reglas No Negociables

1. **PROHIBIDO commitear directo en `main` o `development`.**
   * GitHub rechazará automáticamente cualquier `git push` directo a estas ramas. Todo cambio entra exclusivamente por **Pull Request (PR)**.
2. **Toda rama nace SIEMPRE desde `development` actualizada.**
   * Jamás crear una rama a partir de `main` ni de otra rama desactualizada.
3. **Verificar la rama antes de cualquier commit:**
   ```bash
   git branch --show-current
   ```
   Si dice `main` o `development`: **frená**, creá tu rama (`git checkout -b <tipo>/<nombre>`) y recién ahí guardá cambios.
4. **No hacer push, abrir PR ni mergear sin pedido explícito del usuario:**
   * Ningún asistente de IA sube cambios ni abre un PR sin que el responsable haya confirmado la prueba manual local.
5. **Calidad técnica obligatoria antes del PR:**
   * Es obligatorio correr y verificar localmente que pasen el linter y el build sin errores:
     ```bash
     npm run lint
     npm run build
     ```
   * Si rompe el build o hay errores de ESLint, no abras el PR; corregilo antes.
6. **Prueba manual local antes del PR (bloqueante):**
   * Si el cambio afecta pantallas, estilos, animaciones o flujos de usuario, la persona responsable lo prueba en su máquina (`npm run dev`) en **Desktop, Tablet y Mobile** y confirma que funciona antes de abrir el PR.
   * Un asistente de IA **no abre el PR sin esa confirmación**: le pasa al usuario el link local (`http://localhost:5173/...`) y los pasos concretos para probar, y espera su visto bueno.
7. **Documentación obligatoria por PR en `docs/`:**
   * Todo PR que implemente una funcionalidad, corrección o rediseño debe incluir (o actualizar) su archivo de documentación en `docs/<nombre-descriptivo>.md` y registrarlo en `docs/INDEX.md`.
   * El documento debe detallar:
     1. **Qué se implementó** (resumen funcional/visual, componentes o servicios creados/modificados y decisiones tomadas).
     2. **Archivos clave tocados**.
     3. **`## Validación`** (comandos automáticos ejecutados + pasos exactos de la prueba manual local y dispositivos verificados).
     4. **`## Correcciones de revisión del PR`** (cuando se resuelvan comentarios de revisión).
8. **Atender los comentarios de revisión en PRs:**
   * Antes de dar por cerrada una tarea o abrir un PR nuevo, revisar los comentarios de compañeros en el PR. Cada observación se resuelve aplicando el ajuste en la misma rama o respondiendo con el motivo técnico.
9. **Decisiones abiertas (`[CONFIRMAR]`): las toma el usuario, nunca la IA:**
   * Si una tarea tiene una duda de producto, diseño o negocio, el asistente frena antes de programar esa parte, explica las opciones en lenguaje simple y espera la elección explícita del usuario.
10. **Cero Secretos en el Repositorio:**
    * Prohibido subir claves privadas, tokens, contraseñas o API keys. Usá `.env` local (ignorado en git) y declará variables ficticias en `.env.example`. El job `secrets-scan` (Gitleaks) audita cada PR.

---

## Convención de Tarjetas en Trello

Cada tarjeta de Trello sigue la estructura:
```text
[sistema]_[tipo]. [nombre corto y descriptivo]
```

### Prefijos de Sistema:
* `samsa_...` (App principal de turnos, pacientes, médicos e instituciones)
* `vitadev-website_...` (Sitio institucional de VitaDev)
* `vitadev-gestion_...` (Sistema interno de gestión)

### Tipos de Tarea:
* **`feature`**: Funcionalidad nueva, nuevas pantallas o lógica de negocio.
* **`hotfix`**: Corrección urgente de un error crítico.
* **`bugfix`**: Corrección de un error o defecto reportado.
* **`style`**: Mejoras de diseño UX/UI, animaciones, responsive (CSS/Tailwind) sin alterar reglas de negocio.
* **`docs`**: Documentación de arquitectura, flujo, design system o entregas.
* **`chore`**: Configuración, CI/CD, dependencias o mantenimiento.

> **Ejemplos en Trello:**
> * `samsa_feature. Selección y reserva de turnos por especialista`
> * `samsa_hotfix. Error al confirmar turno en mobile`
> * `samsa_bugfix. Desalineación en tabla de pacientes`
> * `samsa_style. Rediseño de flujo de atención y responsive en Acerca de Nosotros`

---

## Convención de Ramas en Git

El CI de GitHub Actions (`branch-name`) valida automáticamente el nombre de tu rama al abrir un PR:

```text
[tipo]/[nombre-descriptivo]
```

* `feature/[nombre]` (ej. `feature/US-00-modulo-admin-vitadev`, `feature/seleccion-turnos`)
* `hotfix/[nombre]` (ej. `hotfix/error-confirmar-turno-mobile`)
* `bugfix/[nombre]` (ej. `bugfix/desalineacion-tabla-pacientes`)
* `style/[nombre]` (ej. `style/flujo-atencion-y-responsive-about`)
* `docs/[nombre]` (ej. `docs/actualizar-guia-trello`)
* `chore/[nombre]` (ej. `chore/fix-ci-and-lint`)

---

## Mensajes de Commit (Conventional Commits)

Los commits deben reflejar el tipo de cambio y describir qué se hizo:

* `feat: [descripcion]` para nuevas features
* `hotfix: [descripcion]` para arreglos urgentes
* `fix: [descripcion]` para bugfixes
* `style: [descripcion]` para mejoras visuales, animaciones o responsive
* `docs: [descripcion]` para documentación
* `chore: [descripcion]` para mantenimiento/configuración

---

## El Ciclo de Desarrollo Paso a Paso (Checklist Operativo)

```text
1. Tomar la tarjeta en Trello (o ficha en docs/tareas/INDEX.md) y moverla a "En Progreso"
2. Leer docs/design-system.md y docs/arquitectura-y-roles.md según el área que toque la tarea
3. Si hay decisiones pendientes [CONFIRMAR], consultar al usuario antes de codificar
4. git checkout development && git pull origin development
5. git checkout -b <tipo>/<nombre-descriptivo>
6. Implementar siguiendo los estándares de UI, responsive y código limpio
7. Levantar entorno local (npm run dev) y pasar los pasos al usuario para Prueba Manual Local
8. Iterar ajustes visuales/funcionales hasta tener confirmación explícita del usuario
9. Crear o actualizar la documentación de la entrega en docs/<nombre>.md y actualizar docs/INDEX.md
10. Correr verificaciones obligatorias:
    - npm run lint
    - npm run build
11. Verificar git branch --show-current (PROHIBIDO estar en main o development)
12. git add . && git commit -m "<tipo>: <descripcion>"
13. git push -u origin <tipo>/<nombre-descriptivo>
14. Abrir Pull Request hacia development con:
    - Tarjeta Trello (si aplica)
    - Resumen de lo implementado
    - Link al documento en docs/<nombre>.md
    - Pasos de prueba en local / Vercel Preview
15. Mover tarjeta de Trello a "QA / En Revisión" pegando el link del PR y el Preview de Vercel
16. Atender comentarios de revisión de compañeros hasta obtener Approve y checks de CI en verde
17. Mergear PR a development y mover tarjeta a "Hecho / Done"
```

---

## Criterios de Calidad antes del PR (Frontend React + Vite + Tailwind)

- [ ] `npm run lint` sin errores ni warnings nuevos.
- [ ] `npm run build` compila limpio.
- [ ] **Responsiveness verificado** en Mobile (`360px - 414px`), Tablet (`712px - 768px`) y Desktop (`1280px+`) sin scroll horizontal accidental (`overflow-x-hidden` donde corresponda) ni recortes de imagen (`object-top` / `aspect-ratio`).
- [ ] **Design System respetado** (`docs/design-system.md`): tipografías, paleta `blue-600` / `indigo-600` / `slate-900`, botones primarios/secundarios y tarjetas consistentes.
- [ ] **Documentación del PR creada/actualizada** en `docs/<feature>.md` con su sección `## Validación` e indexada en `docs/INDEX.md`.
- [ ] **Probado manualmente en local** por la persona responsable antes de abrir el PR.
- [ ] **CI en verde** (`frontend-build-lint`, `branch-name`, `secrets-scan`) y Preview de Vercel generado.
- [ ] Sin secretos, credenciales ni `console.log` innecesarios.

---

## Skills Recomendadas del Equipo

Cuando trabajes con asistentes de IA en el repositorio, estas skills potencian la calidad del frontend y del diseño:

| Skill | Para qué sirve | Comando de instalación |
|-------|----------------|------------------------|
| `vercel-react-best-practices` | Rendimiento, hooks y buenas prácticas en React | `npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices -g` |
| `web-design-guidelines` | Accesibilidad, contraste, foco y guías de UX web | `npx skills add vercel-labs/agent-skills --skill web-design-guidelines -g` |
| `frontend-design` | Construcción de componentes e interfaces con acabado moderno y pulido | `npx skills add anthropics/skills --skill frontend-design -g` |
| `ui-ux-pro-max` | Criterios de UI/UX: estados interactivos, tamaños táctiles y responsive | `npx skills add nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max -g` |
