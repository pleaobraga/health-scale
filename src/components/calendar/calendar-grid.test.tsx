import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CalendarGrid } from './calendar-grid'
import { AuthProvider } from '../../context/auth-context'
import { useScheduleStore } from '../../store/use-schedule-store'

import type { AuthContextType } from '../../context/auth-context'
import type { User } from 'firebase/auth'

const mockAdminUser: User = {
  uid: 'admin-123',
  email: 'admin@healthscale.com',
  displayName: 'Admin User',
} as User

const mockAdminAuth: AuthContextType = {
  user: mockAdminUser,
  role: 'admin',
  isAdmin: true,
  isGuest: false,
  loading: false,
  guestProfiles: [],
  login: vi.fn(),
  loginAsGuest: vi.fn(),
  logout: vi.fn(),
  deleteGuestProfile: vi.fn(),
}

describe('CalendarGrid Component', () => {
  beforeEach(() => {
    useScheduleStore.setState({
      currentMonth: '2026-10',
      isEditMode: false,
      persons: [
        { id: 'p1', name: 'Dra. Camila', color: '#3b82f6', active: true },
      ],
      monthParticipants: { '2026-10': ['p1'] },
      assignments: {},
      events: [],
      availabilities: [],
    })
  })

  it('deve renderizar o cabeçalho do calendário e navegação de meses', () => {
    render(
      <AuthProvider value={mockAdminAuth}>
        <CalendarGrid />
      </AuthProvider>,
    )

    expect(screen.getByRole('button', { name: /mês anterior/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /próximo mês/i })).toBeInTheDocument()
    expect(screen.getByText(/outubro/i)).toBeInTheDocument()
  })

  it('deve renderizar o botão de puxar dados da nuvem e disparar pullCloudData ao clicar', async () => {
    const pullCloudDataMock = vi.fn().mockResolvedValue({
      success: true,
      message: 'Dados sincronizados!',
    })
    useScheduleStore.setState({ pullCloudData: pullCloudDataMock })

    render(
      <AuthProvider value={mockAdminAuth}>
        <CalendarGrid />
      </AuthProvider>,
    )

    const pullButton = screen.getByRole('button', {
      name: /puxar dados da nuvem/i,
    })
    expect(pullButton).toBeInTheDocument()

    fireEvent.click(pullButton)

    expect(pullCloudDataMock).toHaveBeenCalledWith('2026-10', true)

    await waitFor(() => {
      expect(screen.getByText(/atualizado!/i)).toBeInTheDocument()
    })
  })

  it('deve alternar entre modo de visualização e edição', () => {
    render(
      <AuthProvider value={mockAdminAuth}>
        <CalendarGrid />
      </AuthProvider>,
    )

    const editModeButton = screen.getByRole('button', { name: /edição/i })
    fireEvent.click(editModeButton)

    expect(useScheduleStore.getState().isEditMode).toBe(true)
  })
})
