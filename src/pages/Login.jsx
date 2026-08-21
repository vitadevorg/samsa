import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, Check, X, Activity, ChevronRight, ArrowLeft, AlertTriangle } from 'lucide-react';

// --- ESTILOS DE ANIMACIÓN PERSONALIZADOS ---
const customStyles = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  @keyframes headNo {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-10deg); }
    75% { transform: rotate(10deg); }
  }
  .animate-shake { animation: shake 0.4s ease-in-out; }
  .animate-head-no { animation: headNo 0.4s ease-in-out infinite; }
`;

// --- COMPONENTE AVATAR MÉDICO (CSS PURO AVANZADO) ---
const MedicalAvatar = ({ currentState }) => {
  // Estados: 'idle', 'inspecting' (email), 'peeking' (password), 'processing', 'success', 'error'
  
  return (
    <div className="relative w-40 h-40 mx-auto mb-6 transition-all duration-500 ease-out transform select-none z-20">
      <style>{customStyles}</style>
      
      {/* 0. FONDO QUIRÓFANO (Luz Giratoria) */}
      <div className="absolute inset-0 rounded-full bg-blue-50/50 overflow-hidden z-0">
         <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-white/80 via-transparent to-transparent animate-[spin_10s_linear_infinite] opacity-50 blur-xl"></div>
      </div>

      {/* 1. CABEZA */}
      <div className={`relative z-20 w-32 h-32 mx-auto bg-[#F3E5DC] rounded-[2.5rem] shadow-2xl border-4 border-white transition-transform duration-300 ${currentState === 'error' ? 'animate-shake' : ''}`}>
        
        {/* COFIA (Gorro) */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-blue-500 rounded-t-[2rem] overflow-hidden border-b-4 border-blue-600 z-10">
           <div className="w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
        </div>

        {/* LINTERNA FRONTAL (Estado: Inspecting/Email) */}
        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-800 rounded-full shadow-lg transition-all duration-300 z-30 flex items-center justify-center border-2 border-gray-600 ${currentState === 'inspecting' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="w-4 h-4 bg-yellow-300 rounded-full animate-pulse shadow-[0_0_15px_rgba(253,224,71,1)]"></div>
            {/* Haz de luz */}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 w-32 h-48 bg-gradient-to-b from-yellow-400/40 to-transparent transform -translate-y-2 origin-top transition-all duration-300 pointer-events-none ${currentState === 'inspecting' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
        </div>

        {/* OJOS */}
        <div className="absolute top-14 left-0 w-full flex justify-center gap-6 transition-all duration-300 z-10">
            {/* Ojo Izq */}
            <div className={`w-3 h-3 bg-slate-800 rounded-full transition-all duration-200 
                ${currentState === 'processing' ? 'scale-x-110 translate-y-1' : ''} 
                ${currentState === 'success' ? 'scale-y-50 -rotate-6' : ''}
                ${currentState === 'error' ? 'scale-110' : ''}
            `}></div>
            {/* Ojo Der */}
            <div className={`w-3 h-3 bg-slate-800 rounded-full transition-all duration-200 
                ${currentState === 'processing' ? 'scale-x-110 translate-y-1' : ''} 
                ${currentState === 'success' ? 'scale-y-50 rotate-6' : ''}
                ${currentState === 'error' ? 'scale-110' : ''}
            `}></div>
        </div>

        {/* RUBOR (Estado: Peeking/Password) */}
        <div className={`absolute top-16 left-0 w-full flex justify-between px-6 transition-opacity duration-500 z-10 ${currentState === 'peeking' ? 'opacity-60' : 'opacity-0'}`}>
            <div className="w-4 h-2 bg-red-400 rounded-full blur-md"></div>
            <div className="w-4 h-2 bg-red-400 rounded-full blur-md"></div>
        </div>

        {/* BARBIJO (Mascara) */}
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-14 bg-blue-100 rounded-b-[2rem] border-t-2 border-white shadow-inner transition-transform duration-500 z-10 flex flex-col justify-center items-center ${currentState === 'error' ? 'translate-y-6 rotate-12' : 'translate-y-0'}`}>
             <div className="w-20 h-[1px] bg-blue-200/60 mb-1"></div>
             <div className="w-20 h-[1px] bg-blue-200/60 mb-1"></div>
             <div className="w-20 h-[1px] bg-blue-200/60"></div>
        </div>

        {/* MANOS Y BRAZOS */}
        <div className={`absolute top-0 left-0 w-full h-full pointer-events-none transition-all duration-300 z-40`}>
            
            {/* Manos tapando ojos (Peeking) */}
            <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-full flex justify-center gap-0.5 transition-transform duration-300 ${currentState === 'peeking' ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                 <div className="w-12 h-12 bg-blue-400 rounded-full shadow-md border-2 border-white transform -rotate-12 origin-bottom-left"></div>
                 <div className="w-12 h-12 bg-blue-400 rounded-full shadow-md border-2 border-white transform rotate-12 origin-bottom-right"></div>
            </div>
            
            {/* Tablet y Mano (Processing) */}
             <div className={`absolute bottom-[-20px] right-[-20px] transition-all duration-500 ${currentState === 'processing' ? 'translate-y-0 opacity-100 rotate-0' : 'translate-y-10 opacity-0 rotate-45'}`}>
                 <div className="w-20 h-24 bg-slate-800 rounded-lg border-2 border-slate-600 shadow-xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-1 left-1 right-1 h-4 bg-slate-700 rounded-sm"></div>
                    <div className="absolute top-6 left-2 right-2 bottom-2 bg-blue-500/20 rounded animate-pulse"></div>
                    {/* Mano sosteniendo */}
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-400 rounded-full border-2 border-white"></div>
                 </div>
            </div>
        </div>

        {/* ACCESORIOS FINALES (Success/Error) */}
        
        {/* Estetoscopio y Gesto "Listo" (Success) */}
        <div className={`absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-40 border-[6px] border-slate-700 rounded-full transition-all duration-500 pointer-events-none z-0 ${currentState === 'success' ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}></div>
        <div className={`absolute -bottom-2 right-[-10px] w-12 h-12 bg-blue-400 rounded-full border-4 border-white shadow-lg z-50 flex items-center justify-center transition-all duration-500 delay-200 ${currentState === 'success' ? 'opacity-100 scale-100 rotate-12' : 'opacity-0 scale-0'}`}>
            <span className="text-xl">👍</span>
        </div>

        {/* Cruz Roja Flotante (Error) */}
        <div className={`absolute -top-8 right-0 bg-white rounded-full p-1.5 shadow-lg border-2 border-red-100 transition-all duration-300 z-50 ${currentState === 'error' ? 'scale-100 opacity-100 animate-bounce' : 'scale-0 opacity-0'}`}>
            <X className="w-8 h-8 text-red-500 stroke-[4]" />
        </div>

      </div>

      {/* 3. MONITOR ECG (Inferior) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-20 overflow-hidden flex items-end justify-center opacity-90 z-0">
         {currentState === 'success' && (
             <svg viewBox="0 0 500 100" className="w-full h-full text-green-500 animate-ecgMove filter drop-shadow-[0_0_5px_rgba(34,197,94,0.6)]">
                 <polyline fill="none" stroke="currentColor" strokeWidth="4" points="0,50 100,50 120,20 140,80 160,50 200,50 220,20 240,80 260,50 300,50 320,20 340,80 360,50 500,50" />
             </svg>
         )}
         {currentState === 'error' && (
             <svg viewBox="0 0 500 100" className="w-full h-full text-red-500 animate-pulse">
                 <line x1="0" y1="50" x2="500" y2="50" stroke="currentColor" strokeWidth="3" />
                 <path d="M 150 20 L 350 80 M 350 20 L 150 80" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3"/>
             </svg>
         )}
         {currentState === 'processing' && (
             <div className="flex gap-1.5 mb-4">
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce delay-0"></div>
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce delay-200"></div>
             </div>
         )}
      </div>
    </div>
  );
};

// --- LÓGICA PRINCIPAL ---
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados de error de formulario
  const [errors, setErrors] = useState({ email: false, password: false });
  const [errorMsg, setErrorMsg] = useState('');

  // Estados de animación
  const [loginState, setLoginState] = useState('idle'); 
  const [activeField, setActiveField] = useState(null);

  // Efecto de coordinación de animaciones
  useEffect(() => {
      if (['processing', 'success', 'error'].includes(loginState)) return;

      if (showPassword || activeField === 'password') {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setLoginState('peeking');
      } else if (activeField === 'email') {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setLoginState('inspecting');
      } else {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setLoginState('idle');
      }
  }, [showPassword, activeField, loginState]);

  // Manejo de inputs con limpieza de errores
  const handleEmailChange = (e) => {
      setEmail(e.target.value);
      if (errors.email) setErrors(prev => ({ ...prev, email: false }));
  };

  const handlePasswordChange = (e) => {
      setPassword(e.target.value);
      if (errors.password) setErrors(prev => ({ ...prev, password: false }));
  };

  const validateForm = () => {
      let hasError = false;
      const newErrors = { email: false, password: false };

      if (!email.trim()) {
          newErrors.email = true;
          hasError = true;
      }
      if (!password.trim()) {
          newErrors.password = true;
          hasError = true;
      }

      setErrors(newErrors);
      return !hasError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Validación Local
    if (!validateForm()) {
        setLoginState('error');
        setErrorMsg('Por favor, completá todos los campos.');
        setTimeout(() => setLoginState('idle'), 2000);
        return;
    }
    
    // 2. Estado: Procesando
    setLoginState('processing');

    // Simulamos tiempo de carga de red
    setTimeout(() => {
        
        let success = false;
        let roleData = null;

        // --- LÓGICA DE ACCESO ---
        if (email === 'lglucasgabriel@gmail.com' && password === 'batman') {
             success = true;
             roleData = { 
                name: 'Lucas Gabriel', 
                lastname: 'Lazarte',
                email: email, 
                role: 'patient',
                dni: '45275212',
                phone: '3863409588',
                location: 'Villa Quinteros',
                img: 'https://placehold.co/100x100/3B82F6/FFFFFF?text=LL',
                dob: '11/05/2004'
            };
        }
        else if (email === 'jesus.zelarayan@samsa.med' && password === '12345') {
            success = true;
            roleData = { 
                name: 'Jesús Zelarayan', 
                email: email, 
                role: 'doctor',
                img: '/img/UTN-Jesus.jpg'
            };
        } 
        else if (email === 'admin@samsa.med' && password === 'admin') {
             success = true;
             roleData = { name: 'Administrador', email: email, role: 'admin' };
        }
        else if (email === 'secretaria@samsa.med' && password === '12345') {
            success = true;
            roleData = { 
                name: 'María González', 
                email: email, 
                role: 'secretary',
                img: 'https://placehold.co/100x100/ec4899/FFFFFF?text=MG'
            };
        }

        // --- RESULTADO ---
        if (success) {
            setLoginState('success');
            setTimeout(() => {
                login(roleData);
                if(roleData.role === 'admin') navigate('/admin/doctors');
                else if(roleData.role === 'doctor') navigate('/doctor/turns');
                else navigate('/');
            }, 800);
            
        } else {
            // Credenciales Incorrectas
            setLoginState('error');
            setErrorMsg('Credenciales incorrectas. Intentalo de nuevo.');
            setErrors({ email: true, password: true });
            
            setTimeout(() => {
                setLoginState('idle');
                setPassword(''); 
            }, 2500);
        }

    }, 2000); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      <Link to="/" className="absolute top-8 left-8 text-white/70 hover:text-white flex items-center gap-2 font-medium transition-colors z-50">
         <ArrowLeft className="w-5 h-5" /> Volver al inicio
      </Link>
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative z-10">
          
          <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>

          <div className="p-8 pt-10">
            
            {/* AVATAR */}
            <MedicalAvatar currentState={loginState} />

            <div className="text-center mb-8 mt-4 relative z-30">
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Bienvenido</h2>
              <p className="text-slate-500 text-sm mt-2">Ingresá tus credenciales para acceder a S.A.M.S.A</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-30" noValidate>
              
              {/* EMAIL */}
              <div className="group">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ml-1 transition-colors ${errors.email ? 'text-red-500' : 'text-slate-400'}`}>
                    Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                  </div>
                  <input
                    type="email"
                    className={`block w-full pl-11 pr-4 py-3.5 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                        errors.email 
                        ? 'bg-red-50 border-red-500 focus:ring-2 focus:ring-red-200 animate-shake' 
                        : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                    placeholder="nombre@ejemplo.com"
                    value={email}
                    onChange={handleEmailChange}
                    onFocus={() => setActiveField('email')}
                    onBlur={() => setActiveField(null)}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="group">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ml-1 transition-colors ${errors.password ? 'text-red-500' : 'text-slate-400'}`}>
                    Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 transition-colors ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`block w-full pl-11 pr-12 py-3.5 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                        errors.password 
                        ? 'bg-red-50 border-red-500 focus:ring-2 focus:ring-red-200 animate-shake' 
                        : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    onFocus={() => setActiveField('password')}
                    onBlur={() => setActiveField(null)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* MENSAJE ERROR GENERAL */}
              {errorMsg && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-bounce">
                      <AlertTriangle className="w-4 h-4 shrink-0"/>
                      <span>{errorMsg}</span>
                  </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer group">
                    <div className="relative">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="w-4 h-4 border-2 border-slate-300 rounded bg-white peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all"></div>
                        <Check className="absolute top-0.5 left-0.5 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-slate-500 group-hover:text-slate-700 transition-colors">Recordarme</span>
                </label>
                <a href="#" className="font-bold text-blue-600 hover:text-blue-500 transition-colors hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                disabled={loginState === 'processing' || loginState === 'success'}
                className={`w-full flex items-center justify-center py-4 px-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform duration-200 ${
                    loginState === 'success' ? 'bg-green-500 hover:bg-green-600 scale-105' :
                    loginState === 'error' ? 'bg-red-500 hover:bg-red-600 shake' :
                    'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-blue-500/30'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {loginState === 'processing' ? (
                    <span className="flex items-center gap-2"><Activity className="w-5 h-5 animate-spin"/> Diagnosticando...</span>
                ) : loginState === 'success' ? (
                    <span className="flex items-center gap-2"><Check className="w-6 h-6"/> ¡Acceso Correcto!</span>
                ) : (
                    <span className="flex items-center gap-2">Iniciar Sesión <ChevronRight className="w-5 h-5"/></span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center relative z-30">
              <p className="text-slate-500 text-sm">
                ¿No tenés una cuenta?{' '}
                <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-colors hover:underline">
                  Registrarme
                </Link>
              </p>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Login;