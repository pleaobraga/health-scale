import { Calendar as CalendarIcon, X, Sparkles, AlertCircle, Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CandidatePicker } from './candidate-picker'
import { useScheduleStore } from '../../store/use-schedule-store'
import { formatDisplayDate } from '../../utils/date-utils'
import { AddDayShiftModal } from '../modals/add-day-shift-modal'
import { DayViolationsModal } from '../modals/day-violations-modal'

import type { Person, CalendarEvent, ValidationError, ShiftDefinition } from '../../types'
import type { CalendarDayInfo } from '../../utils/date-utils'

export interface DayCellProps {
  dayInfo: CalendarDayInfo
  currentMonth: string
  isEditMode: boolean
  assignedPersonIds: string[]
  dayShiftMap?: Record<string, string>
  activeShifts?: ShiftDefinition[]
  allPersons: Person[]
  monthPersons?: Person[]
  events: CalendarEvent[]
  highlightedPerson: Person | null
  isHighlightedPersonAvailable: boolean
  isPersonAvailable: (personId: string, dayNumber: number, shiftId?: string) => boolean
  violations?: ValidationError[]
  onOpenEvents: () => void
  onRemovePerson: (personId: string) => void
  onAddPerson: (personId: string, shiftId?: string) => void
  onAssignPersonToShift?: (shiftId: string, personId: string) => void
  onRemovePersonFromShift?: (shiftId: string) => void
}

export function DayCell({
  dayInfo,
  currentMonth,
  isEditMode,
  assignedPersonIds,
  dayShiftMap,
  activeShifts,
  allPersons,
  monthPersons,
  events,
  highlightedPerson,
  isHighlightedPersonAvailable,
  isPersonAvailable,
  violations,
  onOpenEvents,
  onRemovePerson,
  onAddPerson,
  onAssignPersonToShift,
  onRemovePersonFromShift,
}: DayCellProps) {
  const { t } = useTranslation(['calendar', 'common'])
  const { dayNumber, isCurrentMonth, isToday, dateStr } = dayInfo
  const hasEvents = events.length > 0
  const personMap = new Map<string, Person>(allPersons.map((p) => [p.id, p]))

  const [isViolationsModalOpen, setIsViolationsModalOpen] = useState(false)
  const [isAddShiftModalOpen, setIsAddShiftModalOpen] = useState(false)
  const shiftRules = useScheduleStore((state) => state.shiftRules)
  const shiftDefinitions = useScheduleStore((state) => state.shiftDefinitions)

  const getPersonShift = (personId: string): ShiftDefinition | undefined => {
    if (dayShiftMap) {
      const shiftId = Object.entries(dayShiftMap).find(([, pId]) => pId === personId)?.[0]
      if (shiftId) {
        const found =
          (activeShifts || []).find((s) => s.id === shiftId) ||
          shiftDefinitions.find((s) => s.id === shiftId)
        if (found) return found
      }
    }
    if (activeShifts && activeShifts.length > 0) {
      const idx = assignedPersonIds.indexOf(personId)
      if (idx >= 0 && idx < activeShifts.length) {
        return activeShifts[idx]
      }
      return activeShifts[0]
    }
    return shiftDefinitions[0]
  }

  // Background styling when a person's availability is being highlighted
  const isTargetOfHighlight = highlightedPerson && isHighlightedPersonAvailable && isCurrentMonth

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
              title={t('calendar:dayCell.markedAvailability', { name: highlightedPerson.name })}
            >
              <Sparkles className="w-2.5 h-2.5" />
              {t('calendar:dayCell.disp')}
            </span>
          )}

          {/* Validation Violations Indicator Button */}
          {violations && violations.length > 0 && (
            <button
              type="button"
              onClick={() => setIsViolationsModalOpen(true)}
              className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border transition hover:scale-105 active:scale-95 cursor-pointer ${
                violations.some((v) => v.severity === 'error')
                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-200 dark:hover:bg-rose-900/80'
                  : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/80'
              }`}
              title={violations.map((v) => v.message).join('\n')}
              aria-label={t('calendar:validation.auditButtonTooltip')}
            >
              <AlertCircle className="w-2.5 h-2.5 shrink-0" />
              <span>{violations.length}</span>
            </button>
          )}
        </div>

        {/* Discreet Calendar / Event Button */}
        <button
          type="button"
          onClick={onOpenEvents}
          title={
            hasEvents
              ? t('calendar:dayCell.eventsTooltip', { count: events.length })
              : t('calendar:dayCell.viewOrAddEvents')
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
            {activeShifts && activeShifts.length > 0 ? (
              <>
                {activeShifts.map((shift) => {
                  const personId = dayShiftMap ? dayShiftMap[shift.id] : undefined
                  const fallbackPersonId =
                    !personId && activeShifts.length === 1 && assignedPersonIds.length === 1
                      ? assignedPersonIds[0]
                      : undefined
                  const finalPersonId = personId || fallbackPersonId
                  const person = finalPersonId ? personMap.get(finalPersonId) : undefined

                  if (person) {
                    return (
                      <div
                        key={shift.id}
                        style={{ backgroundColor: person.color }}
                        className="text-white text-xs font-semibold px-1.5 py-1 rounded-lg shadow-2xs flex items-center justify-between gap-1 truncate"
                        title={`${shift.name}: ${person.name}`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            data-testid={`shift-badge-${dateStr}-${shift.code}`}
                            className="text-[9px] font-black uppercase px-1 py-0.2 rounded shrink-0 shadow-xs"
                            style={{
                              backgroundColor: shift.color || 'rgba(0,0,0,0.3)',
                              color: '#FFFFFF',
                            }}
                          >
                            {shift.code}
                          </span>
                          <span className="truncate">{person.name}</span>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={shift.id}
                      className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                    >
                      <span
                        className="text-[9px] font-bold uppercase px-1 py-0.2 rounded shrink-0 opacity-70"
                        style={{
                          backgroundColor: shift.color || '#94A3B8',
                          color: '#FFFFFF',
                        }}
                      >
                        {shift.code}
                      </span>
                      <span className="text-[10px] italic">{t('calendar:dayCell.vacant')}</span>
                    </div>
                  )
                })}

                {/* Legacy or extra unallocated persons */}
                {assignedPersonIds
                  .filter(
                    (pId) =>
                      !(dayShiftMap && Object.values(dayShiftMap).includes(pId)) &&
                      !(activeShifts.length === 1 && assignedPersonIds.length === 1)
                  )
                  .map((pId) => {
                    const p = personMap.get(pId)
                    if (!p) return null
                    const pShift = getPersonShift(pId)
                    return (
                      <div
                        key={pId}
                        style={{ backgroundColor: p.color }}
                        className="text-white text-xs font-semibold px-1.5 py-1 rounded-lg shadow-2xs flex items-center justify-between gap-1 truncate"
                        title={pShift ? `${pShift.name}: ${p.name}` : p.name}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {pShift && (
                            <span
                              data-testid={`shift-badge-${dateStr}-${pShift.code}`}
                              className="text-[9px] font-black uppercase px-1 py-0.2 rounded shrink-0 shadow-xs"
                              style={{
                                backgroundColor: pShift.color || 'rgba(0,0,0,0.3)',
                                color: '#FFFFFF',
                              }}
                            >
                              {pShift.code}
                            </span>
                          )}
                          <span className="truncate">{p.name}</span>
                        </div>
                      </div>
                    )
                  })}
              </>
            ) : assignedPersonIds.length === 0 ? (
              activeShifts && activeShifts.length > 0 ? (
                <div className="text-center py-1">
                  <span className="text-[11px] text-slate-300 dark:text-slate-600 italic">
                    {t('calendar:dayCell.vacant')}
                  </span>
                </div>
              ) : null
            ) : (
              assignedPersonIds.map((personId) => {
                const person = personMap.get(personId)
                if (!person) return null
                const pShift = getPersonShift(personId)

                return (
                  <div
                    key={personId}
                    style={{ backgroundColor: person.color }}
                    className="text-white text-xs font-semibold px-1.5 py-1 rounded-lg shadow-2xs flex items-center justify-between gap-1 truncate"
                    title={pShift ? `${pShift.name}: ${person.name}` : person.name}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {pShift && (
                        <span
                          data-testid={`shift-badge-${dateStr}-${pShift.code}`}
                          className="text-[9px] font-black uppercase px-1 py-0.2 rounded shrink-0 shadow-xs"
                          style={{
                            backgroundColor: pShift.color || 'rgba(0,0,0,0.3)',
                            color: '#FFFFFF',
                          }}
                        >
                          {pShift.code}
                        </span>
                      )}
                      <span className="truncate">{person.name}</span>
                    </div>
                  </div>
                )
              })
            )}

            {/* Warning if multiple people are assigned in reading mode without distinct shift slots */}
            {assignedPersonIds.length > 1 &&
              (!activeShifts ||
                activeShifts.length <= 1 ||
                !dayShiftMap ||
                Object.keys(dayShiftMap).length <= 1) && (
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800 block text-center">
                  {t('calendar:dayCell.conflict', { count: assignedPersonIds.length })}
                </span>
              )}
          </div>
        )}

        {/* EDIT MODE */}
        {isEditMode && (
          <div className="space-y-1.5">
            {activeShifts && activeShifts.length > 1 ? (
              <>
                {/* Render filled shifts */}
                <div className="space-y-1">
                  {activeShifts.map((shift) => {
                    const personId = dayShiftMap ? dayShiftMap[shift.id] : undefined
                    const person = personId ? personMap.get(personId) : undefined
                    if (!person) return null

                    return (
                      <div
                        key={shift.id}
                        style={{ backgroundColor: person.color }}
                        className="group flex items-center justify-between gap-1 text-white text-[11px] font-semibold pl-1.5 pr-1 py-0.5 rounded-md shadow-2xs transition-all max-w-full"
                        title={`${shift.name}: ${person.name}`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            data-testid={`shift-badge-${dateStr}-${shift.code}`}
                            className="text-[9px] font-black uppercase px-1 py-0.2 rounded shrink-0 shadow-xs"
                            style={{
                              backgroundColor: shift.color || 'rgba(0,0,0,0.3)',
                              color: '#FFFFFF',
                            }}
                          >
                            {shift.code}
                          </span>
                          <span className="truncate">{person.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onRemovePersonFromShift) {
                              onRemovePersonFromShift(shift.id)
                            } else {
                              onRemovePerson(person.id)
                            }
                          }}
                          title={t('calendar:dayCell.removePersonTooltip', { name: person.name })}
                          className="w-4 h-4 rounded hover:bg-black/25 flex items-center justify-center shrink-0 transition cursor-pointer"
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Legacy or extra unallocated persons in edit mode */}
                {assignedPersonIds
                  .filter((pId) => !(dayShiftMap && Object.values(dayShiftMap).includes(pId)))
                  .map((pId) => {
                    const p = personMap.get(pId)
                    if (!p) return null
                    const pShift = getPersonShift(pId)
                    return (
                      <div
                        key={pId}
                        style={{ backgroundColor: p.color }}
                        className="group flex items-center justify-between gap-1 text-white text-[11px] font-semibold pl-1.5 pr-1 py-0.5 rounded-md shadow-2xs transition-all max-w-full"
                        title={pShift ? `${pShift.name}: ${p.name}` : p.name}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {pShift && (
                            <span
                              data-testid={`shift-badge-${dateStr}-${pShift.code}`}
                              className="text-[9px] font-black uppercase px-1 py-0.2 rounded shrink-0 shadow-xs"
                              style={{
                                backgroundColor: pShift.color || 'rgba(0,0,0,0.3)',
                                color: '#FFFFFF',
                              }}
                            >
                              {pShift.code}
                            </span>
                          )}
                          <span className="truncate">{p.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemovePerson(pId)}
                          title={t('calendar:dayCell.removePersonTooltip', { name: p.name })}
                          className="w-4 h-4 rounded hover:bg-black/20 flex items-center justify-center shrink-0 transition cursor-pointer"
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    )
                  })}

                {/* Single Add button opening modal for multi-shift days */}
                <div className="pt-0.5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsAddShiftModalOpen(true)}
                    className="flex items-center gap-1 text-[11px] font-medium p-1 sm:px-2 sm:py-0.5 rounded-md border transition bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 cursor-pointer"
                    title={t('calendar:dayCell.addPersonTooltip')}
                    aria-label={t('calendar:dayCell.addPerson')}
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-slate-600 dark:text-slate-400" />
                    <span className="hidden sm:inline">{t('calendar:dayCell.addPerson')}</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Fallback candidate tags when only 1 active shift or none */}
                <div className="space-y-1">
                  {assignedPersonIds.map((personId) => {
                    const person = personMap.get(personId)
                    if (!person) return null
                    const pShift = getPersonShift(personId)

                    return (
                      <div
                        key={personId}
                        style={{ backgroundColor: person.color }}
                        className="group flex items-center justify-between gap-1 text-white text-[11px] font-semibold pl-1.5 pr-1 py-0.5 rounded-md shadow-2xs transition-all max-w-full"
                        title={pShift ? `${pShift.name}: ${person.name}` : person.name}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {pShift && (
                            <span
                              data-testid={`shift-badge-${dateStr}-${pShift.code}`}
                              className="text-[9px] font-black uppercase px-1 py-0.2 rounded shrink-0 shadow-xs"
                              style={{
                                backgroundColor: pShift.color || 'rgba(0,0,0,0.3)',
                                color: '#FFFFFF',
                              }}
                            >
                              {pShift.code}
                            </span>
                          )}
                          <span className="truncate">{person.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemovePerson(personId)}
                          title={t('calendar:dayCell.removePersonTooltip', { name: person.name })}
                          className="w-4 h-4 rounded hover:bg-black/20 flex items-center justify-center shrink-0 transition cursor-pointer"
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Inline CandidatePicker for single shift / fallback */}
                {activeShifts && activeShifts.length > 0 && (
                  <div className="pt-0.5 flex items-center justify-between">
                    <CandidatePicker
                      dateStr={dateStr}
                      dayNumber={dayNumber}
                      month={currentMonth}
                      assignedPersonIds={assignedPersonIds}
                      allPersons={monthPersons || allPersons}
                      isPersonAvailable={isPersonAvailable}
                      shiftId={activeShifts?.[0]?.id}
                      shiftCode={activeShifts?.[0]?.code}
                      shiftName={activeShifts?.[0]?.name}
                      onSelectPerson={(personId) => {
                        if (isPersonAvailable(personId, dayNumber, activeShifts?.[0]?.id)) {
                          if (activeShifts?.[0]?.id && onAssignPersonToShift) {
                            onAssignPersonToShift(activeShifts[0].id, personId)
                          } else {
                            onAddPerson(personId)
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Subtle indicator if today */}
      {isToday && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-indigo-600 rounded-bl-sm" />
      )}

      {/* Interactive Day Violations Modal */}
      {violations && violations.length > 0 && (
        <DayViolationsModal
          isOpen={isViolationsModalOpen}
          onClose={() => setIsViolationsModalOpen(false)}
          dateStr={dateStr}
          formattedDate={formatDisplayDate(dateStr)}
          violations={violations}
          allPersons={allPersons}
          shiftRules={shiftRules}
        />
      )}

      {/* Multi-shift Day Assignment Modal */}
      {activeShifts && activeShifts.length > 1 && (
        <AddDayShiftModal
          isOpen={isAddShiftModalOpen}
          onClose={() => setIsAddShiftModalOpen(false)}
          dateStr={dateStr}
          formattedDate={formatDisplayDate(dateStr)}
          dayNumber={dayNumber}
          activeShifts={activeShifts}
          dayShiftMap={dayShiftMap}
          allPersons={allPersons}
          monthPersons={monthPersons}
          isPersonAvailable={isPersonAvailable}
          onAssignPersonToShift={(shiftId, personId) => {
            if (onAssignPersonToShift) {
              onAssignPersonToShift(shiftId, personId)
            } else {
              onAddPerson(personId, shiftId)
            }
          }}
        />
      )}
    </div>
  )
}
