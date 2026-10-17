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
    <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors">
      {WEEKDAYS.map((day) => (
        <div
          key={day.full}
          className={`py-2.5 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0 ${
            day.isWeekend ? 'text-indigo-950/70 dark:text-indigo-300 bg-slate-200/40 dark:bg-slate-700/40' : ''
          }`}
        >
          <span className="hidden sm:inline">{day.full}</span>
          <span className="sm:hidden">{day.short}</span>
        </div>
      ))}
    </div>
  );
};
