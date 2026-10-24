import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CalendarGrid } from './calendar-grid'
import { AuthProvider } from '../../context/auth-context'
import { useScheduleStore } from '../../store/use-schedule-store'
import { useToastStore } from '../../store/use-toast-store'

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
    useToastStore.setState({ toasts: [] })
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

  it('deve renderizar o botão de puxar dados da nuvem no menu de opções e disparar pullCloudData ao clicar', async () => {
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

    const trigger = screen.getByTestId('calendar-actions-dropdown-trigger')
    fireEvent.click(trigger)

    const pullButton = screen.getByRole('menuitem', {
      name: /puxar dados da nuvem/i,
    })
    expect(pullButton).toBeInTheDocument()

    fireEvent.click(pullButton)

    expect(pullCloudDataMock).toHaveBeenCalledWith(true)

    await waitFor(() => {
      expect(useToastStore.getState().toasts).toEqual([
        expect.objectContaining({ type: 'success', message: 'Dados da nuvem carregados neste dispositivo.' }),
      ])
    })
  })

  it('deve alternar entre modo de visualização e edição usando o botão único', () => {
    render(
      <AuthProvider value={mockAdminAuth}>
        <CalendarGrid />
      </AuthProvider>,
    )

    // Button starts as "Edição"
    const editModeButton = screen.getByRole('button', { name: /edição/i })
    expect(editModeButton).toBeInTheDocument()
    fireEvent.click(editModeButton)

    // Store is now in edit mode and button text changes to "Visualização"
    expect(useScheduleStore.getState().isEditMode).toBe(true)
    const viewModeButton = screen.getByRole('button', { name: /visualização/i })
    expect(viewModeButton).toBeInTheDocument()

    // Clicking it switches back to view mode and button reverts to "Edição"
    fireEvent.click(viewModeButton)
    expect(useScheduleStore.getState().isEditMode).toBe(false)
    expect(screen.getByRole('button', { name: /edição/i })).toBeInTheDocument()
  })

  it('deve abrir o menu de ações ao clicar no gatilho e exibir as opções agrupadas', () => {
    render(
      <AuthProvider value={mockAdminAuth}>
        <CalendarGrid />
      </AuthProvider>,
    )

    const trigger = screen.getByTestId('calendar-actions-dropdown-trigger')
    expect(trigger).toBeInTheDocument()

    // Menu initially closed
    expect(
      screen.queryByTestId('calendar-actions-dropdown-menu'),
    ).not.toBeInTheDocument()

    // Open dropdown
    fireEvent.click(trigger)
    expect(
      screen.getByTestId('calendar-actions-dropdown-menu'),
    ).toBeInTheDocument()

    // Options inside menu
    expect(
      screen.getByRole('menuitem', { name: /puxar dados da nuvem/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: /exportar excel/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: /imprimir \/ pdf/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: /tela cheia/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: /valores a pagar/i }),
    ).toBeInTheDocument()
  })

  it('deve disparar tela cheia ao selecionar Tela Cheia no menu dropdown', () => {
    render(
      <AuthProvider value={mockAdminAuth}>
        <CalendarGrid />
      </AuthProvider>,
    )

    const trigger = screen.getByTestId('calendar-actions-dropdown-trigger')
    fireEvent.click(trigger)

    const fullscreenOption = screen.getByRole('menuitem', {
      name: /tela cheia/i,
    })
    fireEvent.click(fullscreenOption)

    expect(useScheduleStore.getState().isFullScreenModalOpen).toBe(true)
    expect(
      screen.queryByTestId('calendar-actions-dropdown-menu'),
    ).not.toBeInTheDocument()
  })

  it('deve fechar o dropdown ao pressionar a tecla Escape', () => {
    render(
      <AuthProvider value={mockAdminAuth}>
        <CalendarGrid />
      </AuthProvider>,
    )

    const trigger = screen.getByTestId('calendar-actions-dropdown-trigger')
    fireEvent.click(trigger)
    expect(
      screen.getByTestId('calendar-actions-dropdown-menu'),
    ).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(
      screen.queryByTestId('calendar-actions-dropdown-menu'),
    ).not.toBeInTheDocument()
  })

  it('deve garantir que o calendário inicializa no mês do dia atual quando currentMonth estiver vazio', () => {
    useScheduleStore.setState({ currentMonth: '' })

    render(
      <AuthProvider value={mockAdminAuth}>
        <CalendarGrid />
      </AuthProvider>,
    )

    const expectedMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    expect(useScheduleStore.getState().currentMonth).toBe(expectedMonth)
  })

  it('deve exibir apenas o número de violações no botão de diagnóstico e ocultar o texto do botão de edição em telas pequenas', () => {
    useScheduleStore.setState({ validateCurrentSchedule: () => [] })
    useScheduleStore.setState({
      validationErrors: [
        { id: 'v1', rule: 'r1', severity: 'error', message: 'Erro 1', date: '2026-10-01' },
        { id: 'v2', rule: 'r1', severity: 'warning', message: 'Aviso 1', date: '2026-10-02' },
      ],
    })

    render(
      <AuthProvider value={mockAdminAuth}>
        <CalendarGrid />
      </AuthProvider>,
    )

    expect(screen.getByText('2 Violações')).toBeInTheDocument()
    expect(screen.queryByText(/na escala/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edição' }).querySelector('span')).toHaveClass('mobile:hidden')
  })

  it('no modo de edição, oculta o aviso longo em telas pequenas e exibe Salvar Alterações quando houver mudanças', () => {
    const saveMock = vi.fn()
    useScheduleStore.setState({
      validateCurrentSchedule: () => [],
      isEditMode: true,
      hasUnsavedChanges: false,
      saveSchedule: saveMock,
    })

    const { rerender } = render(
      <AuthProvider value={mockAdminAuth}>
        <CalendarGrid />
      </AuthProvider>,
    )

    expect(screen.getByTestId('edit-notice')).toHaveClass('mobile:hidden')
    expect(screen.queryByTestId('edit-notice-save-button')).not.toBeInTheDocument()

    useScheduleStore.setState({ hasUnsavedChanges: true })
    rerender(
      <AuthProvider value={mockAdminAuth}>
        <CalendarGrid />
      </AuthProvider>,
    )

    const saveBtn = screen.getByTestId('edit-notice-save-button')
    expect(screen.getByText('Salvar Alterações')).toHaveClass('hidden', 'mobile:inline')
    fireEvent.click(saveBtn)
    expect(saveMock).toHaveBeenCalledTimes(1)
  })

  it('com o layout empilhado (< 1024px), rola até o calendário ao ativar o destaque de disponibilidade ou de escala', () => {
    useScheduleStore.setState({
      validateCurrentSchedule: () => [],
      highlightedPersonId: null,
      highlightedScheduledPersonId: null,
    })
    const scrollSpy = vi.fn()
    Element.prototype.scrollIntoView = scrollSpy
    const matchMediaSpy = vi.fn().mockReturnValue({ matches: false })
    vi.stubGlobal('matchMedia', matchMediaSpy)

    render(
      <AuthProvider value={mockAdminAuth}>
        <CalendarGrid />
      </AuthProvider>,
    )
    expect(scrollSpy).not.toHaveBeenCalled()

    act(() => useScheduleStore.setState({ highlightedPersonId: 'p1' }))
    expect(matchMediaSpy).toHaveBeenCalledWith('(min-width: 1024px)')
    expect(scrollSpy).toHaveBeenCalledTimes(1)

    act(() =>
      useScheduleStore.setState({ highlightedPersonId: null, highlightedScheduledPersonId: 'p1' }),
    )
    expect(scrollSpy).toHaveBeenCalledTimes(2)

    // Turning the highlight off must not scroll
    act(() => useScheduleStore.setState({ highlightedScheduledPersonId: null }))
    expect(scrollSpy).toHaveBeenCalledTimes(2)

    // Side-by-side layout (>= 1024px) never scrolls
    matchMediaSpy.mockReturnValue({ matches: true })
    act(() => useScheduleStore.setState({ highlightedPersonId: 'p1' }))
    expect(scrollSpy).toHaveBeenCalledTimes(2)

    vi.unstubAllGlobals()
  })

  it('em telas pequenas, oculta o texto "(dias destacados em verde)" ao destacar a escala de uma pessoa', () => {
    useScheduleStore.setState({
      validateCurrentSchedule: () => [],
      highlightedPersonId: null,
      highlightedScheduledPersonId: 'p1',
    })

    render(
      <AuthProvider value={mockAdminAuth}>
        <CalendarGrid />
      </AuthProvider>,
    )

    const hint = screen.getByTestId('scheduled-days-highlighted-hint')
    expect(hint).toHaveTextContent('(dias destacados em verde)')
    expect(hint).toHaveClass('mobile:hidden')
  })
  it('deve pedir confirmação em um modal antes de limpar o mês', () => {
    const clearMonthAssignmentsMock = vi.fn()
    useScheduleStore.setState({ isEditMode: true, clearMonthAssignments: clearMonthAssignmentsMock })
    render(
      <AuthProvider value={mockAdminAuth}>
        <CalendarGrid />
      </AuthProvider>,
    )

    const clearButton = screen.getByRole('button', { name: /limpar mês/i })
    expect(clearButton).toHaveTextContent(/^limpar$/i)

    fireEvent.click(clearButton)
    const dialog = screen.getByRole('alertdialog', { name: /limpar mês/i })
    expect(dialog).toHaveTextContent(/outubro/i)
    expect(clearMonthAssignmentsMock).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(clearMonthAssignmentsMock).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /limpar mês/i }))
    fireEvent.click(screen.getByTestId('confirm-dialog-confirm'))
    expect(clearMonthAssignmentsMock).toHaveBeenCalledWith('2026-10')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
  it('deve manter o botão de edição na linha do título abaixo de 1510px (hd), preservando a label (exceto <= 640px)', () => {
    render(
      <AuthProvider value={mockAdminAuth}>
        <CalendarGrid />
      </AuthProvider>,
    )

    const editButton = screen.getByRole('button', { name: /^edição$/i })
    expect(editButton).toHaveClass('max-hd:order-2')
    // A label só é escondida em telas <= 640px
    const label = editButton.querySelector('span')
    expect(label).toHaveClass('mobile:hidden')
    expect(label?.className).not.toMatch(/max-hd:hidden/)
  })
})
