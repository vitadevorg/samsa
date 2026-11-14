# Inicio del paciente logueado

Rama: `style/inicio-paciente-logueado`

## Qué se implementó

* El paciente con sesión iniciada ya no ve la landing pública (`Home`), que le sugería iniciar sesión o registrarse aunque ya lo había hecho. Su pantalla principal pasa a ser **Turnos** (`/turns`).
* `ROLE_HOME[ROLES.PATIENT]` pasa de `/` a `/turns` (`src/constants/roles.js`). Eso unifica los destinos que usan `getHomeForRole`:
  * Después de iniciar sesión (`Login.jsx`), salvo que venga de una ruta protegida a la que quería entrar.
  * El logo "S.A.M.S.A" del Navbar.
  * `ProtectedRoute`, cuando un paciente intenta entrar a una ruta de otro rol.
* Nuevo `src/components/HomeRoute.jsx`, usado en la ruta `/`: si el usuario es paciente redirige (con `replace`) a `/turns`; para visitantes y para el resto de los roles sigue mostrando `Home`. Como `Home` ni se monta, tampoco se reproduce su intro animada.
* Sin cambios de estilos: `Turns.jsx` y `Navbar.jsx` quedan igual.

### Comportamiento

| Situación | Resultado |
|-----------|-----------|
| Visitante abre `/` | Ve la landing (`Home`) como siempre |
| Paciente inicia sesión | Va a `/turns` |
| Paciente logueado abre o recarga `/` | Redirige a `/turns` |
| Paciente logueado hace clic en el logo | Va a `/turns` |
| Paciente cierra sesión | Va a `/` (landing pública) |
| Otros roles (médico, secretaria, admins) | Sin cambios |

## Archivos clave tocados

* `src/constants/roles.js`
* `src/components/HomeRoute.jsx` (nuevo)
* `src/App.jsx` (ruta `/`)
* `docs/arquitectura-y-roles.md` (ruta home del paciente y mapa de rutas)

## Validación

Automática:
* `npm run lint`
* `npm run build`

Manual (`npm run dev`, Desktop, Tablet y Mobile):
1. Sin sesión, `/` muestra la landing con sus botones de iniciar sesión y registrarse.
2. Iniciar sesión con un paciente de prueba (`paciente@samsa.med`): se aterriza en `/turns`.
3. Estando logueado, escribir `/` en la barra o recargar: vuelve a `/turns` sin pasar por la landing.
4. Estando logueado, clic en el logo: queda en `/turns`.
5. "Cerrar sesión" desde el menú: vuelve a la landing pública.
6. Con un médico, secretaria o admin el inicio no cambia.
7. `/turns` en Mobile (1 columna), Tablet (2 columnas) y Desktop (4 columnas): sin scroll horizontal.
