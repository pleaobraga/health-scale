import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useToastStore } from '../../store/use-toast-store'

import type { ToastType } from '../../store/use-toast-store'

const TOAST_STYLES: Record<ToastType, { icon: typeof Info; className: string; iconClassName: string }> = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/90',
    iconClassName: 'text-emerald-600 dark:text-emerald-400',
  },
  error: {
    icon: AlertCircle,
    className: 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/90',
    iconClassName: 'text-rose-600 dark:text-rose-400',
  },
  info: {
    icon: Info,
    className: 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/90',
    iconClassName: 'text-indigo-600 dark:text-indigo-400',
  },
}

export function ToastViewport() {
  const { t } = useTranslation(['common'])
  const { toasts, dismissToast } = useToastStore()

  return (
    <div
      aria-live="polite"
      data-testid="toast-viewport"
      className="fixed z-130 right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-4 w-[calc(100%-2rem)] max-w-sm flex flex-col gap-2 pointer-events-none print:hidden"
    >
      {toasts.map((toast) => {
        const { icon: Icon, className, iconClassName } = TOAST_STYLES[toast.type]
        return (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            data-testid={`toast-${toast.type}`}
            className={`pointer-events-auto flex items-start gap-3 p-3 rounded-xl border shadow-lg text-sm text-slate-800 dark:text-slate-100 animate-fadeIn ${className}`}
          >
            <Icon className={`w-5 h-5 mt-px shrink-0 ${iconClassName}`} />
            <p className="flex-1 font-medium leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label={t('common:actions.close')}
              className="p-0.5 -m-0.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
