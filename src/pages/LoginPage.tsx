import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Trash2,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react'
import React, { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { getFriendlyAuthErrorMessage } from '../utils/authErrors'

const formatLastActive = (isoString?: string): string => {
  if (!isoString) return 'Recentemente'
  try {
    const date = new Date(isoString)
    return `Ativo em ${date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })} às ${date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  } catch {
    return 'Recentemente'
  }
}

export function LoginPage() {
  const { user, login, loginAsGuest, guestProfiles, deleteGuestProfile } =
    useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Guest access state
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestError, setGuestError] = useState<string | null>(null)
  const [isGuestSubmitting, setIsGuestSubmitting] = useState(false)

  // If already authenticated, redirect to destination or /calendario
  if (user) {
    const fromPath =
      (location.state as { from?: { pathname?: string } })?.from?.pathname ||
      '/calendario'
    return (
      <Navigate
        to={fromPath}
        replace
      />
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setErrorMessage('Por favor, informe seu e-mail e senha.')
      return
    }

    try {
      setIsSubmitting(true)
      await login(trimmedEmail, password)
      const fromPath =
        (location.state as { from?: { pathname?: string } })?.from?.pathname ||
        '/calendario'
      navigate(fromPath, { replace: true })
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || ''
      setErrorMessage(getFriendlyAuthErrorMessage(code))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectExistingGuest = async (guestId: string) => {
    try {
      setIsGuestSubmitting(true)
      setGuestError(null)
      await loginAsGuest('', guestId)
      const fromPath =
        (location.state as { from?: { pathname?: string } })?.from?.pathname ||
        '/calendario'
      navigate(fromPath, { replace: true })
    } catch (err: unknown) {
      setGuestError(
        (err as Error)?.message || 'Erro ao carregar conta de convidado.'
      )
    } finally {
      setIsGuestSubmitting(false)
    }
  }

  const handleCreateNewGuest = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = guestName.trim()
    if (!trimmed) {
      setGuestError('Por favor, informe seu nome.')
      return
    }

    try {
      setIsGuestSubmitting(true)
      setGuestError(null)
      await loginAsGuest(trimmed)
      const fromPath =
        (location.state as { from?: { pathname?: string } })?.from?.pathname ||
        '/calendario'
      navigate(fromPath, { replace: true })
    } catch (err: unknown) {
      setGuestError(
        (err as Error)?.message || 'Erro ao criar conta de convidado.'
      )
    } finally {
      setIsGuestSubmitting(false)
    }
  }

  return (
    <div
      data-testid="login-page"
      className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans select-none transition-colors"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Branding header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 mb-1">
            <CalendarDays className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Gerenciador de Escalas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acesso restrito para profissionais e administradores
          </p>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div
            role="alert"
            data-testid="login-error-banner"
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs animate-in fade-in duration-150"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Email field */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              E-mail institucional
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password field with visibility toggle */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition disabled:opacity-60"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>Entrar na Aplicação</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 relative">
            ou
          </span>
        </div>

        {/* Enter as Guest trigger button */}
        <button
          type="button"
          onClick={() => {
            setGuestError(null)
            setIsGuestModalOpen(true)
          }}
          data-testid="enter-as-guest-btn"
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm shadow-xs transition"
        >
          <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Entrar como Convidado</span>
        </button>

        {/* Footer info */}
        <div className="pt-2 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80">
          Credenciais gerenciadas de forma segura via Firebase Authentication.
        </div>
      </div>

      {/* Guest Access Modal */}
      {isGuestModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-modal-title"
          data-testid="guest-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2
                    id="guest-modal-title"
                    className="text-lg font-bold text-slate-900 dark:text-white"
                  >
                    Acesso como Convidado
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Acesso local para gerenciar suas escalas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGuestModalOpen(false)}
                aria-label="Fechar"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guest Error Banner */}
            {guestError && (
              <div
                role="alert"
                data-testid="guest-error-banner"
                className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span>{guestError}</span>
              </div>
            )}

            {/* List of existing saved guest profiles */}
            {guestProfiles.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Contas Salvas Neste Navegador
                </label>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {guestProfiles.map((profile) => (
                    <div
                      key={profile.id}
                      data-testid={`guest-profile-${profile.id}`}
                      className="group flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectExistingGuest(profile.id)}
                        disabled={isGuestSubmitting}
                        className="flex items-center gap-3 text-left flex-1 min-w-0"
                      >
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {profile.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatLastActive(profile.lastActiveAt)}</span>
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => handleSelectExistingGuest(profile.id)}
                          disabled={isGuestSubmitting}
                          data-testid={`select-guest-${profile.id}`}
                          aria-label={`Entrar como ${profile.name}`}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
                        >
                          Entrar
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteGuestProfile(profile.id)}
                          data-testid={`delete-guest-${profile.id}`}
                          aria-label={`Excluir perfil de ${profile.name}`}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create new guest form */}
            <form
              onSubmit={handleCreateNewGuest}
              className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800"
            >
              <label
                htmlFor="new-guest-name"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
              >
                {guestProfiles.length > 0
                  ? 'Ou entrar como novo usuário'
                  : 'Criar Perfil de Convidado'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <UserPlus className="w-4 h-4" />
                </div>
                <input
                  id="new-guest-name"
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Nome do novo usuário (ex: Dr. Roberto)"
                  disabled={isGuestSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={isGuestSubmitting || !guestName.trim()}
                data-testid="create-guest-submit-btn"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
              >
                {isGuestSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Iniciando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar como Novo Convidado</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage

