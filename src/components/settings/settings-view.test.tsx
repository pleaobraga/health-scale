import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { SettingsView } from './settings-view'
import { AuthProvider } from '../../context/auth-context'
import { useScheduleStore } from '../../store/use-schedule-store'

import type { AuthContextType } from '../../context/auth-context'
import type { User } from 'firebase/auth'

const renderSettings = (authValue?: Partial<AuthContextType>) => {
  return render(
    <AuthProvider value={authValue}>
      <MemoryRouter>
        <SettingsView />
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('SettingsView Component - Limpar Dados Locais', () => {
  beforeEach(() => {
    localStorage.clear()
    useScheduleStore.setState({
      persons: [{ id: 'p1', name: 'Dr. Silva', color: '#10b981', active: true }],
      assignments: { '2026-10-01': ['p1'] },
      events: [{ id: 'ev1', title: 'Plantão', date: '2026-10-01', description: '' }],
      addresses: [{ id: 'addr1', name: 'Consultório', street: 'Rua Central', number: '10' }],
      isDarkMode: false,
    })
  })

  it('deve renderizar a seção de Redefinir Armazenamento Local com o botão visível', () => {
    renderSettings()

    expect(screen.getByTestId('clear-local-data-card')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /limpar todos os dados locais/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/esta ação não altera nem remove nenhum dado salvo na nuvem/i),
    ).toBeInTheDocument()
  })

  it('deve abrir o modal de confirmação ao clicar no botão de limpar dados locais', () => {
    renderSettings()

    const clearButton = screen.getByRole('button', {
      name: /limpar todos os dados locais/i,
    })
    fireEvent.click(clearButton)

    const modalTitle = screen.getByRole('heading', {
      name: /limpar todos os dados locais/i,
    })
    expect(modalTitle).toBeInTheDocument()
    expect(
      screen.getByText(/tem certeza de que deseja apagar todos os dados locais\?/i),
    ).toBeInTheDocument()
  })

  it('deve fechar o modal ao clicar em Cancelar sem remover os dados', () => {
    renderSettings()

    fireEvent.click(
      screen.getByRole('button', { name: /limpar todos os dados locais/i }),
    )

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i })
    fireEvent.click(cancelBtn)

    expect(
      screen.queryByRole('heading', { name: /limpar todos os dados locais/i }),
    ).not.toBeInTheDocument()
    // Dados continuam na store
    expect(useScheduleStore.getState().persons.length).toBe(1)
    expect(useScheduleStore.getState().addresses.length).toBe(1)
  })

  it('deve limpar todos os dados locais e exibir mensagem de feedback ao confirmar no modal', async () => {
    renderSettings()

    fireEvent.click(
      screen.getByRole('button', { name: /limpar todos os dados locais/i }),
    )

    const confirmBtn = screen.getByRole('button', { name: /sim, limpar tudo/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(
        screen.getByText('Todos os dados locais foram apagados com sucesso!'),
      ).toBeInTheDocument()
    })

    // Verifica que a store foi completamente zerada
    expect(useScheduleStore.getState().persons).toEqual([])
    expect(useScheduleStore.getState().assignments).toEqual({})
    expect(useScheduleStore.getState().events).toEqual([])
    expect(useScheduleStore.getState().addresses).toEqual([])
  })

  it('deve exibir o botão de limpar dados locais tanto para administradores quanto para usuários comuns e convidados', () => {
    const regularUserAuth: Partial<AuthContextType> = {
      user: {
        uid: 'user_123',
        email: 'medico@hospital.com',
      } as unknown as User,
      role: 'user',
      isAdmin: false,
      isGuest: false,
    }

    const { unmount } = renderSettings(regularUserAuth)
    expect(
      screen.getByRole('button', { name: /limpar todos os dados locais/i }),
    ).toBeInTheDocument()
    unmount()

    const guestUserAuth: Partial<AuthContextType> = {
      user: {
        uid: 'guest_456',
        displayName: 'Convidado Teste',
      } as unknown as User,
      role: 'user',
      isAdmin: false,
      isGuest: true,
    }

    renderSettings(guestUserAuth)
    expect(
      screen.getByRole('button', { name: /limpar todos os dados locais/i }),
    ).toBeInTheDocument()
  })

  it('deve alternar entre as abas Geral e Importar Dados e exibir o conteúdo de importação', () => {
    renderSettings()

    // Default tab is Geral
    expect(screen.getByTestId('clear-local-data-card')).toBeInTheDocument()

    // Click Importar Dados tab
    const importTab = screen.getByRole('tab', { name: /importar dados/i })
    fireEvent.click(importTab)

    // General sections are hidden, import view content is displayed
    expect(screen.queryByTestId('clear-local-data-card')).not.toBeInTheDocument()
    expect(screen.getByText(/Selecione o arquivo de backup/i)).toBeInTheDocument()

    // Click Geral tab
    const generalTab = screen.getByRole('tab', { name: /geral/i })
    fireEvent.click(generalTab)

    expect(screen.getByTestId('clear-local-data-card')).toBeInTheDocument()
  })

  it('deve alternar para a aba de importação ao clicar no botão Importar ou Restaurar', () => {
    renderSettings()

    const importButton = screen.getByRole('button', { name: /importar ou restaurar/i })
    fireEvent.click(importButton)

    expect(screen.getByText(/Selecione o arquivo de backup/i)).toBeInTheDocument()
  })
})
