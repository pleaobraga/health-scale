import { Routes, Route, Navigate, MemoryRouter, HashRouter } from 'react-router-dom'

import { AdminRoute } from '../components/auth/admin-route'
import { PrivateRoute } from '../components/auth/private-route'
import { CalendarView } from '../components/calendar/calendar-view'
import { ErrorBoundary } from '../components/common/error-boundary'
import { ImportView } from '../components/import/import-view'
import { RootLayout } from '../components/layout/root-layout'
import { PeopleManagementView } from '../components/people-management/people-management-view'
import { SettingsView } from '../components/settings/settings-view'
import { AuthProvider } from '../context/auth-context'
import { LoginPage } from '../pages/login-page'
import { UserManagementView } from '../pages/user-management-view'

import type { AuthContextType } from '../context/auth-context'

/**
 * Main application routes tree.
 * Enforces authentication on private routes and role-based access on admin endpoints.
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Authentication Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* 2. Private Routes Guarded by Firebase Auth */}
      <Route element={<PrivateRoute />}>
        <Route element={<RootLayout />}>
          {/* Root Route / Calendar */}
          <Route index element={<CalendarView />} />
          {/* Alias route /calendario */}
          <Route path="calendario" element={<CalendarView />} />
          {/* Global People Management Route */}
          <Route path="pessoas" element={<PeopleManagementView />} />
          {/* Data Import Route */}
          <Route path="importar" element={<ImportView />} />
          {/* Extensible Route: General Settings */}
          <Route path="configuracoes" element={<SettingsView />} />

          {/* Admin-Exclusive Route: User Management */}
          <Route element={<AdminRoute />}>
            <Route path="usuarios" element={<UserManagementView />} />
          </Route>

          {/* Fallback Route / Internal 404: Redirect to /calendario */}
          <Route path="*" element={<Navigate to="/calendario" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

/**
 * Production HashRouter wrapper component.
 * URLs follow /#/rota pattern, preventing 404s on GitHub Pages static hosting.
 */
export function AppRouter() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export interface TestAppRouterProps {
  initialEntries?: string[];
  authValue?: Partial<AuthContextType>;
}

/**
 * Test wrapper using MemoryRouter for deterministic testing with Vitest.
 * Defaults to an authenticated admin mock to maintain test compatibility unless specified.
 */
export function TestAppRouter({
  initialEntries = ['/'],
  authValue,
}: TestAppRouterProps) {
  const defaultAuth: Partial<AuthContextType> = {
    user: {
      uid: 'test-admin-uid',
      email: 'admin@healthscale.com',
    } as unknown as AuthContextType['user'],
    role: 'admin',
    isAdmin: true,
    loading: false,
    login: async () => {},
    logout: async () => {},
  }

  return (
    <ErrorBoundary>
      <AuthProvider value={authValue !== undefined ? authValue : defaultAuth}>
        <MemoryRouter initialEntries={initialEntries}>
          <AppRoutes />
        </MemoryRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}
