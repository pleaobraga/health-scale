import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  X,
  Search,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Layers,
  User,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { formatDisplayDate } from '../../utils/date-utils'

import type { ValidationError, Person, ShiftRule } from '../../types'

export interface ScheduleAuditModalProps {
  isOpen: boolean
  onClose: () => void
  violations: ValidationError[]
  allPersons: Person[]
  shiftRules: ShiftRule[]
  activeRuleIds: string[]
  currentMonth: string
  onToggleMonthRule: (ruleId: string) => void
}

export function ScheduleAuditModal({
  isOpen,
  onClose,
  violations,
  allPersons,
  shiftRules,
  activeRuleIds,
  onToggleMonthRule,
}: ScheduleAuditModalProps) {
  const { t } = useTranslation(['calendar', 'settings', 'common'])
  const [activeTab, setActiveTab] = useState<'rules' | 'people' | 'all'>('rules')
  const [searchQuery, setSearchQuery] = useState('')

  const personMap = useMemo(
    () => new Map<string, Person>(allPersons.map((p) => [p.id, p])),
    [allPersons]
  )
  const ruleMap = useMemo(
    () => new Map<string, ShiftRule>(shiftRules.map((r) => [r.id, r])),
    [shiftRules]
  )

  const errorCount = violations.filter((v) => v.severity === 'error').length
  const warningCount = violations.filter((v) => v.severity === 'warning').length

  // Filter violations based on search
  const filteredViolations = useMemo(() => {
    if (!searchQuery.trim()) return violations
    const q = searchQuery.toLowerCase()
    return violations.filter((v) => {
      const personName = v.personName?.toLowerCase() || ''
      const msg = v.message.toLowerCase()
      const date = v.date.toLowerCase()
      return personName.includes(q) || msg.includes(q) || date.includes(q)
    })
  }, [violations, searchQuery])

  // Group by Rule
  const violationsByRule = useMemo(() => {
    const groups = new Map<string, ValidationError[]>()
    for (const v of filteredViolations) {
      const list = groups.get(v.rule) || []
      list.push(v)
      groups.set(v.rule, list)
    }
    return groups
  }, [filteredViolations])

  // Group by Person
  const violationsByPerson = useMemo(() => {
    const groups = new Map<string, ValidationError[]>()
    for (const v of filteredViolations) {
      const personId = v.personId || 'unassigned'
      const list = groups.get(personId) || []
      list.push(v)
      groups.set(personId, list)
    }
    return groups
  }, [filteredViolations])

  if (!isOpen) return null

  const getRuleDetails = (ruleId: string) => {
    const dynamicRule = ruleMap.get(ruleId)
    if (dynamicRule) {
      return {
        id: dynamicRule.id,
        name: dynamicRule.name,
        description: dynamicRule.description,
        type: dynamicRule.type,
        parameters: dynamicRule.parameters,
        isActive: activeRuleIds.includes(dynamicRule.id),
      }
    }
    switch (ruleId) {
      case 'consecutive_days':
        return {
          id: ruleId,
          name: t('calendar:validation.rules.consecutive_days'),
          description: undefined,
          type: undefined,
          parameters: undefined,
          isActive: true,
        }
      case 'weekly_limit':
        return {
          id: ruleId,
          name: t('calendar:validation.rules.weekly_limit'),
          description: undefined,
          type: undefined,
          parameters: undefined,
          isActive: true,
        }
      case 'multi_assigned':
        return {
          id: ruleId,
          name: t('calendar:validation.rules.multi_assigned'),
          description: undefined,
          type: undefined,
          parameters: undefined,
          isActive: true,
        }
      case 'empty_day':
        return {
          id: ruleId,
          name: t('calendar:validation.rules.empty_day'),
          description: undefined,
          type: undefined,
          parameters: undefined,
          isActive: true,
        }
      case 'not_available':
        return {
          id: ruleId,
          name: t('calendar:validation.rules.not_available'),
          description: undefined,
          type: undefined,
          parameters: undefined,
          isActive: true,
        }
      default:
        return {
          id: ruleId,
          name: t('calendar:validation.rules.default'),
          description: undefined,
          type: undefined,
          parameters: undefined,
          isActive: true,
        }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="schedule-audit-modal"
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="modal-panel bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/60">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t('calendar:validation.auditModal.title')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('calendar:validation.auditModal.subtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Severity Banner & Search Filter */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
              {t('calendar:validation.auditModal.criticalErrors', { count: errorCount })}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
              {t('calendar:validation.auditModal.warnings', { count: warningCount })}
            </span>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('calendar:validation.auditModal.filterPlaceholder')}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center px-5 pt-3 border-b border-slate-100 dark:border-slate-800 gap-4 shrink-0 bg-slate-50/30 dark:bg-slate-900/30">
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`pb-2.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'rules'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t('calendar:validation.auditModal.tabByRule', { count: violationsByRule.size })}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('people')}
            className={`pb-2.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'people'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t('calendar:validation.auditModal.tabByPerson', { count: violationsByPerson.size })}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pb-2.5 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'all'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>{t('calendar:validation.auditModal.tabAll', { count: filteredViolations.length })}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="modal-body flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {filteredViolations.length === 0 ? (
            <div className="p-8 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center flex flex-col items-center justify-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('calendar:validation.auditModal.noViolationsTitle')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md">
                {t('calendar:validation.auditModal.noViolationsDesc')}
              </p>
            </div>
          ) : activeTab === 'rules' ? (
            /* Tab: Grouped By Rule */
            <div className="space-y-4">
              {Array.from(violationsByRule.entries()).map(([ruleId, ruleViolations]) => {
                const ruleDetails = getRuleDetails(ruleId)
                const isDynamic = ruleMap.has(ruleId)

                return (
                  <div
                    key={ruleId}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {ruleDetails.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                            {ruleViolations.length === 1
                              ? t('calendar:validation.auditModal.occurrencesCount', { count: 1 })
                              : t('calendar:validation.auditModal.occurrencesCountPlural', { count: ruleViolations.length })}
                          </span>
                        </div>
                        {ruleDetails.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {ruleDetails.description}
                          </p>
                        )}
                      </div>

                      {/* Toggle Rule for Month button */}
                      {isDynamic && (
                        <button
                          type="button"
                          onClick={() => onToggleMonthRule(ruleId)}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition shrink-0"
                          title={t('calendar:validation.auditModal.disableRuleForMonth')}
                        >
                          {ruleDetails.isActive ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-emerald-600" />
                              <span>{t('calendar:validation.auditModal.disableRuleForMonth')}</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-slate-400" />
                              <span>{t('calendar:validation.auditModal.ruleDisabled')}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Violations for this rule */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {ruleViolations.map((v) => {
                        const person = v.personId ? personMap.get(v.personId) : undefined
                        const isErr = v.severity === 'error'

                        return (
                          <div
                            key={v.id}
                            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                              isErr
                                ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                                : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {person && (
                                <span
                                  style={{ backgroundColor: person.color }}
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                />
                              )}
                              <span className="font-bold text-slate-900 dark:text-slate-100">
                                {v.message}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                                <CalendarIcon className="w-3 h-3 text-slate-400" />
                                {formatDisplayDate(v.date)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : activeTab === 'people' ? (
            /* Tab: Grouped By Person */
            <div className="space-y-4">
              {Array.from(violationsByPerson.entries()).map(([personId, personViolations]) => {
                const person = personMap.get(personId)

                return (
                  <div
                    key={personId}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {person ? (
                          <span
                            style={{ backgroundColor: person.color }}
                            className="w-3.5 h-3.5 rounded-full shrink-0"
                          />
                        ) : (
                          <User className="w-4 h-4 text-slate-400" />
                        )}
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {person ? person.name : t('calendar:validation.rules.empty_day')}
                        </h3>
                      </div>

                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        {personViolations.length === 1
                          ? t('calendar:validation.auditModal.violationsCount', { count: 1 })
                          : t('calendar:validation.auditModal.violationsCountPlural', { count: personViolations.length })}
                      </span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {personViolations.map((v) => {
                        const ruleDetails = getRuleDetails(v.rule)
                        return (
                          <div
                            key={v.id}
                            className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div>
                              <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-2">
                                {ruleDetails.name}:
                              </span>
                              <span className="text-slate-700 dark:text-slate-300">
                                {v.message}
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-semibold shrink-0">
                              <CalendarIcon className="w-3 h-3 text-slate-400" />
                              {formatDisplayDate(v.date)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Tab: All Violations List */
            <div className="space-y-2.5">
              {filteredViolations.map((v) => {
                const ruleDetails = getRuleDetails(v.rule)
                const isErr = v.severity === 'error'

                return (
                  <div
                    key={v.id}
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 transition ${
                      isErr
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                        : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isErr ? (
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {ruleDetails.name}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          • {formatDisplayDate(v.date)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                        {v.message}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            {t('calendar:validation.dayViolationsModal.howToFixText')}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            {t('calendar:validation.auditModal.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
