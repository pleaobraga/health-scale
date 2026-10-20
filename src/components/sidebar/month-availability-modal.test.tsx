import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { MonthAvailabilityModal } from './month-availability-modal'

import type { Person, ShiftDefinition } from '../../types'

describe('MonthAvailabilityModal Component', () => {
  const mockPerson: Person = {
    id: 'p1',
    name: 'Dr. Roberto',
    color: '#3B82F6',
  }

  const mockActiveShifts: ShiftDefinition[] = [
    {
      id: 'shift_p24',
      name: 'Plantão 24h',
      code: 'P24',
      startTime: '07:00',
      durationHours: 24,
      color: '#8B5CF6',
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
      color: '#6366F1',
      enabledByDefault: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ]

  it('permite alternar entre escalas do mês e definir dias específicos para cada uma (ex: pares na 24h e 3, 5, 7 na 12h)', () => {
    const handleSave = vi.fn()

    render(
      <MonthAvailabilityModal
        isOpen={true}
        onClose={vi.fn()}
        person={mockPerson}
        currentMonth="2026-10"
        initialAvailableDays={[]}
        initialShiftAvailability={{}}
        activeShifts={mockActiveShifts}
        onSave={handleSave}
      />
    )

    // Should display tabs for both shifts
    expect(screen.getByText(/Plantão 24h \(P24\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Plantão Noturno 12h \(N12\)/i)).toBeInTheDocument()

    // Select even days for the first shift (P24 is initially selected)
    const evenBtn = screen.getByText('Dias Pares')
    fireEvent.click(evenBtn)

    // Switch to N12 shift tab
    const n12Tab = screen.getByText(/Plantão Noturno 12h \(N12\)/i)
    fireEvent.click(n12Tab)

    // Initially N12 should have 0 days selected. Click days 3, 5, 7
    const day3Btn = screen.getByRole('button', { name: /^3$/ })
    const day5Btn = screen.getByRole('button', { name: /^5$/ })
    const day7Btn = screen.getByRole('button', { name: /^7$/ })

    fireEvent.click(day3Btn)
    fireEvent.click(day5Btn)
    fireEvent.click(day7Btn)

    // Save availability
    const saveBtn = screen.getByRole('button', { name: /salvar/i })
    fireEvent.click(saveBtn)

    expect(handleSave).toHaveBeenCalledTimes(1)
    const [personId, unionDays, shiftAvailability] = handleSave.mock.calls[0]

    expect(personId).toBe('p1')
    // P24 has even days in October (2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30)
    expect(shiftAvailability.shift_p24).toContain(2)
    expect(shiftAvailability.shift_p24).toContain(4)
    expect(shiftAvailability.shift_p24).not.toContain(3)

    // N12 has 3, 5, 7
    expect(shiftAvailability.shift_n12).toEqual([3, 5, 7])

    // Union contains both even days and 3, 5, 7
    expect(unionDays).toContain(2)
    expect(unionDays).toContain(3)
    expect(unionDays).toContain(4)
    expect(unionDays).toContain(5)
    expect(unionDays).toContain(7)
  })

  it('funciona no modo clássico de dias gerais quando não há escalas ativas no mês', () => {
    const handleSave = vi.fn()

    render(
      <MonthAvailabilityModal
        isOpen={true}
        onClose={vi.fn()}
        person={mockPerson}
        currentMonth="2026-10"
        initialAvailableDays={[10, 15]}
        activeShifts={[]}
        onSave={handleSave}
      />
    )

    // Does NOT render shift tabs
    expect(screen.queryByText(/Escalas \/ Turnos cadastrados neste mês/i)).not.toBeInTheDocument()

    const saveBtn = screen.getByRole('button', { name: /salvar/i })
    fireEvent.click(saveBtn)

    expect(handleSave).toHaveBeenCalledWith('p1', [10, 15])
  })
})

