import { X, Check, Trash2, User, Palette } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { AvailabilityMiniCalendar } from './availability-mini-calendar'
import { TAILWIND_PALETTE } from '../../constants/tailwind-colors'

import type { Person } from '../../types'

export interface PersonModalProps {
  isOpen: boolean
  onClose: () => void
  personToEdit?: Person | null
  currentMonth: string
  initialAvailableDays?: number[]
  onSave: (name: string, color: string, availableDays: number[]) => void
  onDelete?: (id: string) => void
}

export function PersonModal({
  isOpen,
  onClose,
  personToEdit,
  currentMonth,
  initialAvailableDays = [],
  onSave,
  onDelete,
}: PersonModalProps) {
  const { t } = useTranslation(['people', 'common'])
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState(TAILWIND_PALETTE[0].hex)
  const [availableDays, setAvailableDays] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (personToEdit) {
      setName(personToEdit.name)
      setSelectedColor(personToEdit.color)
      setAvailableDays(initialAvailableDays)
    } else {
      setName('')
      setSelectedColor(TAILWIND_PALETTE[0].hex)
      setAvailableDays([])
    }
    setError(null)
  }, [personToEdit, initialAvailableDays, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('people:personModal.nameRequired'))
      return
    }
    onSave(name.trim(), selectedColor, availableDays)
    onClose()
  }

  const handleDelete = () => {
    if (personToEdit && onDelete) {
      if (confirm(t('people:personModal.deleteConfirm', { name: personToEdit.name }))) {
        onDelete(personToEdit.id)
        onClose()
      }
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: selectedColor }}
            />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {personToEdit ? t('people:personModal.editTitle') : t('people:personModal.newTitle')}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label={t('common:actions.close')}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-medium">
              {error}
            </div>
          )}

          {/* Name Input */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              {t('people:personModal.nameLabel')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError(null)
              }}
              placeholder={t('people:personModal.namePlaceholder')}
              autoFocus
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-100 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Color Picker: High-contrast palette */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Palette className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>{t('people:personModal.colorLabel')}</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {TAILWIND_PALETTE.find((c) => c.hex.toLowerCase() === selectedColor.toLowerCase())?.name || t('people:personModal.customColor')}
                </span>
                <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {selectedColor.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl max-h-52 overflow-y-auto">
              {TAILWIND_PALETTE.map((color) => {
                const isSelected = selectedColor.toLowerCase() === color.hex.toLowerCase()
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setSelectedColor(color.hex)}
                    style={{ backgroundColor: color.hex }}
                    title={`${color.name} (${color.hex})`}
                    aria-label={color.name}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      isSelected ? 'ring-2 ring-slate-800 dark:ring-white ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-md' : ''
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Availability Mini Calendar */}
          <div>
            <AvailabilityMiniCalendar
              month={currentMonth}
              selectedDays={availableDays}
              onChange={setAvailableDays}
              accentColor={selectedColor}
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            {personToEdit && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('people:personModal.delete')}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition"
              >
                {t('people:personModal.cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm rounded-xl transition"
              >
                {personToEdit ? t('people:personModal.save') : t('people:personModal.create')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
