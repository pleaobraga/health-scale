/**
 * Translates Firebase Auth error codes into friendly user messages in Portuguese.
 */
export const getFriendlyAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha incorretos. Verifique suas credenciais.'
    case 'auth/invalid-email':
      return 'O formato do e-mail digitado é inválido.'
    case 'auth/user-disabled':
      return 'Esta conta de usuário foi desativada pelo administrador.'
    case 'auth/too-many-requests':
      return 'Acesso temporariamente bloqueado devido a muitas tentativas. Tente mais tarde.'
    case 'auth/network-request-failed':
      return 'Falha de conexão com a rede. Verifique seu acesso à internet.'
    default:
      return 'Erro ao tentar autenticar. Verifique seus dados e tente novamente.'
  }
}

