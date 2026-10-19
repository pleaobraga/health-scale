import { Sparkles, Eraser, CheckSquare, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { formatMonthYear, getDaysCountInMonth } from '../../utils/date-utils'

export interface AvailabilityMiniCalendarProps {
  month: string // 'YYYY-MM'
  selectedDays: number[]
  onChange: (days: number[]) => void
  accentColor?: string
}

export function AvailabilityMiniCalendar({
  month,
  selectedDays,
  onChange,
  accentColor = '#3b82f6',
}: AvailabilityMiniCalendarProps) {
  const { t, i18n } = useTranslation(['people', 'common'])
  const totalDays = getDaysCountInMonth(month)
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1)

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day))
    } else {
      onChange([...selectedDays, day].sort((a, b) => a - b))
    }
  }

  const selectEven = () => {
    onChange(daysArray.filter((d) => d % 2 === 0))
  }

  const selectOdd = () => {
    onChange(daysArray.filter((d) => d % 2 !== 0))
  }

  const selectAll = () => {
    onChange([...daysArray])
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 transition-colors">
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium pb-2 border-b border-slate-200 dark:border-slate-700">
        <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
          <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          {t('people:monthAvailability.availabilityOf', { month: formatMonthYear(month, i18n.language) })}
        </span>
        <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium">
          {t('people:monthAvailability.daysCount', { selected: selectedDays.length, total: totalDays })}
        </span>
      </div>

      {/* Quick selection shortcuts */}
      <div className="flex items-center flex-wrap gap-1.5">
        <button
          type="button"
          onClick={selectEven}
          className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition"
        >
          <CheckSquare className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          {t('people:monthAvailability.evenDays')}
        </button>
        <button
          type="button"
          onClick={selectOdd}
          className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition"
        >
          <CheckSquare className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          {t('people:monthAvailability.oddDays')}
        </button>
        <button
          type="button"
          onClick={selectAll}
          className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition"
        >
          <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          {t('people:monthAvailability.allDays')}
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 transition ml-auto"
        >
          <Eraser className="w-3 h-3 text-rose-500" />
          {t('people:monthAvailability.clear')}
        </button>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 pt-1">
        {daysArray.map((day) => {
          const isSelected = selectedDays.includes(day)
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              style={
                isSelected
                  ? { backgroundColor: accentColor, color: '#ffffff', borderColor: accentColor }
                  : undefined
              }
              className={`h-8 text-xs font-medium rounded-lg flex items-center justify-center transition-all ${
                isSelected
                  ? 'shadow-sm font-semibold'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
