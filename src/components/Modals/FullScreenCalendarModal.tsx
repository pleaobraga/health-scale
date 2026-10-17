import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useScheduleStore } from '../../store/useScheduleStore';
import { getMonthCalendarGrid, formatMonthYear } from '../../utils/dateUtils';
import {
  CalendarDays,
  X,
  ChevronLeft,
  ChevronRight,
  Printer,
  Calendar as CalendarIcon,
} from 'lucide-react';

const WEEKDAYS = [
  { short: 'Dom', full: 'Domingo', isWeekend: true },
  { short: 'Seg', full: 'Segunda-feira', isWeekend: false },
  { short: 'Ter', full: 'Terça-feira', isWeekend: false },
  { short: 'Qua', full: 'Quarta-feira', isWeekend: false },
  { short: 'Qui', full: 'Quinta-feira', isWeekend: false },
  { short: 'Sex', full: 'Sexta-feira', isWeekend: false },
  { short: 'Sáb', full: 'Sábado', isWeekend: true },
];

export const FullScreenCalendarModal: React.FC = () => {
  const {
    isFullScreenModalOpen,
    setFullScreenModalOpen,
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    persons,
    assignments,
    events,
  } = useScheduleStore();

  const daysGrid = getMonthCalendarGrid(currentMonth);
  const personMap = new Map(persons.map((p) => [p.id, p]));

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreenModalOpen) {
        setFullScreenModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreenModalOpen, setFullScreenModalOpen]);

  if (!isFullScreenModalOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full h-full bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-colors">
        {/* Fullscreen Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <CalendarDays className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {formatMonthYear(currentMonth)}
                </h2>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 hidden sm:inline">
                  Tela Cheia
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualização panorâmica de todas as escalas e plantões do mês
              </p>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-2">
            {/* Month Navigation */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={goToPreviousMonth}
                title="Mês anterior"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition shadow-2xs"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                title="Próximo mês"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition shadow-2xs"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Print button */}
            <button
              type="button"
              onClick={handlePrint}
              title="Imprimir escala do mês"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 transition"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setFullScreenModalOpen(false)}
              title="Fechar tela cheia (ESC)"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-slate-50/50 dark:bg-slate-950">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
            {WEEKDAYS.map((day) => (
              <div
                key={day.full}
                className={`py-2 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0 ${
                  day.isWeekend ? 'text-indigo-950/70 dark:text-indigo-300 bg-slate-200/40 dark:bg-slate-700/40' : ''
                }`}
              >
                <span className="hidden sm:inline">{day.full}</span>
                <span className="sm:hidden">{day.short}</span>
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="flex-1 grid grid-cols-7 border-l border-slate-200 dark:border-slate-800 auto-rows-fr overflow-y-auto">
            {daysGrid.map((dayInfo) => {
              const assigned = assignments[dayInfo.dateStr] || [];
              const dayEvents = events.filter((e) => e.date === dayInfo.dateStr);
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={dayInfo.dateStr}
                  className={`border-b border-r border-slate-200 dark:border-slate-800 p-2 md:p-3 flex flex-col justify-between transition-colors min-h-[90px] ${
                    !dayInfo.isCurrentMonth
                      ? 'bg-slate-100/60 dark:bg-slate-950/50 text-slate-400 dark:text-slate-600'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Cell Top Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-sm md:text-base font-semibold inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
                        hasEvents
                          ? 'text-red-600 font-extrabold dark:text-red-400 bg-red-50 dark:bg-red-950/60'
                          : dayInfo.isToday
                          ? 'bg-indigo-600 text-white font-bold'
                          : dayInfo.isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      {dayInfo.dayNumber}
                    </span>

                    {/* Events Count Tag */}
                    {hasEvents && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.5 rounded-md"
                        title={dayEvents.map((e) => e.title).join(' | ')}
                      >
                        <CalendarIcon className="w-3 h-3" />
                        <span>{dayEvents.length}</span>
                      </span>
                    )}
                  </div>

                  {/* Cell Body with Assigned Persons */}
                  <div className="flex-1 flex flex-col justify-center space-y-1">
                    {assigned.length === 0 ? (
                      <div className="text-center py-1">
                        <span className="text-xs text-slate-300 dark:text-slate-600 italic">Vago</span>
                      </div>
                    ) : (
                      assigned.map((personId) => {
                        const person = personMap.get(personId);
                        if (!person) return null;

                        return (
                          <div
                            key={personId}
                            style={{ backgroundColor: person.color }}
                            className="text-white text-xs md:text-sm font-semibold px-2 py-1 rounded-lg shadow-2xs flex items-center justify-between truncate"
                            title={person.name}
                          >
                            <span className="truncate">{person.name}</span>
                          </div>
                        );
                      })
                    )}

                    {assigned.length > 1 && (
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800 block text-center">
                        Conflito: {assigned.length} escalados
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

