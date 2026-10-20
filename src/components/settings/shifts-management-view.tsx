import {
  Clock,
  Plus,
  Search,
  Edit2,
  Copy,
  Trash2,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

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

  const [searchQuery, setSearchQuery] = useState('')
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

  const filteredShifts = shiftDefinitions.filter((shift) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      shift.name.toLowerCase().includes(q) ||
      shift.code.toLowerCase().includes(q) ||
      shift.startTime.toLowerCase().includes(q)
    )
  })

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
      className="flex-1 h-full overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6 max-w-[1500px] w-full mx-auto custom-scrollbar"
    >
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-xs">
            <Clock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('settings:shifts.title')}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {t('settings:shifts.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-xs transition-all shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t('settings:shifts.newShift')}</span>
          </button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={t('settings:shifts.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 self-end sm:self-center">
          <span className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            {t('settings:shifts.totalRegistered', { count: shiftDefinitions.length })}
          </span>
        </div>
      </div>

      {/* Shifts List / Cards */}
      {filteredShifts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-300">
            {searchQuery
              ? t('settings:shifts.noSearchResults')
              : t('settings:shifts.emptyTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {!searchQuery && t('settings:shifts.emptyDesc')}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('settings:shifts.newShift')}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShifts.map((shift) => (
            <div
              key={shift.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between gap-4 transition hover:border-slate-300 dark:hover:border-slate-700"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col transition-colors">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-rose-50/60 dark:bg-rose-950/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-2xs">
                  <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('settings:shifts.delete')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('settings:shifts.deleteConfirm')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                title={t('common:actions.close')}
                aria-label={t('common:actions.close')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                {t('settings:shifts.cancel')}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 transition shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('settings:shifts.delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col transition-colors max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-2xs">
                  <Clock className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingShift ? t('settings:shifts.editShift') : t('settings:shifts.newShift')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('settings:shifts.subtitle')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                title={t('common:actions.close')}
                aria-label={t('common:actions.close')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="p-6 space-y-4">
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
