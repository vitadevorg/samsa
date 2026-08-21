import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ChevronRight = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m9 18 6-6-6-6"/>
    </svg>
);

const Footer = ({ theme = 'dark' }) => {
  const { user } = useAuth();
  const isLight = theme === 'light';

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';

  const bgClass = isLight ? 'bg-white border-t border-gray-100' : 'bg-slate-950 border-t border-slate-800';
  const textTitleClass = isLight ? 'text-gray-900' : 'text-white';
  const textMutedClass = isLight ? 'text-gray-500' : 'text-slate-400';
  const iconBgClass = isLight ? 'bg-blue-50' : 'bg-slate-900';
  const iconHoverClass = isLight ? 'hover:bg-blue-100' : 'hover:bg-blue-900/30';
  const borderBottomClass = isLight ? 'border-gray-100' : 'border-slate-900';

  return (
    <footer className={`${bgClass} ${isLight ? 'text-gray-800' : 'text-white'} py-16`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">

          <div className="space-y-4">
              <div className="flex items-center gap-2">
                  <div className="bg-blue-600 p-2 rounded-lg">
                      <Heart className="w-5 h-5 text-white fill-white"/>
                  </div>
                  <span className={`text-2xl font-bold tracking-tighter ${textTitleClass}`}>S.A.M.S.A</span>
              </div>
              <p className={`${textMutedClass} text-sm leading-relaxed`}>
                  Sistema de Atención Médica y Salud Argentina. <br/>
                  Innovación y compromiso con tu bienestar.
              </p>
          </div>

          <div>
              <h4 className={`font-bold mb-6 ${textTitleClass} uppercase text-xs tracking-widest`}>{isDoctor || isAdmin ? 'Accesos de Gestión' : 'Navegación'}</h4>
              <ul className={`space-y-3 ${textMutedClass} text-sm`}>
                  {isAdmin ? (
                      <>
                          <li><Link to="/admin/doctors" className="hover:text-blue-500 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3"/> Gestión Médicos</Link></li>
                          <li><Link to="/admin/patients" className="hover:text-blue-500 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3"/> Gestión Pacientes</Link></li>
                          <li><Link to="/admin/offices" className="hover:text-blue-500 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3"/> Consultorios</Link></li>
                      </>
                  ) : isDoctor ? (
                      <>
                          <li><Link to="/doctor/turns" className="hover:text-blue-500 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3"/> Turnos Asignados</Link></li>
                          <li><Link to="/doctor/patients" className="hover:text-blue-500 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3"/> Mis Pacientes</Link></li>
                          <li><Link to="/doctor/profile" className="hover:text-blue-500 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3"/> Mi Perfil Profesional</Link></li>
                          <li><Link to="/doctor/protocols" className="hover:text-blue-500 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3"/> Protocolos Médicos</Link></li>
                          <li><Link to="/doctor/support" className="hover:text-blue-500 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3"/> Soporte Técnico</Link></li>
                      </>
                  ) : (
                      <>
                          <li><Link to="/about" className="hover:text-blue-500 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3"/> Acerca de Nosotros</Link></li>
                          <li><Link to="/turns" className="hover:text-blue-500 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3"/> Turnos</Link></li>
                          <li><Link to="/professionals" className="hover:text-blue-500 transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3"/> Profesionales</Link></li>
                      </>
                  )}
              </ul>
          </div>

          <div>
              <h4 className={`font-bold mb-6 ${textTitleClass} uppercase text-xs tracking-widest`}>Contacto</h4>
              <ul className={`space-y-4 ${textMutedClass} text-sm`}>
                  <li className="flex items-center group">
                      <div className={`p-2 ${iconBgClass} rounded-lg mr-3 ${iconHoverClass} transition`}>
                          <Phone className="w-4 h-4 text-blue-500" />
                      </div>
                      0800-SAMSA-SALUD
                  </li>
                  <li className="flex items-center group">
                      <div className={`p-2 ${iconBgClass} rounded-lg mr-3 ${iconHoverClass} transition`}>
                          <Calendar className="w-4 h-4 text-blue-500" />
                      </div>
                      Lunes a Viernes 8-20hs
                  </li>
              </ul>
          </div>

          <div>
              <h4 className={`font-bold mb-6 ${textTitleClass} uppercase text-xs tracking-widest`}>Síguenos</h4>
              <div className="flex space-x-4">

                 {['fb', 'tw', 'ig'].map((social, i) => (
                     <div key={i} className={`w-10 h-10 ${iconBgClass} rounded-xl flex items-center justify-center hover:bg-blue-600 hover:-translate-y-1 transition-all cursor-pointer shadow-lg border ${isLight ? 'border-blue-50' : 'border-slate-800'}`}>
                         <div className={`w-4 h-4 ${isLight ? 'bg-blue-300' : 'bg-slate-400'} rounded-sm`}></div>
                     </div>
                 ))}
              </div>
          </div>
      </div>

      <div className={`max-w-7xl mx-auto px-4 mt-16 pt-8 border-t ${borderBottomClass} text-center ${textMutedClass} text-xs`}>
          &copy; {new Date().getFullYear()} S.A.M.S.A. Todos los derechos reservados. Desarrollado con pasión por la salud.
      </div>
    </footer>
  );
};

export default Footer;
