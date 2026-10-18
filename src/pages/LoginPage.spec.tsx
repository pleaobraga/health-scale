import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { LoginPage } from './LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { getFriendlyAuthErrorMessage } from '../utils/authErrors';

import type { AuthContextType } from '../context/AuthContext';

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithAuth = (authOverrides?: Partial<AuthContextType>, initialEntries = ['/login']) => {
    const defaultAuth: Partial<AuthContextType> = {
      user: null,
      role: null,
      isAdmin: false,
      isGuest: false,
      loading: false,
      login: vi.fn(),
      loginAsGuest: vi.fn(),
      logout: vi.fn(),
      guestProfiles: [],
      deleteGuestProfile: vi.fn(),
      ...authOverrides,
    };

    return render(
      <AuthProvider value={defaultAuth}>
        <MemoryRouter initialEntries={initialEntries}>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>,
    );
  };

  it('deve renderizar os campos de email, senha e botão de login', () => {
    renderWithAuth();

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail institucional/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar na aplicação/i })).toBeInTheDocument();
    expect(screen.getByTestId('enter-as-guest-btn')).toBeInTheDocument();
  });

  it('deve alternar a visibilidade da senha ao clicar no botão de exibição', () => {
    renderWithAuth();

    const passwordInput = screen.getByLabelText(/^senha$/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleBtn = screen.getByRole('button', { name: /exibir senha/i });
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(screen.getByRole('button', { name: /ocultar senha/i }));
    expect(passwordInput.type).toBe('password');
  });

  it('deve exibir mensagem de erro amigável quando as credenciais forem inválidas', async () => {
    const mockLogin = vi.fn().mockRejectedValue({ code: 'auth/invalid-credential' });
    renderWithAuth({ login: mockLogin });

    const emailInput = screen.getByLabelText(/e-mail institucional/i);
    const passwordInput = screen.getByLabelText(/^senha$/i);

    fireEvent.change(emailInput, { target: { value: 'errado@exemplo.com' } });
    fireEvent.change(passwordInput, { target: { value: 'senha123' } });

    const submitBtn = screen.getByRole('button', { name: /entrar na aplicação/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('errado@exemplo.com', 'senha123');
      expect(screen.getByTestId('login-error-banner')).toBeInTheDocument();
      expect(screen.getByText(getFriendlyAuthErrorMessage('auth/invalid-credential'))).toBeInTheDocument();
    });
  });

  it('deve desabilitar o botão durante a submissão para prevenir múltiplos envios', async () => {
    let resolveLogin: () => void = () => {};
    const mockLogin = vi.fn().mockReturnValue(new Promise<void>((res) => {
      resolveLogin = res;
    }));

    renderWithAuth({ login: mockLogin });

    fireEvent.change(screen.getByLabelText(/e-mail institucional/i), {
      target: { value: 'medico@hospital.com' },
    });
    fireEvent.change(screen.getByLabelText(/^senha$/i), {
      target: { value: 'segredo123' },
    });

    const submitBtn = screen.getByRole('button', { name: /entrar na aplicação/i });
    fireEvent.click(submitBtn);

    // Should indicate loading state and be disabled
    expect(screen.getByText(/autenticando.../i)).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();

    // Finish submission
    resolveLogin();
    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });
  });

  it('deve abrir o modal de acesso como convidado e listar contas salvas', () => {
    const mockProfiles = [
      { id: 'g1', name: 'Dr. Roberto', createdAt: '2026-10-18T10:00:00Z', lastActiveAt: '2026-10-18T10:00:00Z' },
      { id: 'g2', name: 'Dra. Mariana', createdAt: '2026-10-18T11:00:00Z', lastActiveAt: '2026-10-18T11:00:00Z' },
    ];

    renderWithAuth({ guestProfiles: mockProfiles });

    // Open modal
    fireEvent.click(screen.getByTestId('enter-as-guest-btn'));

    expect(screen.getByTestId('guest-modal')).toBeInTheDocument();
    expect(screen.getByText('Dr. Roberto')).toBeInTheDocument();
    expect(screen.getByText('Dra. Mariana')).toBeInTheDocument();
  });

  it('deve permitir selecionar um convidado existente da lista', async () => {
    const mockLoginAsGuest = vi.fn().mockResolvedValue(undefined);
    const mockProfiles = [
      { id: 'g1', name: 'Dr. Roberto', createdAt: '2026-10-18T10:00:00Z', lastActiveAt: '2026-10-18T10:00:00Z' },
    ];

    renderWithAuth({
      loginAsGuest: mockLoginAsGuest,
      guestProfiles: mockProfiles,
    });

    fireEvent.click(screen.getByTestId('enter-as-guest-btn'));
    fireEvent.click(screen.getByTestId('select-guest-g1'));

    await waitFor(() => {
      expect(mockLoginAsGuest).toHaveBeenCalledWith('', 'g1');
    });
  });

  it('deve permitir criar um novo convidado fornecendo nome', async () => {
    const mockLoginAsGuest = vi.fn().mockResolvedValue(undefined);

    renderWithAuth({
      loginAsGuest: mockLoginAsGuest,
      guestProfiles: [],
    });

    fireEvent.click(screen.getByTestId('enter-as-guest-btn'));

    const nameInput = screen.getByPlaceholderText(/Nome do novo usuário/i);
    fireEvent.change(nameInput, { target: { value: 'Dra. Vanessa' } });

    fireEvent.click(screen.getByTestId('create-guest-submit-btn'));

    await waitFor(() => {
      expect(mockLoginAsGuest).toHaveBeenCalledWith('Dra. Vanessa');
    });
  });

  it('deve permitir excluir um perfil de convidado salvo', () => {
    const mockDelete = vi.fn();
    const mockProfiles = [
      { id: 'g1', name: 'Dr. Roberto', createdAt: '2026-10-18T10:00:00Z', lastActiveAt: '2026-10-18T10:00:00Z' },
    ];

    renderWithAuth({
      guestProfiles: mockProfiles,
      deleteGuestProfile: mockDelete,
    });

    fireEvent.click(screen.getByTestId('enter-as-guest-btn'));
    fireEvent.click(screen.getByTestId('delete-guest-g1'));

    expect(mockDelete).toHaveBeenCalledWith('g1');
  });
});


