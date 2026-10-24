import { CloudDownload, CloudUpload, RefreshCw, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

export type EnableCloudSyncChoice = 'push' | 'pull'

export interface EnableCloudSyncModalProps {
  isOpen: boolean
  onClose: () => void
  onChoose: (choice: EnableCloudSyncChoice) => void
  /** Choice currently running, if any */
  pendingChoice?: EnableCloudSyncChoice | null
}

export function EnableCloudSyncModal({
  isOpen,
  onClose,
  onChoose,
  pendingChoice = null,
}: EnableCloudSyncModalProps) {
  const { t } = useTranslation(['settings', 'common'])
  const isBusy = pendingChoice !== null

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isBusy) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, isBusy])

  if (!isOpen) return null

  const options = [
    {
      choice: 'pull' as const,
      icon: CloudDownload,
      title: t('settings:enableSyncModal.pullTitle'),
      description: t('settings:enableSyncModal.pullDesc'),
      className:
        'border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300',
    },
    {
      choice: 'push' as const,
      icon: CloudUpload,
      title: t('settings:enableSyncModal.pushTitle'),
      description: t('settings:enableSyncModal.pushDesc'),
      className:
        'border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300',
    },
  ]

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="enable-cloud-sync-title"
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 print:hidden"
    >
      <div className="modal-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full text-slate-900 dark:text-slate-100 relative">
        <button
          type="button"
          onClick={onClose}
          disabled={isBusy}
          aria-label={t('common:actions.close')}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="modal-header space-y-2 px-6 pt-6 pr-12">
          <h3 id="enable-cloud-sync-title" className="text-lg font-bold leading-snug">
            {t('settings:enableSyncModal.title')}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('settings:enableSyncModal.description')}
          </p>
        </div>

        <div className="modal-body px-6 pt-5 pb-6 space-y-3">
          {options.map(({ choice, icon: Icon, title, description, className }) => (
            <button
              key={choice}
              type="button"
              onClick={() => onChoose(choice)}
              disabled={isBusy}
              data-testid={`enable-sync-${choice}`}
              className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-colors disabled:opacity-50 ${className}`}
            >
              {pendingChoice === choice ? (
                <RefreshCw className="w-5 h-5 mt-0.5 shrink-0 animate-spin" />
              ) : (
                <Icon className="w-5 h-5 mt-0.5 shrink-0" />
              )}
              <span className="space-y-0.5">
                <span className="block text-sm font-bold">{title}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {description}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="modal-footer flex justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-colors text-slate-700 dark:text-slate-300 disabled:opacity-50"
          >
            {t('settings:enableSyncModal.cancel')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
