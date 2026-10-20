import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloudDownload,
  Edit3,
  Eye,
  FileSpreadsheet,
  Maximize2,
  MoreHorizontal,
  Printer,
  DollarSign,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Wand2,
} from 'lucide-react'
import { use, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CalendarHeader } from './calendar-header'
import { DayCell } from './day-cell'
import { AuthContext } from '../../context/auth-context'
import { useScheduleStore } from '../../store/use-schedule-store'
import { formatMonthYear, getMonthCalendarGrid } from '../../utils/date-utils'
import { exportScheduleToExcel } from '../../utils/export-to-excel'
import { MonthPaymentsModal } from '../modals/month-payments-modal'
import { ScheduleAuditModal } from '../modals/schedule-audit-modal'

export function CalendarGrid() {
  const { t, i18n } = useTranslation(['calendar', 'common'])
  const auth = use(AuthContext)
  const isAdmin = auth?.isAdmin ?? false

  const [isPullingCloud, setIsPullingCloud] = useState(false)
  const [pullSuccess, setPullSuccess] = useState(false)
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false)
  const actionsMenuRef = useRef<HTMLDivElement>(null)

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
    dayShiftAssignments,
    events,
    setSelectedDateForEvents,
    removePersonFromDay,
    addPersonToDay,
    assignPersonToShift,
    removePersonFromShift,
    populateMonthWithAvailableCandidates,
    clearMonthAssignments,
    setFullScreenModalOpen,
    saveSchedule,
    discardChanges,
    hasUnsavedChanges,
    pullCloudData,
    validationErrors,
    shiftRules,
    getActiveRuleIds,
    toggleMonthRule,
    validateCurrentSchedule,
    getDayActiveShifts,
  } = useScheduleStore()

  useEffect(() => {
    validateCurrentSchedule()
  }, [currentMonth, assignments, dayShiftAssignments, validateCurrentSchedule])

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

  const handlePrint = () => {
    setFullScreenModalOpen(true)
    setTimeout(() => {
      window.print()
    }, 200)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(event.target as Node)
      ) {
        setIsActionsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsActionsOpen(false)
      }
    }

    if (isActionsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActionsOpen])

  const daysGrid = getMonthCalendarGrid(currentMonth)

  const currentMonthParticipantIds = monthParticipants[currentMonth] || []
  const monthPersons = persons.filter((p) =>
    currentMonthParticipantIds.includes(p.id),
  )

  const highlightedPerson = highlightedPersonId
    ? persons.find((p) => p.id === highlightedPersonId) || null
    : null

  const isPersonAvailable = (
    personId: string,
    dayNumber: number,
    shiftId?: string
  ): boolean => {
    const avail = availabilities.find(
      (a) => a.personId === personId && a.month === currentMonth,
    )
    if (!avail) return false
    if (
      shiftId &&
      avail.shiftAvailability &&
      Object.keys(avail.shiftAvailability).length > 0
    ) {
      const shiftDays = avail.shiftAvailability[shiftId]
      if (shiftDays) {
        return shiftDays.includes(dayNumber)
      }
      return false
    }
    return avail.availableDays.includes(dayNumber)
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
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
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

          {/* Mode Switch Button (Toggles between Edição and Visualização) */}
          <button
            type="button"
            onClick={toggleEditMode}
            title={isEditMode ? t('calendar:viewMode') : t('calendar:editMode')}
            aria-label={isEditMode ? t('calendar:viewMode') : t('calendar:editMode')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
              isEditMode
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {isEditMode ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>{t('calendar:viewMode')}</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{t('calendar:editMode')}</span>
              </>
            )}
          </button>

          {/* Audit Violations Button / Real-time Status */}
          <button
            type="button"
            onClick={() => setIsAuditModalOpen(true)}
            title={t('calendar:validation.auditButtonTooltip')}
            aria-label={t('calendar:validation.auditButtonTooltip')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-2xs border ${
              validationErrors.length > 0
                ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {validationErrors.length > 0 ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{t('calendar:validation.auditButton', { count: validationErrors.length })}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">{t('calendar:validation.allCompliant')}</span>
              </>
            )}
          </button>

          {/* Grouped Actions Dropdown (Always visible on all screen sizes) */}
          <div ref={actionsMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              title={t('calendar:actionsMenuTooltip')}
              aria-label={t('calendar:actionsMenu')}
              aria-expanded={isActionsOpen}
              aria-haspopup="menu"
              data-testid="calendar-actions-dropdown-trigger"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold transition shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <MoreHorizontal className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className="hidden sm:inline">{t('calendar:actionsMenu')}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isActionsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isActionsOpen && (
              <div
                role="menu"
                aria-label={t('calendar:actionsMenu')}
                data-testid="calendar-actions-dropdown-menu"
                className="absolute right-0 top-full mt-2 z-50 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150 space-y-0.5"
              >
                {/* Option 1: Puxar Dados da Nuvem */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsActionsOpen(false)
                    void handlePullCloud()
                  }}
                  disabled={isPullingCloud}
                  className="w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-700 dark:hover:text-indigo-300 transition disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {pullSuccess ? (
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <CloudDownload
                        className={`w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ${
                          isPullingCloud ? 'animate-bounce' : ''
                        }`}
                      />
                    )}
                    <span className="truncate">
                      {pullSuccess
                        ? t('common:actions.pullSuccess')
                        : isPullingCloud
                          ? t('common:actions.pullingCloud')
                          : t('common:actions.pullCloud')}
                    </span>
                  </div>
                </button>

                {/* Option 2: Exportar Excel */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsActionsOpen(false)
                    exportScheduleToExcel({
                      month: currentMonth,
                      persons,
                      assignments,
                      events,
                    })
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{t('calendar:exportExcel')}</span>
                </button>

                {/* Option 3: Imprimir / PDF */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsActionsOpen(false)
                    handlePrint()
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />
                  <span className="truncate">{t('calendar:printPdf')}</span>
                </button>

                {/* Option 4: Tela Cheia */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsActionsOpen(false)
                    setFullScreenModalOpen(true)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
                >
                  <Maximize2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="truncate">{t('calendar:fullscreen')}</span>
                </button>

                {/* Option 5: Valores a Pagar / Fechamento Financeiro */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsActionsOpen(false)
                    setIsPaymentsModalOpen(true)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
                >
                  <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{t('calendar:monthlyPayments')}</span>
                </button>
              </div>
            )}
          </div>
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
                dayShiftMap={dayShiftAssignments[dayInfo.dateStr]}
                activeShifts={getDayActiveShifts(dayInfo.dateStr)}
                allPersons={persons}
                monthPersons={monthPersons}
                events={dayEvents}
                highlightedPerson={highlightedPerson}
                isHighlightedPersonAvailable={isHighlightedAvail}
                isPersonAvailable={isPersonAvailable}
                violations={validationErrors.filter((err) => err.date === dayInfo.dateStr)}
                onOpenEvents={() => setSelectedDateForEvents(dayInfo.dateStr)}
                onRemovePerson={(personId) =>
                  removePersonFromDay(dayInfo.dateStr, personId)
                }
                onAddPerson={(personId, shiftId) => {
                  if (isPersonAvailable(personId, dayInfo.dayNumber)) {
                    addPersonToDay(dayInfo.dateStr, personId, shiftId)
                  }
                }}
                onAssignPersonToShift={(shiftId, personId) =>
                  assignPersonToShift(dayInfo.dateStr, shiftId, personId)
                }
                onRemovePersonFromShift={(shiftId) =>
                  removePersonFromShift(dayInfo.dateStr, shiftId)
                }
              />
            )
          })}
        </div>
      </div>

      {/* Global Schedule Audit & Diagnostics Modal */}
      <ScheduleAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        violations={validationErrors}
        allPersons={persons}
        shiftRules={shiftRules}
        activeRuleIds={getActiveRuleIds(currentMonth)}
        currentMonth={currentMonth}
        onToggleMonthRule={(ruleId) => toggleMonthRule(ruleId, currentMonth)}
      />

      {/* Monthly Payments & Financial Summary Modal */}
      <MonthPaymentsModal
        isOpen={isPaymentsModalOpen}
        onClose={() => setIsPaymentsModalOpen(false)}
        currentMonth={currentMonth}
      />
    </div>
  )
}
