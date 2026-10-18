import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export interface AdminRouteProps {
  children?: React.ReactNode
}

/**
 * Route guard that requires administrator role.
 * Redirects unauthenticated users to #/login,
 * and non-admin authenticated users to #/calendario.
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth()

  console.log(
    `AdminRoute: user=${user?.email}, isAdmin=${isAdmin}, loading=${loading}`,
  )

  if (loading) {
    return (
      <div
        data-testid="auth-loading"
        className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Verificando permissões de administrador...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/calendario"
        replace
      />
    )
  }

  return children ? <>{children}</> : <Outlet />
}

export default AdminRoute
