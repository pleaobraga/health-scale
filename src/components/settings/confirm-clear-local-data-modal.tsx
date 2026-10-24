import { AlertTriangle, Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

export interface ConfirmClearLocalDataModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isClearing?: boolean
}

export function ConfirmClearLocalDataModal({
  isOpen,
  onClose,
  onConfirm,
  isClearing = false,
}: ConfirmClearLocalDataModalProps) {
  const { t } = useTranslation(['settings', 'common'])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isClearing) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, isClearing])

  if (!isOpen) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-local-data-title"
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 relative">
        <button
          type="button"
          onClick={onClose}
          disabled={isClearing}
          aria-label={t('settings:clearLocalDataModal.closeAria')}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/80 dark:border-rose-800/80">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <h3 id="clear-local-data-title" className="text-lg font-bold leading-snug">
              {t('settings:clearLocalDataModal.title')}
            </h3>
            <p
              className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: t('settings:clearLocalDataModal.description') }}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('settings:clearLocalDataModal.note')}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isClearing}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-colors text-slate-700 dark:text-slate-300 disabled:opacity-50"
          >
            {t('settings:clearLocalDataModal.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isClearing}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {isClearing
                ? t('settings:clearLocalDataModal.clearing')
                : t('settings:clearLocalDataModal.confirm')}
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

