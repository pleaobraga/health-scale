import React from 'react';

const WEEKDAYS = [
  { short: 'Dom', full: 'Domingo', isWeekend: true },
  { short: 'Seg', full: 'Segunda-feira', isWeekend: false },
  { short: 'Ter', full: 'Terça-feira', isWeekend: false },
  { short: 'Qua', full: 'Quarta-feira', isWeekend: false },
  { short: 'Qui', full: 'Quinta-feira', isWeekend: false },
  { short: 'Sex', full: 'Sexta-feira', isWeekend: false },
  { short: 'Sáb', full: 'Sábado', isWeekend: true },
];

export const CalendarHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/80 text-xs font-bold text-slate-700">
      {WEEKDAYS.map((day) => (
        <div
          key={day.full}
          className={`py-2.5 text-center border-r border-slate-200 last:border-r-0 ${
            day.isWeekend ? 'text-indigo-950/70 bg-slate-200/40' : ''
          }`}
        >
          <span className="hidden sm:inline">{day.full}</span>
          <span className="sm:hidden">{day.short}</span>
        </div>
      ))}
    </div>
  );
};

