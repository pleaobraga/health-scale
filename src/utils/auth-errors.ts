import { i18n } from '../i18n'

/**
 * Translates Firebase Auth error codes into localized friendly user messages.
 */
export const getFriendlyAuthErrorMessage = (
  errorCode: string,
  translate?: (key: string) => string,
): string => {
  const t = translate || ((key: string) => (i18n.t as (k: string) => string)(key))

  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return t('auth:errors.invalidCredentials')
    case 'auth/user-not-found':
      return t('auth:errors.userNotFound')
    case 'auth/invalid-email':
      return t('auth:errors.invalidEmail')
    case 'auth/user-disabled':
      return t('auth:errors.userDisabled')
    case 'auth/too-many-requests':
      return t('auth:errors.tooManyRequests')
    case 'auth/network-request-failed':
      return t('auth:errors.networkError')
    default:
      return t('auth:errors.genericError')
  }
}
