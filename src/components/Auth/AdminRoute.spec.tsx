import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

import { AdminRoute } from './AdminRoute';
import { AuthProvider } from '../../context/AuthContext';

import type { AuthContextType } from '../../context/AuthContext';

describe('AdminRoute Guard', () => {
  const renderAdminRoute = (authValue: Partial<AuthContextType>, initialEntries = ['/admin']) => {
    return render(
      <AuthProvider value={authValue}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/login" element={<div data-testid="login-page">Tela de Login</div>} />
            <Route path="/calendario" element={<div data-testid="calendar-fallback">Calendário Principal</div>} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<div data-testid="admin-content">Painel de Administração</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
  };

  it('deve exibir indicador de loading enquanto estiver verificando permissões', () => {
    renderAdminRoute({
      loading: true,
      user: null,
      isAdmin: false,
    });

    expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  it('deve redirecionar para a tela de login quando o usuário não estiver autenticado', () => {
    renderAdminRoute({
      loading: false,
      user: null,
      isAdmin: false,
    });

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  it('deve redirecionar usuários comuns (não-admin) para /calendario', () => {
    renderAdminRoute({
      loading: false,
      user: { uid: 'user-regular', email: 'regular@hospital.com' } as unknown as AuthContextType['user'],
      role: 'user',
      isAdmin: false,
    });

    expect(screen.getByTestId('calendar-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  it('deve renderizar o conteúdo administrativo quando o usuário for admin', () => {
    renderAdminRoute({
      loading: false,
      user: { uid: 'admin-root', email: 'pleao.braga@gmail.com' } as unknown as AuthContextType['user'],
      role: 'admin',
      isAdmin: true,
    });

    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    expect(screen.queryByTestId('calendar-fallback')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });
});

