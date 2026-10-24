import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { ScheduleAuditModal } from './schedule-audit-modal'

import type { ValidationError, Person, ShiftRule } from '../../types'

describe('ScheduleAuditModal', () => {
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
      <ScheduleAuditModal
        isOpen={false}
        onClose={vi.fn()}
        violations={mockViolations}
        allPersons={mockPersons}
        shiftRules={mockRules}
        activeRuleIds={['rule_rest_24']}
        currentMonth="2026-10"
        onToggleMonthRule={vi.fn()}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the grouping tabs and lists violations by rule', () => {
    render(
      <ScheduleAuditModal
        isOpen={true}
        onClose={vi.fn()}
        violations={mockViolations}
        allPersons={mockPersons}
        shiftRules={mockRules}
        activeRuleIds={['rule_rest_24']}
        currentMonth="2026-10"
        onToggleMonthRule={vi.fn()}
      />
    )

    expect(screen.getByTestId('schedule-audit-modal')).toBeInTheDocument()
    expect(screen.getByText('Descanso mínimo de 24h')).toBeInTheDocument()
    expect(
      screen.getByText(/Dra. Camila tem apenas 12h de descanso/)
    ).toBeInTheDocument()
  })

  it('switches to the by-professional tab', () => {
    render(
      <ScheduleAuditModal
        isOpen={true}
        onClose={vi.fn()}
        violations={mockViolations}
        allPersons={mockPersons}
        shiftRules={mockRules}
        activeRuleIds={['rule_rest_24']}
        currentMonth="2026-10"
        onToggleMonthRule={vi.fn()}
      />
    )

    const personTab = screen.getByRole('button', { name: /por profissional/i })
    fireEvent.click(personTab)

    expect(screen.getByText('Dra. Camila')).toBeInTheDocument()
  })

  it('disables a rule for the current month', () => {
    const onToggle = vi.fn()
    render(
      <ScheduleAuditModal
        isOpen={true}
        onClose={vi.fn()}
        violations={mockViolations}
        allPersons={mockPersons}
        shiftRules={mockRules}
        activeRuleIds={['rule_rest_24']}
        currentMonth="2026-10"
        onToggleMonthRule={onToggle}
      />
    )

    const disableBtn = screen.getByTitle(/desativar regra para este mês/i)
    fireEvent.click(disableBtn)
    expect(onToggle).toHaveBeenCalledWith('rule_rest_24')
  })
})

