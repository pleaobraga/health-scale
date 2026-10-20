import {
  Clock,
  Plus,
  Edit2,
  Copy,
  Trash2,
  Check,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SettingsNavTabs } from './settings-nav-tabs'
import { TAILWIND_PALETTE } from '../../constants/tailwind-colors'
import { useScheduleStore } from '../../store/use-schedule-store'

import type { ShiftDefinition } from '../../types'

export function ShiftsManagementView() {
  const { t } = useTranslation(['settings', 'common'])
  const {
    shiftDefinitions,
    addShiftDefinition,
    updateShiftDefinition,
    deleteShiftDefinition,
    duplicateShiftDefinition,
  } = useScheduleStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<ShiftDefinition | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [startTime, setStartTime] = useState('07:00')
  const [durationHours, setDurationHours] = useState(12)
  const [color, setColor] = useState('#3B82F6')
  const [enabledByDefault, setEnabledByDefault] = useState(true)

  const handleOpenCreateModal = () => {
    setEditingShift(null)
    setName('')
    setCode('')
    setStartTime('07:00')
    setDurationHours(12)
    setColor('#3B82F6')
    setEnabledByDefault(true)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (shift: ShiftDefinition) => {
    setEditingShift(shift)
    setName(shift.name)
    setCode(shift.code)
    setStartTime(shift.startTime)
    setDurationHours(shift.durationHours)
    setColor(shift.color)
    setEnabledByDefault(shift.enabledByDefault)
    setIsModalOpen(true)
  }

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) return

    if (editingShift) {
      updateShiftDefinition(editingShift.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        startTime,
        durationHours: Number(durationHours) || 12,
        color,
        enabledByDefault,
      })
    } else {
      addShiftDefinition({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        startTime,
        durationHours: Number(durationHours) || 12,
        color,
        enabledByDefault,
      })
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteShiftDefinition(id)
    setDeleteConfirmId(null)
  }

  return (
    <div
      data-testid="shifts-management-view"
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
            <span>{t('settings:shifts.newShift')}</span>
          </button>
        </div>

        {/* View Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('settings:shifts.title')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('settings:shifts.subtitle')}
            </p>
          </div>
        </div>

        {/* Total Summary */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
          <span>{t('settings:shifts.totalRegistered', { count: shiftDefinitions.length })}</span>
        </div>

        {/* Shifts List / Cards */}
        {shiftDefinitions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {t('settings:shifts.emptyTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {t('settings:shifts.emptyDesc')}
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('settings:shifts.newShift')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shiftDefinitions.map((shift) => (
              <div
                key={shift.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between gap-4 transition hover:shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      style={{ backgroundColor: shift.color }}
                      className="px-2.5 py-1 rounded-lg text-white font-extrabold text-xs shadow-2xs"
                    >
                      {shift.code}
                    </span>

                    {/* Enabled By Default Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        shift.enabledByDefault
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {shift.enabledByDefault ? t('common:status.defaultActive') : t('common:status.defaultInactive')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {shift.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>{t('settings:shifts.startTime')}: <strong>{shift.startTime}</strong></span>
                      <span>•</span>
                      <span>{t('settings:shifts.durationHours')}: <strong>{t('settings:shifts.hoursBadge', { hours: shift.durationHours })}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(shift)}
                    title={t('settings:shifts.edit')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => duplicateShiftDefinition(shift.id)}
                    title={t('settings:shifts.duplicate')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(shift.id)}
                    title={t('settings:shifts.delete')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('settings:shifts.delete')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t('settings:shifts.deleteConfirm')}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t('settings:shifts.cancel')}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition"
              >
                {t('settings:shifts.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingShift ? t('settings:shifts.editShift') : t('settings:shifts.newShift')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="space-y-4">
              {/* Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('settings:shifts.name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('settings:shifts.namePlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('settings:shifts.code')} *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder={t('settings:shifts.codePlaceholder')}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white uppercase"
                  />
                </div>
              </div>

              {/* Start Time & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('settings:shifts.startTime')} *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('settings:shifts.durationHours')} *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={72}
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Color Swatches */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('settings:shifts.color')}
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 border border-slate-200 dark:border-slate-700 rounded-xl">
                  {TAILWIND_PALETTE.map((pal) => (
                    <button
                      key={pal.hex}
                      type="button"
                      onClick={() => setColor(pal.hex)}
                      style={{ backgroundColor: pal.hex }}
                      className="w-6 h-6 rounded-lg transition-transform hover:scale-110 flex items-center justify-center shrink-0"
                      title={pal.name}
                    >
                      {color.toLowerCase() === pal.hex.toLowerCase() && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enabled By Default Toggle */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t('settings:shifts.enabledByDefault')}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('settings:shifts.enabledByDefaultDesc')}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabledByDefault}
                  onClick={() => setEnabledByDefault(!enabledByDefault)}
                  className={`w-10 h-6 rounded-full transition-colors relative shrink-0 focus:outline-hidden ${
                    enabledByDefault ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      enabledByDefault ? 'left-5' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {t('settings:shifts.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs"
                >
                  {editingShift ? t('settings:shifts.save') : t('settings:shifts.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
