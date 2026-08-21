import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Printer, ChevronRight, ChevronLeft, Upload, File, Image as ImageIcon } from 'lucide-react';

const ProfessionalApplicationModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [progress, setProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', dni: '', cuit: '', email: '', phone: '',
        specialty: '', licenseNumber: '', professionalType: 'particular',
        cv: null, profilePic: null
    });

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setIsSubmitting(false);
            setIsSuccess(false);
            setProgress(0);
            setFormData({
                firstName: '', lastName: '', dni: '', cuit: '', email: '', phone: '',
                specialty: '', licenseNumber: '', professionalType: 'particular',
                cv: null, profilePic: null
            });
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    useEffect(() => {
        if (isSuccess) {
            document.body.classList.add('hide-root-for-print');
        } else {
            document.body.classList.remove('hide-root-for-print');
        }
        return () => {
            document.body.classList.remove('hide-root-for-print');
        };
    }, [isSuccess]);

    if (!isOpen) return null;

    const handleNext = () => {
        setStep(prev => {
            const next = Math.min(prev + 1, 3);
            setProgress((next - 1) * 33.33);
            return next;
        });
    };

    const handlePrev = () => {
        setStep(prev => {
            const next = Math.max(prev - 1, 1);
            setProgress((next - 1) * 33.33);
            return next;
        });
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = () => {
        setIsSubmitting(true);
        setProgress(100);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1000);
    };

    const stepMessages = {
        1: "Comencemos con tus datos principales.",
        2: "¡Excelente! Ahora contanos sobre tu perfil profesional.",
        3: "Estás a un paso. Subí tu documentación."
    };

    const handlePrint = () => {
        window.print();
    };

    if (isSuccess) {
        return (
            <>
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B1120] p-4 animate-circle-reveal print:hidden">
                    <div className="max-w-xl w-full text-center flex flex-col items-center relative z-10">

                        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.4)] opacity-0 animate-scale-in-bounce" style={{ animationFillMode: 'both' }}>
                            <svg className="w-12 h-12 text-white" viewBox="0 0 52 52">
                                <path 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="4" 
                                    strokeDasharray="48" 
                                    strokeDashoffset="48" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    d="M14.1 27.2l7.1 7.2 16.7-16.8" 
                                    style={{ animation: 'check-draw 0.4s ease-out 0.4s forwards' }} 
                                />
                            </svg>
                        </div>

                        <h2 className="text-4xl md:text-5xl text-white font-serif mb-6 opacity-0 animate-fade-in-up tracking-tight" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                            Solicitud Enviada
                        </h2>

                        <p className="text-xl text-slate-200 mb-2 opacity-0 animate-fade-in-up font-light" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
                            Todo listo, <span className="font-bold text-white">{formData.firstName || 'Profesional'}</span>.
                        </p>
                        <p className="text-slate-400 text-base mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
                            Nuestro equipo evaluará tu perfil y te contactará a la brevedad.
                        </p>

                        <div className="flex items-center gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
                            <button onClick={handlePrint} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-colors text-lg shadow-lg shadow-emerald-500/20">
                                <Printer className="w-6 h-6" /> Imprimir Comprobante
                            </button>
                            <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-8 py-4 rounded-xl font-bold transition-colors text-lg">
                                Volver al Inicio
                            </button>
                        </div>

                        <p className="text-slate-500 text-sm mt-16 opacity-0 animate-fade-in-up" style={{ animationDelay: '1000ms', animationFillMode: 'both' }}>
                            Se ha enviado una copia a su correo {formData.email && <strong className="text-slate-400">{formData.email}</strong>}
                        </p>

                    </div>
                </div>

                {createPortal(
                    <div className="hidden print:block bg-white text-black p-10 min-h-screen font-serif absolute top-0 left-0 w-full">
                        <div className="max-w-4xl mx-auto">

                        <div className="flex justify-between items-end border-b-2 border-slate-900 pb-6 mb-12">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-1">SAMSA<span className="text-blue-600">.</span></h1>
                                    <p className="text-slate-500 uppercase tracking-widest text-xs font-bold font-sans">Sistema de Adhesión Médica</p>
                                </div>
                            </div>
                            <div className="text-right font-sans">
                                <p className="text-slate-400 uppercase text-xs font-bold tracking-wider mb-1">Comprobante Oficial N°</p>
                                <p className="font-mono font-bold text-2xl text-slate-800">{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                                <p className="text-sm text-slate-500 mt-1">{new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="mb-16 px-4">
                            <h2 className="text-3xl font-bold mb-8 text-slate-900 border-l-4 border-blue-600 pl-4">Certificado de Recepción de Solicitud</h2>
                            <p className="text-slate-700 leading-loose mb-10 text-lg">
                                Por medio del presente documento, se certifica formalmente que el profesional individualizado a continuación ha completado satisfactoriamente el proceso de envío de la <strong>Solicitud de Adhesión Institucional</strong> para formar parte de la red de profesionales de la salud vinculados a SAMSA.
                            </p>

                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 font-sans shadow-sm">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-4">Detalle del Profesional Solicitante</h3>
                                <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre Completo</p>
                                        <p className="font-bold text-xl text-slate-900">{formData.firstName} {formData.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Documento Nacional de Identidad</p>
                                        <p className="font-medium text-lg text-slate-700">{formData.dni || 'No provisto'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Correo Electrónico de Contacto</p>
                                        <p className="font-medium text-lg text-slate-700">{formData.email || 'No provisto'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Teléfono Celular</p>
                                        <p className="font-medium text-lg text-slate-700">{formData.phone || 'No provisto'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 pt-10 mt-16 flex justify-between items-end px-4">
                            <div className="text-slate-500 text-sm w-2/3 font-sans">
                                <p className="mb-3 leading-relaxed"><strong>Aviso Legal y Condiciones:</strong> Este documento es estrictamente un comprobante de recepción e inicio de trámite administrativo. No constituye, bajo ningún concepto, una aprobación automática ni habilitación profesional. El perfil será rigurosamente evaluado por el Comité de Admisiones Médicas de SAMSA en un plazo de 48 a 72 horas hábiles.</p>
                                <p className="text-xs text-slate-400">© {new Date().getFullYear()} SAMSA, Tucumán, Argentina. Documento generado automáticamente.</p>
                            </div>

                            <div className="w-64 text-center">
                                <div className="border-b border-slate-400 pb-2 mb-2">

                                    <span className="font-serif text-3xl italic text-slate-300">SAMSA Admisiones</span>
                                </div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest font-sans">Sello de Recepción</p>
                            </div>
                        </div>

                    </div>
                </div>,
                document.body
                )}
            </>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">

                <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-black text-white">Solicitud de Adhesión</h2>
                            <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-1 rounded-md">Paso {step} de 3</span>
                        </div>
                        <p key={step} className="text-blue-400 font-bold text-sm animate-fadeIn">
                            {stepMessages[step]}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-800 text-slate-400 rounded-full hover:text-white hover:bg-slate-700 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="h-1.5 bg-slate-800 w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">

                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span> 
                                Datos Personales y Contacto
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Nombres</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Ej. Juan Martín" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Apellidos</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Ej. Pérez" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">DNI</label>
                                    <input type="text" name="dni" value={formData.dni} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Sin puntos" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">CUIT / CUIL</label>
                                    <input type="text" name="cuit" value={formData.cuit} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Ej. 20-XXXXXXXX-X" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="tu@email.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Teléfono Celular</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Código de área + número" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span> 
                                Datos Profesionales
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Especialidad Principal</label>
                                    <select name="specialty" value={formData.specialty} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors">
                                        <option value="">Seleccione una especialidad</option>
                                        <option value="Cardiología">Cardiología</option>
                                        <option value="Clínica Médica">Clínica Médica</option>
                                        <option value="Pediatría">Pediatría</option>
                                        <option value="Dermatología">Dermatología</option>
                                        <option value="Traumatología">Traumatología</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Número de Matrícula (Provincial o Nacional)</label>
                                    <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Ej. MP 12345" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tipo de Profesional</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {['particular', 'clinica', 'hospital'].map(type => (
                                            <div 
                                                key={type}
                                                onClick={() => setFormData({...formData, professionalType: type})}
                                                className={`cursor-pointer border rounded-xl p-4 text-center transition-all ${formData.professionalType === type ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                                            >
                                                <div className="font-bold capitalize">{type === 'clinica' ? 'Clínica' : type}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm">3</span> 
                                Documentación
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                                <div className="border-2 border-dashed border-slate-800 bg-slate-950 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors group cursor-pointer">
                                    <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full mx-auto flex items-center justify-center mb-4 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                                        <ImageIcon className="w-6 h-6 text-slate-500 group-hover:text-blue-400" />
                                    </div>
                                    <h4 className="text-white font-bold mb-1">Foto de Perfil</h4>
                                    <p className="text-slate-400 text-sm">Formato JPG o PNG</p>
                                    <div className="mt-4 inline-block px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">Seleccionar Archivo</div>
                                </div>

                                <div className="border-2 border-dashed border-slate-800 bg-slate-950 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors group cursor-pointer">
                                    <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full mx-auto flex items-center justify-center mb-4 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                                        <File className="w-6 h-6 text-slate-500 group-hover:text-blue-400" />
                                    </div>
                                    <h4 className="text-white font-bold mb-1">Currículum Vitae</h4>
                                    <p className="text-slate-400 text-sm">Formato PDF</p>
                                    <div className="mt-4 inline-block px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">Seleccionar PDF</div>
                                </div>
                            </div>

                            <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-xl mt-6">
                                <p className="text-blue-400 text-sm">
                                    Toda la información proporcionada será tratada de manera confidencial y utilizada exclusivamente para evaluar su solicitud de adhesión a la red médica SAMSA.
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                <div className="p-6 border-t border-slate-800 flex justify-between bg-slate-900/50">
                    <button 
                        onClick={handlePrev} 
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                    >
                        <ChevronLeft className="w-4 h-4" /> Anterior
                    </button>

                    {step < 3 ? (
                        <button 
                            onClick={handleNext} 
                            className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-black flex items-center gap-2 shadow-lg transition-all"
                        >
                            Siguiente <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting}
                            className={`px-8 py-3 bg-blue-600 text-white hover:bg-blue-500 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-blue-900/50 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ProfessionalApplicationModal;
