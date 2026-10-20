import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { PersonCard } from './person-card'

import type { Person } from '../../types'

describe('PersonCard Component', () => {
  const mockPerson: Person = {
    id: 'p1',
    name: 'Dra. Camila Santos',
    color: '#3b82f6',
  }

  it('deve renderizar nome, dias em que está trabalhando e contagem de dias disponíveis', () => {
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
    expect(screen.getByText('3 dias trab.')).toBeInTheDocument()
    expect(screen.getByText('12 dias disp.')).toBeInTheDocument()
  })

  it('deve chamar onToggleHighlight ao clicar no botão de visibilidade', () => {
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

  it('deve chamar onEdit ao clicar no botão de edição', () => {
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

  it('NÃO deve exibir o botão de inserir dias se não estiver no modo de edição', () => {
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

  it('NÃO deve exibir o botão se estiver no modo de edição mas availableDaysCount for 0', () => {
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

  it('DEVE exibir e chamar onInsertAllDays quando isEditMode for true E availableDaysCount > 0', () => {
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

  it('deve abrir balão de seleção quando a pessoa tiver mais de uma escala cadastrada com dias disponíveis', () => {
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

  it('permite selecionar "Todas as escalas" no balão de seleção', () => {
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
})
