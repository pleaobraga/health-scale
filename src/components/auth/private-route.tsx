import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../../context/auth-context'

export interface PrivateRouteProps {
  children?: React.ReactNode;
}

/**
 * Route guard that requires active Firebase authentication.
 * Displays a loading state while authentication status resolves,
 * redirects unauthenticated users to #/login, preserving location state.
 */
export function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div
        data-testid="auth-loading"
        className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Verificando credenciais...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children ? children : <Outlet />
}

