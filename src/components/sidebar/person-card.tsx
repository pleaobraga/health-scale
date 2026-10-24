import { Edit2, Eye, EyeOff, CalendarCheck, CalendarPlus, Check, UserMinus } from 'lucide-react'
import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { computePopoverPosition } from '../../utils/popover-position'

import type { Person, ShiftDefinition } from '../../types'

export interface ShiftOption {
  shift: ShiftDefinition
  daysCount: number
}

export interface PersonCardProps {
  person: Person
  availableDaysCount: number
  workingDaysCount?: number
  isHighlighted: boolean
  isScheduledHighlighted?: boolean
  isEditMode?: boolean
  availableShifts?: ShiftOption[]
  onToggleHighlight: () => void
  onToggleScheduledHighlight?: () => void
  onEdit: () => void
  onInsertAllDays: (shiftId?: string) => void
  onRemoveFromMonth?: () => void
}

export function PersonCard({
  person,
  availableDaysCount,
  workingDaysCount = 0,
  isHighlighted,
  isScheduledHighlighted = false,
  isEditMode = false,
  availableShifts = [],
  onToggleHighlight,
  onToggleScheduledHighlight,
  onEdit,
  onInsertAllDays,
  onRemoveFromMonth,
}: PersonCardProps) {
  const { t } = useTranslation(['people', 'common'])
  const [justInserted, setJustInserted] = useState(false)
  const [isBalloonOpen, setIsBalloonOpen] = useState(false)
  const [balloonPosition, setBalloonPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const balloonRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const canInsertAllDays = isEditMode && availableDaysCount > 0
  const hasMultipleShifts = isEditMode && availableShifts && availableShifts.length > 1
  const hasAvailability = availableDaysCount > 0
  const hasWorkingDays = workingDaysCount > 0

  const highlightTooltip = !hasAvailability
    ? t('people:card.noAvailabilityTooltip')
    : isHighlighted
      ? t('people:card.hideHighlightTooltip')
      : t('people:card.showHighlightTooltip')

  const scheduledHighlightTooltip = !hasWorkingDays
    ? t('people:card.noScheduledDaysTooltip')
    : isScheduledHighlighted
      ? t('people:card.hideScheduledHighlightTooltip')
      : t('people:card.showScheduledHighlightTooltip')

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const balloonWidth = balloonRef.current?.offsetWidth || 256
    const balloonHeight = balloonRef.current?.offsetHeight || 220

    setBalloonPosition(
      computePopoverPosition({
        triggerRect: rect,
        menuWidth: balloonWidth,
        menuHeight: balloonHeight,
        align: 'right',
        preferPlacement: 'bottom',
      })
    )
  }, [])

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasMultipleShifts) {
      if (!isBalloonOpen) {
        updatePosition()
        setIsBalloonOpen(true)
      } else {
        setIsBalloonOpen(false)
      }
    } else {
      const shiftId = availableShifts?.[0]?.shift.id
      onInsertAllDays(shiftId)
      setJustInserted(true)
      setTimeout(() => setJustInserted(false), 1500)
    }
  }

  const handleSelectShiftOption = (shiftId?: string) => {
    setIsBalloonOpen(false)
    onInsertAllDays(shiftId)
    setJustInserted(true)
    setTimeout(() => setJustInserted(false), 1500)
  }

  useLayoutEffect(() => {
    if (isBalloonOpen) {
      updatePosition()
    }
  }, [isBalloonOpen, availableShifts.length, updatePosition])

  // Click outside, scroll, resize and Escape key to handle balloon
  useEffect(() => {
    if (!isBalloonOpen) return

    updatePosition()

    const handleScrollOrResize = () => {
      updatePosition()
    }

    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)

    const handleClickOutside = (ev: MouseEvent) => {
      if (
        balloonRef.current &&
        !balloonRef.current.contains(ev.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(ev.target as Node)
      ) {
        setIsBalloonOpen(false)
      }
    }
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        setIsBalloonOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isBalloonOpen, updatePosition])

  const workingDayLabel = workingDaysCount === 1 ? t('people:card.dayLabel') : t('people:card.dayLabelPlural')
  const availableDayLabel = availableDaysCount === 1 ? t('people:card.dayLabel') : t('people:card.dayLabelPlural')

  return (
    <div
      className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all ${
        isHighlighted
          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
          : isScheduledHighlighted
          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20 shadow-xs'
          : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs'
      }`}
    >
      {/* Left: Color dot & Name & Days info */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
          style={{ backgroundColor: person.color }}
        />
        <div className="truncate">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate" title={person.name}>
            {person.name}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span
              className="font-semibold text-indigo-600 dark:text-indigo-400"
              title={t('people:card.workingDaysTooltip', { count: workingDaysCount, dayLabel: workingDayLabel })}
            >
              {workingDaysCount === 1
                ? t('people:card.workingDays', { count: workingDaysCount })
                : t('people:card.workingDaysPlural', { count: workingDaysCount })}
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span
              title={t('people:card.availableDaysTooltip', { count: availableDaysCount, dayLabel: availableDayLabel })}
            >
              {availableDaysCount === 1
                ? t('people:card.availableDays', { count: availableDaysCount })
                : t('people:card.availableDaysPlural', { count: availableDaysCount })}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Insert all days into calendar - Only visible in Edit Mode and if person has available days */}
        {canInsertAllDays && (
          <div>
            <button
              ref={buttonRef}
              type="button"
              onClick={handleButtonClick}
              title={
                justInserted
                  ? t('people:card.insertedFeedback')
                  : t('people:card.insertTooltip', { count: availableDaysCount, name: person.name })
              }
              aria-label={t('people:card.insertAria', { name: person.name })}
              className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                justInserted
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isBalloonOpen
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
              }`}
            >
              {justInserted ? (
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <CalendarPlus className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Balão / Popover de seleção de escala renderizado no body via Portal */}
            {isBalloonOpen &&
              hasMultipleShifts &&
              typeof document !== 'undefined' &&
              createPortal(
                <div
                  ref={balloonRef}
                  data-testid="shift-selection-balloon"
                  role="dialog"
                  aria-label={t('people:card.selectShiftTitle')}
                  style={{
                    position: 'fixed',
                    top: `${balloonPosition.top}px`,
                    left: `${balloonPosition.left}px`,
                    maxHeight: 'calc(100vh - 24px)',
                    zIndex: 9999,
                  }}
                  className="w-64 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl animate-fadeIn flex flex-col overflow-hidden"
                >
                  <div className="px-2 py-1 mb-1 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      {t('people:card.selectShiftTitle')}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      {t('people:card.selectShiftSubtitle')}
                    </p>
                  </div>

                  <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {availableShifts.map(({ shift, daysCount }) => (
                      <button
                        key={shift.id}
                        type="button"
                        onClick={() => handleSelectShiftOption(shift.id)}
                        className="w-full text-left px-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-between gap-2 cursor-pointer group"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            style={{ backgroundColor: shift.color }}
                            className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm text-white shrink-0 shadow-2xs"
                          >
                            {shift.code}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {shift.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
                          {daysCount} {daysCount === 1 ? t('people:card.dayLabel') : t('people:card.dayLabelPlural')}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleSelectShiftOption(undefined)}
                      className="w-full text-left px-2 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span>{t('people:card.allShiftsOption')}</span>
                      <span className="text-[10px] font-semibold text-indigo-500">
                        {availableDaysCount} {availableDaysCount === 1 ? t('people:card.dayLabel') : t('people:card.dayLabelPlural')}
                      </span>
                    </button>
                  </div>
                </div>,
                document.body
              )}
          </div>
        )}

        {/* Toggle View Scheduled Days */}
        <button
          type="button"
          disabled={!hasWorkingDays}
          onClick={onToggleScheduledHighlight}
          title={scheduledHighlightTooltip}
          aria-label={scheduledHighlightTooltip}
          data-testid={`toggle-scheduled-highlight-${person.id}`}
          className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
            !hasWorkingDays
              ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'
              : isScheduledHighlighted
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
        </button>

        {/* Toggle View Availability (hidden on small screens) */}
        <button
          type="button"
          disabled={!hasAvailability}
          onClick={onToggleHighlight}
          title={highlightTooltip}
          aria-label={highlightTooltip}
          className={`mobile:hidden p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
            !hasAvailability
              ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'
              : isHighlighted
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
          }`}
        >
          {isHighlighted ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>

        {/* Edit Availability Button */}
        <button
          type="button"
          onClick={onEdit}
          title={t('people:card.editAvailabilityTooltip')}
          aria-label={t('people:card.editAvailabilityAria', { name: person.name })}
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        {/* Remove from Month Button */}
        {onRemoveFromMonth && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemoveFromMonth()
            }}
            title={t('people:card.removeFromMonthTooltip', { name: person.name })}
            aria-label={t('people:card.removeFromMonthAria', { name: person.name })}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          >
            <UserMinus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
