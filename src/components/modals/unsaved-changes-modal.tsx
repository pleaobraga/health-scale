import { AlertTriangle, Save, Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation, Trans } from 'react-i18next'

import { useScheduleStore } from '../../store/use-schedule-store'

export function UnsavedChangesModal() {
  const { t } = useTranslation(['calendar', 'common'])
  const {
    isUnsavedModalOpen,
    setUnsavedModalOpen,
    saveSchedule,
    discardChanges,
  } = useScheduleStore()

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isUnsavedModalOpen) {
        setUnsavedModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isUnsavedModalOpen, setUnsavedModalOpen])

  if (!isUnsavedModalOpen) return null

  const handleSaveAndExit = () => {
    saveSchedule()
    useScheduleStore.setState({ isEditMode: false, isUnsavedModalOpen: false })
  }

  const handleDiscardAndExit = () => {
    discardChanges()
    useScheduleStore.setState({ isEditMode: false, isUnsavedModalOpen: false })
  }

  const handleCancel = () => {
    setUnsavedModalOpen(false)
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-modal-title"
      className="modal-overlay fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
    >
      <div className="modal-panel bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="modal-header flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-amber-50/60 dark:bg-amber-950/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3
                id="unsaved-modal-title"
                className="text-base font-bold text-slate-900 dark:text-white"
              >
                {t('calendar:unsavedModal.title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('calendar:unsavedModal.subtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            title={t('common:actions.close')}
            aria-label={t('common:actions.close')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div data-testid="unsaved-modal-body" className="modal-body p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <Trans ns="calendar" i18nKey="unsavedModal.message">
              Se você alternar para o modo de <strong>Visualização</strong> sem salvar, todas as escalas e turnos modificados serão descartados e o calendário retornará ao estado original.
            </Trans>
          </p>

          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/80 dark:border-amber-800 text-xs font-semibold text-amber-900 dark:text-amber-200">
            {t('calendar:unsavedModal.question')}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="modal-footer px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2 justify-end sm:items-center shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto h-9 px-3.5 flex items-center justify-center text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition whitespace-nowrap shrink-0"
          >
            {t('calendar:unsavedModal.stay')}
          </button>

          <button
            type="button"
            onClick={handleDiscardAndExit}
            className="w-full sm:w-auto h-9 flex items-center justify-center gap-1.5 px-3.5 text-xs font-bold rounded-xl text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition shadow-2xs whitespace-nowrap shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span>{t('calendar:unsavedModal.discardAndExit')}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndExit}
            className="w-full sm:w-auto h-9 flex items-center justify-center gap-1.5 px-4 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition shadow-xs whitespace-nowrap shrink-0"
          >
            <Save className="w-3.5 h-3.5 shrink-0" />
            <span>{t('calendar:unsavedModal.saveAndExit')}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

