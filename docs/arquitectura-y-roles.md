# Arquitectura, Roles y Mapa de Rutas — SAMSA

Documentación técnica de la estructura del frontend de **SAMSA**, sus roles de usuario, rutas protegidas, contextos compartidos y organización de módulos.

---

## 1. Stack Tecnológico

* **Core:** React 19 + Vite 7 (ESM)
* **Enrutamiento:** `react-router-dom` v7 (`BrowserRouter`, `Routes`, `Route`, `ProtectedRoute`)
* **Estilos:** Tailwind CSS v3.4 + `tailwindcss-animate` + utilidades `clsx` / `tailwind-merge`
* **Iconografía:** `lucide-react`
* **Calidad y CI:** ESLint 9 + GitHub Actions (`.github/workflows/ci.yml`: `frontend-build-lint`, `branch-name`, `secrets-scan` con Gitleaks)

---

## 2. Roles del Sistema (`src/constants/roles.js`)

El sistema define 7 roles en `ROLES` y su ruta de inicio por defecto (`ROLE_HOME`):

| Constante | Valor | Ruta Home (`ROLE_HOME`) | Descripción |
|-----------|-------|-------------------------|-------------|
| `ROLES.PATIENT` | `'patient'` | `/` | Paciente: solicita turnos, consulta estudios, reseñas y perfil |
| `ROLES.DOCTOR` | `'doctor'` | `/doctor/turns` | Profesional médico: gestiona su agenda, pacientes, protocolos y soporte |
| `ROLES.SECRETARY` | `'secretary'` | `/secretary/dashboard` | Secretaria: administra turnos y directorio de pacientes |
| `ROLES.ADMIN` | `'admin'` | `/admin/doctors` | Administrador general de consultorios, médicos, especialidades y obras sociales |
| `ROLES.CLINIC_ADMIN` | `'clinic_admin'` | `/clinic/doctors` | Administrador de Clínica (médicos, secretarias, personal y solicitudes) |
| `ROLES.HOSPITAL_ADMIN` | `'hospital_admin'` | `/hospital/doctors` | Administrador de Hospital (reutiliza las vistas de institución bajo `/hospital/...`) |
| `ROLES.VITADEV_ADMIN` | `'vitadev_admin'` | `/vitadev/dashboard` | Superadministrador VitaDev: red neuronal del ecosistema, clínicas, hospitales, médicos particulares y usuarios |

---

## 3. Mapa de Rutas (`src/App.jsx`)

### Rutas Públicas y Portal Paciente
* `/` → `Home.jsx` (Landing principal con intro cinematográfica, especialidades y sección B2B `ProfessionalB2BSection`)
* `/about` → `AboutUs.jsx` (Acerca de Nosotros: propuesta de valor, métricas y `CareFlowSection` interactivo)
* `/turns` → `Turns.jsx` (Buscador y solicitud de turnos)
* `/professionals` → `Professionals.jsx` (Cartilla de especialistas)
* `/professionals/:id` → `DoctorProfile.jsx` (Perfil público del profesional)
* `/book-appointment/:id` → `BookAppointment.jsx` (Flujo de reserva de turno)
* `/news` → `NewsForum.jsx` (Foro de salud preventiva y novedades)
* `/faq` → `FAQ.jsx` (Preguntas frecuentes)
* `/login`, `/register`, `/forgot-password`, `/reset-password` → Flujo completo de autenticación y recuperación de cuenta

### Rutas Protegidas por Rol (`ProtectedRoute`)
* **Cualquier usuario autenticado:**
  * `/user-profile` → `UserProfile.jsx`
* **Paciente (`ROLES.PATIENT`):**
  * `/studies` → `Studies.jsx`
  * `/my-turns` → `MyTurns.jsx`
  * `/my-reviews` → `MyReviews.jsx`
* **Médico (`ROLES.DOCTOR`):**
  * `/doctor/turns` → `DoctorTurns.jsx`
  * `/doctor/patients` → `DoctorPatients.jsx`
  * `/doctor/profile` → `DoctorProfile.jsx`
  * `/doctor/protocols` → `DoctorProtocols.jsx`
  * `/doctor/support` → `DoctorSupport.jsx`
* **Secretaria (`ROLES.SECRETARY`):**
  * `/secretary/dashboard` → `SecretaryDashboard.jsx`
  * `/secretary/patients` → `SecretaryPatients.jsx`
* **Administrador (`ROLES.ADMIN`):**
  * `/admin/doctors`, `/admin/specialties`, `/admin/offices`, `/admin/patients`, `/admin/insurances`, `/admin/profile`
* **Administrador de Clínica / Hospital (`ROLES.CLINIC_ADMIN` / `ROLES.HOSPITAL_ADMIN`):**
  * `/clinic/doctors` y `/hospital/doctors` → `ClinicDoctors.jsx`
  * `/clinic/secretaries` y `/hospital/secretaries` → `ClinicSecretaries.jsx`
  * `/clinic/staff` y `/hospital/staff` → `ClinicStaff.jsx`
  * `/clinic/requests` y `/hospital/requests` → `ClinicRequests.jsx`
* **Administrador VitaDev (`ROLES.VITADEV_ADMIN`):**
  * `/vitadev/dashboard` → `VitadevDashboard.jsx` (`NetworkGraph.jsx` + `SynapseCanvas.jsx`)
  * `/vitadev/doctors` → `VitadevDoctors.jsx` (`ParticularDoctorsPanel.jsx` + `ParticularSecretariesPanel.jsx`)
  * `/vitadev/clinics` → `VitadevInstitutions.jsx` (`kind="clinic"`)
  * `/vitadev/hospitals` → `VitadevInstitutions.jsx` (`kind="hospital"`)
  * `/vitadev/users` → `VitadevUsers.jsx`
  * `/vitadev/account` → `VitadevAccount.jsx`

---

## 4. Estado Global y Persistencia Local

* **`AuthProvider` (`src/context/AuthContext.jsx` + `src/services/authService.js`):**
  * Gestiona la sesión activa, login, registro, recuperación/reseteo de contraseña, cambio de contraseña y estado de cuentas (activas, inhabilitadas o dadas de baja).
* **`ClinicDataProvider` (`src/pages/clinic/ClinicDataProvider.jsx`):**
  * Envuelve todas las rutas en `App.jsx` para compartir el estado de instituciones, médicos, secretarias, personal y solicitudes pendientes (consumido tanto por las pantallas de clínica/hospital/VitaDev como por el contador de notificaciones en `Navbar.jsx`).
