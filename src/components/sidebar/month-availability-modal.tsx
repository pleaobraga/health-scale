import { Calendar, X, Clock, Layers } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { AvailabilityMiniCalendar } from './availability-mini-calendar'
import { formatMonthYear } from '../../utils/date-utils'

import type { Person, ShiftDefinition } from '../../types'

export interface MonthAvailabilityModalProps {
  isOpen: boolean
  onClose: () => void
  person: Person | null
  currentMonth: string
  initialAvailableDays: number[]
  initialShiftAvailability?: Record<string, number[]>
  activeShifts?: ShiftDefinition[]
  onSave: (
    personId: string,
    availableDays: number[],
    shiftAvailability?: Record<string, number[]>
  ) => void
}

export function MonthAvailabilityModal({
  isOpen,
  onClose,
  person,
  currentMonth,
  initialAvailableDays,
  initialShiftAvailability = {},
  activeShifts = [],
  onSave,
}: MonthAvailabilityModalProps) {
  const { t, i18n } = useTranslation(['people', 'common'])
  const [availableDays, setAvailableDays] = useState<number[]>([])
  const [shiftAvailability, setShiftAvailability] =
    useState<Record<string, number[]>>(initialShiftAvailability)
  const [selectedShiftId, setSelectedShiftId] = useState<string>(activeShifts[0]?.id || '')

  const hasMultipleShifts = activeShifts.length > 0

  useEffect(() => {
    if (person && isOpen) {
      setAvailableDays(initialAvailableDays || [])

      const safeShiftAvail: Record<string, number[]> = { ...(initialShiftAvailability || {}) }
      // If no shift availability was previously recorded but person had general availableDays
      if (
        Object.keys(safeShiftAvail).length === 0 &&
        initialAvailableDays &&
        initialAvailableDays.length > 0 &&
        activeShifts.length > 0
      ) {
        activeShifts.forEach((s) => {
          safeShiftAvail[s.id] = [...initialAvailableDays]
        })
      }
      setShiftAvailability(safeShiftAvail)
      setSelectedShiftId(activeShifts[0]?.id || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, person?.id])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !person || typeof document === 'undefined') return null

  const currentSelectedShift = activeShifts.find((s) => s.id === selectedShiftId)

  // Union of all days across all shifts
  const uniqueDaysUnion = hasMultipleShifts
    ? Array.from(new Set(Object.values(shiftAvailability).flat())).sort((a, b) => a - b)
    : availableDays

  const handleShiftDaysChange = (newDays: number[]) => {
    if (!selectedShiftId) return
    const updated = {
      ...shiftAvailability,
      [selectedShiftId]: newDays,
    }
    setShiftAvailability(updated)
  }

  const handleSave = () => {
    if (hasMultipleShifts) {
      onSave(person.id, uniqueDaysUnion, shiftAvailability)
    } else {
      onSave(person.id, availableDays)
    }
    onClose()
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="month-avail-modal-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0"
              style={{ backgroundColor: person.color }}
            >
              {person.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3
                id="month-avail-modal-title"
                className="text-base font-bold text-slate-900 dark:text-white truncate max-w-[240px]"
              >
                {t('people:monthAvailability.title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {person.name} • {formatMonthYear(currentMonth, i18n.language)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            title={t('common:close')}
            aria-label={t('common:close')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
          <div className="flex items-center gap-2 p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span
              dangerouslySetInnerHTML={{
                __html: t('people:monthAvailability.instruction', { name: person.name }),
              }}
            />
          </div>

          {/* Shift Selection Tabs for multi-shift months */}
          {hasMultipleShifts && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                {t('people:monthAvailability.shiftsLabel')}
              </label>

              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
                {activeShifts.map((shift) => {
                  const count = (shiftAvailability[shift.id] || []).length
                  const isSelected = selectedShiftId === shift.id

                  return (
                    <button
                      key={shift.id}
                      type="button"
                      onClick={() => setSelectedShiftId(shift.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: shift.color || '#6366F1' }}
                      />
                      <span>
                        {shift.name} ({shift.code})
                      </span>
                      {count > 0 && (
                        <span
                          className="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold text-white"
                          style={{ backgroundColor: shift.color || '#6366F1' }}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {currentSelectedShift && (
                <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="px-1.5 py-0.2 rounded text-[10px] font-black text-white uppercase"
                      style={{ backgroundColor: currentSelectedShift.color || '#3B82F6' }}
                    >
                      {currentSelectedShift.code}
                    </span>
                    <span>{currentSelectedShift.name}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>
                      {t('people:monthAvailability.shiftDuration', {
                        time: currentSelectedShift.startTime,
                        hours: currentSelectedShift.durationHours,
                      })}
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mini Calendar */}
          <AvailabilityMiniCalendar
            month={currentMonth}
            selectedDays={
              hasMultipleShifts
                ? shiftAvailability[selectedShiftId] || []
                : availableDays
            }
            onChange={hasMultipleShifts ? handleShiftDaysChange : setAvailableDays}
            accentColor={currentSelectedShift?.color || person.color}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex flex-col text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>
              {hasMultipleShifts
                ? t('people:monthAvailability.totalAvailableDays', {
                    count: uniqueDaysUnion.length,
                  })
                : availableDays.length === 1
                ? t('people:monthAvailability.markedDays', { count: availableDays.length })
                : t('people:monthAvailability.markedDaysPlural', { count: availableDays.length })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {t('people:monthAvailability.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-xs transition cursor-pointer"
            >
              {t('people:monthAvailability.save')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
