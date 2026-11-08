# AGENTS.md

Before doing any work in this repository, read `docs/flujo-codigo-trello.md` and follow it strictly.

Hard rules (full detail in `docs/flujo-codigo-trello.md`):

- **Never commit directly to `main` or `development`.** Check `git branch --show-current` before every commit. If it is `main` or `development`: STOP, create a branch, and only then commit.
- **Never create branches from `main`.** Always branch from an up-to-date `development` (`git checkout development && git pull origin development`).
- **Branch naming convention (enforced by CI):**
  `feature/<descriptive-name>`, `hotfix/<descriptive-name>`, `bugfix/<descriptive-name>`, `style/<descriptive-name>`, `docs/<descriptive-name>`, `chore/<descriptive-name>`.
- **Every change goes through a Pull Request targeting `development`.** `main` only receives merges from `development` (releases), also via PR.
- **Use Conventional Commits:** `feat: ...`, `fix: ...`, `hotfix: ...`, `style: ...`, `docs: ...`, `chore: ...`.
- **Do not push, open PRs, or merge unless the user explicitly asks.**
- **Quality gates before opening any PR:**
  Run `npm run lint` and `npm run build` locally and verify both exit with code `0`. Never open a PR with lint errors or a broken build.
- **Manual local verification before PR (mandatory):**
  If a change affects UI, user flows, or behavior, the responsible person must test it locally (`npm run dev`) and confirm it works before opening the PR. An AI assistant must NEVER open a PR without that confirmation: provide the concrete steps/URL to test locally and wait for the user's explicit approval.
- **Mandatory PR Documentation in `docs/`:**
  Every PR that implements a feature, fix, or visual/UX redesign must create or update its corresponding documentation file in `docs/<feature-or-module>.md` (and link it in `docs/INDEX.md`). That document must include:
  1. **Qué se implementó** (summary of changes, components/services touched, business or design rules applied).
  2. **Archivos modificados / creados** (key paths and responsibility).
  3. **Validación** (automated checks `npm run lint` / `npm run build` + concrete manual verification steps tested locally and on Mobile/Tablet/Desktop viewports).
  4. **Correcciones de revisión del PR** (if review feedback was addressed).
- **Respect the Design System & Architecture:**
  - Read `docs/design-system.md` before building or modifying UI components, animations, typography, buttons, cards, or responsive layouts.
  - Read `docs/arquitectura-y-roles.md` to understand routes, roles (`patient`, `doctor`, `secretary`, `admin`, `clinic_admin`, `hospital_admin`, `vitadev_admin`), shared contexts (`AuthContext`, `ClinicDataProvider`), and data mocks.
- **Task & Trello alignment:**
  - Trello cards follow `[sistema]_[tipo]. [nombre corto]` (e.g., `samsa_feature. ...`, `samsa_style. ...`).
  - Task specifications and acceptance criteria live in `docs/tareas/INDEX.md` (and individual task files when applicable). If a task has a `[CONFIRMAR]` or open design/product decision, STOP and ask the user before implementing that part.
- **Zero secrets in the repository:**
  Never hardcode secrets, passwords, API keys, or tokens. Use `.env` locally (git-ignored) and `.env.example` with placeholder values. CI runs `gitleaks` on every PR.
