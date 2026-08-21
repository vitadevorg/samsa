import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  HeartPulse, LogOut, ChevronDown, Menu, X,
  Building, Stethoscope, Tag, Users, User, Calendar, FileText, Wallet, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive 
      ? "text-blue-700 font-bold flex items-center gap-1 bg-blue-50/80 px-4 py-2 rounded-xl transition-colors" 
      : "text-slate-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:bg-slate-50 px-4 py-2 rounded-xl transition-all";
  };

  const getFirstName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.split(' ');
    if (parts[0] === 'Dr.' || parts[0] === 'Dra.') {
       return parts[1] || parts[0];
    }
    return parts[0];
  };

  const displayName = getFirstName(user?.name);
  const userInitial = displayName ? displayName.charAt(0) : '';

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const isSecretary = user?.role === 'secretary';

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* 1. LOGO */}
          <div className="flex items-center">
            <Link to={isAdmin ? "/admin/doctors" : isDoctor ? "/doctor/turns" : isSecretary ? "/secretary/dashboard" : "/"} className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-2.5 rounded-xl group-hover:shadow-md group-hover:shadow-blue-500/20 transition-all duration-300 border border-blue-100">
                <HeartPulse className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-blue-700 transition-colors">S.A.M.S.A</span>
            </Link>
          </div>

          {/* 2. MENÚ CENTRAL */}
          <div className="hidden md:flex space-x-8 items-center">
            {isAdmin ? (
              /* --- VISTA ADMINISTRADOR --- */
              <>
                <Link to="/admin/offices" className={getLinkClass('/admin/offices')}>
                  <Building className="w-4 h-4"/> Consultorios
                </Link>
                <Link to="/admin/specialties" className={getLinkClass('/admin/specialties')}>
                  <Tag className="w-4 h-4"/> Especialidades
                </Link>
                <Link to="/admin/doctors" className={getLinkClass('/admin/doctors')}>
                  <Stethoscope className="w-4 h-4"/> Médicos
                </Link>
                <Link to="/admin/patients" className={getLinkClass('/admin/patients')}>
                  <Users className="w-4 h-4"/> Pacientes
                </Link>
                <Link to="/admin/insurances" className={getLinkClass('/admin/insurances')}>
                  <Wallet className="w-4 h-4"/> Obras Sociales
                </Link>
              </>
            ) : isDoctor ? (
              /* --- VISTA MÉDICO --- */
              <>
                <Link to="/doctor/turns" className={getLinkClass('/doctor/turns')}>
                  Turnos Asignados
                </Link>
                <Link to="/doctor/patients" className={getLinkClass('/doctor/patients')}>
                  Pacientes
                </Link>
              </>
            ) : isSecretary ? (
              /* --- VISTA SECRETARIA --- */
              <>
                <Link to="/secretary/dashboard" className={getLinkClass('/secretary/dashboard')}>
                  Agenda Diaria
                </Link>
                <Link to="/secretary/patients" className={getLinkClass('/secretary/patients')}>
                  Directorio Pacientes
                </Link>
              </>
            ) : (
              /* --- VISTA PÚBLICA / PACIENTE --- */
              <>
                <Link to="/about" className={getLinkClass('/about')}>Acerca de Nosotros</Link>
                <Link to="/turns" className={getLinkClass('/turns')}>Turnos</Link>
                <Link to="/professionals" className={getLinkClass('/professionals')}>Profesionales</Link>
                <Link to="/faq" className={getLinkClass('/faq')}>Preguntas Frecuentes</Link>
              </>
            )}

            {/* 3. PERFIL / LOGIN */}
            {user ? (
              <div className="relative ml-4">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-2xl border transition-all shadow-sm hover:shadow-md focus:outline-none ${isAdmin ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                >
                  <div 
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner ${isAdmin ? 'bg-blue-500 text-white' : isSecretary ? 'bg-pink-500 text-white' : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'}`}
                    style={{
                      backgroundImage: user.img ? `url(${user.img})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!user.img && userInitial}
                  </div>
                  <span className="text-sm font-bold px-1 tracking-wide">
                    {isAdmin ? 'Admin' : isDoctor ? `Dr. ${displayName}` : isSecretary ? `Sec. ${displayName}` : displayName}
                  </span>
                  <ChevronDown className="w-4 h-4 opacity-50 mr-1" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 z-50">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-xs font-bold text-gray-400 uppercase">Cuenta</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                    </div>

                    {/* OPCIONES DINÁMICAS */}
                    {isAdmin ? (
                       /* VISTA ADMIN */
                       <>
                         <Link to="/admin/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                           <Shield className="w-4 h-4" /> Mi Perfil
                         </Link>
                         <div className="px-4 py-2 text-xs text-center text-gray-400 italic bg-gray-50 mx-2 rounded mt-1">
                            Modo Gestión
                         </div>
                       </>
                    ) : isDoctor ? (
                      /* VISTA MÉDICO */
                      <>
                        <Link to="/doctor/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                          <User className="w-4 h-4" /> Perfil Profesional
                        </Link>
                      </>
                    ) : isSecretary ? (
                      /* VISTA SECRETARIA */
                      <>
                         <div className="px-4 py-2 text-xs text-center text-pink-600 italic bg-pink-50 mx-2 rounded mt-1 font-bold">
                            Modo Operativo
                         </div>
                      </>
                    ) : (
                      /* VISTA PACIENTE */
                      <>
                        <Link to="/user-profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                          <User className="w-4 h-4" /> Mi Perfil
                        </Link>
                        <Link to="/my-turns" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                          <Calendar className="w-4 h-4" /> Mis Turnos
                        </Link>
                        <Link to="/studies" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                          <FileText className="w-4 h-4" /> Mis Estudios
                        </Link>
                      </>
                    )}

                    <div className="border-t border-gray-100 my-1 mt-2"></div>
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition">
                      <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                  </div>
                )}
                {isDropdownOpen && <div className="fixed inset-0 z-30 cursor-default" onClick={() => setIsDropdownOpen(false)}></div>}
              </div>
            ) : (
              <Link to="/login" className="ml-4">
                <button className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-7 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 group flex items-center gap-2">
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <User className="w-4 h-4 relative z-10 opacity-90 group-hover:scale-110 transition-transform" />
                  <span className="relative z-10">Iniciar Sesión</span>
                </button>
              </Link>
            )}
          </div>
          
          {/* MENÚ MÓVIL */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-blue-600 p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO MENÚ MÓVIL */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-2 pt-2 pb-3 space-y-1">
          {isAdmin ? (
            <>
              <Link to="/admin/offices" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Consultorios</Link>
              <Link to="/admin/specialties" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Especialidades</Link>
              <Link to="/admin/doctors" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Médicos</Link>
              <Link to="/admin/patients" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Pacientes</Link>
              <Link to="/admin/insurances" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Obras Sociales</Link>
              <Link to="/admin/profile" className="block px-3 py-2 rounded-md text-base font-medium text-blue-700 bg-blue-50">Mi Perfil Admin</Link>
            </>
            ) : isDoctor ? (
            <>
              <Link to="/doctor/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Perfil Profesional</Link>
              <Link to="/doctor/turns" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Turnos Asignados</Link>
              <Link to="/doctor/patients" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Pacientes</Link>
            </>
          ) : isSecretary ? (
            <>
              <Link to="/secretary/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Agenda Diaria</Link>
              <Link to="/secretary/patients" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Directorio Pacientes</Link>
            </>
          ) : (
            <>
              <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Acerca de Nosotros</Link>
              <Link to="/turns" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Turnos</Link>
              <Link to="/professionals" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Profesionales</Link>
              <Link to="/faq" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Preguntas Frecuentes</Link>
            </>
          )}
          
          <div className="border-t border-gray-100 mt-4 pt-4">
             {user ? (
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-600 font-bold">Cerrar Sesión</button>
             ) : (
                <Link to="/login" className="block px-3 py-2 text-center bg-blue-600 text-white rounded-lg font-bold">Iniciar Sesión</Link>
             )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;