import React from 'react';
import { useScheduleStore } from '../../store/useScheduleStore';
import { getMonthCalendarGrid, formatMonthYear } from '../../utils/dateUtils';
import { CalendarHeader } from './CalendarHeader';
import { DayCell } from './DayCell';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Wand2,
  CalendarDays,
} from 'lucide-react';

export const CalendarGrid: React.FC = () => {
  const {
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    isEditMode,
    toggleEditMode,
    highlightedPersonId,
    persons,
    availabilities,
    assignments,
    events,
    setSelectedDateForEvents,
    removePersonFromDay,
    addPersonToDay,
    populateMonthWithAvailableCandidates,
  } = useScheduleStore();

  const daysGrid = getMonthCalendarGrid(currentMonth);

  const highlightedPerson = highlightedPersonId
    ? persons.find((p) => p.id === highlightedPersonId) || null
    : null;

  const isPersonAvailable = (personId: string, dayNumber: number): boolean => {
    const avail = availabilities.find(
      (a) => a.personId === personId && a.month === currentMonth
    );
    return avail ? avail.availableDays.includes(dayNumber) : false;
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden shadow-xs border border-slate-200 rounded-2xl">
      {/* Calendar Top Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/80">
            <button
              type="button"
              onClick={goToPreviousMonth}
              title="Mês anterior"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition shadow-2xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goToNextMonth}
              title="Próximo mês"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition shadow-2xs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
              {formatMonthYear(currentMonth)}
            </h2>
            <p className="text-xs text-slate-500">
              Escala de plantões e distribuição de turnos
            </p>
          </div>
        </div>

        {/* View / Edit Mode Switch & Tools */}
        <div className="flex items-center gap-2.5">
          {isEditMode && (
            <button
              type="button"
              onClick={() => populateMonthWithAvailableCandidates(currentMonth)}
              title="Preenche dias vagos com as pessoas disponíveis"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Povoar com Disponíveis</span>
            </button>
          )}

          {/* Mode Switch Toggle Button */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                if (isEditMode) toggleEditMode();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                !isEditMode
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Visualização</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isEditMode) toggleEditMode();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                isEditMode
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edição</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notice bar when editing or highlighting */}
      {isEditMode && (
        <div className="bg-amber-50 px-4 py-2 text-xs text-amber-800 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>
              <strong>Modo Edição Ativo:</strong> Remova as tags excedentes clicando no <strong>✕</strong> até definir o responsável final do dia, ou adicione outros pelo <strong>+</strong>.
            </span>
          </div>
        </div>
      )}

      {highlightedPerson && (
        <div className="bg-indigo-50/80 px-4 py-1.5 text-xs text-indigo-800 border-b border-indigo-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: highlightedPerson.color }}
            />
            <span>
              Exibindo disponibilidade de: <strong>{highlightedPerson.name}</strong> (dias destacados em amarelo)
            </span>
          </div>
        </div>
      )}

      {/* Main 7-Column Grid (Domingo a Sábado) */}
      <div className="flex-1 overflow-auto flex flex-col">
        <CalendarHeader />
        <div className="grid grid-cols-7 border-l border-slate-200 flex-1 auto-rows-fr">
          {daysGrid.map((dayInfo) => {
            const assigned = assignments[dayInfo.dateStr] || [];
            const dayEvents = events.filter((e) => e.date === dayInfo.dateStr);
            const isHighlightedAvail = highlightedPerson
              ? isPersonAvailable(highlightedPerson.id, dayInfo.dayNumber)
              : false;

            return (
              <DayCell
                key={dayInfo.dateStr}
                dayInfo={dayInfo}
                currentMonth={currentMonth}
                isEditMode={isEditMode}
                assignedPersonIds={assigned}
                allPersons={persons}
                events={dayEvents}
                highlightedPerson={highlightedPerson}
                isHighlightedPersonAvailable={isHighlightedAvail}
                isPersonAvailable={isPersonAvailable}
                onOpenEvents={() => setSelectedDateForEvents(dayInfo.dateStr)}
                onRemovePerson={(personId) => removePersonFromDay(dayInfo.dateStr, personId)}
                onAddPerson={(personId) => addPersonToDay(dayInfo.dateStr, personId)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

