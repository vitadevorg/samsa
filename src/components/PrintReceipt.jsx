import React from 'react';
import { HeartPulse } from 'lucide-react';

// Comprobante imprimible de un turno. `transactionId` debe generarse una sola vez
// (al crear o imprimir el turno) para que no cambie entre renders.
const PrintReceipt = ({ appointmentData }) => {
    const { doctorName, patientName, dni, insurance, date, time, email, location, bookingDate, transactionId } = appointmentData;
    return (
        <div id="print-area" className="hidden print:flex flex-col p-8 font-serif text-slate-900 bg-white w-full max-w-none box-border absolute top-0 left-0 right-0 z-[99999] min-h-[100vh]">
            <div className="border-b-[3px] border-slate-900 pb-6 mb-10 flex justify-between items-end">
                <div className="flex items-center gap-4">
                    <HeartPulse className="w-14 h-14 text-slate-900" strokeWidth={1.2} />
                    <div>
                        <h1 className="text-4xl tracking-[0.3em] font-medium text-slate-900 ml-1">SAMSA</h1>
                        <p className="text-xs text-slate-500 tracking-[0.2em] uppercase mt-1">Sistema de Salud Integral</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-widest mb-1">Comprobante</h2>
                    <p className="text-sm text-slate-500 font-sans">TX: #{transactionId}</p>
                    <p className="text-sm text-slate-500 font-sans">Reservado: {bookingDate || new Date().toLocaleDateString('es-AR')}</p>
                    <p className="text-sm text-slate-500 font-sans">Impreso: {new Date().toLocaleDateString('es-AR')}</p>
                </div>
            </div>
            <div className="flex-1">
                <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl mb-8">
                    <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-widest border-b border-slate-200 pb-3 text-sm">Información de la Reserva</h3>
                    <div className="grid grid-cols-2 gap-y-6 text-lg font-sans">
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Profesional Asignado</span> <span className="font-medium text-slate-800">{doctorName}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Ubicación</span> <span className="font-medium text-slate-800">{location || 'Sede Central'}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Fecha</span> <span className="font-medium text-slate-800">{date}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Horario</span> <span className="font-medium text-slate-800">{time} hs</span></p>
                    </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl mb-8">
                    <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-widest border-b border-slate-200 pb-3 text-sm">Datos del Paciente</h3>
                    <div className="grid grid-cols-2 gap-y-6 text-lg font-sans">
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Nombre Completo</span> <span className="font-medium text-slate-800">{patientName}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Documento (DNI)</span> <span className="font-medium text-slate-800">{dni}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Cobertura Médica</span> <span className="font-medium text-slate-800 capitalize">{insurance || 'Atención Particular'}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold tracking-wider block mb-1">Correo Electrónico</span> <span className="font-medium text-slate-800">{email}</span></p>
                    </div>
                </div>
                <div className="border-l-[3px] border-slate-900 pl-6 py-2 mt-12">
                    <p className="text-sm text-slate-700 italic font-sans leading-relaxed">
                        <strong>Aviso Importante:</strong> El paciente deberá anunciarse en recepción con al menos 15 minutos de antelación al horario pactado, 
                        presentando obligatoriamente su Documento Nacional de Identidad y la credencial física o virtual de su cobertura médica. 
                        Toda demora superior a 10 minutos podrá implicar la reasignación o cancelación del turno sin previo aviso.
                    </p>
                </div>
            </div>
            <div className="border-t border-slate-300 pt-6 text-justify text-[10px] text-slate-400 mt-auto font-sans">
                <p className="mb-3 leading-relaxed">
                    Este documento constituye un comprobante formal y válido de reserva de turno emitido por el Sistema de Atención Médica y Salud Argentina (SAMSA). 
                    Generado de manera electrónica y automatizada bajo el ID único mencionado. La institución se reserva el derecho de modificar o reprogramar el turno 
                    por razones de fuerza mayor, notificando previamente al paciente mediante los canales de contacto declarados. 
                </p>
                <p className="text-center font-bold tracking-[0.3em] uppercase mt-6 text-xs text-slate-800">
                    SAMSA - Excelencia en Salud Institucional
                </p>
            </div>
        </div>
    );
};

export default PrintReceipt;
