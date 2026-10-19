import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { FullScreenCalendarModal } from './fullscreen-calendar-modal'
import { useScheduleStore } from '../../store/use-schedule-store'

describe('FullScreenCalendarModal', () => {
  beforeEach(() => {
    useScheduleStore.setState({
      isFullScreenModalOpen: false,
      currentMonth: '2026-10',
      persons: [
        { id: 'p1', name: 'Dr. Roberto Alves', color: '#3B82F6' },
      ],
      assignments: {
        '2026-10-15': ['p1'],
      },
      events: [
        { id: 'e1', date: '2026-10-15', title: 'Dia do Professor' },
      ],
    })
  })

  it('does not render when isFullScreenModalOpen is false', () => {
    render(<FullScreenCalendarModal />)
    expect(screen.queryByText(/outubro de 2026/i)).not.toBeInTheDocument()
  })

  it('renders correctly with month and year and assignments when open', () => {
    useScheduleStore.setState({ isFullScreenModalOpen: true })
    render(<FullScreenCalendarModal />)

    // Title should show month and year
    expect(screen.getByRole('heading', { level: 2, name: /outubro de 2026/i })).toBeInTheDocument()
    expect(screen.getByText('Tela Cheia')).toBeInTheDocument()

    // Should render assigned person name
    expect(screen.getAllByText('Dr. Roberto Alves')[0]).toBeInTheDocument()
  })


  it('closes when close button is clicked', () => {
    useScheduleStore.setState({ isFullScreenModalOpen: true })
    render(<FullScreenCalendarModal />)

    const closeBtn = screen.getByTitle(/fechar tela cheia/i)
    fireEvent.click(closeBtn)

    expect(useScheduleStore.getState().isFullScreenModalOpen).toBe(false)
  })

  it('closes on Escape key press', () => {
    useScheduleStore.setState({ isFullScreenModalOpen: true })
    render(<FullScreenCalendarModal />)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(useScheduleStore.getState().isFullScreenModalOpen).toBe(false)
  })

  it('renders print button and triggers print on click', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    useScheduleStore.setState({ isFullScreenModalOpen: true })
    render(<FullScreenCalendarModal />)

    const printBtn = screen.getByTitle(/imprimir escala do mês/i)
    expect(printBtn).toBeInTheDocument()
    expect(screen.queryByTitle(/exportar para excel/i)).not.toBeInTheDocument()

    fireEvent.click(printBtn)
    expect(printSpy).toHaveBeenCalledTimes(1)
    printSpy.mockRestore()
  })

  it('renders print-only events section with events ordered chronologically by date and time', () => {
    useScheduleStore.setState({
      isFullScreenModalOpen: true,
      currentMonth: '2026-10',
      persons: [
        { id: 'p1', name: 'Dr. Roberto Alves', color: '#3B82F6' },
        { id: 'p2', name: 'Dra. Ana Paula', color: '#10B981' },
      ],
      assignments: {
        '2026-10-05': ['p1'],
        '2026-10-20': ['p2'],
      },
      events: [
        // Out of order purposely
        { id: 'e3', date: '2026-10-20', time: '14:00', title: 'Treinamento de Equipe', description: 'Sala de reuniões 2' },
        { id: 'e1', date: '2026-10-05', time: '08:00', title: 'Reunião Geral' },
        { id: 'e2', date: '2026-10-15', title: 'Dia do Professor', description: 'Feriado escolar' },
        { id: 'e_other', date: '2026-11-02', title: 'Finados - Outro mês' },
      ],
    })

    render(<FullScreenCalendarModal />)

    const printSection = screen.getByTestId('print-events-section')
    expect(printSection).toBeInTheDocument()

    // Out of month event must NOT be listed
    expect(screen.queryByText('Finados - Outro mês')).not.toBeInTheDocument()

    // Header info
    expect(screen.getByText(/eventos do mês – outubro de 2026/i)).toBeInTheDocument()
    expect(screen.getByText(/total: 3 eventos/i)).toBeInTheDocument()

    // Check all event titles are rendered
    expect(screen.getByText('Reunião Geral')).toBeInTheDocument()
    expect(screen.getByText('Dia do Professor')).toBeInTheDocument()
    expect(screen.getByText('Treinamento de Equipe')).toBeInTheDocument()

    // Check chronological order of events in the table rows
    const rows = printSection.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(3)

    // Row 1: 05/10/2026
    expect(rows[0]).toHaveTextContent('05/10/2026')
    expect(rows[0]).toHaveTextContent('08:00')
    expect(rows[0]).toHaveTextContent('Reunião Geral')
    expect(rows[0]).toHaveTextContent('Dr. Roberto Alves')

    // Row 2: 15/10/2026
    expect(rows[1]).toHaveTextContent('15/10/2026')
    expect(rows[1]).toHaveTextContent('Dia todo')
    expect(rows[1]).toHaveTextContent('Dia do Professor')
    expect(rows[1]).toHaveTextContent('Feriado escolar')

    // Row 3: 20/10/2026
    expect(rows[2]).toHaveTextContent('20/10/2026')
    expect(rows[2]).toHaveTextContent('14:00')
    expect(rows[2]).toHaveTextContent('Treinamento de Equipe')
    expect(rows[2]).toHaveTextContent('Sala de reuniões 2')
    expect(rows[2]).toHaveTextContent('Dra. Ana Paula')
  })

  it('does not render print events section when there are no events in current month', () => {
    useScheduleStore.setState({
      isFullScreenModalOpen: true,
      currentMonth: '2026-10',
      events: [
        { id: 'e_nov', date: '2026-11-15', title: 'Proclamação da República' },
      ],
    })

    render(<FullScreenCalendarModal />)
    expect(screen.queryByTestId('print-events-section')).not.toBeInTheDocument()
  })

  it('possui classes adequadas para garantir visualização correta no dark theme durante impressão', () => {
    useScheduleStore.setState({
      isFullScreenModalOpen: true,
      currentMonth: '2026-10',
      events: [
        { id: 'e1', date: '2026-10-15', title: 'Reunião Clínica' },
      ],
    })

    render(<FullScreenCalendarModal />)

    const printSection = screen.getByTestId('print-events-section')
    expect(printSection).toHaveClass('dark:print:bg-white', 'dark:print:text-slate-900')

    const table = printSection.querySelector('table')
    expect(table).toHaveClass('dark:bg-white', 'dark:text-slate-900')

    const title = screen.getByRole('heading', { level: 3, name: /eventos do mês/i })
    expect(title).toHaveClass('dark:text-slate-950', 'print:text-slate-950')
  })

  it('deve listar a coluna de Responsável do Serviço com a cor associada e não exibir Escala do Dia na impressão', () => {
    useScheduleStore.setState({
      isFullScreenModalOpen: true,
      currentMonth: '2026-10',
      persons: [
        { id: 'p1', name: 'Ana Souza', color: '#EF4444', active: true },
        { id: 'p2', name: 'Beatriz Lima', color: '#10B981', active: true },
      ],
      assignments: {
        '2026-10-15': ['p1'],
      },
      events: [
        {
          id: 'e1',
          date: '2026-10-15',
          title: 'Curativo Complexo',
          personId: 'p2',
        },
      ],
    })

    render(<FullScreenCalendarModal />)

    const printSection = screen.getByTestId('print-events-section')
    expect(printSection).toBeInTheDocument()

    // Headers
    expect(within(printSection).getByText('Responsável do Serviço')).toBeInTheDocument()
    expect(within(printSection).queryByText('Escala do Dia')).not.toBeInTheDocument()

    // Responsible caregiver badge with color
    const responsibleBadge = within(printSection).getByText('Beatriz Lima')
    expect(responsibleBadge).toHaveClass('print-person-chip')
    expect(responsibleBadge).toHaveStyle({ backgroundColor: '#10B981' })
  })
})



