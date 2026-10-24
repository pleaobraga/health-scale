import { Clock, Check, X, CheckSquare, Square, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { formatMonthYear } from '../../utils/date-utils'

import type { ShiftDefinition } from '../../types'

export interface AddMonthShiftsModalProps {
  isOpen: boolean
  onClose: () => void
  currentMonth: string
  allShifts: ShiftDefinition[]
  currentShiftIds: string[]
  onAddShifts: (shiftIds: string[]) => void
  onGoToGlobalManagement?: () => void
}

export function AddMonthShiftsModal({
  isOpen,
  onClose,
  currentMonth,
  allShifts,
  currentShiftIds,
  onAddShifts,
  onGoToGlobalManagement,
}: AddMonthShiftsModalProps) {
  const { t, i18n } = useTranslation(['people', 'common'])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [modalSearch, setModalSearch] = useState('')

  // Eligible shifts are global shifts NOT yet active in this month
  const eligibleShifts = allShifts.filter((s) => !currentShiftIds.includes(s.id))

  const filteredEligible = eligibleShifts.filter(
    (s) =>
      s.name.toLowerCase().includes(modalSearch.toLowerCase().trim()) ||
      s.code.toLowerCase().includes(modalSearch.toLowerCase().trim())
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
    if (selectedIds.length === eligibleShifts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(eligibleShifts.map((s) => s.id))
    }
  }

  const handleConfirm = () => {
    if (selectedIds.length > 0) {
      onAddShifts(selectedIds)
      onClose()
    }
  }

  const monthFormatted = formatMonthYear(currentMonth, i18n.language)

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-month-shifts-title"
      className="modal-overlay fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl lg:max-w-3xl overflow-hidden flex flex-col max-h-[90vh] transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-100 dark:border-violet-800 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0 shadow-2xs">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="add-month-shifts-title"
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                >
                  {t('people:addMonthShifts.title')}
                </h3>
                <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded-full border border-violet-100 dark:border-violet-800">
                  {eligibleShifts.length === 1
                    ? t('people:addMonthShifts.available', { count: eligibleShifts.length })
                    : t('people:addMonthShifts.availablePlural', { count: eligibleShifts.length })}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                {t('people:addMonthShifts.scheduleOf', { month: monthFormatted })}
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
          {eligibleShifts.length === 0 ? (
            <div className="text-center py-12 px-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {allShifts.length === 0
                  ? t('people:addMonthShifts.noneGlobal')
                  : t('people:addMonthShifts.allLinked')}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                {allShifts.length === 0
                  ? t('people:addMonthShifts.noneGlobalDesc')
                  : t('people:addMonthShifts.allLinkedDesc')}
              </p>
              {allShifts.length === 0 && onGoToGlobalManagement && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onGoToGlobalManagement()
                  }}
                  className="mt-4 px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-xs transition"
                >
                  {t('people:addMonthShifts.goToManagement')}
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
                    placeholder={t('people:addMonthShifts.filterPlaceholder')}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
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
                  {selectedIds.length === eligibleShifts.length ? (
                    <>
                      <CheckSquare className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      <span>{t('people:addMonthShifts.unselectAll')}</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 text-slate-400" />
                      <span>
                        {t('people:addMonthShifts.selectAll', { count: eligibleShifts.length })}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Grid of Shifts */}
              {filteredEligible.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  {t('people:addMonthShifts.noMatch', { query: modalSearch })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredEligible.map((shift) => {
                    const isSelected = selectedIds.includes(shift.id)

                    return (
                      <div
                        key={shift.id}
                        onClick={() => toggleSelect(shift.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                          isSelected
                            ? 'bg-violet-50/80 dark:bg-violet-950/40 border-violet-300 dark:border-violet-700 shadow-2xs ring-1 ring-violet-500/30'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            style={{ backgroundColor: shift.color }}
                            className="px-2 py-0.5 rounded-md text-white font-extrabold text-[10px] shrink-0 shadow-2xs"
                          >
                            {shift.code}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {shift.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              {t('people:sidebar.shiftSummary', {
                                startTime: shift.startTime,
                                hours: shift.durationHours,
                              })}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition ${
                            isSelected
                              ? 'bg-violet-600 border-violet-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-3" />
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
            {eligibleShifts.length > 0 && (
              <span
                dangerouslySetInnerHTML={{
                  __html: t('people:addMonthShifts.selectedSummary', {
                    selected: selectedIds.length,
                    total: eligibleShifts.length,
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
              {t('people:addMonthShifts.cancel')}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-xs transition"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>
                {selectedIds.length > 0
                  ? t('people:addMonthShifts.addSelectedWithCount', { count: selectedIds.length })
                  : t('people:addMonthShifts.addSelected')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

