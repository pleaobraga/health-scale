import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

import { AdminRoute } from './admin-route'
import { AuthProvider } from '../../context/auth-context'

import type { AuthContextType } from '../../context/auth-context'

describe('AdminRoute Guard', () => {
  const renderAdminRoute = (authValue: Partial<AuthContextType>, initialEntries = ['/admin']) => {
    return render(
      <AuthProvider value={authValue}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/login" element={<div data-testid="login-page">Tela de Login</div>} />
            <Route path="/calendario" element={<div data-testid="calendar-fallback">Main calendar</div>} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<div data-testid="admin-content">Admin panel</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )
  }

  it('shows a loading indicator while permissions are being checked', () => {
    renderAdminRoute({
      loading: true,
      user: null,
      isAdmin: false,
    })

    expect(screen.getByTestId('auth-loading')).toBeInTheDocument()
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
  })

  it('redirects to the login screen when the user is not authenticated', () => {
    renderAdminRoute({
      loading: false,
      user: null,
      isAdmin: false,
    })

    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
  })

  it('redirects regular (non-admin) users to /calendario', () => {
    renderAdminRoute({
      loading: false,
      user: { uid: 'user-regular', email: 'regular@hospital.com' } as unknown as AuthContextType['user'],
      role: 'user',
      isAdmin: false,
    })

    expect(screen.getByTestId('calendar-fallback')).toBeInTheDocument()
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
  })

  it('renders the admin content when the user is an admin', () => {
    renderAdminRoute({
      loading: false,
      user: { uid: 'admin-root', email: 'pleao.braga@gmail.com' } as unknown as AuthContextType['user'],
      role: 'admin',
      isAdmin: true,
    })

    expect(screen.getByTestId('admin-content')).toBeInTheDocument()
    expect(screen.queryByTestId('calendar-fallback')).not.toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })
})

