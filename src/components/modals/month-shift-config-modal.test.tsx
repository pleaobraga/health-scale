import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { MonthShiftConfigModal } from './month-shift-config-modal'
import { useScheduleStore } from '../../store/use-schedule-store'

describe('MonthShiftConfigModal', () => {
  const currentMonth = '2026-10'

  beforeEach(() => {
    useScheduleStore.setState({
      currentMonth,
      shiftDefinitions: [
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
          color: '#8b5cf6',
          enabledByDefault: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
      monthDailyShifts: {},
    })
  })

  it('renders nothing when isOpen is false', () => {
    render(
      <MonthShiftConfigModal
        isOpen={false}
        onClose={vi.fn()}
        currentMonth={currentMonth}
      />
    )
    expect(screen.queryByText(/Configurar Plantões e Horas por Dia/i)).not.toBeInTheDocument()
  })

  it('lists the registered shifts when open', () => {
    render(
      <MonthShiftConfigModal
        isOpen={true}
        onClose={vi.fn()}
        currentMonth={currentMonth}
      />
    )

    expect(screen.getByText(/Configurar Plantões Diários/i)).toBeInTheDocument()
    expect(screen.getAllByText('Plantão Diurno 12h').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Plantão Noturno 12h')).toBeInTheDocument()
  })

  it('applies a day shortcut and saves it to the store', () => {
    const handleClose = vi.fn()
    render(
      <MonthShiftConfigModal
        isOpen={true}
        onClose={handleClose}
        currentMonth={currentMonth}
      />
    )

    // Click "Todos os Dias" shortcut for the first shift (D12)
    const allDaysBtn = screen.getByRole('button', { name: /todos os dias/i })
    fireEvent.click(allDaysBtn)

    // October 2026 has 31 days
    expect(screen.getByText(/31 dias selecionados/i)).toBeInTheDocument()

    // Click "Salvar Configuração"
    const saveBtn = screen.getByRole('button', { name: /salvar configuração/i })
    fireEvent.click(saveBtn)

    const savedState = useScheduleStore.getState().monthDailyShifts[currentMonth]
    expect(savedState).toBeDefined()
    expect(savedState['shift_d12']).toHaveLength(31)
    expect(handleClose).toHaveBeenCalled()
  })

  it('creates a new shift type with a custom start time and duration', () => {
    render(
      <MonthShiftConfigModal
        isOpen={true}
        onClose={vi.fn()}
        currentMonth={currentMonth}
      />
    )

    // Click "Novo Plantão"
    const newShiftBtn = screen.getByRole('button', { name: /novo plantão/i })
    fireEvent.click(newShiftBtn)

    // Fill form
    const nameInput = screen.getByPlaceholderText(/ex: plantão 12h noturno/i)
    fireEvent.change(nameInput, { target: { value: 'Plantão Fim de Semana 24h' } })

    const durationInput = screen.getByDisplayValue('12')
    fireEvent.change(durationInput, { target: { value: '24' } })

    const timeInput = screen.getByDisplayValue('07:00')
    fireEvent.change(timeInput, { target: { value: '08:00' } })

    // Save shift
    const createBtn = screen.getByRole('button', { name: /salvar plantão/i })
    fireEvent.click(createBtn)

    // New shift should now appear in the list and in store definitions
    expect(screen.getByText('Plantão Fim de Semana 24h')).toBeInTheDocument()
    const defs = useScheduleStore.getState().shiftDefinitions
    expect(defs.some((d) => d.name === 'Plantão Fim de Semana 24h' && d.durationHours === 24)).toBe(true)
  })
})
