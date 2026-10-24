import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { MonthAvailabilityModal } from './month-availability-modal'

import type { Person, ShiftDefinition } from '../../types'

describe('MonthAvailabilityModal', () => {
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

  it('sets specific days per shift of the month (e.g. even days on 24h and 3, 5, 7 on 12h)', () => {
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

  it('falls back to plain days when the month has no active shifts', () => {
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

    expect(handleSave).toHaveBeenCalledWith('p1', [10, 15], undefined, {})
  })

  it('sets a shift rate for specific days of the same shift', () => {
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

    // Select days 2, 4 in P24
    const day2Btn = screen.getByRole('button', { name: /^2$/ })
    const day4Btn = screen.getByRole('button', { name: /^4$/ })
    fireEvent.click(day2Btn)
    fireEvent.click(day4Btn)

    // Set rate of 350
    const rateInput = screen.getByPlaceholderText('Ex: 350')
    fireEvent.change(rateInput, { target: { value: '350' } })

    // Apply rate to all days of this shift
    const applyBtn = screen.getByRole('button', { name: /Aplicar Valor/i })
    fireEvent.click(applyBtn)

    // Verify rate group is displayed
    expect(screen.getAllByText(/350/).length).toBeGreaterThanOrEqual(1)

    // Save
    const saveBtn = screen.getByRole('button', { name: /salvar/i })
    fireEvent.click(saveBtn)

    expect(handleSave).toHaveBeenCalledTimes(1)
    const [, , , shiftRates] = handleSave.mock.calls[0]
    expect(shiftRates.shift_p24[2]).toBe(350)
    expect(shiftRates.shift_p24[4]).toBe(350)
  })

  it('warns about calendar removal only when a saved day is removed, and hides it when re-added', () => {
    render(
      <MonthAvailabilityModal
        isOpen={true}
        onClose={vi.fn()}
        person={mockPerson}
        currentMonth="2026-10"
        initialAvailableDays={[10, 15]}
        activeShifts={[]}
        onSave={vi.fn()}
      />
    )

    // No warning before any change
    expect(
      screen.queryByTestId('availability-calendar-removal-warning')
    ).not.toBeInTheDocument()

    // Adding a new day (20) does not show the warning
    const day20Btn = screen.getByRole('button', { name: /^20$/ })
    fireEvent.click(day20Btn)
    expect(
      screen.queryByTestId('availability-calendar-removal-warning')
    ).not.toBeInTheDocument()

    // Removing a saved day (10) shows the warning
    const day10Btn = screen.getByRole('button', { name: /^10$/ })
    fireEvent.click(day10Btn)

    const warningBanner = screen.getByTestId('availability-calendar-removal-warning')
    expect(warningBanner).toBeInTheDocument()
    expect(warningBanner).toHaveTextContent(
      /se a disponibilidade já estiver vinculada ao calendário, ela será removida/i
    )

    // Re-adding day 10 hides the warning again (even with day 20 added)
    fireEvent.click(day10Btn)
    expect(
      screen.queryByTestId('availability-calendar-removal-warning')
    ).not.toBeInTheDocument()
  })
})

