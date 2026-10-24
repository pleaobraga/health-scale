import { i18n } from '../i18n'
import { showErrorToast, showSuccessToast } from '../store/use-toast-store'

import type { CloudPullResult, CloudPushResult } from '../store/use-schedule-store'

const PULL_ERROR_KEYS = {
  no_data: 'common:toast.pullNoData',
  offline: 'common:toast.pullOffline',
  unauthorized: 'common:toast.pullUnauthorized',
  error: 'common:toast.pullError',
} as const

/**
 * Shows the outcome of a cloud pull as a toast.
 */
export function notifyPullResult(result: CloudPullResult): void {
  if (result.success) {
    showSuccessToast(i18n.t('common:toast.pullSuccess'))
    return
  }
  const code = result.code && result.code !== 'success' ? result.code : 'error'
  showErrorToast(i18n.t(PULL_ERROR_KEYS[code]))
}

/**
 * Shows the outcome of a forced cloud push as a toast.
 */
export function notifyPushResult(result: CloudPushResult): void {
  if (result.success) {
    showSuccessToast(i18n.t('common:toast.pushSuccess'))
    return
  }
  showErrorToast(
    i18n.t(result.code === 'offline' ? 'common:toast.pushOffline' : 'common:toast.pushError'),
  )
}
