import { AlertTriangle, Trash2, X } from 'lucide-react'
import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  confirmLabel: string
  /** Defaults to the generic "Cancel" label */
  cancelLabel?: string
  /** `danger` for destructive actions (red), `warning` for reversible ones (amber) */
  variant?: 'danger' | 'warning'
  isBusy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const VARIANT_STYLES = {
  danger: {
    icon: Trash2,
    iconBox:
      'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/80',
    confirmButton: 'bg-rose-600 hover:bg-rose-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconBox:
      'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/80',
    confirmButton: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
}

/**
 * In-app replacement for `window.confirm`. Like every modal it takes the full screen at
 * <= 640px through the `.modal-overlay` rule in index.css.
 */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation(['common'])
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isBusy) {
        e.stopPropagation()
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [isOpen, isBusy, onCancel])

  if (!isOpen) return null

  const { icon: Icon, iconBox, confirmButton } = VARIANT_STYLES[variant]

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="modal-overlay fixed inset-0 z-140 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn print:hidden"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 relative flex flex-col">
        <button
          type="button"
          onClick={onCancel}
          disabled={isBusy}
          aria-label={t('common:actions.close')}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 pr-6 mobile:flex-1 mobile:pt-8">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${iconBox}`}
          >
            <Icon className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="space-y-2">
            <h3 id={titleId} className="text-lg font-bold leading-snug">
              {title}
            </h3>
            <p
              id={descriptionId}
              className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
            >
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            autoFocus
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-colors text-slate-700 dark:text-slate-300 disabled:opacity-50"
          >
            {cancelLabel ?? t('common:actions.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            data-testid="confirm-dialog-confirm"
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors disabled:opacity-50 ${confirmButton}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
