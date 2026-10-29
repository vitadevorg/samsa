import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './constants/roles';

import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Turns from './pages/Turns';
import Professionals from './pages/Professionals';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Studies from './pages/Studies';
import MyTurns from './pages/MyTurns';
import DoctorProfile from './pages/DoctorProfile';
import BookAppointment from './pages/BookAppointment';
import UserProfile from './pages/UserProfile';
import NewsForum from './pages/NewsForum';
import MyReviews from './pages/MyReviews';

import DoctorTurns from './pages/doctor/DoctorTurns';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorProtocols from './pages/doctor/DoctorProtocols';
import DoctorSupport from './pages/doctor/DoctorSupport';

import SecretaryDashboard from './pages/secretary/SecretaryDashboard';
import SecretaryPatients from './pages/secretary/SecretaryPatients';

import AdminDoctors from './pages/admin/AdminDoctors';
import AdminSpecialties from './pages/admin/AdminSpecialties';
import AdminOffices from './pages/admin/AdminOffices';
import AdminPatients from './pages/admin/AdminPatients';
import AdminInsurances from './pages/admin/AdminInsurances';
import AdminProfile from './pages/admin/AdminProfile';

import ClinicDataProvider from './pages/clinic/ClinicDataProvider';
import ClinicDoctors from './pages/clinic/ClinicDoctors';
import ClinicSecretaries from './pages/clinic/ClinicSecretaries';
import ClinicRequests from './pages/clinic/ClinicRequests';
import ClinicStaff from './pages/clinic/ClinicStaff';
import VitadevDashboard from './pages/vitadev/VitadevDashboard';

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
        {/* ClinicDataProvider comparte los datos de las instituciones con TODAS las rutas
            (pantallas de clínica, Navbar, perfil del médico...) */}
        <ClinicDataProvider>
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/turns" element={<Turns />} />
          <Route path="/news" element={<NewsForum />} />
          <Route path="/professionals" element={<Professionals />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/professionals/:id" element={<DoctorProfile />} />
          <Route path="/book-appointment/:id" element={<BookAppointment />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/user-profile" element={<UserProfile />} />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.PATIENT]} />}>
            <Route path="/studies" element={<Studies />} />
            <Route path="/my-turns" element={<MyTurns />} />
            <Route path="/my-reviews" element={<MyReviews />} />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.DOCTOR]} />}>
            <Route path="/doctor/turns" element={<DoctorTurns />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />
            <Route path="/doctor/protocols" element={<DoctorProtocols />} />
            <Route path="/doctor/support" element={<DoctorSupport />} />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.SECRETARY]} />}>
            <Route path="/secretary/dashboard" element={<SecretaryDashboard />} />
            <Route path="/secretary/patients" element={<SecretaryPatients />} />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
            <Route path="/admin/doctors" element={<AdminDoctors />} />
            <Route path="/admin/specialties" element={<AdminSpecialties />} />
            <Route path="/admin/offices" element={<AdminOffices />} />
            <Route path="/admin/patients" element={<AdminPatients />} />
            <Route path="/admin/insurances" element={<AdminInsurances />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>

          {/* Administradores de institución: cada grupo solo es accesible para su rol */}
          <Route element={<ProtectedRoute roles={[ROLES.CLINIC_ADMIN]} />}>
            <Route path="/clinic/doctors" element={<ClinicDoctors />} />
            <Route path="/clinic/secretaries" element={<ClinicSecretaries />} />
            <Route path="/clinic/staff" element={<ClinicStaff />} />
            <Route path="/clinic/requests" element={<ClinicRequests />} />
          </Route>

          {/* El hospital usa las mismas pantallas que la clínica, bajo /hospital/... */}
          <Route element={<ProtectedRoute roles={[ROLES.HOSPITAL_ADMIN]} />}>
            <Route path="/hospital/doctors" element={<ClinicDoctors />} />
            <Route path="/hospital/secretaries" element={<ClinicSecretaries />} />
            <Route path="/hospital/staff" element={<ClinicStaff />} />
            <Route path="/hospital/requests" element={<ClinicRequests />} />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.VITADEV_ADMIN]} />}>
            <Route path="/vitadev/dashboard" element={<VitadevDashboard />} />
          </Route>
        </Routes>
        </ClinicDataProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;