import { RulesManagementView } from './rules-management-view'
import { useScheduleStore } from '../../store/use-schedule-store'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof RulesManagementView> = {
  title: 'Settings/RulesManagementView',
  component: RulesManagementView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-6xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof RulesManagementView>;

export const WithConfiguredRules: Story = {
  render: () => {
    useScheduleStore.setState({
      shiftDefinitions: [
        {
          id: 'shift-1',
          name: 'Plantão Diurno 12h',
          code: 'D12',
          startTime: '07:00',
          durationHours: 12,
          color: '#3B82F6',
          enabledByDefault: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        {
          id: 'shift-2',
          name: 'Plantão Noturno 12h',
          code: 'N12',
          startTime: '19:00',
          durationHours: 12,
          color: '#8B5CF6',
          enabledByDefault: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
      shiftRules: [
        {
          id: 'rule-1',
          name: 'Máximo 1 turno por dia',
          description: 'Impede que o mesmo profissional assuma mais de um plantão no mesmo dia.',
          type: 'MAX_SHIFTS_PER_PERIOD',
          severity: 'ERROR',
          enabledByDefault: true,
          parameters: {
            scope: 'DAY',
            maxOccurrences: 1,
          },
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        {
          id: 'rule-2',
          name: 'Descanso mínimo de 24 horas',
          description: 'Exige intervalo mínimo entre o fim de um plantão e o próximo.',
          type: 'MIN_REST_HOURS',
          severity: 'ERROR',
          enabledByDefault: true,
          parameters: {
            minRestHours: 24,
          },
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        {
          id: 'rule-3',
          name: 'Horas Diárias: 24h em Dias Úteis',
          description: 'Verifica a cobertura exata de 24 horas de segunda a sexta-feira.',
          type: 'DAILY_SHIFT_HOURS',
          severity: 'WARNING',
          enabledByDefault: false,
          parameters: {
            targetDailyHours: 24,
            dailyHoursComparison: 'EXACT',
            dayFilterType: 'WEEKDAYS',
          },
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
    })
    return <RulesManagementView />
  },
}

export const EmptyState: Story = {
  render: () => {
    useScheduleStore.setState({
      shiftDefinitions: [],
      shiftRules: [],
    })
    return <RulesManagementView />
  },
}

