import { fn } from 'storybook/test'

import { DayViolationsModal } from './day-violations-modal'

import type { Person, ShiftRule, ValidationError } from '../../types'
import type { Meta, StoryObj } from '@storybook/react-vite'

const mockPersons: Person[] = [
  { id: 'p1', name: 'Dr. Lucas Ferreira', color: '#3b82f6', active: true },
  { id: 'p2', name: 'Dra. Beatriz Santos', color: '#ec4899', active: true },
]

const mockRules: ShiftRule[] = [
  {
    id: 'rule-consecutive',
    name: 'Máximo dias consecutivos',
    description: 'Proíbe plantões em dias seguidos para o mesmo médico.',
    type: 'CONSECUTIVE_DAYS_LIMIT',
    severity: 'ERROR',
    enabledByDefault: true,
    parameters: { consecutiveDaysLimit: 1 },
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
]

const mockViolations: ValidationError[] = [
  {
    id: 'v1',
    rule: 'rule-consecutive',
    severity: 'error',
    date: '2026-10-15',
    personId: 'p1',
    personName: 'Dr. Lucas Ferreira',
    message: 'Dr. Lucas Ferreira está escalado em dias consecutivos.',
  },
  {
    id: 'v2',
    rule: 'empty_day',
    severity: 'warning',
    date: '2026-10-15',
    message: 'Plantão do dia ainda incompleto.',
  },
]

const meta: Meta<typeof DayViolationsModal> = {
  title: 'Modals/DayViolationsModal',
  component: DayViolationsModal,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    onClose: fn(),
    dateStr: '2026-10-15',
    formattedDate: '15 de Outubro de 2026',
    allPersons: mockPersons,
    shiftRules: mockRules,
  },
}

export default meta
type Story = StoryObj<typeof DayViolationsModal>;

export const WithViolations: Story = {
  args: {
    violations: mockViolations,
  },
}

export const CleanDay: Story = {
  args: {
    violations: [],
  },
}

