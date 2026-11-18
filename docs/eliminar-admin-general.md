# Eliminación del administrador general anterior

## Qué se implementó

El sistema tenía un rol `admin` (`ROLES.ADMIN`) que quedó reemplazado por el administrador VitaDev (`admin.samsa@samsa.med`, `ROLES.VITADEV_ADMIN`). Ese rol no tenía ninguna cuenta cargada, así que sus módulos eran código muerto. Se eliminaron:

- Las seis pantallas de `src/pages/admin/`: médicos, especialidades, consultorios, pacientes, obras sociales y perfil.
- Las rutas `/admin/*` y su `ProtectedRoute` en `App.jsx`.
- El rol `ADMIN` y su ruta de inicio en `src/constants/roles.js`.
- Los accesos del rol en `Navbar.jsx` (menú de escritorio, desplegable y menú móvil) y en `Footer.jsx`.
- El hook `src/hooks/useCrudList.js`, que solo usaban esas pantallas.
- La sección "Administración general" del README y sus dos capturas.
- Comentarios que referenciaban a `AdminDoctors` en `ClinicDoctors.jsx`.

La gestión de especialidades, obras sociales y estudios sigue disponible en VitaDev (`/vitadev/catalog`).

## Archivos clave tocados

- `src/App.jsx`, `src/constants/roles.js`
- `src/components/Navbar.jsx`, `src/components/Footer.jsx`
- `src/pages/clinic/ClinicDoctors.jsx` (comentarios)
- `src/pages/admin/*` y `src/hooks/useCrudList.js` (eliminados)
- `README.md`, `docs/arquitectura-y-roles.md`, `docs/INDEX.md`

## Validación

Automática:
- `npm run lint`: sin errores.
- `npm run build`: compila limpio.
- Búsqueda de `ROLES.ADMIN`, `isAdmin` y `/admin/` en `src/`: sin resultados.

Manual local (pendiente de confirmación del responsable, `npm run dev`):
- Ingresar con `admin.samsa@samsa.med` y comprobar Navbar, desplegable y menú móvil de VitaDev.
- Ingresar como paciente, médico, secretaria y admin de clínica y comprobar que Navbar y Footer no cambiaron.
- Abrir `/admin/doctors` y comprobar que no existe.
- Anchos a verificar: mobile (~375px), tablet (~768px) y desktop (~1280px).
