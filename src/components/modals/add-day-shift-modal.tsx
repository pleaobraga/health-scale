import { X, Check, Clock, Calendar, UserCheck, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import type { Person, ShiftDefinition } from '../../types'

export interface AddDayShiftModalProps {
  isOpen: boolean
  onClose: () => void
  dateStr: string
  formattedDate: string
  dayNumber: number
  activeShifts: ShiftDefinition[]
  dayShiftMap?: Record<string, string>
  allPersons: Person[]
  monthPersons?: Person[]
  isPersonAvailable: (personId: string, dayNumber: number, shiftId?: string) => boolean
  onAssignPersonToShift: (shiftId: string, personId: string) => void
}

export function AddDayShiftModal({
  isOpen,
  onClose,
  dateStr,
  formattedDate,
  dayNumber,
  activeShifts,
  dayShiftMap = {},
  allPersons,
  monthPersons,
  isPersonAvailable,
  onAssignPersonToShift,
}: AddDayShiftModalProps) {
  const { t } = useTranslation(['calendar', 'common'])

  // Find first vacant shift or fallback to first shift
  const initialShiftId =
    activeShifts.find((s) => !dayShiftMap[s.id])?.id || activeShifts[0]?.id || ''

  const [selectedShiftId, setSelectedShiftId] = useState<string>(initialShiftId)
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const vacantId =
        activeShifts.find((s) => !dayShiftMap[s.id])?.id || activeShifts[0]?.id || ''
      setSelectedShiftId(vacantId)
      setSelectedPersonId(dayShiftMap[vacantId] || null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, dateStr])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  const personMap = new Map<string, Person>(allPersons.map((p) => [p.id, p]))
  const candidatesPool = monthPersons || allPersons

  const currentShift = activeShifts.find((s) => s.id === selectedShiftId)

  // Segregate candidates for the selected shift
  const availableCandidates = candidatesPool.filter((p) =>
    isPersonAvailable(p.id, dayNumber, selectedShiftId)
  )
  const unavailableCandidates = candidatesPool.filter(
    (p) => !isPersonAvailable(p.id, dayNumber, selectedShiftId)
  )

  const handleConfirm = () => {
    if (!selectedShiftId || !selectedPersonId) return
    onAssignPersonToShift(selectedShiftId, selectedPersonId)
    onClose()
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-day-shift-modal-title"
      className="modal-overlay fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="add-day-shift-modal-title"
                className="text-base font-bold text-slate-900 dark:text-white"
              >
                {t('calendar:addShiftModal.title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {formattedDate}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          {/* STEP 1: Choose Shift / Escala */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t('calendar:addShiftModal.step1Shift')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeShifts.map((shift) => {
                const isSelected = selectedShiftId === shift.id
                const occupiedPersonId = dayShiftMap[shift.id]
                const occupiedPerson = occupiedPersonId ? personMap.get(occupiedPersonId) : null

                return (
                  <button
                    key={shift.id}
                    type="button"
                    onClick={() => {
                      setSelectedShiftId(shift.id)
                      // Reset selected person if switching shifts
                      if (selectedPersonId !== occupiedPersonId) {
                        setSelectedPersonId(null)
                      }
                    }}
                    className={`text-left p-3 rounded-2xl border transition relative flex flex-col justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className="px-2 py-0.5 rounded-sm text-[11px] font-black text-white uppercase shadow-2xs"
                        style={{ backgroundColor: shift.color || '#3B82F6' }}
                      >
                        {shift.code}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{shift.startTime}</span>
                        <span>({t('calendar:addShiftModal.durationHours', { hours: shift.durationHours })})</span>
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {shift.name}
                      </div>
                      <div className="text-[10px] mt-0.5 font-medium">
                        {occupiedPerson ? (
                          <span className="text-amber-700 dark:text-amber-300 flex items-center gap-1">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: occupiedPerson.color }}
                            />
                            <span className="truncate">
                              {t('calendar:addShiftModal.alreadyOccupied', {
                                name: occupiedPerson.name,
                              })}
                            </span>
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-3" />
                            <span>{t('calendar:addShiftModal.vacant')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* STEP 2: Choose Person */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t('calendar:addShiftModal.step2Person')}
              </label>
              {currentShift && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {currentShift.name} ({currentShift.code})
                </span>
              )}
            </div>

            {/* Available candidates */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                {t('calendar:addShiftModal.availableCandidates', {
                  count: availableCandidates.length,
                })}
              </span>

              {availableCandidates.length === 0 ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/80 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-300 font-medium text-center">
                  {t('calendar:addShiftModal.noAvailableCandidates')}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-0.5 custom-scrollbar">
                  {availableCandidates.map((person) => {
                    const isSelected = selectedPersonId === person.id
                    return (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => setSelectedPersonId(person.id)}
                        className={`text-left px-3 py-2 rounded-xl border text-xs font-medium transition flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20 text-slate-900 dark:text-white font-bold'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                            style={{ backgroundColor: person.color }}
                          />
                          <span className="truncate">{person.name}</span>
                        </div>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-3" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Unavailable candidates */}
            {unavailableCandidates.length > 0 && (
              <div className="pt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-slate-400" />
                  {t('calendar:addShiftModal.unavailableCandidates', {
                    count: unavailableCandidates.length,
                  })}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-0.5 custom-scrollbar">
                  {unavailableCandidates.map((person) => {
                    const isSelected = selectedPersonId === person.id
                    return (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => setSelectedPersonId(person.id)}
                        className={`text-left px-3 py-2 rounded-xl border text-xs font-medium transition flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 ring-2 ring-amber-500/20 text-slate-900 dark:text-white font-bold'
                            : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                        title={t('calendar:candidatePicker.unavailableTooltip', {
                          name: person.name,
                          day: dayNumber,
                        })}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: person.color }}
                          />
                          <span className="truncate">{person.name}</span>
                        </div>
                        <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/60 px-1.5 py-0.2 rounded-sm shrink-0">
                          {t('calendar:candidatePicker.unavailableBadge')}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            {t('calendar:addShiftModal.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedShiftId || !selectedPersonId}
            className={`px-5 py-2 text-xs font-bold rounded-xl text-white transition shadow-xs ${
              !selectedShiftId || !selectedPersonId
                ? 'opacity-40 cursor-not-allowed bg-slate-400 dark:bg-slate-600'
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 cursor-pointer'
            }`}
          >
            {t('calendar:addShiftModal.confirm')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

