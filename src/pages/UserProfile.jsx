import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, MapPin, Mail, Key, CreditCard, FileText, 
  Camera, Trash2, Save, X, AlertTriangle, Shield, 
  Stethoscope, HeartPulse, Calendar, LogOut, CheckCircle, Phone
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

// --- DATOS ESTÁTICOS ---
const INSURANCES = [
  "Ninguna", "Prensa", "Subsidio de Salud", "OSDE", "Swiss Medical", 
  "Galeno", "PAMI", "IOS", "OSECAC"
];

// Componente InputField extraído
const InputField = ({ label, name, type = "text", icon: Icon, value, onChange, disabled, required = false, themeColor }) => (
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

const UserProfile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showRelievedToast, setShowRelievedToast] = useState(false);
  const [showGoodbyeToast, setShowGoodbyeToast] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    lastname: user?.lastname || '', 
    email: user?.email || '',
    location: user?.location || '',
    dob: user?.dob || '',
    phone: user?.phone || '',
    dni: user?.dni || '',
    cuil: user?.cuil || '',
    insurance: user?.insurance || 'Ninguna', // Campo Obra Social
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [previewImg, setPreviewImg] = useState(user?.img || null);

  const roleTheme = {
    admin: { color: 'slate', icon: Shield, label: 'Administrador' },
    doctor: { color: 'indigo', icon: Stethoscope, label: 'Profesional de Salud' },
    patient: { color: 'blue', icon: HeartPulse, label: 'Paciente' }
  };
  const currentTheme = roleTheme[user?.role] || roleTheme.patient;
  const ThemeIcon = currentTheme.icon;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImg(reader.result);
        updateUser({ img: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleDeleteImage = () => {
    setPreviewImg(null);
    updateUser({ img: null });
  };

  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    updateUser({
      name: formData.name,
      lastname: formData.lastname,
      email: formData.email,
      location: formData.location,
      dob: formData.dob,
      phone: formData.phone,
      dni: formData.dni,
      cuil: formData.cuil,
      insurance: formData.insurance
    });
    setIsEditing(false);
    setShowSaveModal(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError("Las nuevas contraseñas no coinciden.");
      return;
    }
    if (formData.newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setPasswordError('');
    setShowPasswordModal(true);
  };

  const confirmPasswordChange = () => {
    console.log("Cambiando contraseña...");
    setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsChangingPassword(false);
    setShowPasswordModal(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setShowRelievedToast(true);
    setTimeout(() => setShowRelievedToast(false), 4000);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    setShowGoodbyeToast(true);
    setTimeout(() => {
      console.log("Cuenta eliminada permanentemente:", user.id);
      logout();
      navigate('/');
    }, 4000);
  };

  const handleLogout = () => {
      logout();
      navigate('/');
  };

  if (!user) return <div className="p-10 text-center">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r from-${currentTheme.color}-600 to-${currentTheme.color}-800 p-8 text-white shadow-lg mb-8`}>
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
            <ThemeIcon className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/30 shadow-xl overflow-hidden bg-white flex items-center justify-center relative z-20">
                {previewImg ? (
                  <img src={previewImg} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className={`w-20 h-20 text-${currentTheme.color}-300`} />
                )}
              </div>
              
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-30">
                <button onClick={triggerFileInput} className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 hover:scale-110 transition" title="Subir foto">
                  <Camera className="w-5 h-5" />
                </button>
                {previewImg && (
                  <button onClick={handleDeleteImage} className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 hover:scale-110 transition" title="Eliminar foto">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider bg-${currentTheme.color}-200/20 rounded-full flex items-center gap-1`}>
                  <ThemeIcon className="w-3 h-3" /> {currentTheme.label}
                </span>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <Calendar className="w-3 h-3"/> Miembro desde 2023
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{user.name} {user.lastname}</h1>
              <p className="text-lg text-white/80 font-medium mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                   <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                     <FileText className={`w-5 h-5 text-${currentTheme.color}-600`}/> Informacion Personal
                   </h2>
                   <p className="text-sm text-gray-500 mt-1">Gestiona tus datos básicos de identificación.</p>
                </div>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className={`flex items-center gap-2 px-5 py-2.5 bg-${currentTheme.color}-50 text-${currentTheme.color}-700 rounded-xl hover:bg-${currentTheme.color}-100 font-semibold transition-colors`}>
                    Editar Datos
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-semibold transition-colors">
                      <X className="w-4 h-4"/> Cancelar
                    </button>
                    <button type="button" onClick={() => setShowSaveModal(true)} className={`flex items-center gap-2 px-5 py-2.5 bg-${currentTheme.color}-600 text-white rounded-xl hover:bg-${currentTheme.color}-700 font-bold transition-colors shadow-md hover:shadow-lg`}>
                      <Save className="w-4 h-4"/> Guardar
                    </button>
                  </div>
                )}
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                  label="Nombre(s)" 
                  name="name" 
                  icon={User} 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  required 
                  themeColor={currentTheme.color}
                />
                <InputField 
                  label="Apellido(s)" 
                  name="lastname" 
                  icon={User} 
                  value={formData.lastname} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  required 
                  themeColor={currentTheme.color}
                />
                <InputField 
                  label="Localidad" 
                  name="location" 
                  icon={MapPin} 
                  value={formData.location} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  themeColor={currentTheme.color}
                />
                <InputField 
                  label="Correo" 
                  name="email" 
                  type="email" 
                  icon={Mail} 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  required 
                  themeColor={currentTheme.color}
                />
                <InputField 
                  label="Fecha de Nacimiento" 
                  name="dob" 
                  type="date"
                  icon={Calendar} 
                  value={formData.dob} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  themeColor={currentTheme.color}
                />
                <InputField 
                  label="Teléfono" 
                  name="phone" 
                  type="tel"
                  icon={Phone} 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  themeColor={currentTheme.color}
                />
                <InputField 
                  label="DNI" 
                  name="dni" 
                  icon={CreditCard} 
                  value={formData.dni} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  themeColor={currentTheme.color}
                />
                <InputField 
                  label="CUIL" 
                  name="cuil" 
                  icon={FileText} 
                  value={formData.cuil} 
                  onChange={handleInputChange} 
                  disabled={!isEditing} 
                  themeColor={currentTheme.color}
                />

                {/* Selector de Obra Social */}
                <div className="space-y-1 col-span-1 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                      <HeartPulse className={`w-4 h-4 text-${currentTheme.color}-500`} /> Obra Social
                    </label>
                    <select
                      name="insurance"
                      value={formData.insurance}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:outline-none transition-all duration-200 appearance-none cursor-pointer ${
                        !isEditing 
                          ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed' 
                          : `bg-white border-gray-300 focus:border-${currentTheme.color}-500 focus:ring-${currentTheme.color}-100 text-gray-800 shadow-sm`
                      }`}
                    >
                      {INSURANCES.map((ins) => (
                        <option key={ins} value={ins}>{ins}</option>
                      ))}
                    </select>
                </div>

              </form>
              
              {isEditing && (
                 <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-400 animate-pulse"></div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
               <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                 <Key className={`w-5 h-5 text-${currentTheme.color}-600`}/> Seguridad
               </h2>
               
               {!isChangingPassword ? (
                  <div className="text-center py-4">
                     <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-gray-400"/>
                     </div>
                     <p className="text-gray-600 mb-4 font-medium">La contraseña se ocultó por seguridad.</p>
                     <button onClick={() => setIsChangingPassword(true)} className={`w-full py-3 border-2 border-${currentTheme.color}-600 text-${currentTheme.color}-700 font-bold rounded-xl hover:bg-${currentTheme.color}-50 transition-colors`}>
                        Cambiar Contraseña
                     </button>
                  </div>
               ) : (
                  <form onSubmit={handleSavePassword} className="space-y-5">
                     <InputField 
                       label="Actual" 
                       name="currentPassword" 
                       type="password" 
                       icon={Key} 
                       value={formData.currentPassword} 
                       onChange={handleInputChange}
                       disabled={false} 
                       required 
                       themeColor={currentTheme.color}
                     />
                     <div className="border-t border-gray-100 my-4 pt-4">
                        <InputField 
                          label="Nueva" 
                          name="newPassword" 
                          type="password" 
                          icon={Key} 
                          value={formData.newPassword} 
                          onChange={handleInputChange}
                          disabled={false} 
                          required 
                          themeColor={currentTheme.color}
                        />
                        <InputField 
                          label="Confirmar" 
                          name="confirmPassword" 
                          type="password" 
                          icon={Key} 
                          value={formData.confirmPassword} 
                          onChange={handleInputChange}
                          disabled={false} 
                          required 
                          themeColor={currentTheme.color}
                        />
                        {passwordError && (
                          <p className="text-red-500 text-sm font-semibold mt-2">{passwordError}</p>
                        )}
                     </div>
                     <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => { setIsChangingPassword(false); setPasswordError(''); }} className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Cancelar</button>
                        <button type="submit" className={`flex-1 py-2.5 bg-${currentTheme.color}-600 text-white font-bold rounded-xl hover:bg-${currentTheme.color}-700 shadow-md`}>Actualizar</button>
                     </div>
                  </form>
               )}
            </section>

            <section className="bg-red-50 rounded-3xl shadow-sm border border-red-100 p-6 md:p-8">
              <h2 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5"/> Zona de Peligro
              </h2>
              <p className="text-sm text-red-600/80 mb-4 leading-relaxed">
                Estas acciones son irreversibles. Ten cuidado.
              </p>
              <button onClick={() => setShowDeleteModal(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors">
                <Trash2 className="w-4 h-4"/> Eliminar Cuenta
              </button>
            </section>

            <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm"
            >
                <LogOut className="w-4 h-4"/> Cerrar Sesión
            </button>

          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <button onClick={() => setShowDeleteModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="text-5xl" role="img" aria-label="sad face">😢</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">¿De verdad te vas?</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Lamentamos mucho que quieras irte de S.A.M.S.A. Si eliminas tu cuenta, <strong className="text-red-600">perderás acceso a todo de forma permanente.</strong>
              </p>

              <div className="flex flex-col gap-3">
                 <button onClick={handleDeleteAccount} className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all transform active:scale-95">
                    Sí, eliminar mi cuenta permanentemente
                 </button>
                <button onClick={handleCancelDelete} className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                  No, quiero quedarme
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Guardado */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className={`absolute top-0 left-0 w-full h-2 bg-${currentTheme.color}-500`}></div>
            <button onClick={() => setShowSaveModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className={`w-20 h-20 bg-${currentTheme.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                 <Save className={`w-10 h-10 text-${currentTheme.color}-600`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">¿Guardar Cambios?</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                ¿Estás seguro de que deseas actualizar tu información personal?
              </p>

              <div className="flex flex-col gap-3">
                 <button onClick={handleSaveProfile} className={`w-full py-3.5 bg-${currentTheme.color}-600 text-white font-bold rounded-xl hover:bg-${currentTheme.color}-700 shadow-lg shadow-${currentTheme.color}-600/20 transition-all transform active:scale-95`}>
                    Sí, guardar cambios
                 </button>
                <button onClick={() => setShowSaveModal(false)} className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className={`absolute top-0 left-0 w-full h-2 bg-${currentTheme.color}-500`}></div>
            <button onClick={() => setShowPasswordModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className={`w-20 h-20 bg-${currentTheme.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                 <Key className={`w-10 h-10 text-${currentTheme.color}-600`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">¿Cambiar Contraseña?</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                ¿Estás seguro de que deseas actualizar tu contraseña de seguridad?
              </p>

              <div className="flex flex-col gap-3">
                 <button onClick={confirmPasswordChange} className={`w-full py-3.5 bg-${currentTheme.color}-600 text-white font-bold rounded-xl hover:bg-${currentTheme.color}-700 shadow-lg shadow-${currentTheme.color}-600/20 transition-all transform active:scale-95`}>
                    Sí, cambiar contraseña
                 </button>
                <button onClick={() => setShowPasswordModal(false)} className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cartelito de Éxito (Modal Centrado) */}
      {showSuccessToast && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in duration-300 flex items-center gap-4 max-w-sm w-full">
            <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
            <div className="bg-green-100 rounded-full p-2 ml-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-bold text-lg">¡Cambios guardados!</p>
              <p className="text-gray-500 text-sm mt-1">Tu información se actualizó correctamente.</p>
            </div>
            <button onClick={() => setShowSuccessToast(false)} className="text-gray-400 hover:text-gray-600 absolute top-4 right-4">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Cartelito Aliviado (Modal Grande) */}
      {showRelievedToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
            <button onClick={() => setShowRelievedToast(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="text-5xl" role="img" aria-label="relieved face">😮‍💨</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">¡Qué alivio!</h3>
              <p className="text-gray-600 mb-2 leading-relaxed">
                Nos alegra muchísimo que decidas quedarte en S.A.M.S.A.
              </p>
              <p className="text-gray-500 text-sm font-medium">
                Seguiremos cuidando de ti y tu salud.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cartelito Despedida (Modal Grande) */}
      {showGoodbyeToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all">
          <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-slate-600"></div>

            <div className="text-center">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                 <span className="text-5xl" role="img" aria-label="sad face">🥺</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Hasta pronto...</h3>
              <p className="text-slate-300 mb-2 leading-relaxed font-medium">
                Lamentamos mucho verte partir.
              </p>
              <p className="text-slate-400 text-sm">
                Esperamos que nuestros caminos se vuelvan a cruzar. ¡Cuídate mucho!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;