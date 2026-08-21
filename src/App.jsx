import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

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

          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/studies" element={<Studies />} />
          <Route path="/my-turns" element={<MyTurns />} />
          <Route path="/my-reviews" element={<MyReviews />} />

          <Route path="/doctor/turns" element={<DoctorTurns />} />
          <Route path="/doctor/patients" element={<DoctorPatients />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
          <Route path="/doctor/protocols" element={<DoctorProtocols />} />
          <Route path="/doctor/support" element={<DoctorSupport />} />

          <Route path="/secretary/dashboard" element={<SecretaryDashboard />} />
          <Route path="/secretary/patients" element={<SecretaryPatients />} />

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