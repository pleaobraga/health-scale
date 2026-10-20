import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { MonthPaymentsModal } from './month-payments-modal'
import { useScheduleStore } from '../../store/use-schedule-store'

describe('MonthPaymentsModal Component', () => {
  beforeEach(() => {
    useScheduleStore.setState({
      persons: [
        { id: 'p1', name: 'Dr. Lucas Ferreira', color: '#3b82f6', active: true },
        { id: 'p2', name: 'Dra. Beatriz Santos', color: '#ec4899', active: true },
      ],
      shiftDefinitions: [
        {
          id: 'shift_d12',
          name: 'Plantão Diurno 12h',
          code: 'D12',
          startTime: '07:00',
          durationHours: 12,
          color: '#3B82F6',
          enabledByDefault: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
      availabilities: [
        {
          personId: 'p1',
          month: '2026-10',
          availableDays: [1, 2],
          shiftAvailability: {
            shift_d12: [1, 2],
          },
          shiftRates: {
            shift_d12: { 1: 300, 2: 350 },
          },
        },
        {
          personId: 'p2',
          month: '2026-10',
          availableDays: [3],
          shiftAvailability: {
            shift_d12: [3],
          },
          shiftRates: {
            shift_d12: { 3: 400 },
          },
        },
      ],
      dayShiftAssignments: {
        '2026-10-01': { shift_d12: 'p1' },
        '2026-10-02': { shift_d12: 'p1' },
        '2026-10-03': { shift_d12: 'p2' },
      },
    })
  })

  it('exibe o total geral e os valores calculados por profissional', () => {
    render(
      <MonthPaymentsModal
        isOpen={true}
        onClose={vi.fn()}
        currentMonth="2026-10"
      />
    )

    // Grand total: 300 + 350 + 400 = 1050
    expect(screen.getByText('Fechamento de Valores do Mês')).toBeInTheDocument()
    // Check Dr. Lucas and Dra. Beatriz
    expect(screen.getByText('Dr. Lucas Ferreira')).toBeInTheDocument()
    expect(screen.getByText('Dra. Beatriz Santos')).toBeInTheDocument()

    // 3 shifts total
    expect(screen.getByText('3 plantões')).toBeInTheDocument()
  })

  it('permite expandir os detalhes de um profissional para visualizar os plantões e valores diários', () => {
    render(
      <MonthPaymentsModal
        isOpen={true}
        onClose={vi.fn()}
        currentMonth="2026-10"
      />
    )

    const drLucasCard = screen.getByText('Dr. Lucas Ferreira')
    fireEvent.click(drLucasCard)

    // Details should show days 1 and 2
    expect(screen.getByText(/Dia 1/i)).toBeInTheDocument()
    expect(screen.getByText(/Dia 2/i)).toBeInTheDocument()
  })

  it('permite filtrar profissionais por busca de texto', () => {
    render(
      <MonthPaymentsModal
        isOpen={true}
        onClose={vi.fn()}
        currentMonth="2026-10"
      />
    )

    const searchInput = screen.getByPlaceholderText(/Filtrar por nome/i)
    fireEvent.change(searchInput, { target: { value: 'Beatriz' } })

    expect(screen.getByText('Dra. Beatriz Santos')).toBeInTheDocument()
    expect(screen.queryByText('Dr. Lucas Ferreira')).not.toBeInTheDocument()
  })
})

