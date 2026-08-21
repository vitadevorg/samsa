import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Check, X, ArrowLeft, ShieldAlert } from 'lucide-react';

const customStyles = `
  @keyframes scan {
    0%, 100% { top: 10%; opacity: 0; }
    10%, 90% { opacity: 1; }
    50% { top: 90%; }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  @keyframes heartbeat {
    0% { transform: scale(1); }
    14% { transform: scale(1.1); }
    28% { transform: scale(1); }
    42% { transform: scale(1.1); }
    70% { transform: scale(1); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

const RecoveryAnimation = ({ currentState }) => {
  return (
    <div className="relative w-48 h-48 mx-auto mb-8 transition-all duration-500 ease-out flex items-center justify-center">
      <style>{customStyles}</style>

      <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-1000 z-0
        ${currentState === 'processing' ? 'bg-blue-400/40 animate-pulse' : 
          currentState === 'success' ? 'bg-green-400/50 scale-125' : 
          currentState === 'error' ? 'bg-red-400/40' : 'bg-slate-200/60'}`}
      ></div>

      <div className={`relative z-10 w-full h-full flex items-center justify-center transition-transform duration-500
        ${currentState === 'error' ? 'animate-[shake_0.4s_ease-in-out]' : ''}
        ${currentState === 'idle' || currentState === 'inspecting' ? 'animate-[float_4s_ease-in-out_infinite]' : ''}`}
      >

        <div className={`absolute transition-all duration-700 
          ${currentState === 'success' ? 'scale-0 opacity-0 rotate-180' : 'scale-100 opacity-100 rotate-0'}`}>
          <div className="relative w-32 h-32 bg-white rounded-3xl shadow-xl border-4 border-slate-50 flex items-center justify-center overflow-hidden">

            {currentState === 'inspecting' && (
              <div className="absolute w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-20 animate-[scan_2s_ease-in-out_infinite]"></div>
            )}

            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-t-full border-4 border-b-0 transition-colors duration-300
                ${currentState === 'error' ? 'border-red-400' : 'border-blue-300'}`}></div>
              <div className={`w-14 h-12 rounded-lg flex items-center justify-center transition-colors duration-300 shadow-inner
                ${currentState === 'error' ? 'bg-red-500' : 
                  currentState === 'processing' ? 'bg-blue-500' : 'bg-slate-100'}`}>

                {currentState === 'processing' ? (
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                ) : currentState === 'error' ? (
                  <X className="w-6 h-6 text-white stroke-[3]" />
                ) : (

                  <div className="relative w-6 h-6 text-blue-400">
                    <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-current -translate-y-1/2 rounded-full"></div>
                    <div className="absolute left-1/2 top-0 bottom-0 w-1.5 bg-current -translate-x-1/2 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`absolute transition-all duration-700 
          ${currentState === 'success' ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 -rotate-180'}`}>
          <div className="relative w-32 h-32 bg-green-50 rounded-full shadow-2xl border-4 border-green-100 flex items-center justify-center animate-[heartbeat_2s_ease-in-out_infinite]">
            <Check className="w-16 h-16 text-green-500 stroke-[3]" />

            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-300 rounded-full animate-ping"></div>
            <div className="absolute bottom-2 -left-2 w-3 h-3 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

      </div>
    </div>
  );
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [animState, setAnimState] = useState('idle'); 
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailFocus = () => {
    if (animState !== 'success' && animState !== 'processing') {
      setAnimState('inspecting');
    }
  };

  const handleEmailBlur = () => {
    if (animState === 'inspecting') {
      setAnimState('idle');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setAnimState('error');
      setErrorMessage('Por favor, ingresá tu correo electrónico.');
      setTimeout(() => setAnimState('idle'), 2000);
      return;
    }

    setAnimState('processing');
    setErrorMessage('');

    setTimeout(() => {
      if (email.includes('@')) {
        setAnimState('success');
      } else {
        setAnimState('error');
        setErrorMessage('El formato del correo es inválido.');
        setTimeout(() => setAnimState('idle'), 3000);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">

      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative z-10 bg-white shadow-[10px_0_30px_rgba(0,0,0,0.03)]">

        <div className="absolute top-8 left-8 sm:left-16 lg:left-24">
          <Link to="/login" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Volver
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto mt-16 md:mt-0">
          <div className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-4">
              <ShieldAlert className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mb-3">Recuperar Acceso</h1>
            <p className="text-slate-500 font-medium">Ingresá tu correo asociado a la cuenta y te enviaremos un enlace seguro para restablecer tu contraseña.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {animState === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center animate-fadeIn">
                <h3 className="text-xl font-bold text-green-800 mb-2">¡Correo enviado!</h3>
                <p className="text-green-600 font-medium mb-6">Revisá tu bandeja de entrada (y la carpeta de spam). Te enviamos las instrucciones a <strong>{email}</strong>.</p>
                <Link to="/login" className="inline-flex w-full justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all">
                  Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              <>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 transition-colors ${animState === 'inspecting' ? 'text-blue-500' : 'text-slate-400'}`} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={handleEmailFocus}
                    onBlur={handleEmailBlur}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                    placeholder="correo@ejemplo.com"
                    disabled={animState === 'processing'}
                  />
                </div>

                {errorMessage && (
                  <p className="text-red-500 text-sm font-bold flex items-center gap-2 animate-fadeIn">
                    <X className="w-4 h-4" /> {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={animState === 'processing'}
                  className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-blue-500/30 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {animState === 'processing' ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Verificando...
                    </span>
                  ) : (
                    'Enviar enlace de recuperación'
                  )}
                </button>
              </>
            )}

          </form>
        </div>
      </div>

      <div className="hidden md:flex md:w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">

        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 -left-1/4 w-full h-full bg-gradient-to-br from-blue-500 to-transparent rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 -right-1/4 w-full h-full bg-gradient-to-tl from-emerald-500 to-transparent rounded-full blur-[100px]"></div>
        </div>

        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <div className="relative z-10 w-full max-w-md px-8 flex flex-col items-center">

          <RecoveryAnimation currentState={animState} />

          <div className="text-center mt-8">
            <h2 className="text-2xl font-black text-white tracking-tight mb-3">
              Sistema de Seguridad SAMSA
            </h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              Tus datos de salud están protegidos con encriptación clínica avanzada. Nunca compartas tus credenciales con terceros.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ForgotPassword;
