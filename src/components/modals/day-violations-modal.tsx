import { AlertCircle, AlertTriangle, X, ShieldAlert, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { ValidationError, Person, ShiftRule } from '../../types'

export interface DayViolationsModalProps {
  isOpen: boolean
  onClose: () => void
  dateStr: string
  formattedDate: string
  violations: ValidationError[]
  allPersons: Person[]
  shiftRules: ShiftRule[]
}

export function DayViolationsModal({
  isOpen,
  onClose,
  formattedDate,
  violations,
  allPersons,
  shiftRules,
}: DayViolationsModalProps) {
  const { t } = useTranslation(['calendar', 'common'])

  if (!isOpen) return null

  const personMap = new Map<string, Person>(allPersons.map((p) => [p.id, p]))
  const ruleMap = new Map<string, ShiftRule>(shiftRules.map((r) => [r.id, r]))

  const errorCount = violations.filter((v) => v.severity === 'error').length
  const warningCount = violations.filter((v) => v.severity === 'warning').length

  const getRuleDetails = (ruleId: string) => {
    const dynamicRule = ruleMap.get(ruleId)
    if (dynamicRule) {
      return {
        name: dynamicRule.name,
        description: dynamicRule.description,
        type: dynamicRule.type,
      }
    }
    switch (ruleId) {
      case 'consecutive_days':
        return { name: t('calendar:validation.rules.consecutive_days'), description: undefined }
      case 'weekly_limit':
        return { name: t('calendar:validation.rules.weekly_limit'), description: undefined }
      case 'multi_assigned':
        return { name: t('calendar:validation.rules.multi_assigned'), description: undefined }
      case 'empty_day':
        return { name: t('calendar:validation.rules.empty_day'), description: undefined }
      case 'not_available':
        return { name: t('calendar:validation.rules.not_available'), description: undefined }
      default:
        return { name: t('calendar:validation.rules.default'), description: undefined }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="day-violations-modal"
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="modal-panel bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header flex items-start justify-between px-6 pt-6 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900/60">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('calendar:validation.dayViolationsModal.title', { date: formattedDate })}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                {errorCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                    {t('calendar:validation.auditModal.criticalErrors', { count: errorCount })}
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    {t('calendar:validation.auditModal.warnings', { count: warningCount })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Violations List */}
        <div className="modal-body space-y-3 px-6 py-4 custom-scrollbar">
          {violations.map((violation) => {
            const isError = violation.severity === 'error'
            const person = violation.personId ? personMap.get(violation.personId) : undefined
            const ruleDetails = getRuleDetails(violation.rule)

            return (
              <div
                key={violation.id}
                className={`p-4 rounded-2xl border transition ${
                  isError
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                    : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isError
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {isError ? (
                        <AlertCircle className="w-3 h-3 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                      )}
                      {isError
                        ? t('calendar:validation.dayViolationsModal.severityError')
                        : t('calendar:validation.dayViolationsModal.severityWarning')}
                    </span>

                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {ruleDetails.name}
                    </span>
                  </div>

                  {person && (
                    <span
                      style={{ backgroundColor: person.color }}
                      className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold shadow-2xs shrink-0"
                    >
                      {person.name}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 font-medium leading-relaxed">
                  {violation.message}
                </p>

                {ruleDetails.description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                    {ruleDetails.description}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Guidance Footer */}
        <div className="modal-footer px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{t('calendar:validation.dayViolationsModal.howToFixText')}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition shrink-0"
          >
            {t('calendar:validation.dayViolationsModal.close')}
          </button>
        </div>
      </div>
    </div>
  )
}

