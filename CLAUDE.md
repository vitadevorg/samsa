# CLAUDE.md

This project follows a mandatory team workflow and documentation standard. Read and respect these documents before starting any task:

- @docs/flujo-codigo-trello.md
- @docs/INDEX.md
- @docs/design-system.md
- @docs/arquitectura-y-roles.md

## Hard Rules

1. **Never commit to `main` or `development` directly.** Always work on a branch created from an up-to-date `development` and open PRs against `development`. Check `git branch --show-current` before every commit.
2. **Branch names (validated by GitHub Actions CI):** `feature/...`, `hotfix/...`, `bugfix/...`, `style/...`, `docs/...`, `chore/...`.
3. **Conventional Commits:** `feat:`, `fix:`, `hotfix:`, `style:`, `docs:`, `chore:`.
4. **Quality checks before PR:** Run `npm run lint` and `npm run build` locally. Both must pass with zero errors.
5. **Manual local test before PR:** Never push or open a PR without explicit confirmation from the user after testing locally (`npm run dev`), unless it is a docs-only change.
6. **Mandatory Documentation per PR (`docs/`):** Every PR must include or update its documentation in `docs/<slug>.md` (and register it in `docs/INDEX.md`) detailing what was implemented, which files were modified, and how it was validated (`## Validación` with automated and manual steps).
7. **Design System & Responsive first:** Follow `docs/design-system.md` for typography, colors, buttons, glassmorphism cards, animations, and mobile/tablet/desktop responsiveness.
8. **Open decisions (`[CONFIRMAR]`):** Never assume defaults on open product or design decisions. Stop, explain the options to the user, and wait for their explicit choice.
9. **Zero secrets:** Never commit credentials, tokens, or API keys. CI runs `gitleaks` on every PR.
