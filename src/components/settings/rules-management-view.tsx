import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Plus,
  Edit2,
  Copy,
  Trash2,
  Check,
  X,
  Layers,
  Info,
  HelpCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsNavTabs } from './settings-nav-tabs'
import { useScheduleStore } from '../../store/use-schedule-store'

import type { PeriodScope, RuleType, ShiftRule } from '../../types'

export function RulesManagementView() {
  const { t } = useTranslation(['settings', 'common'])
  const {
    shiftRules,
    shiftDefinitions,
    currentMonth,
    validationErrors,
    addShiftRule,
    updateShiftRule,
    deleteShiftRule,
    duplicateShiftRule,
  } = useScheduleStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<ShiftRule | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<RuleType>('MAX_SHIFTS_PER_PERIOD')
  const [severity, setSeverity] = useState<'ERROR' | 'WARNING'>('ERROR')
  const [scope, setScope] = useState<PeriodScope>('DAY')
  const [maxOccurrences, setMaxOccurrences] = useState(1)
  const [maxHours, setMaxHours] = useState(24)
  const [minRestHours, setMinRestHours] = useState(24)
  const [consecutiveDaysLimit, setConsecutiveDaysLimit] = useState(1)
  const [targetShiftIds, setTargetShiftIds] = useState<string[]>([])
  const [enabledByDefault, setEnabledByDefault] = useState(true)

  const handleOpenCreateModal = () => {
    setEditingRule(null)
    setName('')
    setDescription('')
    setType('MAX_SHIFTS_PER_PERIOD')
    setSeverity('ERROR')
    setScope('DAY')
    setMaxOccurrences(1)
    setMaxHours(24)
    setMinRestHours(24)
    setConsecutiveDaysLimit(1)
    setTargetShiftIds([])
    setEnabledByDefault(true)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (rule: ShiftRule) => {
    setEditingRule(rule)
    setName(rule.name)
    setDescription(rule.description || '')
    setType(rule.type)
    setSeverity(rule.severity)
    setScope(rule.parameters.scope || 'DAY')
    setMaxOccurrences(rule.parameters.maxOccurrences ?? 1)
    setMaxHours(rule.parameters.maxHours ?? 24)
    setMinRestHours(rule.parameters.minRestHours ?? 24)
    setConsecutiveDaysLimit(rule.parameters.consecutiveDaysLimit ?? 1)
    setTargetShiftIds(rule.parameters.targetShiftIds || [])
    setEnabledByDefault(rule.enabledByDefault)
    setIsModalOpen(true)
  }

  const handleToggleTargetShift = (shiftId: string) => {
    setTargetShiftIds((prev) =>
      prev.includes(shiftId) ? prev.filter((id) => id !== shiftId) : [...prev, shiftId]
    )
  }

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const parameters: ShiftRule['parameters'] = {}

    if (type === 'MAX_SHIFTS_PER_PERIOD') {
      parameters.scope = scope
      parameters.maxOccurrences = Number(maxOccurrences) || 1
    } else if (type === 'MAX_HOURS_PER_PERIOD') {
      parameters.scope = scope
      parameters.maxHours = Number(maxHours) || 24
    } else if (type === 'MIN_REST_HOURS') {
      parameters.minRestHours = Number(minRestHours) || 24
    } else if (type === 'CONSECUTIVE_DAYS_LIMIT') {
      parameters.consecutiveDaysLimit = Number(consecutiveDaysLimit) || 1
    }

    if (targetShiftIds.length > 0) {
      parameters.targetShiftIds = targetShiftIds
    }

    if (editingRule) {
      updateShiftRule(editingRule.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        severity,
        parameters,
        enabledByDefault,
      })
    } else {
      addShiftRule({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        severity,
        parameters,
        enabledByDefault,
      })
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteShiftRule(id)
    setDeleteConfirmId(null)
  }

  const getRuleTriggerCriterion = (rule: ShiftRule) => {
    switch (rule.type) {
      case 'MAX_SHIFTS_PER_PERIOD': {
        const count = rule.parameters.maxOccurrences ?? 1
        const rScope = rule.parameters.scope || 'DAY'
        if (rScope === 'DAY') {
          return t('settings:rules.logicExplanation.maxShiftsDay', { count })
        }
        if (rScope === 'WEEK') {
          return t('settings:rules.logicExplanation.maxShiftsWeek', { count })
        }
        return t('settings:rules.logicExplanation.maxShiftsMonth', { count })
      }
      case 'MAX_HOURS_PER_PERIOD': {
        const hours = rule.parameters.maxHours ?? 24
        const rScope = rule.parameters.scope || 'DAY'
        if (rScope === 'DAY') {
          return t('settings:rules.logicExplanation.maxHoursDay', { hours })
        }
        if (rScope === 'WEEK') {
          return t('settings:rules.logicExplanation.maxHoursWeek', { hours })
        }
        return t('settings:rules.logicExplanation.maxHoursMonth', { hours })
      }
      case 'MIN_REST_HOURS': {
        const hours = rule.parameters.minRestHours ?? 24
        return t('settings:rules.logicExplanation.minRest', { hours })
      }
      case 'CONSECUTIVE_DAYS_LIMIT': {
        const days = rule.parameters.consecutiveDaysLimit ?? 1
        return t('settings:rules.logicExplanation.consecutiveDays', { days })
      }
      default:
        return ''
    }
  }

  return (
    <div
      data-testid="rules-management-view"
      className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 md:p-8 flex flex-col items-center custom-scrollbar"
    >
      <div className="w-full max-w-5xl space-y-6 pb-12">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <SettingsNavTabs />

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('settings:rules.newRule')}</span>
          </button>
        </div>

        {/* View Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('settings:rules.title')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('settings:rules.subtitle')}
            </p>
          </div>
        </div>

        {/* Educational Banner Explaining Severity vs Rules */}
        <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 rounded-2xl p-4 flex items-start gap-3.5 shadow-2xs">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-indigo-950 dark:text-indigo-200">
              {t('settings:rules.banner.title')}
            </h4>
            <p className="text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed">
              {t('settings:rules.banner.description')}
            </p>
          </div>
        </div>

        {/* Total Summary */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
          <span>{t('settings:rules.totalRegistered', { count: shiftRules.length })}</span>
        </div>

        {/* Rules List / Cards */}
        {shiftRules.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {t('settings:rules.emptyTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {t('settings:rules.emptyDesc')}
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('settings:rules.newRule')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shiftRules.map((rule) => {
              const isError = rule.severity === 'ERROR'
              return (
                <div
                  key={rule.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between gap-4 transition hover:shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Severity Badge */}
                        <span
                          title={
                            isError
                              ? t('settings:rules.severityDescriptions.ERROR')
                              : t('settings:rules.severityDescriptions.WARNING')
                          }
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border cursor-help ${
                            isError
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
                          }`}
                        >
                          {isError ? (
                            <ShieldAlert className="w-3 h-3 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                          )}
                          {isError
                            ? t('settings:rules.severities.ERROR')
                            : t('settings:rules.severities.WARNING')}
                        </span>

                        {/* Type Badge */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <Layers className="w-3 h-3 text-slate-400" />
                          {t(`settings:rules.types.${rule.type}`)}
                        </span>
                      </div>

                      {/* Default Active Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          rule.enabledByDefault
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {rule.enabledByDefault
                          ? t('common:status.defaultActive')
                          : t('common:status.defaultInactive')}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {rule.name}
                      </h3>
                      {rule.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {rule.description}
                        </p>
                      )}
                    </div>

                    {/* Trigger Criterion explanation */}
                    <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-950 dark:text-indigo-300">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>{t('settings:rules.logicExplanation.title')}</span>
                      </div>
                      <p className="text-[11px] text-indigo-900/80 dark:text-indigo-200/80 leading-snug">
                        {getRuleTriggerCriterion(rule)}
                      </p>
                    </div>

                    {/* Parameters Details */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {rule.parameters.scope && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">
                            {t('settings:rules.scope')}:
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {t(`settings:rules.scopes.${rule.parameters.scope}`)}
                          </span>
                        </div>
                      )}

                      {rule.parameters.maxOccurrences !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">
                            {t('settings:rules.maxOccurrences')}:
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {rule.parameters.maxOccurrences}
                          </span>
                        </div>
                      )}

                      {rule.parameters.maxHours !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">
                            {t('settings:rules.maxHours')}:
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {t('settings:shifts.hoursBadge', { hours: rule.parameters.maxHours })}
                          </span>
                        </div>
                      )}

                      {rule.parameters.minRestHours !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">
                            {t('settings:rules.minRestHours')}:
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {t('settings:shifts.hoursBadge', { hours: rule.parameters.minRestHours })}
                          </span>
                        </div>
                      )}

                      {rule.parameters.consecutiveDaysLimit !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">
                            {t('settings:rules.consecutiveDaysLimit')}:
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {rule.parameters.consecutiveDaysLimit}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-slate-400 font-medium">
                          {t('settings:rules.targetShifts')}:
                        </span>
                        <div className="flex items-center gap-1 flex-wrap justify-end">
                          {!rule.parameters.targetShiftIds || rule.parameters.targetShiftIds.length === 0 ? (
                            <span className="text-[11px] text-slate-500 italic">
                              {t('settings:rules.allShiftsOption')}
                            </span>
                          ) : (
                            rule.parameters.targetShiftIds.map((sId) => {
                              const sDef = shiftDefinitions.find((s) => s.id === sId)
                              return (
                                <span
                                  key={sId}
                                  style={{
                                    backgroundColor: sDef?.color || '#64748B',
                                  }}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
                                >
                                  {sDef?.code || sId}
                                </span>
                              )
                            })
                          )}
                        </div>
                      </div>

                      {/* Active Month Impact Status */}
                      {(() => {
                        const violationsForRule = validationErrors.filter(
                          (v) => v.rule === rule.id || v.id?.startsWith(rule.id)
                        )
                        const count = violationsForRule.length
                        return (
                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                            <span className="text-slate-400 font-medium">
                              {t('settings:rules.activeMonthStatus.title', { month: currentMonth })}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                count > 0
                                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                                  : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                              }`}
                            >
                              {count > 0
                                ? count === 1
                                  ? t('settings:rules.activeMonthStatus.hasViolations', { count: 1 })
                                  : t('settings:rules.activeMonthStatus.hasViolationsPlural', {
                                      count,
                                    })
                                : t('settings:rules.activeMonthStatus.noViolations')}
                            </span>
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(rule)}
                      title={t('settings:rules.edit')}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => duplicateShiftRule(rule.id)}
                      title={t('settings:rules.duplicate')}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(rule.id)}
                      title={t('settings:rules.delete')}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('settings:rules.delete')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t('settings:rules.deleteConfirm')}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t('settings:rules.cancel')}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition"
              >
                {t('settings:rules.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl my-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingRule ? t('settings:rules.editRule') : t('settings:rules.newRule')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('settings:rules.name')} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('settings:rules.namePlaceholder')}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('settings:rules.description')}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('settings:rules.descriptionPlaceholder')}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Type and Severity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('settings:rules.type')}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as RuleType)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="MAX_SHIFTS_PER_PERIOD">
                      {t('settings:rules.types.MAX_SHIFTS_PER_PERIOD')}
                    </option>
                    <option value="MAX_HOURS_PER_PERIOD">
                      {t('settings:rules.types.MAX_HOURS_PER_PERIOD')}
                    </option>
                    <option value="MIN_REST_HOURS">
                      {t('settings:rules.types.MIN_REST_HOURS')}
                    </option>
                    <option value="CONSECUTIVE_DAYS_LIMIT">
                      {t('settings:rules.types.CONSECUTIVE_DAYS_LIMIT')}
                    </option>
                  </select>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('settings:rules.severity')}
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as 'ERROR' | 'WARNING')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ERROR">{t('settings:rules.severitySelect.ERROR')}</option>
                    <option value="WARNING">{t('settings:rules.severitySelect.WARNING')}</option>
                  </select>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {t(`settings:rules.severityDescriptions.${severity}`)}
                  </p>
                </div>
              </div>

              {/* Conditional Parameter Inputs */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {t('settings:rules.parametersTitle', { defaultValue: 'Parâmetros da Regra' })}
                </span>

                {(type === 'MAX_SHIFTS_PER_PERIOD' || type === 'MAX_HOURS_PER_PERIOD') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('settings:rules.scope')}
                      </label>
                      <select
                        value={scope}
                        onChange={(e) => setScope(e.target.value as PeriodScope)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="DAY">{t('settings:rules.scopes.DAY')}</option>
                        <option value="WEEK">{t('settings:rules.scopes.WEEK')}</option>
                        <option value="MONTH">{t('settings:rules.scopes.MONTH')}</option>
                      </select>
                    </div>

                    {type === 'MAX_SHIFTS_PER_PERIOD' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t('settings:rules.maxOccurrences')}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={maxOccurrences}
                          onChange={(e) => setMaxOccurrences(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    )}

                    {type === 'MAX_HOURS_PER_PERIOD' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t('settings:rules.maxHours')}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={720}
                          value={maxHours}
                          onChange={(e) => setMaxHours(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {type === 'MIN_REST_HOURS' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('settings:rules.minRestHours')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={72}
                      value={minRestHours}
                      onChange={(e) => setMinRestHours(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {type === 'CONSECUTIVE_DAYS_LIMIT' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('settings:rules.consecutiveDaysLimit')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={consecutiveDaysLimit}
                      onChange={(e) => setConsecutiveDaysLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {/* Target Shifts Filter */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('settings:rules.targetShifts')}
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    {t('settings:rules.allShiftsOption')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {shiftDefinitions.map((shift) => {
                      const isSelected = targetShiftIds.includes(shift.id)
                      return (
                        <button
                          key={shift.id}
                          type="button"
                          onClick={() => handleToggleTargetShift(shift.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-700 shadow-2xs'
                              : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            style={{ backgroundColor: shift.color }}
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                          />
                          <span>{shift.name} ({shift.code})</span>
                          {isSelected && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Enabled By Default Toggle */}
              <div className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="space-y-0.5">
                  <label
                    htmlFor="ruleEnabledByDefault"
                    className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    {t('settings:rules.enabledByDefault')}
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('settings:rules.enabledByDefaultDesc')}
                  </p>
                </div>
                <input
                  id="ruleEnabledByDefault"
                  type="checkbox"
                  checked={enabledByDefault}
                  onChange={(e) => setEnabledByDefault(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {t('settings:rules.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-xs transition"
                >
                  {editingRule ? t('settings:rules.save') : t('settings:rules.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
