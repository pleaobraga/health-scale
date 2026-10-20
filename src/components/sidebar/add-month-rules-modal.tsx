import { ShieldCheck, Check, X, CheckSquare, Square, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { formatMonthYear } from '../../utils/date-utils'

import type { ShiftRule } from '../../types'

export interface AddMonthRulesModalProps {
  isOpen: boolean
  onClose: () => void
  currentMonth: string
  allRules: ShiftRule[]
  currentRuleIds: string[]
  onAddRules: (ruleIds: string[]) => void
  onGoToGlobalManagement?: () => void
}

export function AddMonthRulesModal({
  isOpen,
  onClose,
  currentMonth,
  allRules,
  currentRuleIds,
  onAddRules,
  onGoToGlobalManagement,
}: AddMonthRulesModalProps) {
  const { t, i18n } = useTranslation(['people', 'settings', 'common'])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [modalSearch, setModalSearch] = useState('')

  // Eligible rules are global rules NOT yet active in this month
  const eligibleRules = allRules.filter((r) => !currentRuleIds.includes(r.id))

  const filteredEligible = eligibleRules.filter(
    (r) =>
      r.name.toLowerCase().includes(modalSearch.toLowerCase().trim()) ||
      r.description?.toLowerCase().includes(modalSearch.toLowerCase().trim())
  )

  useEffect(() => {
    if (isOpen) {
      setSelectedIds([])
      setModalSearch('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedIds.length === eligibleRules.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(eligibleRules.map((r) => r.id))
    }
  }

  const handleConfirm = () => {
    if (selectedIds.length > 0) {
      onAddRules(selectedIds)
      onClose()
    }
  }

  const monthFormatted = formatMonthYear(currentMonth, i18n.language)

  const getRuleParamSummary = (rule: ShiftRule) => {
    if (rule.type === 'MAX_SHIFTS_PER_PERIOD') {
      const scopeLabel =
        rule.parameters.scope === 'WEEK'
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
      const scopeLabel =
        rule.parameters.scope === 'WEEK'
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
    if (rule.type === 'MAX_PEOPLE_PER_SHIFT') {
      return t('people:sidebar.paramMaxPeople', {
        count: rule.parameters.maxPeople ?? rule.parameters.maxOccurrences ?? 1,
      })
    }
    return undefined
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-month-rules-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl lg:max-w-3xl overflow-hidden flex flex-col max-h-[90vh] transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="add-month-rules-title"
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                >
                  {t('people:addMonthRules.title')}
                </h3>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
                  {eligibleRules.length === 1
                    ? t('people:addMonthRules.available', { count: eligibleRules.length })
                    : t('people:addMonthRules.availablePlural', { count: eligibleRules.length })}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                {t('people:addMonthRules.scheduleOf', { month: monthFormatted })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            title={t('common:actions.close', { defaultValue: 'Fechar' })}
            aria-label={t('common:actions.close', { defaultValue: 'Fechar' })}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {eligibleRules.length === 0 ? (
            <div className="text-center py-12 px-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {allRules.length === 0
                  ? t('people:addMonthRules.noneGlobal')
                  : t('people:addMonthRules.allLinked')}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                {allRules.length === 0
                  ? t('people:addMonthRules.noneGlobalDesc')
                  : t('people:addMonthRules.allLinkedDesc')}
              </p>
              {allRules.length === 0 && onGoToGlobalManagement && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onGoToGlobalManagement()
                  }}
                  className="mt-4 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
                >
                  {t('people:addMonthRules.goToManagement')}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Filter and Bulk Selection */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    placeholder={t('people:addMonthRules.filterPlaceholder')}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                  {modalSearch && (
                    <button
                      type="button"
                      onClick={() => setModalSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={selectAll}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  {selectedIds.length === eligibleRules.length ? (
                    <>
                      <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{t('people:addMonthRules.unselectAll')}</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 text-slate-400" />
                      <span>
                        {t('people:addMonthRules.selectAll', { count: eligibleRules.length })}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Grid of Rules */}
              {filteredEligible.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  {t('people:addMonthRules.noMatch', { query: modalSearch })}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredEligible.map((rule) => {
                    const isSelected = selectedIds.includes(rule.id)
                    const isError = rule.severity === 'ERROR'
                    const paramSummary = getRuleParamSummary(rule)

                    return (
                      <div
                        key={rule.id}
                        onClick={() => toggleSelect(rule.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                          isSelected
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-2xs ring-1 ring-emerald-500/30'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase shrink-0 ${
                                isError
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {isError
                                ? t('people:sidebar.errorSeverity')
                                : t('people:sidebar.warningSeverity')}
                            </span>
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {rule.name}
                            </p>
                          </div>
                          {paramSummary && (
                            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                              {paramSummary}
                            </p>
                          )}
                          {rule.description && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {rule.description}
                            </p>
                          )}
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {eligibleRules.length > 0 && (
              <span
                dangerouslySetInnerHTML={{
                  __html: t('people:addMonthRules.selectedSummary', {
                    selected: selectedIds.length,
                    total: eligibleRules.length,
                  }),
                }}
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition"
            >
              {t('people:addMonthRules.cancel')}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-xs transition"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>
                {selectedIds.length > 0
                  ? t('people:addMonthRules.addSelectedWithCount', { count: selectedIds.length })
                  : t('people:addMonthRules.addSelected')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

