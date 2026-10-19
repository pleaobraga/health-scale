import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

import { PrivateRoute } from './private-route';
import { AuthProvider } from '../../context/auth-context';

import type { AuthContextType } from '../../context/auth-context';

describe('PrivateRoute Guard', () => {
  const renderPrivateRoute = (authValue: Partial<AuthContextType>, initialEntries = ['/protegido']) => {
    return render(
      <AuthProvider value={authValue}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/login" element={<div data-testid="login-page">Tela de Login</div>} />
            <Route element={<PrivateRoute />}>
              <Route path="/protegido" element={<div data-testid="protected-content">Conteúdo Protegido</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
  };

  it('deve exibir indicador de loading enquanto a autenticação estiver carregando', () => {
    renderPrivateRoute({
      loading: true,
      user: null,
      isAdmin: false,
    });

    expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('deve redirecionar para a tela de login quando o usuário não estiver autenticado', () => {
    renderPrivateRoute({
      loading: false,
      user: null,
      isAdmin: false,
    });

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('deve renderizar o conteúdo protegido quando o usuário estiver autenticado', () => {
    renderPrivateRoute({
      loading: false,
      user: { uid: 'user-123', email: 'medico@hospital.com' } as unknown as AuthContextType['user'],
      role: 'user',
      isAdmin: false,
    });

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });
});
