import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { AvailabilityMiniCalendar } from './availability-mini-calendar'

describe('AvailabilityMiniCalendar', () => {
  it('renders the month days and the selected days counter', () => {
    const handleChange = vi.fn()
    render(
      <AvailabilityMiniCalendar
        month="2026-10"
        selectedDays={[1, 3, 5]}
        onChange={handleChange}
      />
    )

    expect(screen.getByText(/Disponibilidade \(Outubro de 2026\)/i)).toBeInTheDocument()
    expect(screen.getByText('3 / 31 dias')).toBeInTheDocument()
    // Verify presence of individual days
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '31' })).toBeInTheDocument()
  })

  it.each([
    { shortcut: /Dias Pares/i, count: 15, isExpected: (d: number) => d % 2 === 0 },
    { shortcut: /Dias Ímpares/i, count: 16, isExpected: (d: number) => d % 2 !== 0 },
  ])('selects the matching days from the $shortcut shortcut', ({ shortcut, count, isExpected }) => {
    const handleChange = vi.fn()
    render(
      <AvailabilityMiniCalendar
        month="2026-10"
        selectedDays={[]}
        onChange={handleChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: shortcut }))

    expect(handleChange).toHaveBeenCalledTimes(1)
    const calledWith: number[] = handleChange.mock.calls[0][0]
    // October 2026 has 31 days: 15 even and 16 odd
    expect(calledWith).toHaveLength(count)
    expect(calledWith.every(isExpected)).toBe(true)
  })

  it('clears the selection from the Limpar shortcut', () => {
    const handleChange = vi.fn()
    render(
      <AvailabilityMiniCalendar
        month="2026-10"
        selectedDays={[2, 4, 6]}
        onChange={handleChange}
      />
    )

    const clearBtn = screen.getByRole('button', { name: /Limpar/i })
    fireEvent.click(clearBtn)

    expect(handleChange).toHaveBeenCalledWith([])
  })

  it('toggles a single day on click', () => {
    const handleChange = vi.fn()
    render(
      <AvailabilityMiniCalendar
        month="2026-10"
        selectedDays={[10]}
        onChange={handleChange}
      />
    )

    // Click on day 15 (not selected -> should add)
    const day15 = screen.getByRole('button', { name: '15' })
    fireEvent.click(day15)
    expect(handleChange).toHaveBeenCalledWith([10, 15])

    // Click on day 10 (already selected -> should remove)
    const day10 = screen.getByRole('button', { name: '10' })
    fireEvent.click(day10)
    expect(handleChange).toHaveBeenCalledWith([])
  })
})

