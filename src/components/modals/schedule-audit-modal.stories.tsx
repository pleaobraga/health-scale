import { fn } from 'storybook/test'

import { ScheduleAuditModal } from './schedule-audit-modal'

import type { Person, ShiftRule, ValidationError } from '../../types'
import type { Meta, StoryObj } from '@storybook/react-vite'

const mockPersons: Person[] = [
  { id: 'p1', name: 'Dr. Lucas Ferreira', color: '#3b82f6', active: true },
  { id: 'p2', name: 'Dra. Beatriz Santos', color: '#ec4899', active: true },
  { id: 'p3', name: 'Dr. Carlos Eduardo', color: '#10b981', active: true },
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
  {
    id: 'rule-hours',
    name: 'Carga horária diária (24h)',
    description: 'Exige cobertura de 24h por dia.',
    type: 'DAILY_SHIFT_HOURS',
    severity: 'WARNING',
    enabledByDefault: true,
    parameters: { targetDailyHours: 24, dailyHoursComparison: 'EXACT', dayFilterType: 'ALL' },
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
    message: 'Dr. Lucas Ferreira escalado em dias consecutivos.',
  },
  {
    id: 'v2',
    rule: 'rule-hours',
    severity: 'warning',
    date: '2026-10-16',
    message: 'Dia com apenas 12h de cobertura (esperado: 24h).',
  },
]

const meta: Meta<typeof ScheduleAuditModal> = {
  title: 'Modals/ScheduleAuditModal',
  component: ScheduleAuditModal,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    onClose: fn(),
    currentMonth: '2026-10',
    allPersons: mockPersons,
    shiftRules: mockRules,
    activeRuleIds: ['rule-consecutive', 'rule-hours'],
    onToggleMonthRule: fn(),
  },
}

export default meta
type Story = StoryObj<typeof ScheduleAuditModal>;

export const WithViolations: Story = {
  args: {
    violations: mockViolations,
  },
}

export const CleanSchedule: Story = {
  args: {
    violations: [],
  },
}

