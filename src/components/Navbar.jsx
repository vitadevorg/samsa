import React, { useState, useContext, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut, ChevronDown, Menu, X,
  Building2, Hospital, UserCog, KeyRound, Stethoscope, Users, User, Calendar, FileText, Star, Inbox, Newspaper, UserRound, Database, LifeBuoy } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useSupport } from '../context/support-context';
import { useDismissOnOutside } from '../hooks/useDismissOnOutside';
import NotificationBell from './NotificationBell';
import { ROLES, getHomeForRole, INSTITUTION_ADMIN_PATHS } from '../constants/roles';
import { ClinicDataContext } from '../pages/clinic/clinicDataContext';
import { getDoctorLabel } from '../utils/doctorName';
import SamsaLogo from './SamsaLogo';
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const accountMenuRef = useRef(null);
  // El menú de cuenta se cierra al hacer click afuera o con Escape.
  const closeAccountMenu = useCallback(() => setIsDropdownOpen(false), []);
  useDismissOnOutside(accountMenuRef, isDropdownOpen, closeAccountMenu);
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive 
      ? "text-blue-700 font-bold flex items-center gap-1 whitespace-nowrap bg-blue-50/80 px-3 xl:px-4 py-2 rounded-xl transition-colors text-sm xl:text-base" 
      : "text-slate-600 hover:text-blue-700 font-medium flex items-center gap-1 whitespace-nowrap hover:bg-slate-50 px-3 xl:px-4 py-2 rounded-xl transition-all text-sm xl:text-base";
  };

  const getMobileLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "block px-3.5 py-2.5 rounded-xl text-base font-bold text-blue-700 bg-blue-50/90 border border-blue-100/80 transition-all duration-200"
      : "block px-3.5 py-2.5 rounded-xl text-base font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50/70 hover:translate-x-0.5 active:bg-blue-50 active:scale-[0.99] transition-all duration-200";
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
  const isDoctor = user?.role === ROLES.DOCTOR;
  const isSecretary = user?.role === ROLES.SECRETARY;
  const isClinicAdmin = user?.role === ROLES.CLINIC_ADMIN;
  const isHospitalAdmin = user?.role === ROLES.HOSPITAL_ADMIN;
  const isVitadevAdmin = user?.role === ROLES.VITADEV_ADMIN;
  // El administrador de SAMSA siempre se muestra como "Admin" (inicial A), aunque la sesión guardada tenga otro nombre.
  const userInitial = isVitadevAdmin ? 'A' : displayName ? displayName.charAt(0) : '';
  // Los administradores de institución usan el mismo estilo oscuro que el admin general.
  const isInstitutionAdmin = isClinicAdmin || isHospitalAdmin || isVitadevAdmin;
  // Ruta base de las pantallas de administración: '/clinic', '/hospital' o undefined.
  const institutionBase = INSTITUTION_ADMIN_PATHS[user?.role];
  // En las pantallas de clínica el Navbar está dentro de ClinicDataProvider y puede leer
  // las solicitudes; en el resto del sitio el contexto es null y el contador queda en 0.
  const clinicData = useContext(ClinicDataContext);
  const pendingRequests = clinicData?.requests.filter((r) => r.status === 'pendiente').length ?? 0;
  // Tickets de soporte sin resolver (solo los ve el admin SAMSA).
  const { openCount } = useSupport();
  const pendingTickets = isVitadevAdmin ? openCount : 0;
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center shrink-0">
            <Link to={getHomeForRole(user?.role)} className="flex items-center gap-2.5 group">
              <SamsaLogo className="h-9 w-auto shrink-0 drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
              <span className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-blue-700 transition-colors">S.A.M.S.A</span>
            </Link>
          </div>
          <div className="hidden lg:flex space-x-2 xl:space-x-6 items-center">
            {institutionBase ? (
              <>
                <Link to={`${institutionBase}/doctors`} className={getLinkClass(`${institutionBase}/doctors`)}>
                  <Stethoscope className="w-4 h-4"/> Médicos
                </Link>
                <Link to={`${institutionBase}/secretaries`} className={getLinkClass(`${institutionBase}/secretaries`)}>
                  <Users className="w-4 h-4"/> Secretarias
                </Link>
                <Link to={`${institutionBase}/requests`} className={getLinkClass(`${institutionBase}/requests`)}>
                  <Inbox className="w-4 h-4"/> Solicitudes
                  {pendingRequests > 0 && (
                    <span className="ml-1 min-w-5 h-5 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center" aria-label={`${pendingRequests} pendientes`}>
                      {pendingRequests}
                    </span>
                  )}
                </Link>
                <Link to="/news" className={getLinkClass('/news')}>
                  <Newspaper className="w-4 h-4"/> Foro
                </Link>
              </>
            ) : isVitadevAdmin ? (
              <div className="flex items-center gap-1 xl:gap-2 [&>a]:px-2 xl:[&>a]:px-4">
                <Link to="/vitadev/doctors" className={getLinkClass('/vitadev/doctors')}>
                  <UserRound className="w-4 h-4"/> Particulares
                </Link>
                <Link to="/vitadev/clinics" className={getLinkClass('/vitadev/clinics')}>
                  <Building2 className="w-4 h-4"/> Clínicas
                </Link>
                <Link to="/vitadev/hospitals" className={getLinkClass('/vitadev/hospitals')}>
                  <Hospital className="w-4 h-4"/> Hospitales
                </Link>
                <Link to="/vitadev/users" className={getLinkClass('/vitadev/users')}>
                  <UserCog className="w-4 h-4"/> Usuarios
                </Link>
                {/* Gestión de cuentas e instituciones a la izquierda; comunicación (foro y soporte) a la derecha. */}
                <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
                <Link to="/news" className={getLinkClass('/news')}>
                  <Newspaper className="w-4 h-4"/> Foro
                </Link>
                <Link to="/vitadev/support" className={getLinkClass('/vitadev/support')}>
                  <LifeBuoy className="w-4 h-4"/> Soporte
                  {pendingTickets > 0 && (
                    <span className="ml-1 min-w-5 h-5 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center" aria-label={`${pendingTickets} tickets sin resolver`}>
                      {pendingTickets}
                    </span>
                  )}
                </Link>
              </div>
            ) : isDoctor ? (
              <>
                <Link to="/doctor/turns" className={getLinkClass('/doctor/turns')}>
                  Turnos Asignados
                </Link>
                <Link to="/doctor/patients" className={getLinkClass('/doctor/patients')}>
                  Pacientes
                </Link>
                <Link to="/news" className={getLinkClass('/news')}>
                  Foro
                </Link>
              </>
            ) : isSecretary ? (
              <>
                <Link to="/secretary/dashboard" className={getLinkClass('/secretary/dashboard')}>
                  Agenda Diaria
                </Link>
                <Link to="/secretary/patients" className={getLinkClass('/secretary/patients')}>
                  Directorio Pacientes
                </Link>
              </>
            ) : (
              <>
                <Link to="/turns" className={getLinkClass('/turns')}>Turnos</Link>
                <Link to="/professionals" className={getLinkClass('/professionals')}>Profesionales</Link>
                <Link to="/news" className={getLinkClass('/news')}>Foro</Link>
                <Link to="/faq" className={getLinkClass('/faq')}>Preguntas Frecuentes</Link>
                <Link to="/about" className={getLinkClass('/about')}>Acerca de Nosotros</Link>
              </>
            )}
            {user ? (
              <div className="flex items-center gap-2 xl:gap-3 ml-2 xl:ml-4 shrink-0">
              <div ref={accountMenuRef} className="relative shrink-0">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-2xl border transition-all shadow-sm hover:shadow-md focus:outline-none bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                >
                  <div 
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner ${isSecretary ? 'bg-blue-600 text-white' : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'}`}
                    // Sin foto no se fija `backgroundImage`: pisaría el degradado de Tailwind y la inicial blanca quedaría sobre fondo blanco.
                    style={user.img ? {
                      backgroundImage: `url(${user.img})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    } : undefined}
                  >
                    {!user.img && userInitial}
                  </div>
                  <span className={`text-sm font-bold px-1 tracking-wide whitespace-nowrap ${isInstitutionAdmin ? 'hidden xl:inline' : ''}`}>
                    {isClinicAdmin ? 'Admin Clínica' : isHospitalAdmin ? 'Admin Hospital' : isVitadevAdmin ? 'Admin' : isDoctor ? getDoctorLabel(user) : isSecretary ? `Sec. ${displayName}` : displayName}
                  </span>
                  <ChevronDown className="w-4 h-4 opacity-50 mr-1" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 z-50">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-xs font-bold text-gray-400 uppercase">Cuenta</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{isVitadevAdmin ? 'Admin' : user.name}</p>
                    </div>
                    {isVitadevAdmin ? (
                       <>
                         <Link to="/vitadev/account" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                           <KeyRound className="w-4 h-4" /> Mi cuenta
                         </Link>
                         <Link to="/vitadev/catalog" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                           <Database className="w-4 h-4" /> Gestión de datos
                         </Link>
                         <div className="px-4 py-2 text-xs text-center text-gray-400 italic bg-gray-50 mx-2 rounded mt-1">
                            Modo Gestión
                         </div>
                       </>
                    ) : isInstitutionAdmin ? (
                       <>
                         <Link to={`${institutionBase}/account`} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                           <KeyRound className="w-4 h-4" /> Mi cuenta
                         </Link>
                         <Link to={`${institutionBase}/settings`} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                           {isHospitalAdmin ? <Hospital className="w-4 h-4" /> : <Building2 className="w-4 h-4" />} {isHospitalAdmin ? 'Datos del hospital' : 'Datos de la clínica'}
                         </Link>
                         <div className="px-4 py-2 text-xs text-center text-gray-400 italic bg-gray-50 mx-2 rounded mt-1">
                            Modo Gestión
                         </div>
                       </>
                    ) : isDoctor ? (
                      <>
                        <Link to="/doctor/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                          <User className="w-4 h-4" /> Perfil Profesional
                        </Link>
                      </>
                    ) : isSecretary ? (
                      <>
                         <Link to="/secretary/account" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                           <User className="w-4 h-4" /> Mi cuenta
                         </Link>
                         <div className="px-4 py-2 text-xs text-center text-blue-700 italic bg-blue-50 mx-2 rounded mt-1 font-bold">
                            Modo Operativo
                         </div>
                      </>
                    ) : (
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
                        <Link to="/my-reviews" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700">
                          <Star className="w-4 h-4" /> Mis Reseñas
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-100 my-1 mt-2"></div>
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition">
                      <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
              <NotificationBell />
              </div>
            ) : (
              <Link to="/login" className="ml-2 xl:ml-4 shrink-0">
                <button className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 xl:px-7 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 group flex items-center gap-2 whitespace-nowrap">
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <User className="w-4 h-4 relative z-10 opacity-90 group-hover:scale-110 transition-transform" />
                  <span className="relative z-10">Iniciar Sesión</span>
                </button>
              </Link>
            )}
          </div>
          <div className="lg:hidden flex items-center gap-1">
            {user && <NotificationBell />}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="text-slate-600 hover:text-blue-600 hover:bg-slate-100 active:scale-95 p-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <span className="relative flex flex-col justify-between w-5 h-4" aria-hidden="true">
                <span className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 ease-out origin-center ${isOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
                <span className={`block h-0.5 w-full bg-current rounded-full transition-all duration-200 ease-out ${isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'}`} />
                <span className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 ease-out origin-center ${isOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </div>
      </div>
      <div
        className={`lg:hidden grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100 border-t border-gray-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}
        aria-hidden={!isOpen}
      >
        <div className="overflow-hidden bg-white">
          <div className="px-3 pt-2 pb-4 space-y-1">
          {institutionBase ? (
            <>
              <Link to={`${institutionBase}/doctors`} onClick={() => setIsOpen(false)} className={getMobileLinkClass(`${institutionBase}/doctors`)}>Médicos</Link>
              <Link to={`${institutionBase}/secretaries`} onClick={() => setIsOpen(false)} className={getMobileLinkClass(`${institutionBase}/secretaries`)}>Secretarias</Link>
              <Link to={`${institutionBase}/requests`} onClick={() => setIsOpen(false)} className={getMobileLinkClass(`${institutionBase}/requests`)}>
                Solicitudes{pendingRequests > 0 && ` (${pendingRequests})`}
              </Link>
              <Link to="/news" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/news')}>Foro</Link>
              <Link to={`${institutionBase}/account`} onClick={() => setIsOpen(false)} className={getMobileLinkClass(`${institutionBase}/account`)}>Mi cuenta</Link>
              <Link to={`${institutionBase}/settings`} onClick={() => setIsOpen(false)} className={getMobileLinkClass(`${institutionBase}/settings`)}>{isHospitalAdmin ? 'Datos del hospital' : 'Datos de la clínica'}</Link>
            </>
          ) : isVitadevAdmin ? (
            <>
              <Link to="/vitadev/doctors" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/vitadev/doctors')}>Particulares</Link>
              <Link to="/vitadev/clinics" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/vitadev/clinics')}>Clínicas</Link>
              <Link to="/vitadev/hospitals" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/vitadev/hospitals')}>Hospitales</Link>
              <Link to="/vitadev/users" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/vitadev/users')}>Usuarios</Link>
              <Link to="/news" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/news')}>Foro</Link>
              <Link to="/vitadev/support" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/vitadev/support')}>
                Soporte{pendingTickets > 0 && ` (${pendingTickets})`}
              </Link>
              <Link to="/vitadev/account" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/vitadev/account')}>Mi cuenta</Link>
              <Link to="/vitadev/catalog" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/vitadev/catalog')}>Gestión de datos</Link>
            </>
          ) : isDoctor ? (
            <>
              <Link to="/doctor/profile" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/doctor/profile')}>Perfil Profesional</Link>
              <Link to="/doctor/turns" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/doctor/turns')}>Turnos Asignados</Link>
              <Link to="/doctor/patients" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/doctor/patients')}>Pacientes</Link>
              <Link to="/news" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/news')}>Foro</Link>
            </>
          ) : isSecretary ? (
            <>
              <Link to="/secretary/dashboard" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/secretary/dashboard')}>Agenda Diaria</Link>
              <Link to="/secretary/patients" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/secretary/patients')}>Directorio Pacientes</Link>
              <Link to="/secretary/account" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/secretary/account')}>Mi cuenta</Link>
            </>
          ) : (
            <>
              <Link to="/turns" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/turns')}>Turnos</Link>
              <Link to="/professionals" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/professionals')}>Profesionales</Link>
              <Link to="/news" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/news')}>Foro</Link>
              <Link to="/faq" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/faq')}>Preguntas Frecuentes</Link>
              <Link to="/about" onClick={() => setIsOpen(false)} className={getMobileLinkClass('/about')}>Acerca de Nosotros</Link>
            </>
          )}
          <div className="border-t border-gray-100 mt-4 pt-4">
             {user ? (
                <button onClick={handleLogout} className="w-full text-left px-3.5 py-2.5 rounded-xl text-red-600 font-bold hover:bg-red-50 active:scale-[0.99] transition-all duration-200">Cerrar Sesión</button>
             ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.99] transition-all duration-200">Iniciar Sesión</Link>
             )}
          </div>
        </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
