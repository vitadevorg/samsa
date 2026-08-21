import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Eye, EyeOff, Lock, Mail, User, Phone, MapPin, Calendar, 
  ArrowLeft, CheckCircle, AlertTriangle, XCircle, FileText, 
  Hash, CreditCard, HeartPulse, ChevronDown, ChevronRight,
  ShieldCheck, Activity, Check
} from 'lucide-react';

// --- DATOS ESTÁTICOS ---
const INSURANCES = [
  "Ninguna", "Prensa", "Subsidio de Salud", "OSDE", "Swiss Medical", 
  "Galeno", "PAMI", "IOS", "OSECAC"
];

// --- MODAL DE ÉXITO ---
const SuccessModal = ({ isOpen, onNavigate }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center text-center animate-scaleIn relative overflow-hidden border border-green-100">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-sm relative">
                    <div className="absolute inset-0 rounded-full border-4 border-green-100 animate-ping opacity-20"></div>
                    <CheckCircle className="w-12 h-12 text-green-500 stroke-[3]" />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Cuenta Creada!</h2>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed px-2">
                    Tu historia clínica digital ya está activa en S.A.M.S.A.
                </p>
                
                <button 
                    onClick={onNavigate}
                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                >
                    Ir al Login <ChevronRight className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};

// --- AVATAR MÉDICO ---
const RegistrationAvatar = ({ currentState }) => {
  const isWriting = currentState === 'writing';
  const isError = currentState === 'error';
  const isSuccess = currentState === 'success';
  const isProcessing = currentState === 'processing';

  return (
    // Contenedor más alto y con padding inferior para acomodar la carpeta
    <div className="relative w-64 h-72 flex items-end justify-center select-none pb-8">
      
      {/* Fondo Ambiental */}
      <div className="absolute inset-0 rounded-full bg-blue-50/40 overflow-hidden z-0 scale-90 blur-sm translate-y-4">
         <div className="absolute -top-[150%] -left-[150%] w-[400%] h-[400%] bg-gradient-to-br from-blue-200/40 via-transparent to-transparent animate-[spin_20s_linear_infinite] opacity-70"></div>
      </div>

      {/* Confeti */}
      {isSuccess && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-2 h-4 bg-blue-400 animate-confetti-1 rounded-sm opacity-80"></div>
            <div className="absolute top-4 right-16 w-3 h-3 bg-green-400 animate-confetti-2 rounded-full opacity-80" style={{animationDelay: '0.1s'}}></div>
            <div className="absolute bottom-20 left-4 w-2 h-2 bg-indigo-300 animate-confetti-3 rounded-sm opacity-80" style={{animationDelay: '0.2s'}}></div>
          </div>
      )}

      {/* Personaje - Posicionado más arriba dentro del contenedor */}
      <div className={`relative z-20 flex flex-col items-center transition-transform duration-300 scale-90 origin-bottom -translate-y-6 ${isError ? 'animate-shake' : ''}`}>
        
        {/* CABEZA */}
        <div className="relative w-28 h-32 bg-[#F3E5DC] rounded-[2.5rem] shadow-xl border-[3px] border-white z-30 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/3 bg-blue-500 rounded-b-xl shadow-sm border-b border-blue-600">
                <div className="absolute top-2 right-3 text-white/30"><HeartPulse className="w-5 h-5"/></div>
            </div>
            
            <div className="absolute top-11 left-0 w-full flex justify-center gap-6">
                 {/* Cejas */}
                 <div className={`absolute -top-3 w-full flex justify-center gap-6 transition-all duration-300`}>
                    <div className={`w-6 h-1.5 bg-slate-700 rounded-full transition-transform ${isError ? 'rotate-12 translate-y-1' : ''}`}></div>
                    <div className={`w-6 h-1.5 bg-slate-700 rounded-full transition-transform ${isError ? '-rotate-12 translate-y-1' : ''}`}></div>
                 </div>
                 {/* Ojos */}
                 <div className="relative w-3.5 h-3.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`absolute w-1 h-1 bg-white rounded-full top-0.5 right-0.5 transition-transform duration-200 ${isWriting ? 'translate-y-2 translate-x-0.5' : ''}`}></div>
                 </div>
                 <div className="relative w-3.5 h-3.5 bg-slate-800 rounded-full overflow-hidden">
                     <div className={`absolute w-1 h-1 bg-white rounded-full top-0.5 right-0.5 transition-transform duration-200 ${isWriting ? 'translate-y-2 translate-x-0.5' : ''}`}></div>
                 </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-[42%] bg-blue-100 border-t-2 border-white flex justify-center items-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
                <div className="w-20 h-[1px] bg-blue-200/60 mb-1.5"></div>
                <div className="w-20 h-[1px] bg-blue-200/60"></div>
            </div>
        </div>

        {/* CUERPO */}
        <div className="relative -mt-5 w-40 h-28 bg-blue-600 rounded-t-[3rem] shadow-lg z-20 flex justify-center">
             <div className="w-12 h-8 bg-[#F3E5DC] -mt-1 rounded-b-xl"></div>
             <div className="absolute top-0 w-24 h-28 border-[5px] border-slate-300 rounded-b-[3rem] z-20 pointer-events-none shadow-sm"></div>

             {/* Brazo Izquierdo */}
             <div className={`absolute top-8 -left-2 w-10 h-24 bg-blue-500 rounded-full transition-all duration-500 origin-top ${isProcessing || isWriting ? 'rotate-[15deg]' : 'rotate-0'}`}>
                <div className="absolute bottom-0 w-full h-8 bg-blue-300 rounded-full border-t-2 border-white/20"></div>
             </div>
             
             {/* Brazo Derecho */}
             <div className={`absolute top-8 -right-2 w-10 h-24 bg-blue-500 rounded-full transition-all duration-200 origin-top z-30
                ${isWriting ? 'rotate-[-15deg] translate-x-[-5px]' : 'rotate-0'}
                ${isError ? 'rotate-[-45deg] translate-y-[-5px]' : ''}
                ${isSuccess ? 'rotate-[-130deg] translate-x-[-10px] translate-y-[-5px]' : ''}
             `}>
                 <div className="absolute bottom-0 w-full h-8 bg-blue-300 rounded-full border-t-2 border-white/20"></div>
             </div>

             {/* CARPETA (El elemento que causaba el problema) */}
             <div className={`absolute top-14 w-28 h-32 bg-blue-800 rounded-lg border-l-4 border-blue-900 shadow-lg flex flex-col items-center justify-start pt-2 z-20 transition-all duration-500 transform origin-bottom
                  ${isWriting ? 'translate-y-2 scale-105 rotate-[-2deg]' : ''}
                  ${isSuccess ? 'translate-y-20 opacity-0' : ''}
             `}>
                 <div className="w-12 h-4 bg-slate-400 rounded-b-md shadow-sm mb-2"></div>
                 <div className="text-blue-300/10 font-bold text-5xl select-none">HC</div>
             </div>

             {/* Pluma Flotante */}
             <div className={`absolute top-24 right-4 w-2 h-12 bg-yellow-400 rounded-full z-40 origin-bottom transition-all duration-200 shadow-sm
                ${isWriting ? 'opacity-100 rotate-[-30deg] translate-y-4 translate-x-[-25px]' : 'opacity-0 pointer-events-none'}
             `}></div>
        </div>
      </div>

      {/* Burbuja de Error */}
      {isError && (
         <div className="absolute top-4 right-0 bg-white px-3 py-2 rounded-xl shadow-xl border border-red-100 animate-bounce z-50 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 fill-red-50"/> 
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Revisar Datos</span>
         </div>
      )}
    </div>
  );
};

