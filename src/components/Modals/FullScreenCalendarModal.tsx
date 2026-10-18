import {
  CalendarDays,
  X,
  ChevronLeft,
  ChevronRight,
  Printer,
  FileSpreadsheet,
  Calendar as CalendarIcon,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { useScheduleStore } from '../../store/useScheduleStore';
import { getMonthCalendarGrid, formatMonthYear, formatDateWithWeekday } from '../../utils/dateUtils';
import { exportScheduleToExcel } from '../../utils/exportToExcel';

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

  // Events of the current month sorted chronologically by date and time
  const monthEvents = events
    .filter((e) => e.date.startsWith(currentMonth))
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      const timeCompare = (a.time || '').localeCompare(b.time || '');
      if (timeCompare !== 0) return timeCompare;
      return a.title.localeCompare(b.title);
    });

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

  const handleExportExcel = () => {
    exportScheduleToExcel({
      month: currentMonth,
      persons,
      assignments,
      events,
    });
  };

  return createPortal(
    <div
      id="fullscreen-calendar-modal-container"
      className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn print:p-0 print:m-0 print:static print:bg-transparent print:backdrop-blur-none print:z-auto"
    >
      <div className="w-full h-full bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-colors print:rounded-none print:border-none print:shadow-none print:bg-white print:text-slate-900 print:h-auto print:overflow-visible">
        {/* Fullscreen Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0 print:px-2 print:py-2 print:border-b-2 print:border-slate-800 print:bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shrink-0 print:hidden">
              <CalendarDays className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white print:text-slate-950 print:text-2xl tracking-tight">
                  {formatMonthYear(currentMonth)}
                </h2>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 hidden sm:inline print:hidden">
                  Tela Cheia
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-600">
                Visualização panorâmica de todas as escalas e plantões do mês
              </p>
            </div>
          </div>

          {/* Navigation & Controls - Hidden when printing */}
          <div className="flex items-center gap-2 print:hidden">
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

            {/* Export to Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              title="Exportar para Excel (.xlsx)"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Exportar Excel</span>
            </button>

            {/* Print button */}
            <button
              type="button"
              onClick={handlePrint}
              title="Imprimir escala do mês / Salvar em PDF"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 text-xs font-bold transition shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
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
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-slate-50/50 dark:bg-slate-950 print:overflow-visible print:bg-white print:h-auto">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0 print:bg-slate-100 print:text-slate-900 print:border-b-2 print:border-slate-400">
            {WEEKDAYS.map((day) => (
              <div
                key={day.full}
                className={`py-2 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0 print:border-r print:border-slate-300 ${
                  day.isWeekend ? 'text-indigo-950/70 dark:text-indigo-300 bg-slate-200/40 dark:bg-slate-700/40 print:bg-slate-200/60' : ''
                }`}
              >
                <span className="hidden sm:inline">{day.full}</span>
                <span className="sm:hidden">{day.short}</span>
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="flex-1 grid grid-cols-7 border-l border-slate-200 dark:border-slate-800 auto-rows-fr overflow-y-auto print:overflow-visible print:border-l-2 print:border-slate-400 print:h-auto">
            {daysGrid.map((dayInfo) => {
              const assigned = assignments[dayInfo.dateStr] || [];
              const dayEvents = events.filter((e) => e.date === dayInfo.dateStr);
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={dayInfo.dateStr}
                  className={`border-b border-r border-slate-200 dark:border-slate-800 p-2 md:p-3 flex flex-col justify-between transition-colors min-h-[90px] print:min-h-[105px] print:p-1.5 print:border-slate-300 print:bg-white ${
                    !dayInfo.isCurrentMonth
                      ? 'bg-slate-100/60 dark:bg-slate-950/50 text-slate-400 dark:text-slate-600 print:bg-slate-100/70 print:text-slate-400'
                      : dayInfo.isToday
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-inset ring-indigo-200 dark:ring-indigo-800/60 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40 print:bg-white'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 print:bg-white'
                  }`}
                >
                  {/* Cell Top Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-sm md:text-base font-semibold inline-flex items-center justify-center transition-colors print:w-6 print:h-6 print:text-xs ${
                        hasEvents
                          ? 'text-red-600 font-extrabold dark:text-red-400 bg-red-50 dark:bg-red-950/60 w-7 h-7 rounded-full print:w-6 print:h-6 print:bg-red-100 print:text-red-700'
                          : dayInfo.isToday
                          ? 'text-indigo-600 dark:text-indigo-400 font-bold px-1 print:text-slate-900'
                          : dayInfo.isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200 print:text-slate-900 font-bold'
                          : 'text-slate-400 dark:text-slate-600 print:text-slate-400'
                      }`}
                    >
                      {dayInfo.dayNumber}
                    </span>

                    {/* Events Count Tag */}
                    {hasEvents && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.5 rounded-md print:bg-red-50 print:border print:border-red-300 print:text-red-700"
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
                        <span className="text-xs text-slate-300 dark:text-slate-600 italic print:text-slate-400">Vago</span>
                      </div>
                    ) : (
                      assigned.map((personId) => {
                        const person = personMap.get(personId);
                        if (!person) return null;

                        return (
                          <div
                            key={personId}
                            style={{
                              backgroundColor: person.color,
                              borderColor: person.color,
                              color: '#ffffff',
                              WebkitPrintColorAdjust: 'exact',
                              printColorAdjust: 'exact',
                            }}
                            className="text-white text-xs md:text-sm font-semibold px-2 py-1 rounded-lg shadow-2xs flex items-center justify-between truncate print:text-white print:font-bold print:border-2 print:rounded-md print:px-2 print:py-1 print:shadow-none print-person-chip"
                            title={person.name}
                          >
                            <span className="truncate">{person.name}</span>
                          </div>
                        );
                      })
                    )}

                    {assigned.length > 1 && (
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800 block text-center print:bg-rose-100 print:text-rose-800 print:border-rose-300">
                        Conflito: {assigned.length} escalados
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Print-only Events Section: list all events of the month ordered chronologically by date */}
        {monthEvents.length > 0 && (
          <div
            data-testid="print-events-section"
            className="hidden print:block print:break-before-page print-page-break-before w-full print:pt-6 print:px-2"
          >
            <div className="mb-4 pb-2 border-b-2 border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-950 tracking-tight">
                  Eventos do Mês – {formatMonthYear(currentMonth)}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Listagem cronológica dos eventos e programações especiais cadastradas para o período
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
                  Total: {monthEvents.length} {monthEvents.length === 1 ? 'evento' : 'eventos'}
                </span>
              </div>
            </div>

            <table className="w-full border-collapse border border-slate-300 text-left text-xs">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-400 text-slate-900 font-bold">
                  <th className="py-2.5 px-3 border-r border-slate-300 w-36">Data</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 w-24">Horário</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 w-1/4">Evento</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Descrição / Observações</th>
                  <th className="py-2.5 px-3 w-48">Escala do Dia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {monthEvents.map((event) => {
                  const { formattedDate, weekday } = formatDateWithWeekday(event.date);
                  const assignedIds = assignments[event.date] || [];
                  const assignedNames = assignedIds
                    .map((id) => personMap.get(id)?.name)
                    .filter(Boolean);

                  return (
                    <tr
                      key={event.id}
                      className="print:break-inside-avoid print-break-inside-avoid odd:bg-white even:bg-slate-50/60"
                    >
                      <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-950 whitespace-nowrap">
                        <div>{formattedDate}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{weekday}</div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap">
                        {event.time ? (
                          <span className="font-semibold text-slate-800">{event.time}</span>
                        ) : (
                          <span className="text-slate-400 italic">Dia todo</span>
                        )}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                        {event.title}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-600">
                        {event.description || <span className="text-slate-400 italic">-</span>}
                      </td>
                      <td className="py-2 px-3 text-slate-700">
                        {assignedNames.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {assignedNames.map((name) => (
                              <span
                                key={name}
                                className="inline-block px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px] font-medium text-slate-800"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Vago</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>,


    document.body
  );
};

