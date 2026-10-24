import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { DayViolationsModal } from './day-violations-modal'

import type { ValidationError, Person, ShiftRule } from '../../types'

describe('DayViolationsModal', () => {
  const mockPersons: Person[] = [
    { id: 'p1', name: 'Dra. Camila', color: '#3B82F6' },
  ]

  const mockRules: ShiftRule[] = [
    {
      id: 'rule_rest_24',
      name: 'Descanso mínimo de 24h',
      description: 'Janela de descanso entre plantões',
      type: 'MIN_REST_HOURS',
      severity: 'ERROR',
      enabledByDefault: true,
      parameters: { minRestHours: 24 },
      createdAt: '',
      updatedAt: '',
    },
  ]

  const mockViolations: ValidationError[] = [
    {
      id: 'v1',
      date: '2026-10-02',
      rule: 'rule_rest_24',
      severity: 'error',
      personId: 'p1',
      personName: 'Dra. Camila',
      message: 'Descanso mínimo de 24h: Dra. Camila tem apenas 12h de descanso.',
    },
  ]

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <DayViolationsModal
        isOpen={false}
        onClose={vi.fn()}
        dateStr="2026-10-02"
        formattedDate="02/10/2026"
        violations={mockViolations}
        allPersons={mockPersons}
        shiftRules={mockRules}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the date title and the detailed list of violations', () => {
    render(
      <DayViolationsModal
        isOpen={true}
        onClose={vi.fn()}
        dateStr="2026-10-02"
        formattedDate="02/10/2026"
        violations={mockViolations}
        allPersons={mockPersons}
        shiftRules={mockRules}
      />
    )

    expect(screen.getByTestId('day-violations-modal')).toBeInTheDocument()
    expect(screen.getByText(/02\/10\/2026/)).toBeInTheDocument()
    expect(screen.getByText('Descanso mínimo de 24h')).toBeInTheDocument()
    expect(
      screen.getByText(/Dra. Camila tem apenas 12h de descanso/)
    ).toBeInTheDocument()
  })

  it('calls onClose from the close button', () => {
    const onClose = vi.fn()
    render(
      <DayViolationsModal
        isOpen={true}
        onClose={onClose}
        dateStr="2026-10-02"
        formattedDate="02/10/2026"
        violations={mockViolations}
        allPersons={mockPersons}
        shiftRules={mockRules}
      />
    )

    const closeBtn = screen.getByRole('button', { name: /fechar/i })
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

