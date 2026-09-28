import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { getToday } from './dates';
import { getScheduleSlots, isWorkingDay } from './agenda';

// `appointments` (opcional): turnos del profesional, para marcar días con turnos o completos.
// `schedule` (opcional): horario del profesional; deshabilita los días que no atiende.
const SecretaryCalendar = ({ selectedDate, onSelect, onClose, inline = false, appointments = null, schedule = null }) => {
    const initialDate = selectedDate ? new Date(selectedDate + 'T12:00:00Z') : new Date();
    const [viewDate, setViewDate] = useState(initialDate);
    const [showYearSelector, setShowYearSelector] = useState(false);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const renderDays = () => {
        let days = [];
        for (let i = 0; i < firstDayIndex; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === getToday();

            const docAppointmentsCount = appointments ? appointments.filter(app => app.date === dateStr && app.status !== 'cancelled').length : 0;
            const hasAppointments = docAppointmentsCount > 0;
            const isFullyBooked = schedule !== null && docAppointmentsCount >= getScheduleSlots(schedule).length;

            const isDisabled = !isWorkingDay(new Date(year, month, i), schedule) || isFullyBooked;

            days.push(
                <button 
                    key={i} 
                    type="button"
                    disabled={isDisabled}
                    onClick={() => { onSelect(dateStr); if(!inline) onClose(); }}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        isDisabled 
                            ? 'bg-red-50/50 text-red-300 cursor-not-allowed line-through' 
                            : isSelected 
                                ? 'bg-slate-800 text-white shadow-md' 
                                : isToday 
                                    ? 'bg-slate-200 text-slate-800 font-bold' 
                                    : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                    <span className="relative z-10">{i}</span>
                    {hasAppointments && !isDisabled && !isSelected && (
                        <div className="absolute bottom-1 w-1 h-1 bg-blue-400 rounded-full"></div>
                    )}
                </button>
            );
        }
        return days;
    };

    return (
        <div className={`${inline ? 'w-full' : 'absolute top-full mt-2 left-0 z-50 bg-white shadow-2xl border border-slate-100 p-4 w-72'} rounded-2xl animate-fadeIn`}>
            <div className="flex justify-between items-center mb-4">
                <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronLeft className="w-5 h-5"/></button>
                <div 
                    className="font-bold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-1"
                    onClick={() => setShowYearSelector(!showYearSelector)}
                >
                    {monthNames[month]} {year} <ChevronDown className="w-3 h-3"/>
                </div>
                <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronRight className="w-5 h-5"/></button>
            </div>

            {showYearSelector ? (
                <div className="h-48 overflow-y-auto custom-scrollbar grid grid-cols-3 gap-2 p-1">
                    {Array.from({length: 100}, (_, i) => new Date().getFullYear() - 80 + i).map(y => (
                        <button 
                            key={y}
                            type="button"
                            onClick={() => { setViewDate(new Date(y, month, 1)); setShowYearSelector(false); }}
                            className={`py-2 rounded-lg text-sm font-bold ${y === year ? 'bg-slate-800 text-white' : 'hover:bg-slate-100 text-slate-700'}`}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => <div key={d} className="text-[10px] font-black text-slate-400 uppercase">{d}</div>)}
                    </div>
            <div className="grid grid-cols-7 gap-1 place-items-center mb-3">
                {renderDays()}
            </div>
            <button 
                type="button"
                onClick={() => { onSelect(getToday()); onClose(); }}
                className="w-full py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
            >
                Volver a Hoy
            </button>
            </>
            )}
        </div>
    );
};

export default SecretaryCalendar;
