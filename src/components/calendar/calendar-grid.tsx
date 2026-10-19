import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CloudDownload,
  Edit3,
  Eye,
  FileSpreadsheet,
  Maximize2,
  RotateCcw,
  Trash2,
  Wand2,
} from 'lucide-react'
import { use, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CalendarHeader } from './calendar-header'
import { DayCell } from './day-cell'
import { AuthContext } from '../../context/auth-context'
import { useScheduleStore } from '../../store/use-schedule-store'
import { formatMonthYear, getMonthCalendarGrid } from '../../utils/date-utils'
import { exportScheduleToExcel } from '../../utils/export-to-excel'

export function CalendarGrid() {
  const { t, i18n } = useTranslation(['calendar', 'common'])
  const auth = use(AuthContext)
  const isAdmin = auth?.isAdmin ?? false

  const [isPullingCloud, setIsPullingCloud] = useState(false)
  const [pullSuccess, setPullSuccess] = useState(false)

  const {
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    isEditMode,
    toggleEditMode,
    highlightedPersonId,
    persons,
    monthParticipants,
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
    pullCloudData,
  } = useScheduleStore()

  const handlePullCloud = async () => {
    try {
      setIsPullingCloud(true)
      const res = await pullCloudData(currentMonth, isAdmin)
      if (res.success) {
        setPullSuccess(true)
        setTimeout(() => setPullSuccess(false), 2500)
      }
    } catch (err) {
      console.error('Erro ao puxar dados da nuvem:', err)
    } finally {
      setIsPullingCloud(false)
    }
  }

  const daysGrid = getMonthCalendarGrid(currentMonth)

  const currentMonthParticipantIds = monthParticipants[currentMonth] || []
  const monthPersons = persons.filter((p) =>
    currentMonthParticipantIds.includes(p.id),
  )

  const highlightedPerson = highlightedPersonId
    ? persons.find((p) => p.id === highlightedPersonId) || null
    : null

  const isPersonAvailable = (personId: string, dayNumber: number): boolean => {
    const avail = availabilities.find(
      (a) => a.personId === personId && a.month === currentMonth,
    )
    return avail ? avail.availableDays.includes(dayNumber) : false
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 shadow-xs border border-slate-200 dark:border-slate-800 rounded-2xl transition-colors shrink-0">
      {/* Calendar Top Toolbar */}
      <div className="p-4 border-b rounded-t-2xl border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 transition-colors">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={goToPreviousMonth}
              title={t('calendar:prevMonth')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition shadow-2xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goToNextMonth}
              title={t('calendar:nextMonth')}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition shadow-2xs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {formatMonthYear(currentMonth, i18n.language)}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('calendar:subtitle')}
            </p>
          </div>
        </div>

        {/* View / Edit Mode Switch & Tools */}
        <div className="flex items-center flex-wrap gap-2.5">
          {isEditMode && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  populateMonthWithAvailableCandidates(currentMonth)
                }
                title={t('calendar:populateAvailableTooltip')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition shadow-2xs"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {t('calendar:populateAvailable')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm(
                    t('calendar:confirmClearMonth', {
                      month: formatMonthYear(currentMonth, i18n.language),
                    }),
                  )
                  if (confirmed) {
                    clearMonthAssignments(currentMonth)
                  }
                }}
                title={t('calendar:clearMonthTooltip')}
                aria-label={t('calendar:clearMonth')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {t('calendar:clearMonth')}
                </span>
              </button>

              {hasUnsavedChanges && (
                <button
                  type="button"
                  onClick={discardChanges}
                  title={t('calendar:discardTooltip')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {t('calendar:discard')}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Mode Switch Toggle Button */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                if (isEditMode) toggleEditMode()
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                !isEditMode
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t('calendar:viewMode')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isEditMode) toggleEditMode()
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                isEditMode
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('calendar:editMode')}</span>
            </button>
          </div>

          {/* Pull from Cloud Button */}
          <button
            type="button"
            onClick={handlePullCloud}
            disabled={isPullingCloud}
            title={t('common:actions.pullCloudTooltip')}
            aria-label={t('common:actions.pullCloud')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition shadow-2xs disabled:opacity-50"
          >
            {pullSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <CloudDownload
                className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${
                  isPullingCloud ? 'animate-bounce' : ''
                }`}
              />
            )}
            <span className="hidden sm:inline">
              {pullSuccess
                ? t('common:actions.pullSuccess')
                : isPullingCloud
                  ? t('common:actions.pullingCloud')
                  : t('common:actions.pullCloud')}
            </span>
          </button>

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
            title={t('calendar:exportExcelTooltip')}
            aria-label={t('calendar:exportExcel')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">
              {t('calendar:exportExcel')}
            </span>
          </button>

          {/* Full Screen Modal Button */}
          <button
            type="button"
            onClick={() => setFullScreenModalOpen(true)}
            title={t('calendar:fullscreenTooltip')}
            aria-label={t('calendar:fullscreen')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold transition shadow-2xs"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">{t('calendar:fullscreen')}</span>
          </button>
        </div>
      </div>

      {/* Notice bar when editing or highlighting */}
      {isEditMode && (
        <div className="bg-amber-50 dark:bg-amber-950/40 px-4 py-2 text-xs text-amber-800 dark:text-amber-200 border-b border-amber-200 dark:border-amber-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>
              <strong>{t('calendar:editModeActive')}</strong>{' '}
              {t('calendar:editNotice')}
            </span>
          </div>
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                {t('calendar:unsavedChanges')}
              </span>
              <button
                type="button"
                onClick={saveSchedule}
                className="px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition"
              >
                {t('calendar:saveNow')}
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
              {t('calendar:showingAvailability')}{' '}
              <strong>{highlightedPerson.name}</strong>{' '}
              {t('calendar:daysHighlighted')}
            </span>
          </div>
        </div>
      )}

      {/* Main 7-Column Grid (Sunday to Saturday) */}
      <div className="flex flex-col">
        <CalendarHeader />
        <div className="grid grid-cols-7 border-l border-slate-200 dark:border-slate-800 flex-1 auto-rows-fr">
          {daysGrid.map((dayInfo) => {
            const assigned = assignments[dayInfo.dateStr] || []
            const dayEvents = events.filter((e) => e.date === dayInfo.dateStr)
            const isHighlightedAvail = highlightedPerson
              ? isPersonAvailable(highlightedPerson.id, dayInfo.dayNumber)
              : false

            return (
              <DayCell
                key={dayInfo.dateStr}
                dayInfo={dayInfo}
                currentMonth={currentMonth}
                isEditMode={isEditMode}
                assignedPersonIds={assigned}
                allPersons={persons}
                monthPersons={monthPersons}
                events={dayEvents}
                highlightedPerson={highlightedPerson}
                isHighlightedPersonAvailable={isHighlightedAvail}
                isPersonAvailable={isPersonAvailable}
                onOpenEvents={() => setSelectedDateForEvents(dayInfo.dateStr)}
                onRemovePerson={(personId) =>
                  removePersonFromDay(dayInfo.dateStr, personId)
                }
                onAddPerson={(personId) => {
                  if (isPersonAvailable(personId, dayInfo.dayNumber)) {
                    addPersonToDay(dayInfo.dateStr, personId)
                  }
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
