# Guía para Asistentes y Equipo — SAMSA

Este proyecto sigue un flujo de trabajo obligatorio en equipo.
Consultar siempre las reglas en `@docs/workflow.md`.

## Reglas Clave

- **Nunca commitear directo en `main` ni en `development`.**
- Toda rama parte siempre desde `development` actualizado.
- Todo cambio entra exclusivamente por **Pull Request hacia `development`**.
- Verificar siempre `git branch --show-current` antes de commitear.
- Formato de ramas obligatorio: `feature/US-XX-...`, `fix/US-XX-...`, `docs/...`, `chore/...`.
- Antes de abrir PR o dar por terminada una tarea, verificar que pasen `npm run lint` y `npm run build`.
- Nunca hardcodear secretos, API keys o credenciales. Usar variables de entorno y documentarlas en `.env.example`.
