# Workflow de trabajo — SAMSA

Flujo obligatorio para el equipo y asistentes de IA.
**Una historia de usuario / tarjeta de Trello = una rama = un PR hacia `development`.**

---

## Reglas duras (no negociables)

1. **Prohibido commitear directo en `main` o `development`.** Siempre se trabaja en una rama propia.
2. **Prohibido crear ramas desde `main`.** Toda rama de desarrollo sale de `development` actualizada.
3. **Todo cambio entra por Pull Request hacia `development`.** `main` solo recibe merges de `development` (releases de producción), también por PR.
4. **Antes de cualquier commit, verificar la rama actual:**
   ```bash
   git branch --show-current
   ```
   Si es `main` o `development`: parar, crear la rama correspondiente y recién ahí commitear.
5. **Commits en formato Conventional Commits:**
   * `feat: US-XX descripcion`
   * `fix: US-XX descripcion`
   * `docs: descripcion`
   * `chore: descripcion`
6. **Prueba local y build limpio antes de abrir PR:**
   * Ejecutar `npm run lint` y `npm run build` localmente para asegurar que no rompa el CI.
7. **Limpieza automática de ramas:**
   * Las ramas de feature/fix deben eliminarse una vez mergeado el PR (GitHub lo puede hacer automáticamente tras el merge).

---

## Nombres de rama permitidos

El CI validará automáticamente que las ramas sigan esta nomenclatura:

```text
feature/US-XX-nombre-descriptivo
fix/US-XX-nombre-descriptivo
docs/nombre-descriptivo
chore/nombre-descriptivo
```

*Ejemplo:* `feature/US-01-adhesion-medica` o `fix/US-04-error-login`.

---

## Flujo paso a paso

```bash
# 1. Posicionarse en development y traer lo último
git checkout development
git pull origin development

# 2. Crear tu rama de trabajo
git checkout -b feature/US-XX-mi-tarea

# 3. Desarrollar y verificar calidad localmente
npm run lint
npm run build

# 4. Confirmar que NO estás en main ni development
git branch --show-current

# 5. Guardar cambios con conventional commits
git add .
git commit -m "feat: US-XX descripcion del cambio"

# 6. Subir tu rama a GitHub
git push -u origin feature/US-XX-mi-tarea

# 7. Abrir el Pull Request hacia la rama 'development'
# Esperar revisión de compañeros y que pasen los checks de CI (build, lint, branch-name, gitleaks).
```

---

## Manejo de Secretos y Variables de Entorno

* **Nunca hardcodear credenciales, API keys ni tokens** en el código fuente.
* Usar variables de entorno en archivos `.env` (incluidos en `.gitignore`).
* Mantener un archivo `.env.example` actualizado con valores ficticios para referencia del equipo.
