import {
  UserPlus,
  Users,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Clock,
  RotateCcw,
  Settings,
  Moon,
  Sun,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { AddMonthParticipantsModal } from './add-month-participants-modal'
import { MonthAvailabilityModal } from './month-availability-modal'
import { PersonCard } from './person-card'
import { useScheduleStore } from '../../store/use-schedule-store'
import { formatMonthYear, formatDisplayDate } from '../../utils/date-utils'
import { LanguageSelector } from '../common/language-selector'

import type { Person, ShiftDefinition, ShiftRule } from '../../types'

export function Sidebar() {
  const { t, i18n } = useTranslation(['people', 'settings', 'calendar', 'common'])
  const navigate = useNavigate()
  const {
    persons,
    monthParticipants,
    availabilities,
    assignments,
    currentMonth,
    isEditMode,
    highlightedPersonId,
    setHighlightedPersonId,
    addPersonsToMonth,
    removePersonFromMonth,
    setPersonAvailability,
    insertAllPersonDaysToMonth,
    setCurrentView,
    shiftDefinitions,
    shiftRules,
    getActiveShiftIds,
    getActiveRuleIds,
    toggleMonthShift,
    toggleMonthRule,
    resetMonthDefaults,
    isDarkMode,
    toggleDarkMode,
    validationErrors,
  } = useScheduleStore()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [personForAvailability, setPersonForAvailability] = useState<Person | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRuleViolations, setExpandedRuleViolations] = useState<Record<string, boolean>>({})

  const toggleExpandRuleViolations = (ruleId: string) => {
    setExpandedRuleViolations((prev) => ({
      ...prev,
      [ruleId]: !prev[ruleId],
    }))
  }

  // Accordion state: Pessoas, Regras, Turnos
  const [openSections, setOpenSections] = useState<{
    people: boolean
    rules: boolean
    shifts: boolean
  }>({
    people: true,
    rules: false,
    shifts: false,
  })

  // Global mobile minimize/expand state for screens < 1024px
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(false)

  const toggleSection = (section: 'people' | 'rules' | 'shifts') => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Active items for current month
  const currentParticipantIds = monthParticipants[currentMonth] || []
  const monthPersons = persons.filter((p) => currentParticipantIds.includes(p.id))
  const activeShiftIds = getActiveShiftIds(currentMonth)
  const activeShifts = shiftDefinitions.filter((s) => activeShiftIds.includes(s.id))
  const activeRuleIds = getActiveRuleIds(currentMonth)
  const rulesWithViolationsCount = shiftRules.filter((r) =>
    validationErrors.some((v) => v.rule === r.id)
  ).length

  const filteredPersons = monthPersons.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  )

  const getPersonAvailableDays = (personId: string): number[] => {
    const avail = availabilities.find(
      (a) => a.personId === personId && a.month === currentMonth
    )
    return avail ? avail.availableDays : []
  }

  const getPersonWorkingDaysCount = (personId: string): number => {
    let count = 0
    Object.entries(assignments).forEach(([dateStr, personIds]) => {
      if (dateStr.startsWith(currentMonth) && personIds.includes(personId)) {
        count++
      }
    })
    return count
  }

  const handleSaveAvailability = (
    personId: string,
    days: number[],
    shiftAvailability?: Record<string, number[]>
  ) => {
    setPersonAvailability(personId, currentMonth, days, shiftAvailability)
  }

  const handleGoToGlobalManagement = () => {
    setCurrentView('people')
    navigate('/pessoas')
  }

  const handleGoToRulesManagement = () => {
    setCurrentView('settings')
    navigate('/configuracoes/regras')
  }

  const handleGoToShiftsManagement = () => {
    setCurrentView('settings')
    navigate('/configuracoes/turnos')
  }

  return (
    <aside className="w-full h-full max-h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col shadow-xs overflow-hidden transition-all duration-300 select-none">
      {/* Mobile Header Toggle on screens < 1024px */}
      <div className="lg:hidden p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
            {t('people:sidebar.title')}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileCollapsed(!isMobileCollapsed)}
          title={isMobileCollapsed ? t('people:sidebar.expandAria') : t('people:sidebar.collapseAria')}
          aria-label={isMobileCollapsed ? t('people:sidebar.expandAria') : t('people:sidebar.collapseAria')}
          aria-expanded={!isMobileCollapsed}
          data-testid="toggle-sidebar-collapse"
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          <span className="text-[11px]">
            {isMobileCollapsed ? t('people:sidebar.expand') : t('people:sidebar.collapse')}
          </span>
          {isMobileCollapsed ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Accordion Panels Container */}
      <div
        className={`${
          isMobileCollapsed ? 'hidden lg:flex' : 'flex'
        } flex-col flex-1 min-h-0 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden`}
      >
        {/* =================================================================== */}
        {/* SECTION 1: PESSOAS DO MÊS */}
        {/* =================================================================== */}
        <section
          className={`flex flex-col min-h-0 transition-all ${
            openSections.people ? 'flex-1 overflow-hidden' : 'shrink-0'
          }`}
        >
          {/* Section Header */}
          <div
            onClick={() => toggleSection('people')}
            className="p-3 sm:px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 cursor-pointer flex items-center justify-between shrink-0 transition"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
                  <span>{t('people:sidebar.title')}</span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    ({monthPersons.length}/{persons.length})
                  </span>
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {monthPersons.length === 1
                    ? t('people:sidebar.linkedCount', { count: monthPersons.length })
                    : t('people:sidebar.linkedCountPlural', { count: monthPersons.length })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                title={t('people:sidebar.linkButtonTooltip')}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-2xs transition"
              >
                <UserPlus className="w-3 h-3" />
                <span className="hidden xs:inline">{t('people:sidebar.linkButton')}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleSection('people')}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                aria-label={openSections.people ? t('people:sidebar.collapse') : t('people:sidebar.expand')}
              >
                {openSections.people ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Section Body */}
          {openSections.people && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white dark:bg-slate-900">
              {/* Search Bar */}
              {monthPersons.length > 0 && (
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('people:sidebar.searchPlaceholder')}
                      className="w-full pl-7 pr-3 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Scrollable Person List */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 min-h-0 custom-scrollbar">
                {monthPersons.length === 0 ? (
                  <div className="text-center py-6 px-3 flex flex-col items-center justify-center h-full">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
                      <Users className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t('people:sidebar.emptyTitle')}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[200px] leading-relaxed">
                      {t('people:sidebar.emptyDesc')}{' '}
                      <strong className="capitalize">{formatMonthYear(currentMonth, i18n.language)}</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{t('people:sidebar.addPersonsToMonth')}</span>
                    </button>
                  </div>
                ) : filteredPersons.length === 0 ? (
                  <div className="text-center py-6 px-3">
                    <Users className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600 mb-1.5" />
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {t('people:sidebar.noResults')}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline mt-1 block mx-auto"
                    >
                      {t('people:sidebar.clearSearch')}
                    </button>
                  </div>
                ) : (
                  filteredPersons.map((person) => {
                    const availDays = getPersonAvailableDays(person.id)
                    const workingDays = getPersonWorkingDaysCount(person.id)
                    return (
                      <PersonCard
                        key={person.id}
                        person={person}
                        availableDaysCount={availDays.length}
                        workingDaysCount={workingDays}
                        isHighlighted={highlightedPersonId === person.id}
                        isEditMode={isEditMode}
                        onToggleHighlight={() => setHighlightedPersonId(person.id)}
                        onEdit={() => setPersonForAvailability(person)}
                        onInsertAllDays={() => insertAllPersonDaysToMonth(person.id, currentMonth)}
                        onRemoveFromMonth={() => removePersonFromMonth(person.id, currentMonth)}
                      />
                    )
                  })
                )}
              </div>

              {/* Informative Hint */}
              {monthPersons.length > 0 && (
                <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: t('people:sidebar.hint') }} />
                </div>
              )}
            </div>
          )}
        </section>

        {/* =================================================================== */}
        {/* SECTION 2: REGRAS DE VALIDAÇÃO DO MÊS */}
        {/* =================================================================== */}
        <section
          className={`flex flex-col min-h-0 transition-all ${
            openSections.rules ? 'flex-1 overflow-hidden' : 'shrink-0'
          }`}
        >
          {/* Section Header */}
          <div
            onClick={() => toggleSection('rules')}
            className="p-3 sm:px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 cursor-pointer flex items-center justify-between shrink-0 transition"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5 flex-wrap">
                  <span>{t('people:sidebar.rulesTitle')}</span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    ({activeRuleIds.length}/{shiftRules.length})
                  </span>
                  {rulesWithViolationsCount > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      {rulesWithViolationsCount === 1
                        ? t('people:sidebar.rulesViolationsBadge', { count: rulesWithViolationsCount })
                        : t('people:sidebar.rulesViolationsBadgePlural', { count: rulesWithViolationsCount })}
                    </span>
                  )}
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {t('people:sidebar.rulesCount', {
                    active: activeRuleIds.length,
                    total: shiftRules.length,
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handleGoToRulesManagement}
                title={t('people:sidebar.manageRules')}
                aria-label={t('people:sidebar.manageRules')}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => toggleSection('rules')}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                aria-label={openSections.rules ? t('people:sidebar.collapse') : t('people:sidebar.expand')}
              >
                {openSections.rules ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Section Body */}
          {openSections.rules && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white dark:bg-slate-900">
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2 min-h-0 custom-scrollbar">
                {shiftRules.length === 0 ? (
                  <div className="text-center py-6 px-3">
                    <ShieldCheck className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                    <p className="text-xs text-slate-500">{t('people:sidebar.noRules')}</p>
                  </div>
                ) : (
                  shiftRules.map((rule: ShiftRule) => {
                    const isActive = activeRuleIds.includes(rule.id)
                    const isError = rule.severity === 'ERROR'
                    const ruleViolations = validationErrors.filter((v) => v.rule === rule.id)
                    const hasViolations = ruleViolations.length > 0
                    const isViolationsExpanded = expandedRuleViolations[rule.id]

                    const getParamSummary = () => {
                      if (rule.type === 'MAX_SHIFTS_PER_PERIOD') {
                        const scopeLabel = rule.parameters.scope === 'WEEK'
                          ? t('settings:rules.scopes.WEEK')
                          : rule.parameters.scope === 'MONTH'
                          ? t('settings:rules.scopes.MONTH')
                          : t('settings:rules.scopes.DAY')
                        return t('people:sidebar.paramMaxShifts', {
                          scope: scopeLabel,
                          count: rule.parameters.maxOccurrences || 1,
                        })
                      }
                      if (rule.type === 'MAX_HOURS_PER_PERIOD') {
                        const scopeLabel = rule.parameters.scope === 'WEEK'
                          ? t('settings:rules.scopes.WEEK')
                          : rule.parameters.scope === 'MONTH'
                          ? t('settings:rules.scopes.MONTH')
                          : t('settings:rules.scopes.DAY')
                        return t('people:sidebar.paramMaxHours', {
                          scope: scopeLabel,
                          hours: rule.parameters.maxHours || 24,
                        })
                      }
                      if (rule.type === 'MIN_REST_HOURS') {
                        return t('people:sidebar.paramMinRest', {
                          hours: rule.parameters.minRestHours || 24,
                        })
                      }
                      if (rule.type === 'CONSECUTIVE_DAYS_LIMIT') {
                        return t('people:sidebar.paramConsecutiveDays', {
                          days: rule.parameters.consecutiveDaysLimit || 1,
                        })
                      }
                      return undefined
                    }

                    const paramSummary = getParamSummary()

                    return (
                      <div
                        key={rule.id}
                        className={`p-2.5 rounded-xl border transition-all ${
                          hasViolations
                            ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                            : isActive
                            ? 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                            : 'bg-slate-100/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                {rule.name}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                                  isError
                                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                }`}
                              >
                                {isError
                                  ? t('people:sidebar.errorSeverity')
                                  : t('people:sidebar.warningSeverity')}
                              </span>

                              {/* Violation Status Badge */}
                              {hasViolations ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                  {ruleViolations.length === 1
                                    ? t('people:sidebar.ruleViolationsCount', { count: 1 })
                                    : t('people:sidebar.ruleViolationsCountPlural', { count: ruleViolations.length })}
                                </span>
                              ) : isActive ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  {t('people:sidebar.ruleCompliant')}
                                </span>
                              ) : null}
                            </div>

                            {/* Parameters summary */}
                            {paramSummary && (
                              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                                {paramSummary}
                              </p>
                            )}

                            {rule.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                {rule.description}
                              </p>
                            )}

                            {/* Toggle View Violations Button */}
                            {hasViolations && (
                              <button
                                type="button"
                                onClick={() => toggleExpandRuleViolations(rule.id)}
                                className="mt-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>
                                  {isViolationsExpanded
                                    ? t('people:sidebar.hideViolations')
                                    : t('people:sidebar.viewViolations', { count: ruleViolations.length })}
                                </span>
                                <ChevronDown
                                  className={`w-3 h-3 transition-transform ${
                                    isViolationsExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                            )}

                            {/* Inline Violations List */}
                            {hasViolations && isViolationsExpanded && (
                              <div className="mt-2 pt-2 border-t border-rose-100 dark:border-rose-900/40 space-y-1">
                                {ruleViolations.map((v) => (
                                  <div
                                    key={v.id}
                                    className="text-[10px] text-slate-700 dark:text-slate-300 flex items-start gap-1.5"
                                  >
                                    <span className="font-bold text-slate-500 shrink-0">
                                      {formatDisplayDate(v.date)}:
                                    </span>
                                    <span className="line-clamp-2">{v.message}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Toggle Switch */}
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isActive}
                            onClick={() => toggleMonthRule(rule.id, currentMonth)}
                            title={isActive ? t('common:actions.deactivate') : t('common:actions.activate')}
                            className={`w-9 h-5 rounded-full transition-colors relative shrink-0 focus:outline-hidden ${
                              isActive ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                                isActive ? 'left-5' : 'left-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </section>

        {/* =================================================================== */}
        {/* SECTION 3: TURNOS VIGENTES DO MÊS */}
        {/* =================================================================== */}
        <section
          className={`flex flex-col min-h-0 transition-all ${
            openSections.shifts ? 'flex-1 overflow-hidden' : 'shrink-0'
          }`}
        >
          {/* Section Header */}
          <div
            onClick={() => toggleSection('shifts')}
            className="p-3 sm:px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 cursor-pointer flex items-center justify-between shrink-0 transition"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/60 border border-violet-100 dark:border-violet-800/60 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
                  <span>{t('people:sidebar.shiftsTitle')}</span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    ({activeShiftIds.length}/{shiftDefinitions.length})
                  </span>
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {t('people:sidebar.shiftsCount', {
                    active: activeShiftIds.length,
                    total: shiftDefinitions.length,
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handleGoToShiftsManagement}
                title={t('people:sidebar.manageShifts')}
                aria-label={t('people:sidebar.manageShifts')}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => toggleSection('shifts')}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                aria-label={openSections.shifts ? t('people:sidebar.collapse') : t('people:sidebar.expand')}
              >
                {openSections.shifts ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Section Body */}
          {openSections.shifts && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white dark:bg-slate-900">
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2 min-h-0 custom-scrollbar">
                {shiftDefinitions.length === 0 ? (
                  <div className="text-center py-6 px-3">
                    <Clock className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                    <p className="text-xs text-slate-500">{t('people:sidebar.noShifts')}</p>
                  </div>
                ) : (
                  shiftDefinitions.map((shift: ShiftDefinition) => {
                    const isActive = activeShiftIds.includes(shift.id)

                    return (
                      <div
                        key={shift.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                          isActive
                            ? 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                            : 'bg-slate-100/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Code Badge */}
                          <span
                            style={{ backgroundColor: shift.color }}
                            className="px-2 py-0.5 rounded-md text-white font-extrabold text-[10px] shrink-0 shadow-2xs"
                          >
                            {shift.code}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {shift.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {t('people:sidebar.shiftSummary', {
                                startTime: shift.startTime,
                                hours: shift.durationHours,
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Toggle Switch */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isActive}
                          onClick={() => toggleMonthShift(shift.id, currentMonth)}
                          title={isActive ? t('common:actions.deactivate') : t('common:actions.activate')}
                          className={`w-9 h-5 rounded-full transition-colors relative shrink-0 focus:outline-hidden ${
                            isActive ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                              isActive ? 'left-5' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* =================================================================== */}
      {/* FIXED SIDEBAR FOOTER */}
      {/* =================================================================== */}
      <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 shrink-0 flex items-center justify-between gap-2">
        {/* Restore Defaults */}
        <button
          type="button"
          onClick={() => resetMonthDefaults(currentMonth)}
          title={t('people:sidebar.restoreDefaultsTooltip')}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <RotateCcw className="w-3 h-3 text-slate-500" />
          <span>{t('people:sidebar.restoreDefaults')}</span>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          {/* Language Selector */}
          <LanguageSelector variant="compact" align="top" />

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            title={isDarkMode ? t('common:theme.light') : t('common:theme.dark')}
            aria-label={isDarkMode ? t('common:theme.light') : t('common:theme.dark')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddMonthParticipantsModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentMonth={currentMonth}
        allPersons={persons}
        currentParticipantIds={currentParticipantIds}
        onAddParticipants={(ids) => addPersonsToMonth(ids, currentMonth)}
        onGoToGlobalManagement={handleGoToGlobalManagement}
      />

      <MonthAvailabilityModal
        isOpen={Boolean(personForAvailability)}
        onClose={() => setPersonForAvailability(null)}
        person={personForAvailability}
        currentMonth={currentMonth}
        activeShifts={activeShifts}
        initialAvailableDays={
          personForAvailability ? getPersonAvailableDays(personForAvailability.id) : []
        }
        initialShiftAvailability={
          personForAvailability
            ? availabilities.find(
                (a) => a.personId === personForAvailability.id && a.month === currentMonth
              )?.shiftAvailability
            : undefined
        }
        onSave={handleSaveAvailability}
      />
    </aside>
  )
}