// --- PÁGINA DE REGISTRO ---
const Register = () => {
  const navigate = useNavigate();
  
  // Formulario
  const [formData, setFormData] = useState({
      name: '', lastname: '', dni: '', cuil: '', dob: '',
      email: '', phone: '', insurance: '', 
      password: '', confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [avatarState, setAvatarState] = useState('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [writingTimeout, setWritingTimeout] = useState(null);

  // Estado de validación de contraseña
  const [passValidations, setPassValidations] = useState({
      length: false, uppercase: false, number: false
  });

  const checkPassword = (pass) => {
      setPassValidations({
          length: pass.length >= 8,
          uppercase: /[A-Z]/.test(pass),
          number: /\d/.test(pass)
      });
  };

  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));

      if (name === 'password') checkPassword(value);

      // Animación
      if (avatarState !== 'processing' && !showSuccess) {
          setAvatarState('writing');
          if (writingTimeout) clearTimeout(writingTimeout);
          setWritingTimeout(setTimeout(() => {
              setAvatarState('idle');
          }, 600));
      }
  };

  const validateForm = () => {
      const newErrors = {};
      if (!formData.name.trim()) newErrors.name = "Requerido";
      if (!formData.lastname.trim()) newErrors.lastname = "Requerido";
      if (!formData.dni.trim()) newErrors.dni = "Requerido";
      if (!formData.insurance) newErrors.insurance = "Seleccioná obra social";
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) newErrors.email = "Email inválido";
      
      const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passRegex.test(formData.password)) newErrors.password = "Contraseña insegura";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "No coinciden";
      
      return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (writingTimeout) clearTimeout(writingTimeout);
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        setAvatarState('error');
        setTimeout(() => setAvatarState('idle'), 2500);
        return;
    }

    setAvatarState('processing');
    setErrors({});

    // Simulación Backend
    setTimeout(() => {
        setAvatarState('success');
        setTimeout(() => {
            setShowSuccess(true);
        }, 600);
    }, 2000);
  };

  const handleLoginRedirect = () => {
      navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      <SuccessModal isOpen={showSuccess} onNavigate={handleLoginRedirect} />

      <Link to="/login" className="absolute top-6 left-6 z-50 group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition border border-white/10 shadow-lg">
         <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
         <span className="text-sm font-medium">Volver</span>
      </Link>
      
      {/* Fondo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative z-10 my-4 flex flex-col md:flex-row min-h-[650px]">
          
          {/* COLUMNA IZQUIERDA: Avatar (Visual) */}
          <div className="w-full md:w-5/12 bg-blue-50 relative flex flex-col justify-start items-center p-6 border-r border-blue-100 pt-16">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
              
              {/* Avatar: Margen inferior aumentado para empujar el texto lejos de la carpeta */}
              <div className="mb-6 z-20">
                <RegistrationAvatar currentState={avatarState} />
              </div>

              {/* Texto: Margen superior adicional para asegurar separación con la carpeta */}
              <div className="text-center z-10 relative mt-4">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Registrarme</h2>
                <p className="text-slate-500 text-sm px-4 leading-relaxed">
                    Completá tus datos para generar tu cuenta en S.A.M.S.A.
                </p>
              </div>
          </div>

          {/* COLUMNA DERECHA: Formulario */}
          <div className="w-full md:w-7/12 bg-white flex flex-col relative z-30">
             <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar h-full">
                <div className="mb-6 md:hidden text-center">
                   <h2 className="text-2xl font-bold text-slate-800">Crear Cuenta</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <input type="text" name="name" placeholder="Nombre(s)" value={formData.name} onChange={handleChange}
                            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm outline-none transition focus:bg-white ${errors.name ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-blue-500'}`} />
                      </div>
                      <div className="space-y-1">
                          <input type="text" name="lastname" placeholder="Apellido(s)" value={formData.lastname} onChange={handleChange}
                            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm outline-none transition focus:bg-white ${errors.lastname ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-blue-500'}`} />
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <input type="number" name="dni" placeholder="DNI" value={formData.dni} onChange={handleChange}
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm outline-none transition focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.dni ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-blue-500'}`} />
                      <input type="number" name="cuil" placeholder="CUIL (Opcional)" value={formData.cuil} onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition focus:bg-white focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <input type="date" name="dob" value={formData.dob} onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition text-slate-600 focus:bg-white focus:border-blue-500" />
                      <input type="tel" name="phone" placeholder="Teléfono" value={formData.phone} onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition focus:bg-white focus:border-blue-500" />
                  </div>

                  <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><ShieldCheck className="w-4 h-4"/></div>
                      <ChevronDown className="absolute top-4 right-4 h-4 w-4 text-slate-400 pointer-events-none" />
                      <select name="insurance" value={formData.insurance} onChange={handleChange} className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-xl text-sm outline-none appearance-none cursor-pointer transition focus:bg-white ${errors.insurance ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-blue-500'}`}>
                          <option value="" disabled>Seleccionar Obra Social</option>
                          {INSURANCES.map((ins, i) => <option key={i} value={ins}>{ins}</option>)}
                      </select>
                      {errors.insurance && <p className="text-red-500 text-xs mt-1 ml-1">{errors.insurance}</p>}
                  </div>

                  <div className="border-t border-slate-100 my-4"></div>
                  
                  <div className="bg-blue-50 rounded-xl p-3 mb-2 border border-blue-100">
                      <p className="text-xs font-bold text-blue-700 uppercase mb-2">Seguridad de la contraseña</p>
                      <div className="flex flex-wrap gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 transition ${passValidations.length ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-500 border-slate-200'}`}>
                              {passValidations.length ? <CheckCircle className="w-3 h-3"/> : <div className="w-3 h-3 rounded-full border border-slate-300"></div>} Mín. 8 caracteres
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 transition ${passValidations.uppercase ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-500 border-slate-200'}`}>
                              {passValidations.uppercase ? <CheckCircle className="w-3 h-3"/> : <div className="w-3 h-3 rounded-full border border-slate-300"></div>} 1 Mayúscula
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 transition ${passValidations.number ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-500 border-slate-200'}`}>
                              {passValidations.number ? <CheckCircle className="w-3 h-3"/> : <div className="w-3 h-3 rounded-full border border-slate-300"></div>} 1 Número
                          </span>
                      </div>
                  </div>

                  <div className="relative">
                      <Mail className="absolute top-3.5 left-4 h-4 w-4 text-slate-400" />
                      <input type="email" name="email" placeholder="Correo Electrónico" value={formData.email} onChange={handleChange} className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm outline-none transition focus:bg-white ${errors.email ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-blue-500'}`} />
                      {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="relative">
                        <Lock className="absolute top-3.5 left-4 h-4 w-4 text-slate-400" />
                        <input type={showPassword ? "text" : "password"} name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-xl text-sm outline-none transition focus:bg-white ${errors.password ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-blue-500'}`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-3.5 right-3 text-slate-400 hover:text-blue-600" tabIndex="-1">{showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>
                     </div>
                     <div className="relative">
                        <Lock className="absolute top-3.5 left-4 h-4 w-4 text-slate-400" />
                        <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Repetir" value={formData.confirmPassword} onChange={handleChange} className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-xl text-sm outline-none transition focus:bg-white ${errors.confirmPassword ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 focus:border-blue-500'}`} />
                         <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute top-3.5 right-3 text-slate-400 hover:text-blue-600" tabIndex="-1">{showConfirmPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>
                     </div>
                  </div>
                  {(errors.password || errors.confirmPassword) && (<div className="bg-red-50 border border-red-100 text-red-600 text-xs p-2 rounded-lg flex gap-2 items-start"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0"/><p>{errors.password || errors.confirmPassword}</p></div>)}

                  <button type="submit" disabled={avatarState === 'processing' || avatarState === 'success'} className={`w-full flex items-center justify-center py-4 px-4 rounded-xl text-white font-bold text-sm shadow-lg transition-all transform duration-200 mt-6 ${avatarState === 'success' ? 'bg-green-500 hover:bg-green-600 scale-105' : avatarState === 'error' ? 'bg-red-500 hover:bg-red-600 shake' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 shadow-blue-500/30'} disabled:opacity-70 disabled:cursor-not-allowed`}>
                    {avatarState === 'processing' ? (<span className="flex items-center gap-2"><Activity className="w-4 h-4 animate-spin"/> Procesando...</span>) : avatarState === 'success' ? (<span className="flex items-center gap-2"><CheckCircle className="w-4 h-4"/> ¡Registro Exitoso!</span>) : (<span className="flex items-center gap-2">Crear Cuenta <ChevronRight className="w-4 h-4"/></span>)}
                  </button>
                </form>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Register;