import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// --- Importación de Páginas Públicas y de Paciente ---
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Turns from './pages/Turns';
import Professionals from './pages/Professionals';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import Register from './pages/Register';
import Studies from './pages/Studies';
import MyTurns from './pages/MyTurns';
import DoctorProfile from './pages/DoctorProfile';
import BookAppointment from './pages/BookAppointment';
import UserProfile from './pages/UserProfile';

// --- Importación de Páginas de Médico ---
import DoctorTurns from './pages/doctor/DoctorTurns';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorProtocols from './pages/doctor/DoctorProtocols';
import DoctorSupport from './pages/doctor/DoctorSupport';

// --- Importación de Páginas de Secretaria ---
import SecretaryDashboard from './pages/secretary/SecretaryDashboard';
import SecretaryPatients from './pages/secretary/SecretaryPatients';

// --- Importación de Páginas de Administrador ---
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminSpecialties from './pages/admin/AdminSpecialties';
import AdminOffices from './pages/admin/AdminOffices';
import AdminPatients from './pages/admin/AdminPatients';
import AdminInsurances from './pages/admin/AdminInsurances';
import AdminProfile from './pages/admin/AdminProfile';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* =======================================================
              RUTAS PÚBLICAS
          ======================================================== */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/turns" element={<Turns />} />
          <Route path="/professionals" element={<Professionals />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rutas Dinámicas */}
          <Route path="/professionals/:id" element={<DoctorProfile />} />
          <Route path="/book-appointment/:id" element={<BookAppointment />} />
          
          {/* =======================================================
              RUTAS DE PACIENTE
          ======================================================== */}
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/studies" element={<Studies />} />
          <Route path="/my-turns" element={<MyTurns />} />

          {/* =======================================================
              RUTAS DE MÉDICO
          ======================================================== */}
          <Route path="/doctor/turns" element={<DoctorTurns />} />
          <Route path="/doctor/patients" element={<DoctorPatients />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
          <Route path="/doctor/protocols" element={<DoctorProtocols />} />
          <Route path="/doctor/support" element={<DoctorSupport />} />

          {/* =======================================================
              RUTAS DE SECRETARIA
          ======================================================== */}
          <Route path="/secretary/dashboard" element={<SecretaryDashboard />} />
          <Route path="/secretary/patients" element={<SecretaryPatients />} />

          {/* =======================================================
              RUTAS DE ADMINISTRADOR
          ======================================================== */}
          <Route path="/admin/doctors" element={<AdminDoctors />} />
          <Route path="/admin/specialties" element={<AdminSpecialties />} />
          <Route path="/admin/offices" element={<AdminOffices />} />
          <Route path="/admin/patients" element={<AdminPatients />} />
          <Route path="/admin/insurances" element={<AdminInsurances />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;