import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HoverSidebar } from './hover-sidebar'
import { AuthProvider } from '../../context/auth-context'
import * as backupService from '../../services/backup-service'
import { useScheduleStore } from '../../store/use-schedule-store'

import type { AuthContextType } from '../../context/auth-context'
import type { User } from 'firebase/auth'

const renderWithRouter = (initialPath = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <HoverSidebar />
    </MemoryRouter>,
  )
}

describe('HoverSidebar Component', () => {
  beforeEach(() => {
    useScheduleStore.setState({
      currentView: 'calendar',
      isDarkMode: false,
    })
  })

  it('deve renderizar a logo, os links de navegação e o alternador de tema', () => {
    renderWithRouter()

    expect(screen.getAllByText('Escalas Mensais').length).toBeGreaterThan(0)
    expect(screen.getAllByText('HealthSchedule').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('link', { name: /calendário de escalas/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /gerenciar pessoas/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /mudar para modo escuro/i }),
    ).toBeInTheDocument()
  })

  it('deve alternar a tela para "people" ao clicar em Gerenciar Pessoas', () => {
    renderWithRouter()

    const peopleLink = screen.getByRole('link', { name: /gerenciar pessoas/i })
    fireEvent.click(peopleLink)

    expect(useScheduleStore.getState().currentView).toBe('people')
  })

  it('deve alternar a tela para "calendar" ao clicar em Calendário de Escalas', () => {
    useScheduleStore.setState({ currentView: 'people' })
    renderWithRouter('/pessoas')

    const calendarLink = screen.getByRole('link', {
      name: /calendário de escalas/i,
    })
    fireEvent.click(calendarLink)

    expect(useScheduleStore.getState().currentView).toBe('calendar')
  })

  it('deve alternar entre Dark Mode e Light Mode e alterar a classe dark no documento', () => {
    renderWithRouter()

    const toggleBtn = screen.getByRole('button', {
      name: /mudar para modo escuro/i,
    })
    fireEvent.click(toggleBtn)

    expect(useScheduleStore.getState().isDarkMode).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    const toggleLightBtn = screen.getByRole('button', {
      name: /mudar para modo claro/i,
    })
    fireEvent.click(toggleLightBtn)

    expect(useScheduleStore.getState().isDarkMode).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('deve alternar a tela para "import" ao clicar em Importar Dados', () => {
    renderWithRouter()

    const importLink = screen.getByRole('link', { name: /importar dados/i })
    fireEvent.click(importLink)

    expect(useScheduleStore.getState().currentView).toBe('import')
  })

  it('deve exibir o botão de Exportar Dados e permitir o clique', async () => {
    vi.spyOn(backupService, 'exportAppData').mockResolvedValue()
    renderWithRouter()

    const exportBtn = screen.getByRole('button', { name: /exportar dados/i })
    expect(exportBtn).toBeInTheDocument()
    fireEvent.click(exportBtn)

    await waitFor(() => {
      expect(screen.getByText('Exportado!')).toBeInTheDocument()
    })
  })

  it('deve exibir o cabeçalho mobile e abrir o menu em tela cheia ao clicar no botão de menu', () => {
    renderWithRouter()

    // Mobile header visible with menu button
    const mobileHeader = screen.getByTestId('mobile-header')
    expect(mobileHeader).toBeInTheDocument()

    const menuBtn = screen.getByTestId('mobile-menu-button')
    expect(menuBtn).toBeInTheDocument()

    // Fullscreen mobile menu initially closed
    expect(
      screen.queryByTestId('mobile-fullscreen-menu'),
    ).not.toBeInTheDocument()

    // Click to open fullscreen menu
    fireEvent.click(menuBtn)
    expect(screen.getByTestId('mobile-fullscreen-menu')).toBeInTheDocument()

    // Click to close menu
    const closeBtn = screen.getByTestId('mobile-menu-close')
    fireEvent.click(closeBtn)
    expect(
      screen.queryByTestId('mobile-fullscreen-menu'),
    ).not.toBeInTheDocument()
  })

  it('deve renderizar o nome e o badge de Convidado quando o usuário for convidado', () => {
    const mockAuth: Partial<AuthContextType> = {
      user: {
        uid: 'guest_123',
        displayName: 'Dr. Convidado',
        email: null,
      } as unknown as User,
      role: 'user',
      isAdmin: false,
      isGuest: true,
    }

    render(
      <AuthProvider value={mockAuth}>
        <MemoryRouter initialEntries={['/']}>
          <HoverSidebar />
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(screen.getAllByText('Dr. Convidado').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Convidado').length).toBeGreaterThan(0)
  })

  it('deve exibir botão Puxar Dados da Nuvem e permitir disparar pullCloudData sem alterar toggle de sincronização', async () => {
    localStorage.setItem('scale_manager_cloud_sync_enabled', 'false')
    const pullCloudDataMock = vi.fn().mockResolvedValue({ success: true, message: 'Dados atualizados!' })
    useScheduleStore.setState({ pullCloudData: pullCloudDataMock })

    renderWithRouter()

    const pullButtons = screen.getAllByRole('button', { name: /puxar dados da nuvem/i })
    expect(pullButtons.length).toBeGreaterThan(0)

    fireEvent.click(pullButtons[0])

    expect(pullCloudDataMock).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(screen.getAllByText(/atualizado/i).length).toBeGreaterThan(0)
    })
    expect(localStorage.getItem('scale_manager_cloud_sync_enabled')).toBe('false')
  })

  it('NÃO deve exibir botão Forçar Dados na Nuvem quando não for prod ou não for admin', () => {
    renderWithRouter()
    expect(screen.queryByRole('button', { name: /forçar dados na nuvem/i })).not.toBeInTheDocument()
  })

  it('deve exibir botão Forçar Dados na Nuvem quando for prod e admin, e disparar forcePushCloudData sem alterar toggle de sync', async () => {
    localStorage.setItem('scale_manager_cloud_sync_enabled', 'false')
    const forcePushMock = vi.fn().mockResolvedValue({ success: true, message: 'Forçado!' })
    useScheduleStore.setState({ forcePushCloudData: forcePushMock })

    const mockAdminAuth: Partial<AuthContextType> = {
      user: {
        uid: 'admin_1',
        email: 'admin@teste.com',
      } as unknown as User,
      role: 'admin',
      isAdmin: true,
      isGuest: false,
    }

    render(
      <AuthProvider value={mockAdminAuth}>
        <MemoryRouter initialEntries={['/']}>
          <HoverSidebar isProdOverride={true} />
        </MemoryRouter>
      </AuthProvider>,
    )

    const forceButtons = screen.getAllByRole('button', { name: /forçar dados na nuvem/i })
    expect(forceButtons.length).toBeGreaterThan(0)

    fireEvent.click(forceButtons[0])

    expect(forcePushMock).toHaveBeenCalledTimes(1)
    expect(forcePushMock).toHaveBeenCalledWith(true)
    await waitFor(() => {
      expect(screen.getAllByText(/forçado/i).length).toBeGreaterThan(0)
    })
    expect(localStorage.getItem('scale_manager_cloud_sync_enabled')).toBe('false')
  })
})

