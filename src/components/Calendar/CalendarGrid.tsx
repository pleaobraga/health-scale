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
  Maximize2,
  Trash2,
  FileSpreadsheet,
  Save,
  RotateCcw,
} from 'lucide-react';
import { exportScheduleToExcel } from '../../utils/exportToExcel';

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
    clearMonthAssignments,
    setFullScreenModalOpen,
    saveSchedule,
    discardChanges,
    hasUnsavedChanges,
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
    <div className="w-full bg-white dark:bg-slate-900 shadow-xs border border-slate-200 dark:border-slate-800 rounded-2xl transition-colors shrink-0">
      {/* Calendar Top Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 transition-colors">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
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

          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {formatMonthYear(currentMonth)}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Escala de plantões e distribuição de turnos
            </p>
          </div>
        </div>

        {/* View / Edit Mode Switch & Tools */}
        <div className="flex items-center flex-wrap gap-2.5">
          {isEditMode && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => populateMonthWithAvailableCandidates(currentMonth)}
                title="Preenche dias vagos com as pessoas disponíveis"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition shadow-2xs"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Povoar com Disponíveis</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm(
                    `Deseja realmente limpar todas as escalas de ${formatMonthYear(currentMonth)}?`
                  );
                  if (confirmed) {
                    clearMonthAssignments(currentMonth);
                  }
                }}
                title="Limpar todas as escalas do mês atual"
                aria-label="Limpar escalas do mês"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar Mês</span>
              </button>

              {/* Save & Discard Buttons in Edit Toolbar */}
              <button
                type="button"
                onClick={saveSchedule}
                title="Salvar alterações na escala"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar</span>
              </button>

              {hasUnsavedChanges && (
                <button
                  type="button"
                  onClick={discardChanges}
                  title="Descartar alterações e reverter ao último estado salvo"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Descartar</span>
                </button>
              )}
            </div>
          )}

          {/* Mode Switch Toggle Button */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                if (isEditMode) toggleEditMode();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                !isEditMode
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
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
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edição</span>
            </button>
          </div>

          {/* Export to Excel Button */}
          <button
            type="button"
            onClick={() =>
              exportScheduleToExcel({
                month: currentMonth,
                persons,
                assignments,
                events,
              })
            }
            title="Exportar escala do mês para planilha Excel (.xlsx)"
            aria-label="Exportar para Excel"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>

          {/* Full Screen Modal Button */}
          <button
            type="button"
            onClick={() => setFullScreenModalOpen(true)}
            title="Abrir calendário em tela cheia"
            aria-label="Abrir calendário em tela cheia"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold transition shadow-2xs"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Tela Cheia</span>
          </button>
        </div>
      </div>

      {/* Notice bar when editing or highlighting */}
      {isEditMode && (
        <div className="bg-amber-50 dark:bg-amber-950/40 px-4 py-2 text-xs text-amber-800 dark:text-amber-200 border-b border-amber-200 dark:border-amber-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>
              <strong>Modo Edição Ativo:</strong> As alterações só são gravadas ao clicar em <strong>Salvar</strong>. Se sair do modo de edição sem salvar, o calendário reverte ao estado original.
            </span>
          </div>
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                ● Alterações não salvas
              </span>
              <button
                type="button"
                onClick={saveSchedule}
                className="px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition"
              >
                Salvar Agora
              </button>
            </div>
          )}
        </div>
      )}

      {highlightedPerson && (
        <div className="bg-indigo-50/80 dark:bg-indigo-950/40 px-4 py-1.5 text-xs text-indigo-800 dark:text-indigo-200 border-b border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
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
      <div className="flex flex-col">
        <CalendarHeader />
        <div className="grid grid-cols-7 border-l border-slate-200 dark:border-slate-800 flex-1 auto-rows-fr">
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
