import { AlertTriangle, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface ConfirmOverwriteModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  isRestoring?: boolean
}

export function ConfirmOverwriteModal({
  isOpen,
  onConfirm,
  onCancel,
  isRestoring = false,
}: ConfirmOverwriteModalProps) {
  const { t } = useTranslation(['import', 'common'])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="overwrite-modal-title"
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 relative">
        <button
          type="button"
          onClick={onCancel}
          disabled={isRestoring}
          aria-label={t('common:close')}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/80 dark:border-amber-800/80">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <h3 id="overwrite-modal-title" className="text-lg font-bold leading-snug">
              {t('import:overwriteModal.title')}
            </h3>
            <p
              className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: t('import:overwriteModal.description') }}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={isRestoring}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-colors text-slate-700 dark:text-slate-300 disabled:opacity-50"
          >
            {t('import:overwriteModal.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isRestoring}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isRestoring ? t('import:overwriteModal.restoring') : t('import:overwriteModal.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

