import { useTranslation } from 'react-i18next'

export function CalendarHeader() {
  const { t } = useTranslation(['calendar'])

  const weekdays = [
    { short: t('calendar:weekdays.sun'), full: t('calendar:weekdays.sunday'), isWeekend: true },
    { short: t('calendar:weekdays.mon'), full: t('calendar:weekdays.monday'), isWeekend: false },
    { short: t('calendar:weekdays.tue'), full: t('calendar:weekdays.tuesday'), isWeekend: false },
    { short: t('calendar:weekdays.wed'), full: t('calendar:weekdays.wednesday'), isWeekend: false },
    { short: t('calendar:weekdays.thu'), full: t('calendar:weekdays.thursday'), isWeekend: false },
    { short: t('calendar:weekdays.fri'), full: t('calendar:weekdays.friday'), isWeekend: false },
    { short: t('calendar:weekdays.sat'), full: t('calendar:weekdays.saturday'), isWeekend: true },
  ]

  return (
    <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors">
      {weekdays.map((day) => (
        <div
          key={day.full}
          className={`py-2.5 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0 ${
            day.isWeekend ? 'text-indigo-950/70 dark:text-indigo-300 bg-slate-200/40 dark:bg-slate-700/40' : ''
          }`}
        >
          <span className="hidden sm:inline">{day.full}</span>
          <span className="sm:hidden">{day.short}</span>
        </div>
      ))}
    </div>
  )
}
