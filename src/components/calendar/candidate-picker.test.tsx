import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { CandidatePicker } from './candidate-picker'

import type { Person } from '../../types'

describe('CandidatePicker', () => {
  const mockPersons: Person[] = [
    { id: 'p1', name: 'Dra. Camila', color: '#3b82f6' },
    { id: 'p2', name: 'Dr. Lucas', color: '#10b981' },
    { id: 'p3', name: 'Enf. Beatriz', color: '#8b5cf6' },
  ]

  it('lets the user pick a professional who is available on the day', () => {
    const handleSelect = vi.fn()
    // Only p1 has availability on day 15
    const isPersonAvailable = (id: string, day: number) => id === 'p1' && day === 15

    render(
      <CandidatePicker
        dateStr="2026-10-15"
        dayNumber={15}
        month="2026-10"
        assignedPersonIds={[]}
        allPersons={mockPersons}
        isPersonAvailable={isPersonAvailable}
        onSelectPerson={handleSelect}
      />
    )

    // Click "Adicionar" button to open dropdown
    const addBtn = screen.getByRole('button', { name: /adicionar/i })
    fireEvent.click(addBtn)

    // Dra. Camila is available and must be clickable
    const camilaBtn = screen.getByRole('button', { name: 'Dra. Camila' })
    expect(camilaBtn).toBeEnabled()

    fireEvent.click(camilaBtn)
    expect(handleSelect).toHaveBeenCalledTimes(1)
    expect(handleSelect).toHaveBeenCalledWith('p1')
  })

  it('disables professionals who are not available on the day', () => {
    const handleSelect = vi.fn()
    // Only p1 has availability on day 15; p2 and p3 do not
    const isPersonAvailable = (id: string, day: number) => id === 'p1' && day === 15

    render(
      <CandidatePicker
        dateStr="2026-10-15"
        dayNumber={15}
        month="2026-10"
        assignedPersonIds={[]}
        allPersons={mockPersons}
        isPersonAvailable={isPersonAvailable}
        onSelectPerson={handleSelect}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }))

    // Dr. Lucas and Enf. Beatriz are listed as unavailable and disabled
    const lucasBtn = screen.getByTitle(/dr\. lucas não possui disponibilidade no dia 15/i)
    expect(lucasBtn).toBeDisabled()
    expect(lucasBtn).toHaveAttribute('aria-disabled', 'true')

    // Clicking an unavailable professional must not trigger onSelectPerson
    fireEvent.click(lucasBtn)
    expect(handleSelect).not.toHaveBeenCalled()
  })

  it('shows a message when nobody is available on the day', () => {
    const handleSelect = vi.fn()
    // Nobody is available
    const isPersonAvailable = () => false

    render(
      <CandidatePicker
        dateStr="2026-10-15"
        dayNumber={15}
        month="2026-10"
        assignedPersonIds={[]}
        allPersons={mockPersons}
        isPersonAvailable={isPersonAvailable}
        onSelectPerson={handleSelect}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }))

    expect(
      screen.getByText(/nenhum profissional com disponibilidade para o dia 15/i)
    ).toBeInTheDocument()
  })

  it('hides the Adicionar button when everyone is already assigned to the day', () => {
    render(
      <CandidatePicker
        dateStr="2026-10-15"
        dayNumber={15}
        month="2026-10"
        assignedPersonIds={['p1', 'p2', 'p3']}
        allPersons={mockPersons}
        isPersonAvailable={() => true}
        onSelectPerson={vi.fn()}
      />
    )

    expect(screen.queryByRole('button', { name: /adicionar/i })).not.toBeInTheDocument()
  })

})
