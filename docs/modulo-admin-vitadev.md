# PR #6 — US-00: Módulo Administrador VitaDev

**Rama:** `feature/US-00-modulo-admin-vitadev`  
**Tipo:** `feature`  
**Rutas principales:** `/vitadev/dashboard`, `/vitadev/doctors`, `/vitadev/clinics`, `/vitadev/hospitals`, `/vitadev/users`, `/vitadev/account`

---

## 1. Qué se implementó

* **Panel Principal con Red Neuronal Interactiva (`VitadevDashboard.jsx`, `NetworkGraph.jsx`, `SynapseCanvas.jsx`):**
  * Visualización gráfica interactiva en canvas de la red de instituciones (clínicas y hospitales), médicos y usuarios activos del ecosistema SAMSA.
* **Gestión de Instituciones (`VitadevInstitutions.jsx`, `InstitutionDoctorsList.jsx`):**
  * Alta, edición, inhabilitación y baja de clínicas (`/vitadev/clinics`) y hospitales (`/vitadev/hospitals`) reutilizando el componente parametrizado por `kind`.
  * Consulta del plantel médico asociado a cada institución.
* **Gestión de Profesionales y Secretarias Particulares (`VitadevDoctors.jsx`, `ParticularDoctorsPanel.jsx`, `ParticularSecretariesPanel.jsx`):**
  * Administración de médicos particulares y sus secretarias asignadas.
* **Directorio Global de Usuarios y Estados de Cuenta (`VitadevUsers.jsx`, `userDirectory.js`, `AccountStatusBadge.jsx`):**
  * Listado unificado de cuentas del sistema con filtros, estado (`activo`, `inhabilitado`, `baja`), inhabilitación temporal y baja lógica.
* **Seguridad, Recuperación de Contraseña y "Mi Cuenta" (`ForgotPassword.jsx`, `ResetPassword.jsx`, `ChangePasswordModal.jsx`, `VitadevAccount.jsx`, `authService.js`):**
  * Flujo de reseteo y cambio de contraseña, validación de cuentas inhabilitadas en `Login.jsx` y gestión del perfil del administrador VitaDev.
* **Validaciones de Clínica (`clinicValidation.js`, `ClinicDataProvider.jsx`):**
  * Centralización de reglas de validación de formularios institucionales y sincronización de estado.

---

## 2. Archivos Creados / Modificados Principales

* `src/pages/vitadev/*` (`VitadevDashboard.jsx`, `NetworkGraph.jsx`, `SynapseCanvas.jsx`, `VitadevInstitutions.jsx`, `VitadevDoctors.jsx`, `ParticularDoctorsPanel.jsx`, `ParticularSecretariesPanel.jsx`, `VitadevUsers.jsx`, `VitadevAccount.jsx`, `AccountStatusBadge.jsx`, `InstitutionDoctorsList.jsx`, `userDirectory.js`, `useSuccessModal.js`)
* `src/pages/ResetPassword.jsx`, `src/pages/ForgotPassword.jsx`, `src/pages/Login.jsx`
* `src/components/ChangePasswordModal.jsx`, `src/components/Navbar.jsx`
* `src/pages/clinic/ClinicDataProvider.jsx`, `src/pages/clinic/clinicValidation.js`
* `src/services/authService.js`, `src/data/institutions.js`, `src/utils/doctorName.js`

---

## 3. Validación

* **Checks Automáticos:** `npm run lint` y `npm run build` sin errores.
* **Prueba Funcional:**
  1. Iniciar sesión con rol `vitadev_admin` y verificar redirección a `/vitadev/dashboard` con el grafo interactivo.
  2. Probar alta, edición, inhabilitación y baja en `/vitadev/clinics`, `/vitadev/hospitals`, `/vitadev/doctors` y `/vitadev/users`.
  3. Verificar que un usuario inhabilitado o dado de baja no pueda iniciar sesión en `/login`.
  4. Verificar flujo de recuperación (`/forgot-password` → `/reset-password`) y cambio de contraseña desde `/vitadev/account`.
