# Índice de Tareas e Historias de Usuario — SAMSA

Registro centralizado de tareas, historias de usuario y mejoras visuales del proyecto **SAMSA**, vinculadas con su rama, Pull Request y documento técnico en `docs/`.

---

## Cómo usar este índice

1. **Antes de iniciar una tarjeta de Trello**, verificá acá su estado, dependencias y si tiene decisiones marcadas con `[CONFIRMAR]`.
2. **Al abrir un Pull Request**, creá su documento de entrega en `docs/<slug>.md` (con secciones *Qué se implementó*, *Archivos Modificados* y *Validación*) y agregá la fila correspondiente en este índice y en [`docs/INDEX.md`](../INDEX.md).

---

## Historial de Tareas y Entregas

| ID / Tipo | Tarjeta / Descripción | Rama | PR | Estado | Documentación |
|-----------|-----------------------|------|----|--------|---------------|
| `chore` | Configuración de flujo de trabajo, CI pipelines y reglas de ramas | `chore/fix-ci-and-lint` | [#5](https://github.com/vitadevorg/samsa/pull/5) | ✅ Mergeado | [`docs/flujo-codigo-trello.md`](../flujo-codigo-trello.md) |
| `US-00` (`feature`) | Módulo administrador VitaDev (red neuronal, instituciones, médicos particulares, usuarios y seguridad) | `feature/US-00-modulo-admin-vitadev` | [#6](https://github.com/vitadevorg/samsa/pull/6) | ✅ Mergeado | [`docs/modulo-admin-vitadev.md`](../modulo-admin-vitadev.md) |
| `style` | Rediseño de "Flujo de atención simplificado", animaciones y mejoras responsive en `AboutUs` | `style/flujo-atencion-y-responsive-about` | [#7](https://github.com/vitadevorg/samsa/pull/7) | ✅ Mergeado | [`docs/flujo-atencion-pacientes.md`](../flujo-atencion-pacientes.md) |
| `style` (`#55`) | Corrección de redundancia y datos de registro en Preguntas Frecuentes + responsive en `FAQ` y `Navbar` | `style/redundancia-panel-preguntas-frecuentes` | [#8](https://github.com/vitadevorg/samsa/pull/8) | 🔍 En Revisión (QA) | [`docs/redundancia-preguntas-frecuentes.md`](../redundancia-preguntas-frecuentes.md) |

---

## Plantilla para Documentar Nuevos PRs (`docs/<nombre-feature>.md`)

Cada nuevo PR debe incluir un archivo en `docs/` siguiendo esta estructura:

```markdown
# PR #XX — [Código/Tipo]: [Título corto]

**Rama:** `<tipo>/<nombre>`
**Tipo:** `feature` | `style` | `bugfix` | `hotfix`
**Rutas / Módulos afectados:** `/ruta` (`src/pages/...`)

---

## 1. Qué se implementó
- Resumen claro de las funcionalidades, reglas de negocio o mejoras visuales/UX implementadas.
- Decisiones tomadas (y por quién, si había puntos `[CONFIRMAR]`).

## 2. Archivos Modificados / Creados
| Archivo | Cambio |
|---------|--------|
| `src/...` | Descripción breve |

## 3. Validación
### Verificación Automática
- `npm run lint` y `npm run build` en verde.

### Prueba Manual Local
1. Pasos concretos ejecutados en `http://localhost:5173/...`
2. Comportamiento verificado en Desktop, Tablet y Mobile.

## 4. Correcciones de revisión del PR (si aplica)
- Ajustes realizados a partir del feedback de compañeros en el PR.
```
