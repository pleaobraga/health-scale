import { Edit2, Eye, EyeOff, CalendarPlus, Check, UserMinus } from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { Person } from '../../types'

export interface PersonCardProps {
  person: Person
  availableDaysCount: number
  workingDaysCount?: number
  isHighlighted: boolean
  isEditMode?: boolean
  onToggleHighlight: () => void
  onEdit: () => void
  onInsertAllDays: () => void
  onRemoveFromMonth?: () => void
}

export function PersonCard({
  person,
  availableDaysCount,
  workingDaysCount = 0,
  isHighlighted,
  isEditMode = false,
  onToggleHighlight,
  onEdit,
  onInsertAllDays,
  onRemoveFromMonth,
}: PersonCardProps) {
  const { t } = useTranslation(['people', 'common'])
  const [justInserted, setJustInserted] = useState(false)

  const canInsertAllDays = isEditMode && availableDaysCount > 0

  const handleInsert = (e: React.MouseEvent) => {
    e.stopPropagation()
    onInsertAllDays()
    setJustInserted(true)
    setTimeout(() => setJustInserted(false), 1500)
  }

  const workingDayLabel = workingDaysCount === 1 ? t('people:card.dayLabel') : t('people:card.dayLabelPlural')
  const availableDayLabel = availableDaysCount === 1 ? t('people:card.dayLabel') : t('people:card.dayLabelPlural')

  return (
    <div
      className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all ${
        isHighlighted
          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20 shadow-sm'
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
          <button
            type="button"
            onClick={handleInsert}
            title={
              justInserted
                ? t('people:card.insertedFeedback')
                : t('people:card.insertTooltip', { count: availableDaysCount, name: person.name })
            }
            aria-label={t('people:card.insertAria', { name: person.name })}
            className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
              justInserted
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
            }`}
          >
            {justInserted ? (
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <CalendarPlus className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Toggle View Availability */}
        <button
          type="button"
          onClick={onToggleHighlight}
          title={isHighlighted ? t('people:card.hideHighlightTooltip') : t('people:card.showHighlightTooltip')}
          className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
            isHighlighted
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
