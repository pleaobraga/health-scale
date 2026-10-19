import { Plus, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { Person } from '../../types'

export interface CandidatePickerProps {
  dateStr: string
  dayNumber: number
  month: string
  assignedPersonIds: string[]
  allPersons: Person[]
  isPersonAvailable: (personId: string, dayNumber: number) => boolean
  onSelectPerson: (personId: string) => void
}

export function CandidatePicker({
  dayNumber,
  assignedPersonIds,
  allPersons,
  isPersonAvailable,
  onSelectPerson,
}: CandidatePickerProps) {
  const { t } = useTranslation(['calendar', 'common'])
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const unassignedPersons = allPersons.filter(
    (p) => !assignedPersonIds.includes(p.id)
  )

  const availablePersons = unassignedPersons.filter((p) =>
    isPersonAvailable(p.id, dayNumber)
  )

  const unavailablePersons = unassignedPersons.filter(
    (p) => !isPersonAvailable(p.id, dayNumber)
  )

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (unassignedPersons.length === 0) return null

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={t('calendar:dayCell.addPersonTooltip')}
        aria-label={t('calendar:dayCell.addPerson')}
        className="flex items-center gap-1 text-[11px] font-medium p-1 sm:px-2 sm:py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
      >
        <Plus className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-slate-600 dark:text-slate-400" />
        <span className="hidden sm:inline">{t('calendar:dayCell.addPerson')}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-1 z-30 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 animate-fadeIn">
          <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
            {t('calendar:candidatePicker.assignPerson')}
          </div>

          <div className="max-h-52 overflow-y-auto py-1">
            {availablePersons.length === 0 && (
              <div className="px-3 py-2 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 rounded-lg m-1.5 border border-amber-200/80 dark:border-amber-800/80 text-center font-medium">
                {t('calendar:candidatePicker.noAvailable', { day: dayNumber })}
              </div>
            )}

            {availablePersons.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => {
                  onSelectPerson(person.id)
                  setIsOpen(false)
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between text-xs transition cursor-pointer"
                title={t('calendar:candidatePicker.addPerson', { name: person.name })}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: person.color }}
                  />
                  <span className="truncate text-slate-700 dark:text-slate-200 font-medium">
                    {person.name}
                  </span>
                </div>
                <span title={t('calendar:candidatePicker.markedAvailable')} className="text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
              </button>
            ))}

            {unavailablePersons.length > 0 && (
              <>
                <div className="px-2.5 pt-2 pb-1 text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-t border-slate-100 dark:border-slate-700 mt-1">
                  {t('calendar:candidatePicker.noAvailabilityCount', { count: unavailablePersons.length })}
                </div>
                {unavailablePersons.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="w-full text-left px-2.5 py-1.5 opacity-40 cursor-not-allowed bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs transition"
                    title={t('calendar:candidatePicker.unavailableTooltip', { name: person.name, day: dayNumber })}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: person.color }}
                      />
                      <span className="truncate text-slate-500 dark:text-slate-400 font-medium">
                        {person.name}
                      </span>
                    </div>
                    <span
                      title={t('calendar:candidatePicker.noAvailabilityForDate')}
                      className="text-[9px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/60 px-1.5 py-0.5 rounded shrink-0"
                    >
                      {t('calendar:candidatePicker.unavailableBadge')}
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
