import { Calendar as CalendarIcon, X, Sparkles } from 'lucide-react';

import { CandidatePicker } from './CandidatePicker';

import type { Person, CalendarEvent } from '../../types';
import type { CalendarDayInfo } from '../../utils/dateUtils';

export interface DayCellProps {
  dayInfo: CalendarDayInfo;
  currentMonth: string;
  isEditMode: boolean;
  assignedPersonIds: string[];
  allPersons: Person[];
  monthPersons?: Person[];
  events: CalendarEvent[];
  highlightedPerson: Person | null;
  isHighlightedPersonAvailable: boolean;
  isPersonAvailable: (personId: string, dayNumber: number) => boolean;
  onOpenEvents: () => void;
  onRemovePerson: (personId: string) => void;
  onAddPerson: (personId: string) => void;
}

export function DayCell({
  dayInfo,
  currentMonth,
  isEditMode,
  assignedPersonIds,
  allPersons,
  monthPersons,
  events,
  highlightedPerson,
  isHighlightedPersonAvailable,
  isPersonAvailable,
  onOpenEvents,
  onRemovePerson,
  onAddPerson,
}: DayCellProps) {
  const { dayNumber, isCurrentMonth, isToday, dateStr } = dayInfo;
  const hasEvents = events.length > 0;
  const personMap = new Map<string, Person>(allPersons.map((p) => [p.id, p]));

  // Background styling when a person's availability is being highlighted
  const isTargetOfHighlight = highlightedPerson && isHighlightedPersonAvailable && isCurrentMonth;

  return (
    <div
      className={`min-h-[110px] md:min-h-[125px] border-b border-r border-slate-200 dark:border-slate-800 p-2 flex flex-col justify-between transition-all relative ${
        !isCurrentMonth
          ? 'bg-slate-50/70 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600'
          : isTargetOfHighlight
          ? 'bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-inset ring-amber-400/50 dark:ring-amber-500/40'
          : isToday
          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-inset ring-indigo-200 dark:ring-indigo-800/60 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40'
          : 'bg-white dark:bg-slate-900 hover:bg-slate-50/30 dark:hover:bg-slate-800/30'
      }`}
    >
      {/* Top Header of the Cell */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {/* Day number: RED if has 1 or more events */}
          <span
            className={`text-sm font-semibold inline-flex items-center justify-center transition-colors ${
              hasEvents
                ? 'text-red-600 font-extrabold dark:text-red-400 bg-red-50 dark:bg-red-950/60 w-6 h-6 rounded-full'
                : isToday
                ? 'text-indigo-600 dark:text-indigo-400 font-bold px-1'
                : isCurrentMonth
                ? 'text-slate-800 dark:text-slate-200'
                : 'text-slate-400 dark:text-slate-600'
            }`}
          >
            {dayNumber}
          </span>

          {/* Highlight indicator */}
          {isTargetOfHighlight && (
            <span
              className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded-full"
              title={`${highlightedPerson.name} marcou disponibilidade`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              Disp.
            </span>
          )}
        </div>

        {/* Discreet Calendar / Event Button */}
        <button
          type="button"
          onClick={onOpenEvents}
          title={
            hasEvents
              ? `${events.length} evento(s) neste dia. Clique para ver/editar.`
              : 'Ver ou adicionar eventos do dia'
          }
          className={`p-1 rounded-md text-xs transition flex items-center gap-0.5 ${
            hasEvents
              ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 font-semibold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          {hasEvents && (
            <span className="text-[10px] font-bold leading-none bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center">
              {events.length}
            </span>
          )}
        </button>
      </div>

      {/* Body of the Cell */}
      <div className="flex-1 flex flex-col justify-center">
        {/* READ-ONLY MODE */}
        {!isEditMode && (
          <div className="space-y-1">
            {assignedPersonIds.length === 0 ? (
              <div className="text-center py-1">
                <span className="text-[11px] text-slate-300 dark:text-slate-600 italic">Vago</span>
              </div>
            ) : (
              assignedPersonIds.map((personId) => {
                const person = personMap.get(personId);
                if (!person) return null;

                return (
                  <div
                    key={personId}
                    style={{ backgroundColor: person.color }}
                    className="text-white text-xs font-semibold px-2 py-1 rounded-lg shadow-2xs flex items-center justify-between truncate"
                    title={person.name}
                  >
                    <span className="truncate">{person.name}</span>
                  </div>
                );
              })
            )}

            {/* Warning if multiple people are assigned in reading mode */}
            {assignedPersonIds.length > 1 && (
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800 block text-center">
                Conflito: {assignedPersonIds.length} escalados
              </span>
            )}
          </div>
        )}

        {/* EDIT MODE */}
        {isEditMode && (
          <div className="space-y-1.5">
            {/* Candidate / Assigned Tags with '✕' remove button */}
            <div className="flex flex-wrap gap-1">
              {assignedPersonIds.map((personId) => {
                const person = personMap.get(personId);
                if (!person) return null;

                return (
                  <div
                    key={personId}
                    style={{ backgroundColor: person.color }}
                    className="group inline-flex items-center gap-1 text-white text-[11px] font-semibold pl-2 pr-1 py-0.5 rounded-md shadow-2xs transition-all max-w-full"
                    title={person.name}
                  >
                    <span className="truncate">{person.name}</span>
                    <button
                      type="button"
                      onClick={() => onRemovePerson(personId)}
                      title={`Remover ${person.name} deste dia`}
                      className="w-4 h-4 rounded hover:bg-black/20 flex items-center justify-center shrink-0 transition"
                    >
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add person candidate button '+' */}
            <div className="pt-0.5 flex items-center justify-between">
              <CandidatePicker
                dateStr={dateStr}
                dayNumber={dayNumber}
                month={currentMonth}
                assignedPersonIds={assignedPersonIds}
                allPersons={monthPersons || allPersons}
                isPersonAvailable={isPersonAvailable}
                onSelectPerson={(personId) => {
                  if (isPersonAvailable(personId, dayNumber)) {
                    onAddPerson(personId);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Subtle indicator if today */}
      {isToday && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-indigo-600 rounded-bl-sm" />
      )}
    </div>
  );
};
