import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { ShiftsManagementView } from './shifts-management-view'
import { useScheduleStore } from '../../store/use-schedule-store'

const renderShiftsView = () => {
  return render(
    <MemoryRouter>
      <ShiftsManagementView />
    </MemoryRouter>
  )
}

describe('ShiftsManagementView Component', () => {
  beforeEach(() => {
    localStorage.clear()
    useScheduleStore.setState({
      shiftDefinitions: [
        {
          id: 'shift_d12',
          name: 'Plantão Diurno 12h',
          code: 'D12',
          startTime: '07:00',
          durationHours: 12,
          color: '#3B82F6',
          enabledByDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
  })

  it('deve renderizar a listagem de turnos cadastrados com seus dados', () => {
    renderShiftsView()

    expect(screen.getByTestId('shifts-management-view')).toBeInTheDocument()
    expect(screen.getByText('Plantão Diurno 12h')).toBeInTheDocument()
    expect(screen.getByText('D12')).toBeInTheDocument()
  })

  it('deve abrir o modal para criação de novo turno ao clicar no botão', () => {
    renderShiftsView()

    const newBtn = screen.getByRole('button', { name: /novo turno/i })
    fireEvent.click(newBtn)

    expect(screen.getByRole('heading', { name: /novo turno/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Ex: Plantão Diurno 12h/i)).toBeInTheDocument()
  })

  it('deve permitir cadastrar um novo turno com sucesso', () => {
    renderShiftsView()

    fireEvent.click(screen.getByRole('button', { name: /novo turno/i }))

    fireEvent.change(screen.getByPlaceholderText(/Ex: Plantão Diurno 12h/i), {
      target: { value: 'Sobreaviso 6h' },
    })
    fireEvent.change(screen.getByPlaceholderText(/Ex: D12/i), {
      target: { value: 'S06' },
    })

    fireEvent.click(screen.getByRole('button', { name: /criar turno/i }))

    expect(screen.getByText('Sobreaviso 6h')).toBeInTheDocument()
    expect(screen.getByText('S06')).toBeInTheDocument()
  })

  it('deve permitir duplicar um turno existente', () => {
    renderShiftsView()

    const duplicateBtn = screen.getByTitle(/duplicar/i)
    fireEvent.click(duplicateBtn)

    expect(screen.getByText(/Plantão Diurno 12h \(Cópia\)/i)).toBeInTheDocument()
  })

  it('deve exibir modal de confirmação ao clicar em excluir e remover o turno', () => {
    renderShiftsView()

    const deleteBtn = screen.getByTitle(/excluir/i)
    fireEvent.click(deleteBtn)

    expect(screen.getByText(/deseja realmente excluir este turno/i)).toBeInTheDocument()

    // Confirm delete
    const confirmButtons = screen.getAllByRole('button', { name: /excluir/i })
    const confirmBtn = confirmButtons[confirmButtons.length - 1]
    fireEvent.click(confirmBtn)

    expect(screen.queryByText('Plantão Diurno 12h')).not.toBeInTheDocument()
  })

  it('deve filtrar os turnos de acordo com a busca', () => {
    renderShiftsView()

    expect(screen.getByText('Plantão Diurno 12h')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText(/buscar turnos/i)
    fireEvent.change(searchInput, { target: { value: 'Inexistente' } })

    expect(screen.queryByText('Plantão Diurno 12h')).not.toBeInTheDocument()
    expect(screen.getByText(/nenhum turno encontrado/i)).toBeInTheDocument()
  })

  it('deve permitir selecionar uma cor customizada via colorpicker no cadastro de turno', () => {
    renderShiftsView()

    fireEvent.click(screen.getByRole('button', { name: /novo turno/i }))

    fireEvent.change(screen.getByPlaceholderText(/Ex: Plantão Diurno 12h/i), {
      target: { value: 'Turno Personalizado' },
    })
    fireEvent.change(screen.getByPlaceholderText(/Ex: D12/i), {
      target: { value: 'TP1' },
    })

    const colorPickers = screen.getAllByLabelText(/cor personalizada/i)
    expect(colorPickers.length).toBeGreaterThanOrEqual(1)
    fireEvent.change(colorPickers[0], { target: { value: '#123456' } })

    fireEvent.click(screen.getByRole('button', { name: /criar turno/i }))

    const created = useScheduleStore.getState().shiftDefinitions.find((s) => s.name === 'Turno Personalizado')
    expect(created).toBeDefined()
    expect(created?.color.toLowerCase()).toBe('#123456')
  })
})

