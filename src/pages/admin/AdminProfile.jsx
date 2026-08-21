import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Key, Shield, Trash2, Save, X, AlertTriangle, 
  Lock, CheckCircle, LogOut 
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

// Componente InputField (Reutilizado para consistencia)
const InputField = ({ label, name, type = "text", icon: Icon, value, onChange, disabled, required = false, themeColor = "slate" }) => (
  <div className="space-y-1">
    <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
      <Icon className={`w-4 h-4 text-${themeColor}-500`} /> {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all duration-200 ${
        disabled 
          ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed' 
          : `bg-white border-gray-300 focus:border-${themeColor}-500 focus:ring-${themeColor}-100 text-gray-800 shadow-sm`
      }`}
    />
  </div>
);

const AdminProfile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || 'Administrador',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // --- MANEJADORES ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser({
      name: formData.name,
      email: formData.email
    });
    setIsEditing(false);
    setShowSuccessModal(true);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert("Las nuevas contraseñas no coinciden.");
      return;
    }
    console.log("Contraseña de admin actualizada...");
    setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsChangingPassword(false);
    setShowSuccessModal(true);
  };

  const handleDeleteAccount = () => {
    console.log("Cuenta de ADMIN eliminada:", user.uid); // user.uid si existe o user.id
    logout();
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return <div className="p-10 text-center">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      <Navbar />

      {/* Modal Éxito (Simple) */}
      {showSuccessModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center shadow-2xl animate-slideUp max-w-sm w-full mx-4">
                <CheckCircle className="w-12 h-12 text-green-500 mb-3"/>
                <h3 className="text-lg font-bold mb-1">Cambios Guardados</h3>
                <p className="text-gray-500 text-sm text-center mb-4">Los datos del administrador han sido actualizados.</p>
                <button onClick={() => setShowSuccessModal(false)} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-700 transition w-full">Aceptar</button>
            </div>
         </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-12">
        
        {/* ENCABEZADO DE ADMIN */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-800 p-8 text-white shadow-xl mb-8">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <Shield className="w-64 h-64" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-28 h-28 rounded-full bg-slate-700 border-4 border-slate-600 flex items-center justify-center shadow-inner">
               <span className="text-4xl font-bold text-slate-400">{user.name?.charAt(0)}</span>
            </div>
            
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600 text-xs font-bold uppercase tracking-wider mb-2">
                <Shield className="w-3 h-3 text-emerald-400" /> Super Usuario
              </div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-slate-400 mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA PRINCIPAL: DATOS DE CUENTA */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                     <User className="w-5 h-5 text-slate-600"/> Credenciales de Acceso
                  </h2>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="text-blue-600 text-sm font-bold hover:underline">Editar</button>
                  ) : (
                    <div className="flex gap-2">
                       <button onClick={() => setIsEditing(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                       <button onClick={handleSaveProfile} className="p-1 text-green-600 hover:text-green-700"><Save className="w-5 h-5"/></button>
                    </div>
                  )}
               </div>

               <div className="space-y-4">
                  <InputField label="Nombre de Identificación" name="name" icon={User} value={formData.name} onChange={handleInputChange} disabled={!isEditing} required />
                  <InputField label="Correo Electrónico" name="email" type="email" icon={Mail} value={formData.email} onChange={handleInputChange} disabled={!isEditing} required />
               </div>
               {isEditing && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>}
            </section>

            {/* SEGURIDAD */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
               <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <Lock className="w-5 h-5 text-slate-600"/> Seguridad
               </h2>
               
               {!isChangingPassword ? (
                  <button 
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4"/> Cambiar Contraseña
                  </button>
               ) : (
                  <form onSubmit={handleSavePassword} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                     <InputField label="Contraseña Actual" name="currentPassword" type="password" icon={Key} value={formData.currentPassword} onChange={handleInputChange} disabled={false} required />
                     <div className="pt-2 border-t border-slate-200">
                        <InputField label="Nueva Contraseña" name="newPassword" type="password" icon={Key} value={formData.newPassword} onChange={handleInputChange} disabled={false} required />
                        <div className="mt-2">
                            <InputField label="Confirmar Nueva" name="confirmPassword" type="password" icon={Key} value={formData.confirmPassword} onChange={handleInputChange} disabled={false} required />
                        </div>
                     </div>
                     <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsChangingPassword(false)} className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg text-sm">Cancelar</button>
                        <button type="submit" className="flex-1 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 text-sm shadow-md">Actualizar Clave</button>
                     </div>
                  </form>
               )}
            </section>
          </div>

          {/* COLUMNA LATERAL: ACCIONES */}
          <div className="space-y-6">
            
             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Acciones de Sesión</h3>
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                    <LogOut className="w-4 h-4"/> Cerrar Sesión
                </button>
             </div>

            <div className="bg-red-50 rounded-2xl shadow-sm border border-red-100 p-6">
              <h2 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4"/> Zona de Peligro
              </h2>
              <p className="text-xs text-red-600/80 mb-4">
                Eliminar tu cuenta de administrador puede bloquear el acceso al panel de gestión.
              </p>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4"/> Eliminar Cuenta
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* MODAL CONFIRMACIÓN ELIMINAR */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle className="w-6 h-6 text-red-600"/>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">¿Eliminar acceso Admin?</h3>
            <p className="text-gray-500 text-center mb-6 text-sm">
               Esta acción es irreversible y perderás todos los privilegios de gestión sobre S.A.M.S.A.
            </p>
            <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleDeleteAccount} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors">
                   Sí, Eliminar
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;