import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { DayCell } from './day-cell'

import type { Person, CalendarEvent } from '../../types'
import type { CalendarDayInfo } from '../../utils/date-utils'

describe('DayCell Component', () => {
  const mockDayInfo: CalendarDayInfo = {
    date: new Date(2026, 9, 15),
    dateStr: '2026-10-15',
    dayNumber: 15,
    isCurrentMonth: true,
    isToday: false,
    dayOfWeek: 4,
  }

  const mockPersons: Person[] = [
    { id: 'p1', name: 'Dra. Camila', color: '#3b82f6' },
    { id: 'p2', name: 'Dr. Lucas', color: '#10b981' },
  ]

  it('deve exibir o número do dia com cor padrão quando NÃO houver eventos', () => {
    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={false}
        assignedPersonIds={['p1']}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    )

    const dayNumber = screen.getByText('15')
    expect(dayNumber).toBeInTheDocument()
    expect(dayNumber.className).not.toContain('text-red-600 font-extrabold')
  })

  it('deve exibir o número do dia em VERMELHO DE DESTAQUE quando houver 1 ou mais eventos', () => {
    const mockEvents: CalendarEvent[] = [
      { id: 'ev-1', date: '2026-10-15', title: 'Reunião Geral' },
    ]

    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={false}
        assignedPersonIds={['p1']}
        allPersons={mockPersons}
        events={mockEvents}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    )

    const dayNumber = screen.getByText('15')
    expect(dayNumber).toBeInTheDocument()
    expect(dayNumber.className).toContain('text-red-600 font-extrabold')
  })

  it('deve disparar abertura de eventos ao clicar no botão de calendário', () => {
    const handleOpenEvents = vi.fn()
    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={false}
        assignedPersonIds={['p1']}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={handleOpenEvents}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    )

    const eventBtn = screen.getByTitle(/Ver ou adicionar eventos/i)
    fireEvent.click(eventBtn)
    expect(handleOpenEvents).toHaveBeenCalledTimes(1)
  })

  it('deve abrir o modal de eventos ao clicar no número do dia (telas pequenas)', () => {
    const handleOpenEvents = vi.fn()
    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={false}
        assignedPersonIds={[]}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={handleOpenEvents}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    )

    const dayNumberBtn = screen.getByTestId('day-number-button')
    expect(dayNumberBtn).toHaveTextContent('15')
    expect(dayNumberBtn).toHaveClass('pointer-events-none', 'mobile:pointer-events-auto')
    expect(screen.getByTitle(/Ver ou adicionar eventos/i)).toHaveClass('mobile:hidden')

    fireEvent.click(dayNumberBtn)
    expect(handleOpenEvents).toHaveBeenCalledTimes(1)
  })

  it('no Modo Leitura, exibe badge com o nome da pessoa alocada', () => {
    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={false}
        assignedPersonIds={['p1']}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    )

    expect(screen.getByText('Dra. Camila')).toBeInTheDocument()
  })

  it('no Modo Edição, exibe tags com botão ✕ para remoção', () => {
    const handleRemove = vi.fn()
    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={true}
        assignedPersonIds={['p1', 'p2']}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={handleRemove}
        onAddPerson={vi.fn()}
      />
    )

    expect(screen.getByText('Dra. Camila')).toBeInTheDocument()
    expect(screen.getByText('Dr. Lucas')).toBeInTheDocument()

    const removeBtn = screen.getByTitle('Remover Dra. Camila deste dia')
    fireEvent.click(removeBtn)
    expect(handleRemove).toHaveBeenCalledWith('p1')
  })

  it('exibe badge de disponibilidade quando o profissional está selecionado para destaque', () => {
    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={false}
        assignedPersonIds={[]}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={mockPersons[0]}
        isHighlightedPersonAvailable={true}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    )

    expect(screen.getByText('Disp.')).toBeInTheDocument()
  })

  it('deve destacar o dia atual com background diferenciado na DayCell sem criar círculo ao redor do número do dia', () => {
    const todayInfo: CalendarDayInfo = {
      ...mockDayInfo,
      isToday: true,
    }

    const { container } = render(
      <DayCell
        dayInfo={todayInfo}
        currentMonth="2026-10"
        isEditMode={false}
        assignedPersonIds={['p1']}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    )

    const cellElement = container.firstChild as HTMLElement
    expect(cellElement.className).toContain('bg-indigo-50/70')

    const dayNumber = screen.getByText('15')
    expect(dayNumber.className).not.toContain('bg-indigo-600 text-white')
    expect(dayNumber.className).toContain('text-indigo-600')
  })

  it('renderiza múltiplos turnos no mesmo dia e permite associar 2 pessoas a turnos de 12h distintos', () => {
    const activeShifts = [
      {
        id: 'shift_d12',
        name: 'Plantão Diurno 12h',
        code: 'D12',
        startTime: '07:00',
        durationHours: 12,
        color: '#3b82f6',
        enabledByDefault: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      {
        id: 'shift_n12',
        name: 'Plantão Noturno 12h',
        code: 'N12',
        startTime: '19:00',
        durationHours: 12,
        color: '#6366f1',
        enabledByDefault: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ]

    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={false}
        assignedPersonIds={['p1', 'p2']}
        dayShiftMap={{
          shift_d12: 'p1',
          shift_n12: 'p2',
        }}
        activeShifts={activeShifts}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    )

    // Should display both shift codes
    expect(screen.getByText('D12')).toBeInTheDocument()
    expect(screen.getByText('N12')).toBeInTheDocument()

    // Should display both doctor names
    expect(screen.getByText('Dra. Camila')).toBeInTheDocument()
    expect(screen.getByText('Dr. Lucas')).toBeInTheDocument()

    // Should NOT show conflict error because they are allocated in distinct 12h shifts covering the day
    expect(screen.queryByText(/Conflito/i)).not.toBeInTheDocument()

    // Small screens (<= 640px): shift code is hidden and the name chip spans the full width
    expect(screen.getByTestId('shift-badge-2026-10-15-D12')).toHaveClass('mobile:hidden')
    expect(screen.getByText('Dra. Camila').closest('[title]')).toHaveClass('w-full', 'mobile:px-1')
  })

  it('no modo de edição com mais de 1 turno ativo, exibe botão único de adicionar que abre o modal de escala', () => {
    const activeShifts = [
      {
        id: 'shift_d12',
        name: 'Plantão Diurno 12h',
        code: 'D12',
        startTime: '07:00',
        durationHours: 12,
        color: '#3b82f6',
        enabledByDefault: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      {
        id: 'shift_n12',
        name: 'Plantão Noturno 12h',
        code: 'N12',
        startTime: '19:00',
        durationHours: 12,
        color: '#6366f1',
        enabledByDefault: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ]

    const handleRemoveFromShift = vi.fn()
    const handleAssignPersonToShift = vi.fn()

    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={true}
        assignedPersonIds={['p1']}
        dayShiftMap={{
          shift_d12: 'p1',
        }}
        activeShifts={activeShifts}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
        onRemovePersonFromShift={handleRemoveFromShift}
        onAssignPersonToShift={handleAssignPersonToShift}
      />
    )

    // Displays allocated shift
    expect(screen.getByText('D12')).toBeInTheDocument()
    expect(screen.getByText('Dra. Camila')).toBeInTheDocument()

    // Clicking remove on D12
    const removeBtn = screen.getByTitle(/Remover Dra. Camila/i)
    fireEvent.click(removeBtn)
    expect(handleRemoveFromShift).toHaveBeenCalledWith('shift_d12')

    // Single add button is present
    const addBtn = screen.getByTitle(/Adicionar pessoa a este dia/i)
    expect(addBtn).toBeInTheDocument()

    // Clicking Add opens the AddDayShiftModal
    fireEvent.click(addBtn)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/1\. Selecione o Plantão \/ Escala/i)).toBeInTheDocument()
    expect(screen.getByText(/2\. Selecione o\(a\) Profissional/i)).toBeInTheDocument()
  })

  it('no modo de edição com apenas 1 turno ativo, exibe botão único de adicionar inline direto', () => {
    const singleShift = [
      {
        id: 'shift_p24',
        name: 'Plantão 24h',
        code: 'P24',
        startTime: '07:00',
        durationHours: 24,
        color: '#8b5cf6',
        enabledByDefault: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ]

    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={true}
        assignedPersonIds={[]}
        dayShiftMap={{}}
        activeShifts={singleShift}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    )

    // Single Add button renders inline CandidatePicker
    const addBtn = screen.getByRole('button', { name: 'Adicionar' })
    expect(addBtn).toBeInTheDocument()

    // Clicking it opens inline picker, NOT the multi-shift dialog
    fireEvent.click(addBtn)
    expect(screen.getByText(/Escalar pessoa/i)).toBeInTheDocument()
    expect(screen.queryByText(/1\. Selecione o Plantão \/ Escala/i)).not.toBeInTheDocument()
  })

  it('deve exibir sempre a sigla da escala na visualização normal (DayCell), tanto em modo leitura quanto edição', () => {
    const singleShift = [
      {
        id: 'shift_d12',
        name: 'Plantão Diurno 12h',
        code: 'D12',
        startTime: '07:00',
        durationHours: 12,
        color: '#3b82f6',
        enabledByDefault: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ]

    // Read mode
    const { unmount } = render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={false}
        assignedPersonIds={['p1']}
        dayShiftMap={{ shift_d12: 'p1' }}
        activeShifts={singleShift}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    )

    expect(screen.getByText('Dra. Camila')).toBeInTheDocument()
    expect(screen.getByTestId('shift-badge-2026-10-15-D12')).toBeInTheDocument()
    expect(screen.getByTestId('shift-badge-2026-10-15-D12')).toHaveTextContent('D12')
    unmount()

    // Edit mode
    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={true}
        assignedPersonIds={['p1']}
        dayShiftMap={{ shift_d12: 'p1' }}
        activeShifts={singleShift}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    )

    expect(screen.getByText('Dra. Camila')).toBeInTheDocument()
    expect(screen.getByTestId('shift-badge-2026-10-15-D12')).toBeInTheDocument()
    expect(screen.getByTestId('shift-badge-2026-10-15-D12')).toHaveTextContent('D12')
  })

  it('não deve mostrar nada (nem Vago nem picker) quando o dia não tem plantão definido e não tem ninguém escalado', () => {
    // Read mode
    const { unmount } = render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={false}
        assignedPersonIds={[]}
        dayShiftMap={{}}
        activeShifts={[]}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    )

    expect(screen.queryByText(/vago/i)).not.toBeInTheDocument()
    unmount()

    // Edit mode
    render(
      <DayCell
        dayInfo={mockDayInfo}
        currentMonth="2026-10"
        isEditMode={true}
        assignedPersonIds={[]}
        dayShiftMap={{}}
        activeShifts={[]}
        allPersons={mockPersons}
        events={[]}
        highlightedPerson={null}
        isHighlightedPersonAvailable={false}
        isPersonAvailable={() => true}
        onOpenEvents={vi.fn()}
        onRemovePerson={vi.fn()}
        onAddPerson={vi.fn()}
      />
    )

    expect(screen.queryByText(/vago/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /escalar pessoa/i })).not.toBeInTheDocument()
  })
})

