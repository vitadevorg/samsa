import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import SecretaryCalendar from './SecretaryCalendar';
import { formatDateToLocale, getToday } from './dates';

const DateStrip = ({ dates, selectedDate, onSelectDate }) => {
  const [showMainCalendar, setShowMainCalendar] = useState(false);
  const today = getToday();
  return (
    <div className="mb-6 sm:mb-8 flex items-center gap-2">
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center shrink-0 relative">
            <button 
                onClick={() => setShowMainCalendar(!showMainCalendar)} 
                aria-label="Seleccionar fecha"
                className={`flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-colors ${showMainCalendar ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'}`} 
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

        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 overflow-x-auto custom-scrollbar flex-grow min-w-0">
            {dates.map(date => {
            const isSelected = date === selectedDate;
            const isToday = date === today;
            return (
                <button
                    key={date}
                    onClick={() => onSelectDate(date)}
                    aria-pressed={isSelected}
                    className={`shrink-0 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold transition-all text-sm flex flex-col items-center min-w-[84px] sm:min-w-[100px] ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : isToday ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
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
