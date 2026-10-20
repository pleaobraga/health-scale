import { AddMonthRulesModal } from './add-month-rules-modal'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof AddMonthRulesModal> = {
  title: 'Sidebar/AddMonthRulesModal',
  component: AddMonthRulesModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof AddMonthRulesModal>;

export const DefaultOpen: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Closed modal'),
    currentMonth: '2026-10',
    allRules: [
      {
        id: 'rule_max_shifts_day',
        name: 'Máximo 1 turno por dia',
        description: 'Impede que o mesmo colaborador seja escalado em mais de um turno no mesmo dia.',
        type: 'MAX_SHIFTS_PER_PERIOD',
        severity: 'ERROR',
        enabledByDefault: true,
        parameters: { scope: 'DAY', maxOccurrences: 1 },
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      {
        id: 'rule_min_rest',
        name: 'Descanso Mínimo de 11h',
        description: 'Garante o intervalo interjornada de descanso entre turnos consecutivos.',
        type: 'MIN_REST_HOURS',
        severity: 'ERROR',
        enabledByDefault: true,
        parameters: { minRestHours: 11 },
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      {
        id: 'rule_weekly_hours',
        name: 'Limite Semanal de 44h',
        description: 'Alerta quando o total de horas de plantão na semana ultrapassar 44h.',
        type: 'MAX_HOURS_PER_PERIOD',
        severity: 'WARNING',
        enabledByDefault: false,
        parameters: { scope: 'WEEK', maxHours: 44 },
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ],
    currentRuleIds: ['rule_max_shifts_day'],
    onAddRules: (ids) => console.log('Added rules:', ids),
    onGoToGlobalManagement: () => console.log('Go to global management'),
  },
}

export const AllAlreadyLinked: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Closed modal'),
    currentMonth: '2026-10',
    allRules: [
      {
        id: 'rule_max_shifts_day',
        name: 'Máximo 1 turno por dia',
        type: 'MAX_SHIFTS_PER_PERIOD',
        severity: 'ERROR',
        enabledByDefault: true,
        parameters: { scope: 'DAY', maxOccurrences: 1 },
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ],
    currentRuleIds: ['rule_max_shifts_day'],
    onAddRules: (ids) => console.log('Added rules:', ids),
  },
}
