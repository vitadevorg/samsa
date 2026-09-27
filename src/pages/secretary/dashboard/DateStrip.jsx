import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import SecretaryCalendar from './SecretaryCalendar';
import { formatDateToLocale, getToday } from './dates';

const DateStrip = ({ dates, selectedDate, onSelectDate }) => {
  const [showMainCalendar, setShowMainCalendar] = useState(false);
  const today = getToday();
  return (
    <div className="mb-8 flex items-center gap-2">
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center shrink-0 relative">
            <button 
                onClick={() => setShowMainCalendar(!showMainCalendar)} 
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${showMainCalendar ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200'}`} 
                title="Seleccionar fecha"
            >
                <Calendar className="w-5 h-5" />
            </button>
            {showMainCalendar && (
                <SecretaryCalendar 
                    selectedDate={selectedDate} 
                    onSelect={onSelectDate} 
                    onClose={() => setShowMainCalendar(false)} 
                />
            )}
        </div>

        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 overflow-x-auto custom-scrollbar flex-grow">
            {dates.map(date => {
            const isSelected = date === selectedDate;
            const isToday = date === today;
            return (
                <button
                    key={date}
                    onClick={() => onSelectDate(date)}
                    className={`shrink-0 px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex flex-col items-center min-w-[100px] ${isSelected ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                    <span className="uppercase text-[10px] tracking-widest opacity-80 mb-0.5">{isToday ? 'Hoy' : formatDateToLocale(date).split(' ')[0]}</span>
                    <span>{formatDateToLocale(date).split(' ').slice(1).join(' ')}</span>
                </button>
            )
        })}
        </div>
    </div>
  );
};

export default DateStrip;
