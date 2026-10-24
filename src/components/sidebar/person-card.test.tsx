import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { PersonCard } from './person-card'

import type { Person } from '../../types'

describe('PersonCard', () => {
  const mockPerson: Person = {
    id: 'p1',
    name: 'Dra. Camila Santos',
    color: '#3b82f6',
  }

  it('renders the name, the working days and the available days count', () => {
    render(
      <PersonCard
        person={mockPerson}
        availableDaysCount={12}
        workingDaysCount={3}
        isHighlighted={false}
        isEditMode={false}
        onToggleHighlight={vi.fn()}
        onEdit={vi.fn()}
        onInsertAllDays={vi.fn()}
      />
    )

    expect(screen.getByText('Dra. Camila Santos')).toBeInTheDocument()
    expect(screen.getByText('3 trab.')).toBeInTheDocument()
    expect(screen.getByText('12 disp.')).toBeInTheDocument()
  })

  it('calls onToggleHighlight from the visibility button', () => {
    const handleToggle = vi.fn()
    render(
      <PersonCard
        person={mockPerson}
        availableDaysCount={5}
        isHighlighted={false}
        isEditMode={false}
        onToggleHighlight={handleToggle}
        onEdit={vi.fn()}
        onInsertAllDays={vi.fn()}
      />
    )

    const toggleBtn = screen.getByTitle('Destacar disponibilidade no calendário')
    fireEvent.click(toggleBtn)
    expect(handleToggle).toHaveBeenCalledTimes(1)
  })

  it('hides the highlight availability button on screens <= 640px', () => {
    render(
      <PersonCard
        person={mockPerson}
        availableDaysCount={5}
        isHighlighted={false}
        isEditMode={false}
        onToggleHighlight={vi.fn()}
        onEdit={vi.fn()}
        onInsertAllDays={vi.fn()}
      />
    )

    expect(screen.getByTitle('Destacar disponibilidade no calendário')).toHaveClass('mobile:hidden')
  })

  it('calls onEdit from the edit button', () => {
    const handleEdit = vi.fn()
    render(
      <PersonCard
        person={mockPerson}
        availableDaysCount={5}
        isHighlighted={false}
        isEditMode={false}
        onToggleHighlight={vi.fn()}
        onEdit={handleEdit}
        onInsertAllDays={vi.fn()}
      />
    )

    const editBtn = screen.getByTitle(/Editar nome, cor ou disponibilidade/i)
    fireEvent.click(editBtn)
    expect(handleEdit).toHaveBeenCalledTimes(1)
  })

  it('hides the insert days button outside edit mode', () => {
    render(
      <PersonCard
        person={mockPerson}
        availableDaysCount={5}
        isHighlighted={false}
        isEditMode={false}
        onToggleHighlight={vi.fn()}
        onEdit={vi.fn()}
        onInsertAllDays={vi.fn()}
      />
    )

    expect(
      screen.queryByLabelText(/Inserir todos os dias de Dra. Camila Santos no calendário/i)
    ).not.toBeInTheDocument()
  })

  it('hides the insert days button in edit mode when availableDaysCount is 0', () => {
    render(
      <PersonCard
        person={mockPerson}
        availableDaysCount={0}
        isHighlighted={false}
        isEditMode={true}
        onToggleHighlight={vi.fn()}
        onEdit={vi.fn()}
        onInsertAllDays={vi.fn()}
      />
    )

    expect(
      screen.queryByLabelText(/Inserir todos os dias de Dra. Camila Santos no calendário/i)
    ).not.toBeInTheDocument()
  })

  it('calls onInsertAllDays in edit mode when availableDaysCount > 0', () => {
    const handleInsert = vi.fn()
    render(
      <PersonCard
        person={mockPerson}
        availableDaysCount={5}
        isHighlighted={false}
        isEditMode={true}
        onToggleHighlight={vi.fn()}
        onEdit={vi.fn()}
        onInsertAllDays={handleInsert}
      />
    )

    const insertBtn = screen.getByLabelText(/Inserir todos os dias de Dra. Camila Santos no calendário/i)
    expect(insertBtn).toBeInTheDocument()

    fireEvent.click(insertBtn)
    expect(handleInsert).toHaveBeenCalledTimes(1)
  })

  it('opens a shift picker when the person is available on more than one shift', () => {
    const handleInsert = vi.fn()
    const mockShifts = [
      {
        shift: {
          id: 'shift_d12',
          name: 'Plantão Diurno 12h',
          code: 'D12',
          startTime: '07:00',
          durationHours: 12,
          color: '#3b82f6',
          enabledByDefault: true,
          createdAt: '',
          updatedAt: '',
        },
        daysCount: 3,
      },
      {
        shift: {
          id: 'shift_n12',
          name: 'Plantão Noturno 12h',
          code: 'N12',
          startTime: '19:00',
          durationHours: 12,
          color: '#6366f1',
          enabledByDefault: true,
          createdAt: '',
          updatedAt: '',
        },
        daysCount: 2,
      },
    ]

    render(
      <PersonCard
        person={mockPerson}
        availableDaysCount={5}
        isHighlighted={false}
        isEditMode={true}
        availableShifts={mockShifts}
        onToggleHighlight={vi.fn()}
        onEdit={vi.fn()}
        onInsertAllDays={handleInsert}
      />
    )

    const insertBtn = screen.getByLabelText(/Inserir todos os dias de Dra. Camila Santos no calendário/i)
    fireEvent.click(insertBtn)

    // Balloon opens showing shift options
    const balloon = screen.getByTestId('shift-selection-balloon')
    expect(balloon).toBeInTheDocument()
    expect(screen.getByText('Plantão Diurno 12h')).toBeInTheDocument()
    expect(screen.getByText('Plantão Noturno 12h')).toBeInTheDocument()
    expect(screen.getByText(/Todas as escalas/i)).toBeInTheDocument()

    // Clicking Plantão Diurno 12h option calls onInsertAllDays with 'shift_d12'
    fireEvent.click(screen.getByText('Plantão Diurno 12h'))
    expect(handleInsert).toHaveBeenCalledWith('shift_d12')
    expect(screen.queryByTestId('shift-selection-balloon')).not.toBeInTheDocument()
  })

  it('picks "Todas as escalas" in the shift picker', () => {
    const handleInsert = vi.fn()
    const mockShifts = [
      {
        shift: {
          id: 'shift_d12',
          name: 'Plantão Diurno 12h',
          code: 'D12',
          startTime: '07:00',
          durationHours: 12,
          color: '#3b82f6',
          enabledByDefault: true,
          createdAt: '',
          updatedAt: '',
        },
        daysCount: 3,
      },
      {
        shift: {
          id: 'shift_p24',
          name: 'Plantão 24h',
          code: 'P24',
          startTime: '07:00',
          durationHours: 24,
          color: '#8b5cf6',
          enabledByDefault: true,
          createdAt: '',
          updatedAt: '',
        },
        daysCount: 4,
      },
    ]

    render(
      <PersonCard
        person={mockPerson}
        availableDaysCount={7}
        isHighlighted={false}
        isEditMode={true}
        availableShifts={mockShifts}
        onToggleHighlight={vi.fn()}
        onEdit={vi.fn()}
        onInsertAllDays={handleInsert}
      />
    )

    const insertBtn = screen.getByLabelText(/Inserir todos os dias de Dra. Camila Santos no calendário/i)
    fireEvent.click(insertBtn)

    fireEvent.click(screen.getByText(/Todas as escalas/i))
    expect(handleInsert).toHaveBeenCalledWith(undefined)
    expect(screen.queryByTestId('shift-selection-balloon')).not.toBeInTheDocument()
  })

  it('disables the eye button and shows a message when the person has no availability in the month', () => {
    const handleToggle = vi.fn()
    render(
      <PersonCard
        person={mockPerson}
        availableDaysCount={0}
        isHighlighted={false}
        isEditMode={false}
        onToggleHighlight={handleToggle}
        onEdit={vi.fn()}
        onInsertAllDays={vi.fn()}
      />
    )

    const toggleBtn = screen.getByTitle('Esta pessoa não tem disponibilidade cadastrada neste mês')
    expect(toggleBtn).toBeInTheDocument()
    expect(toggleBtn).toBeDisabled()
    expect(toggleBtn).toHaveClass('opacity-40', 'cursor-not-allowed')

    fireEvent.click(toggleBtn)
    expect(handleToggle).not.toHaveBeenCalled()
  })

  it('calls onToggleScheduledHighlight when workingDaysCount > 0', () => {
    const handleToggleScheduled = vi.fn()
    render(
      <PersonCard
        person={mockPerson}
        availableDaysCount={5}
        workingDaysCount={3}
        isHighlighted={false}
        isScheduledHighlighted={false}
        isEditMode={false}
        onToggleHighlight={vi.fn()}
        onToggleScheduledHighlight={handleToggleScheduled}
        onEdit={vi.fn()}
        onInsertAllDays={vi.fn()}
      />
    )

    const scheduledBtn = screen.getByTitle('Destacar dias escalados no calendário')
    expect(scheduledBtn).toBeInTheDocument()
    expect(scheduledBtn).not.toBeDisabled()

    fireEvent.click(scheduledBtn)
    expect(handleToggleScheduled).toHaveBeenCalledTimes(1)
  })

  it('disables the scheduled days button when the person has no assigned day in the month', () => {
    const handleToggleScheduled = vi.fn()
    render(
      <PersonCard
        person={mockPerson}
        availableDaysCount={5}
        workingDaysCount={0}
        isHighlighted={false}
        isScheduledHighlighted={false}
        isEditMode={false}
        onToggleHighlight={vi.fn()}
        onToggleScheduledHighlight={handleToggleScheduled}
        onEdit={vi.fn()}
        onInsertAllDays={vi.fn()}
      />
    )

    const scheduledBtn = screen.getByTitle('Esta pessoa não está escalada em nenhum dia neste mês')
    expect(scheduledBtn).toBeInTheDocument()
    expect(scheduledBtn).toBeDisabled()
    expect(scheduledBtn).toHaveClass('opacity-40', 'cursor-not-allowed')

    fireEvent.click(scheduledBtn)
    expect(handleToggleScheduled).not.toHaveBeenCalled()
  })
})
