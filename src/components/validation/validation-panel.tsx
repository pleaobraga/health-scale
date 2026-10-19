import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Save,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useScheduleStore } from '../../store/use-schedule-store'

export function ValidationPanel() {
  const { t } = useTranslation(['calendar', 'common'])
  const {
    validateCurrentSchedule,
    saveSchedule,
    validationErrors,
    hasValidated,
    isSaving,
    saveFeedback,
    dismissValidation,
  } = useScheduleStore()

  const errorsCount = validationErrors.filter((e) => e.severity === 'error').length
  const warningsCount = validationErrors.filter((e) => e.severity === 'warning').length

  const handleValidate = () => {
    validateCurrentSchedule()
  }

  const getRuleBadge = (rule: string) => {
    switch (rule) {
      case 'consecutive_days':
        return { label: t('calendar:validation.rules.consecutive_days'), color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800' }
      case 'weekly_limit':
        return { label: t('calendar:validation.rules.weekly_limit'), color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-800' }
      case 'multi_assigned':
        return { label: t('calendar:validation.rules.multi_assigned'), color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800' }
      case 'empty_day':
        return { label: t('calendar:validation.rules.empty_day'), color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700' }
      case 'not_available':
        return { label: t('calendar:validation.rules.not_available'), color: 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-800' }
      default:
        return { label: t('calendar:validation.rules.default'), color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700' }
    }
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Operational Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {t('calendar:validation.title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('calendar:validation.subtitle')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleValidate}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 border border-slate-300 dark:border-slate-700 rounded-xl transition shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{t('calendar:validation.validate')}</span>
          </button>

          <button
            type="button"
            onClick={saveSchedule}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 rounded-xl transition shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? t('calendar:validation.saving') : t('calendar:validation.save')}</span>
          </button>
        </div>
      </div>

      {/* Save Feedback Banner */}
      {saveFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
        </div>
      )}

      {/* Log / Error Panel (Displayed on demand after validation or save) */}
      {hasValidated && (
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs animate-fadeIn space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {t('calendar:validation.resultsTitle')}
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t('calendar:validation.resultsSummary', {
                  errors: errorsCount,
                  errorLabel: errorsCount === 1 ? t('calendar:validation.criticalError') : t('calendar:validation.criticalErrors'),
                  warnings: warningsCount,
                  warningLabel: warningsCount === 1 ? t('calendar:validation.warning') : t('calendar:validation.warnings'),
                })}
              </span>
            </div>

            <button
              type="button"
              onClick={dismissValidation}
              className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t('calendar:validation.collapse')}
            </button>
          </div>

          {/* All Good State */}
          {validationErrors.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-bold">{t('calendar:validation.allGoodTitle')}</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {t('calendar:validation.allGoodDesc')}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {validationErrors.map((err) => {
                const badge = getRuleBadge(err.rule)
                const isCritical = err.severity === 'error'

                return (
                  <div
                    key={err.id}
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                      isCritical
                        ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                        : 'bg-amber-50/40 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCritical ? (
                        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                        >
                          {badge.label}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCritical ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                          }`}
                        >
                          {isCritical ? t('calendar:validation.blocking') : t('calendar:validation.warningBadge')}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {err.message}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
